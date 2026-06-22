#!/usr/bin/env python3
"""paperweave reader — FastAPI backend for Web reader:
  - Paper full-text loading (full.md + review.md)
  - MinerU image service
  - Translation (LLM + cache)
  - Agent discussion (with wiki context)
  - Highlight/annotation saving
"""
import os
import re
import json
import yaml
import hashlib
import logging
import shlex
from pathlib import Path
from datetime import date
from typing import Optional

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse, StreamingResponse
from pydantic import BaseModel
import uvicorn
import asyncio

# ── Environment ─────────────────────────────────────────────────────────
from dotenv import load_dotenv
load_dotenv()

# ── Logging ─────────────────────────────────────────────────────────────
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

# ── Config ──────────────────────────────────────────────────────────────
PAPERWEAVE_ROOT = Path(os.environ.get("PAPERWEAVE_ROOT", Path(__file__).resolve().parent.parent))
ROOT = PAPERWEAVE_ROOT
WIKI = ROOT / "wiki"
L0 = WIKI / "L0_raw"
L2 = WIKI / "L2_lineage"
L3 = WIKI / "L3_module"
L5 = WIKI / "L5_experience"
STATIC = Path(__file__).resolve().parent / "static"

# ── Auth ────────────────────────────────────────────────────────────────
AUTH_TOKEN = os.environ.get("PAPERWEAVE_AUTH_TOKEN", "")

# ── LLM / Agent Backend Configuration ────────────────────────────────────
LLM_KEY = os.environ.get("DEEPSEEK_API_KEY") or os.environ.get("OPENAI_API_KEY") or ""
LLM_MODEL = os.environ.get("PAPERWEAVE_MODEL", "deepseek-chat")
LLM_BASE = os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
AGENT_CMD = os.environ.get("PAPERWEAVE_AGENT_CMD", "")
AGENT_TIMEOUT = int(os.environ.get("PAPERWEAVE_AGENT_TIMEOUT", "120"))

# Configurable LLM parameters
LLM_TEMPERATURE = float(os.environ.get("PAPERWEAVE_LLM_TEMPERATURE", "0.3"))
LLM_TIMEOUT = int(os.environ.get("PAPERWEAVE_LLM_TIMEOUT", "120"))
LLM_MAX_TOKENS = int(os.environ.get("PAPERWEAVE_LLM_MAX_TOKENS", "2048"))

app = FastAPI(title="paperweave reader")

# ── Auth Middleware ─────────────────────────────────────────────────────
@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    if AUTH_TOKEN:
        # Skip auth for static files and root
        path = request.url.path
        if path.startswith("/static") or path == "/":
            return await call_next(request)
        auth_header = request.headers.get("X-Auth-Token", "")
        if auth_header != AUTH_TOKEN:
            raise HTTPException(401, "Unauthorized: missing or invalid X-Auth-Token")
    return await call_next(request)

# ── Slug Validation ─────────────────────────────────────────────────────
def _validate_slug(slug: str) -> str:
    """Reject slugs with path traversal or suspicious characters."""
    if not slug:
        raise HTTPException(400, "Slug cannot be empty")
    if ".." in slug or "/" in slug or slug.startswith("."):
        raise HTTPException(400, f"Invalid slug: {slug}")
    return slug

# ── Image Index Cache ───────────────────────────────────────────────────
_image_index: dict[str, dict[str, str]] = {}

def _build_image_index(slug: str, img_dir: Path) -> dict[str, str]:
    """Build image filename index (only on first access)."""
    idx = {}
    for f in img_dir.iterdir():
        if not f.is_file():
            continue
        name = f.name.lower()
        idx[name] = f.name
        cleaned = name.removeprefix(slug.lower() + "_")
        if cleaned != name:
            idx[cleaned] = f.name
    return idx

# ── Translation Cache ───────────────────────────────────────────────────
_translation_cache: dict[str, str] = {}

def _cache_key(slug: str, text: str) -> str:
    return hashlib.md5(f"{slug}|{text}".encode()).hexdigest()

# ── Helpers ─────────────────────────────────────────────────────────────

def parse_frontmatter(text: str) -> dict:
    """Extract YAML frontmatter from markdown."""
    m = re.match(r"^---\n(.*?)\n---", text, re.DOTALL)
    if not m:
        return {}
    try:
        return yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError:
        return {}

def body_without_frontmatter(text: str) -> str:
    """Remove YAML frontmatter, return body."""
    return re.sub(r"^---\n.*?\n---\n", "", text, 1, flags=re.DOTALL).strip()

def list_papers() -> list[dict]:
    """List all ingested papers."""
    papers = []
    if not L0.exists():
        return papers
    for d in sorted(L0.iterdir()):
        if not d.is_dir():
            continue
        review_path = d / "review.md"
        full_path = d / "full.md"
        if not full_path.exists():
            continue

        slug = d.name
        fm = {}
        has_review = False
        score = 0

        if review_path.exists():
            has_review = True
            fm = parse_frontmatter(review_path.read_text(encoding="utf-8"))
            raw_score = fm.get("score", 0)
            score = int(raw_score) if isinstance(raw_score, (int, float)) else 0

        title = fm.get("title", slug.replace("-", " ").title())
        authors = fm.get("authors", [])
        if not isinstance(authors, list):
            authors = [str(authors)] if authors else []
        year = fm.get("year", 0)
        if not isinstance(year, (int, float)):
            year = 0
        tags = fm.get("tags", [])
        if not isinstance(tags, list):
            tags = [str(tags)] if tags else []

        papers.append({
            "slug": slug,
            "title": title,
            "authors": authors if isinstance(authors, list) else [authors],
            "year": year,
            "score": score,
            "tags": tags,
            "has_review": has_review,
            "has_full": full_path.exists(),
        })
    papers.sort(key=lambda p: (-p["score"], p["title"]))
    return papers

def get_paper(slug: str) -> dict:
    """Get full paper data."""
    _validate_slug(slug)
    d = L0 / slug
    if not d.exists() or not d.is_dir():
        raise HTTPException(404, f"Paper not found: {slug}")

    full_path = d / "full.md"
    review_path = d / "review.md"
    highlights_path = d / "highlights.md"

    full_text = full_path.read_text(encoding="utf-8") if full_path.exists() else ""
    review_text = review_path.read_text(encoding="utf-8") if review_path.exists() else ""
    highlights_text = highlights_path.read_text(encoding="utf-8") if highlights_path.exists() else ""

    review_fm = parse_frontmatter(review_text)
    review_body = body_without_frontmatter(review_text)
    full_body = body_without_frontmatter(full_text)

    l2_pages = []
    if L2.exists():
        for l2f in L2.rglob("*.md"):
            if slug in l2f.read_text(encoding="utf-8"):
                l2_pages.append(str(l2f.relative_to(WIKI)))

    highlights = []
    if highlights_text:
        for line in highlights_text.splitlines():
            line = line.strip()
            if line.startswith("- "):
                text = line[2:]
                text = re.sub(r'^\[\d{4}-\d{2}-\d{2}\]\s*', '', text)
                highlights.append({"text": text, "id": hashlib.md5(line.encode()).hexdigest()[:8]})

    return {
        "slug": slug,
        "title": review_fm.get("title", slug.replace("-", " ").title()),
        "authors": review_fm.get("authors", []),
        "year": review_fm.get("year", 0),
        "score": review_fm.get("score", 0),
        "tags": review_fm.get("tags", []),
        "l2_pages": l2_pages,
        "full_body": full_body,
        "review_body": review_body,
        "review_fm": review_fm,
        "highlights": highlights,
    }

def get_wiki_context(slug: str, paper_data: dict = None) -> str:
    """Collect wiki context for a paper (L2 lineage + L3 modules)."""
    ctx_parts = []

    if L2.exists():
        for l2f in L2.rglob("*.md"):
            content = l2f.read_text(encoding="utf-8")
            if slug in content:
                body = body_without_frontmatter(content)[:3000]
                ctx_parts.append(f"## L2 Lineage: {l2f.stem}\n{body}")

    if L3.exists():
        if paper_data is None:
            paper_data = get_paper(slug)
        tags = " ".join(str(t) for t in paper_data.get("tags", []))
        for l3f in L3.glob("*.md"):
            content = l3f.read_text(encoding="utf-8")
            if any(kw in content.lower() for kw in tags.lower().split()[:5]):
                body = body_without_frontmatter(content)[:2000]
                body = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', body)
                ctx_parts.append(f"## L3 Module: {l3f.stem}\n{body}")

    return "\n\n---\n\n".join(ctx_parts[:4])

def call_llm(messages: list, max_tokens: int = None) -> str:
    """Call LLM API or delegate to a local agent command."""
    if max_tokens is None:
        max_tokens = LLM_MAX_TOKENS
    if AGENT_CMD:
        return _call_agent(messages, max_tokens)
    if not LLM_KEY:
        raise HTTPException(500, "No LLM API key configured")
    import requests
    url = f"{LLM_BASE}/v1/chat/completions"
    headers = {"Authorization": f"Bearer {LLM_KEY}", "Content-Type": "application/json"}
    body = {
        "model": LLM_MODEL,
        "messages": messages,
        "temperature": LLM_TEMPERATURE,
        "max_tokens": max_tokens,
    }
    resp = requests.post(url, headers=headers, json=body, timeout=LLM_TIMEOUT)
    if resp.status_code != 200:
        raise HTTPException(500, f"LLM API error: {resp.status_code}")
    return resp.json()["choices"][0]["message"]["content"]

def _call_agent(messages: list, max_tokens: int = 2048) -> str:
    """Delegate to a local agent command (hermes, claude, etc.)."""
    import subprocess

    # Extract the prompt from messages
    if len(messages) == 1 and messages[0].get("role") == "user":
        full_prompt = messages[0]["content"]
    else:
        prompt_parts = []
        for m in messages:
            role = m.get("role", "user")
            content = m.get("content", "")
            if role == "system":
                prompt_parts.append(f"[System]\n{content}")
            elif role == "user":
                prompt_parts.append(f"[User]\n{content}")
            else:
                prompt_parts.append(f"[{role.capitalize()}]\n{content}")
        full_prompt = "\n\n---\n\n".join(prompt_parts)

    cmd = AGENT_CMD.strip()
    cmd_parts = shlex.split(cmd)
    is_hermes = cmd_parts[0].endswith("hermes") if cmd_parts else False

    try:
        if is_hermes:
            hermes_cmd = cmd_parts + ["-z", full_prompt]
            proc = subprocess.run(
                hermes_cmd,
                capture_output=True,
                text=True,
                timeout=AGENT_TIMEOUT,
                shell=False,
                cwd=str(ROOT),
            )
        else:
            proc = subprocess.run(
                cmd_parts,
                input=full_prompt,
                capture_output=True,
                text=True,
                timeout=AGENT_TIMEOUT,
                shell=False,
                cwd=str(ROOT),
            )
        if proc.returncode != 0:
            err = proc.stderr.strip()[:500]
            raise HTTPException(500, f"Agent error (exit {proc.returncode}): {err}")
        return proc.stdout.strip()
    except subprocess.TimeoutExpired:
        raise HTTPException(500, f"Agent timed out after {AGENT_TIMEOUT}s")
    except Exception as e:
        raise HTTPException(500, f"Agent execution failed: {e}")

# ── Shared Prompt Builder ───────────────────────────────────────────────

def _build_chat_prompt(slug: str, selected_text: str, question: str, history: list) -> str:
    """Build a single structured prompt from paper + wiki context + history."""
    paper = get_paper(slug) if slug else {}
    wiki_ctx = get_wiki_context(slug, paper_data=paper) if slug else ""

    prompt_parts = []

    if paper.get("title"):
        year_str = str(paper.get("year", ""))
        prompt_parts.append(f"## Paper: {paper['title']} ({year_str})")
    if paper.get("review_body"):
        prompt_parts.append(paper["review_body"][:1500])
    if paper.get("full_body"):
        prompt_parts.append(paper["full_body"][:8000])

    if wiki_ctx:
        clean_ctx = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', wiki_ctx)
        prompt_parts.append(f"## Knowledge Base\n{clean_ctx[:2000]}")

    if selected_text:
        prompt_parts.append(f"## Selected Text\n{selected_text[:1000]}")

    if history:
        conv_lines = ["## Conversation"]
        for entry in history:
            conv_lines.append(str(entry))
        prompt_parts.append("\n".join(conv_lines))

    prompt_parts.append(f"## Question\n{question}")

    return "\n\n".join(prompt_parts)

# ── Pydantic Models ─────────────────────────────────────────────────────

class TranslateRequest(BaseModel):
    text: str
    slug: str = ""

class ChatRequest(BaseModel):
    slug: str = ""
    selected_text: str = ""
    question: str
    history: list = []

class HighlightRequest(BaseModel):
    slug: str
    text: str
    note: str = ""

# ── API Routes ──────────────────────────────────────────────────────────

@app.get("/api/papers")
def api_list_papers(search: str = Query("", description="Search keyword")):
    """List all papers."""
    papers = list_papers()
    if search:
        q = search.lower()
        papers = [p for p in papers if
                  q in p["title"].lower() or
                  q in " ".join(p.get("tags", [])).lower() or
                  q in " ".join(p.get("authors", [])).lower()]
    return {"papers": papers, "total": len(papers)}

@app.get("/api/paper/{slug}")
def api_get_paper(slug: str):
    """Get paper full text + metadata."""
    return get_paper(slug)

@app.get("/api/paper/{slug}/image/{filename:path}")
def api_paper_image(slug: str, filename: str):
    """Serve MinerU-extracted paper images (with index cache)."""
    _validate_slug(slug)
    d = L0 / slug
    if not d.exists():
        raise HTTPException(404, f"Paper not found: {slug}")

    img_dir = d / "images"
    if not img_dir.exists():
        raise HTTPException(404, "No images directory")

    if slug not in _image_index:
        _image_index[slug] = _build_image_index(slug, img_dir)

    idx = _image_index[slug]
    resolved = idx.get(filename.lower())
    if resolved:
        return FileResponse(str(img_dir / resolved), media_type="image/jpeg")

    raise HTTPException(404, f"Image not found: {filename}")

@app.post("/api/translate")
def api_translate(req: TranslateRequest):
    """Translate selected text (with cache)."""
    text = req.text
    slug = req.slug
    if not text:
        raise HTTPException(400, "No text provided")

    key = _cache_key(slug, text)
    if key in _translation_cache:
        return {"translation": _translation_cache[key], "original": text, "cached": True}

    title = ""
    try:
        paper = get_paper(slug)
        title = paper.get("title", "")
    except HTTPException:
        pass

    messages = [
        {"role": "system", "content": (
            "You are a remote-sensing/AI paper translation expert. Translate English to academic Chinese. "
            "Keep technical terms in English (e.g. SAR, optical, transformer, attention). "
            "Accurately translate math concepts and experiment descriptions. "
            "When English sentences have nested clauses, split them into shorter Chinese sentences for fluency. "
            f"Current paper: {title}"
        )},
        {"role": "user", "content": f"Translate the following passage:\n\n{text}"}
    ]
    result = call_llm(messages, max_tokens=LLM_MAX_TOKENS)

    if len(_translation_cache) > 200:
        _translation_cache.pop(next(iter(_translation_cache)))
    _translation_cache[key] = result

    return {"translation": result, "original": text, "cached": False}

@app.post("/api/chat")
def api_chat(req: ChatRequest):
    """Agent discussion — structured prompt with paper and wiki context."""
    slug = req.slug
    question = req.question
    if not question:
        raise HTTPException(400, "No question provided")

    full_prompt = _build_chat_prompt(slug, req.selected_text, question, req.history or [])
    messages = [{"role": "user", "content": full_prompt}]

    result = call_llm(messages, max_tokens=3072)
    return {"answer": result, "question": question}

# ── SSE Streaming Support ──────────────────────────────────────────────

async def _call_agent_stream(full_prompt: str):
    """Spawn hermes -z. Send intelligent initial status, then answer."""
    if not AGENT_CMD:
        yield f"data: {json.dumps({'type': 'status', 'text': 'No agent configured.'})}\n\n"
        yield "data: [DONE]\n\n"
        return

    cmd_parts = shlex.split(AGENT_CMD.strip())
    is_hermes = cmd_parts[0].endswith("hermes") if cmd_parts else False
    if not is_hermes:
        yield f"data: {json.dumps({'type': 'status', 'text': 'Streaming only supported for hermes.'})}\n\n"
        yield "data: [DONE]\n\n"
        return

    # Intelligent initial status based on question content
    prompt_lower = full_prompt.lower()
    if any(kw in prompt_lower for kw in ("search", "find", "look up", "查找", "搜索", "arxiv")):
        yield f"data: {json.dumps({'type': 'searching', 'text': 'Searching for relevant papers and information...'})}\n\n"
    elif any(kw in prompt_lower for kw in ("read", "file", "code", "文件", "代码", "查看")):
        yield f"data: {json.dumps({'type': 'reading', 'text': 'Reading files and analyzing code...'})}\n\n"
    elif any(kw in prompt_lower for kw in ("memory", "recall", "记忆", "之前", "上次", "recall")):
        yield f"data: {json.dumps({'type': 'memory', 'text': 'Recalling from past conversations...'})}\n\n"
    elif any(kw in prompt_lower for kw in ("run", "execute", "test", "train", "运行", "执行", "训练")):
        yield f"data: {json.dumps({'type': 'tool', 'text': 'Executing tools and computations...'})}\n\n"
    elif any(kw in prompt_lower for kw in ("translate", "翻译")):
        yield f"data: {json.dumps({'type': 'status', 'text': 'Translating...'})}\n\n"
    elif any(kw in prompt_lower for kw in ("compare", "compar", "对比", "区别", "diff")):
        yield f"data: {json.dumps({'type': 'status', 'text': 'Comparing and analyzing...'})}\n\n"
    else:
        yield f"data: {json.dumps({'type': 'status', 'text': 'Agent is thinking...'})}\n\n"

    hermes_cmd = cmd_parts + ["-z", full_prompt]
    proc = await asyncio.create_subprocess_exec(
        *hermes_cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        cwd=str(ROOT),
    )

    answer = (await proc.stdout.read()).decode("utf-8", errors="replace").strip()
    await proc.wait()

    yield f"data: {json.dumps({'type': 'answer', 'text': answer})}\n\n"
    yield "data: [DONE]\n\n"


async def _stream_event_generator(req: ChatRequest):
    """Build prompt and stream SSE events from agent."""
    slug = req.slug
    question = req.question
    full_prompt = _build_chat_prompt(slug, req.selected_text, question, req.history or [])

    async for event in _call_agent_stream(full_prompt):
        yield event


@app.post("/api/chat/stream")
async def api_chat_stream(req: ChatRequest):
    """Streaming chat with agent status updates (SSE)."""
    if not req.question:
        raise HTTPException(400, "No question provided")
    return StreamingResponse(
        _stream_event_generator(req),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

# ── Global Chat Session Persistence ───────────────────────────────────

SESSIONS_FILE = ROOT / ".chat-sessions.json"
STARS_FILE   = ROOT / ".stars.json"

def _load_stars() -> list:
    try:
        if STARS_FILE.exists():
            return json.loads(STARS_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, IOError):
        pass
    return []

def _save_stars(stars: list):
    try:
        STARS_FILE.write_text(json.dumps(stars, ensure_ascii=False), encoding="utf-8")
    except IOError:
        pass

def _load_sessions():
    try:
        if SESSIONS_FILE.exists():
            return json.loads(SESSIONS_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, IOError):
        pass
    return []

def _save_sessions(sessions):
    try:
        SESSIONS_FILE.write_text(
            json.dumps(sessions, ensure_ascii=False, indent=2),
            encoding="utf-8"
        )
    except IOError:
        pass

class SessionsRequest(BaseModel):
    sessions: list = []

class StarsRequest(BaseModel):
    stars: list = []

@app.get("/api/stars")
def api_get_stars():
    return {"stars": _load_stars()}

@app.post("/api/stars")
def api_save_stars(req: StarsRequest):
    _save_stars(req.stars)
    return {"ok": True, "count": len(req.stars)}

@app.get("/api/sessions")
def api_get_sessions():
    return {"sessions": _load_sessions()}

@app.post("/api/sessions")
def api_save_sessions(req: SessionsRequest):
    _save_sessions(req.sessions)
    return {"ok": True, "count": len(req.sessions)}

@app.post("/api/highlight")
def api_highlight(req: HighlightRequest):
    """Save highlight annotation."""
    slug = req.slug
    _validate_slug(slug)
    text = req.text.strip()
    note = req.note.strip()

    if not slug or not text:
        raise HTTPException(400, "slug and text required")

    d = L0 / slug
    if not d.exists():
        raise HTTPException(404, f"Paper not found: {slug}")

    d.mkdir(parents=True, exist_ok=True)
    hl_path = d / "highlights.md"

    today_str = date.today().isoformat()
    entry = f"- [{today_str}] {text}"
    if note:
        entry += f"\n  > {note}"

    with open(hl_path, "a", encoding="utf-8") as f:
        f.write(entry + "\n")

    return {
        "ok": True,
        "slug": slug,
        "highlight": text[:100],
        "note": note[:100] if note else None,
        "date": today_str,
    }

@app.delete("/api/highlight/{slug}")
def api_delete_highlight(slug: str, text: str = ""):
    """Delete highlight by matching text."""
    _validate_slug(slug)
    d = L0 / slug
    if not d.exists():
        raise HTTPException(404, f"Paper not found: {slug}")

    hl_path = d / "highlights.md"
    if not hl_path.exists():
        return {"ok": False, "reason": "No highlights file"}

    lines = hl_path.read_text(encoding="utf-8").splitlines()
    new_lines = []
    i = 0
    while i < len(lines):
        stripped = lines[i].strip()
        if stripped.startswith("- ") and text and text in stripped:
            i += 1
            if i < len(lines) and lines[i].strip().startswith("> "):
                i += 1
            continue
        new_lines.append(lines[i])
        i += 1

    with open(hl_path, "w", encoding="utf-8") as f:
        f.write("\n".join(new_lines) + ("\n" if new_lines else ""))

    return {"ok": True}

@app.get("/api/stats")
def api_stats():
    """Knowledge base statistics."""
    papers = list_papers()
    return {
        "total_papers": len(papers),
        "reviewed": sum(1 for p in papers if p["has_review"]),
        "avg_score": round(sum(p["score"] for p in papers) / max(len(papers), 1), 1),
        "domains": list(set(t for p in papers for t in p.get("tags", [])))[:20],
    }

# ── Static Files ────────────────────────────────────────────────────────

@app.get("/")
def index():
    """Reader homepage."""
    return FileResponse(STATIC / "index.html")

if STATIC.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC)), name="static")

# ── Main ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="0.0.0.0", help="Bind address")
    parser.add_argument("--port", type=int, default=8899, help="Bind port")
    args = parser.parse_args()

    backend = "agent" if AGENT_CMD else f"API ({LLM_BASE})"
    agent_name = AGENT_CMD.split()[0].split("/")[-1] if AGENT_CMD else ""
    backend_label = f"agent ({agent_name})" if agent_name else backend
    logger.info(f"PaperWeave — Human · Agent · Paper")
    logger.info(f"Backend: {backend_label}")
    logger.info(f"URL: http://{args.host}:{args.port}")
    logger.info(f"Wiki: {WIKI}")
    logger.info(f"Papers: {len(list_papers())}")
    uvicorn.run(app, host=args.host, port=args.port, log_level="info")
