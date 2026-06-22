#!/usr/bin/env python3
"""
paperweave agent — auto read papers, maintain wiki.
Pure Python, reads LLM key from .env, calls API directly.

Usage:
  python3 tools/agent.py read --slug <slug>       # Read single paper
  python3 tools/agent.py read --batch 3            # Random 3 L0_raw papers
  python3 tools/agent.py check                     # Find reviews >30d stale
  python3 tools/agent.py scan                      # Check to-read queue

cron trigger:
  python3 tools/agent.py read --batch 2
"""

import argparse, datetime, json, os, re, subprocess, sys, textwrap
from collections import Counter
from pathlib import Path

ROOT = Path(os.environ.get("PAPERWEAVE_ROOT", Path(__file__).resolve().parent.parent))
WIKI = ROOT / "wiki"
L0 = WIKI / "L0_raw"
L2 = WIKI / "L2_lineage"
L3 = WIKI / "L3_module"
TO_READ = WIKI / "to-read.md"
LOG = WIKI / "log.md"

# ── Tools ──────────────────────────────────────────────────────────────────

def read(p):
    p = Path(p)
    return p.read_text(encoding="utf-8") if p.exists() else ""

def append(p, text):
    p = Path(p)
    with open(p, "a", encoding="utf-8") as f:
        f.write(text.strip() + "\n")

def today():
    return datetime.date.today().isoformat()

def err(msg):
    print(f"[ERROR] {msg}", file=sys.stderr)

# ── LLM ───────────────────────────────────────────────────────────────────

def load_env():
    """Load env vars from .env file"""
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        # Fallback: manual .env parsing
        env_path = ROOT / ".env"
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                line = line.strip()
                if "=" in line and not line.startswith("#"):
                    k, v = line.split("=", 1)
                    os.environ[k.strip()] = v.strip()

def call_llm(messages: list, model=None, max_tokens=4096) -> str:
    """Call LLM API. Supports system + user multi-turn messages."""
    load_env()
    model = model or os.environ.get("PAPERWEAVE_MODEL", "deepseek-v4-flash")
    key = (os.environ.get("DEEPSEEK_API_KEY") or
           os.environ.get("OPENAI_API_KEY") or
           os.environ.get("OPENROUTER_API_KEY"))
    base_url = os.environ.get("DEEPSEEK_BASE_URL", "")

    if not key:
        raise RuntimeError("No LLM API key in .env (need DEEPSEEK_API_KEY / OPENAI_API_KEY / OPENROUTER_API_KEY)")

    if model.startswith("deepseek"):
        url = base_url + "/v1/chat/completions" if base_url else "https://api.deepseek.com/v1/chat/completions"
    elif model.startswith("openrouter"):
        url = "https://openrouter.ai/api/v1/chat/completions"
    else:
        url = "https://api.openai.com/v1/chat/completions"

    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    body = {"model": model, "messages": messages, "temperature": 0.3, "max_tokens": max_tokens}

    resp = __import__("requests").post(url, headers=headers, json=body, timeout=180)
    if resp.status_code != 200:
        raise RuntimeError(f"LLM API error {resp.status_code}: {resp.text[:500]}")
    return resp.json()["choices"][0]["message"]["content"]

# ── L2 page finder ──────────────────────────────────────────────────────────

def find_l2_for_slug(slug: str) -> Path | None:
    """Search L2 pages for references to this slug. Uses grep for speed."""
    try:
        result = subprocess.run(
            ["grep", "-rl", slug, str(L2)],
            capture_output=True, text=True, timeout=5
        )
        for line in result.stdout.strip().splitlines():
            p = Path(line.strip())
            if p.exists() and p.suffix == ".md":
                return p
    except Exception:
        pass
    return None

def parse_l2_frontmatter(l2_path: Path) -> dict:
    """Extract domain/task/approach from L2 page YAML frontmatter."""
    text = read(l2_path)
    m = re.search(r"^---\n(.*?)\n---", text, re.DOTALL)
    if not m:
        return {}
    fm = {}
    for line in m.group(1).splitlines():
        if re.match(r"^\w+:\s*", line):
            k, v = line.split(":", 1)
            fm[k.strip()] = v.strip()
    return fm

# ── L3 page finder ──────────────────────────────────────────────────────────

L3_KEYWORD_MAP = {
    "geo-foundation-models": ["foundation model", "fm", "masked autoencoder", "mae", "contrastive", "ssl", "self-supervised", "pretrain", "remote sensing foundation"],
    "data-scarcity": ["few-shot", "weak supervision", "few shot", "limited label", "data scarcity", "unlabeled", "transfer learning", "data augmentation"],
    "modality-fusion": ["fusion", "multi-modal", "multimodal", "sar", "optical", "dem", "multi-source", "cross-attention", "cross attention", "modality", "alignment"],
    "model-efficiency": ["lightweight", "efficient", "distillation", "pruning", "quantization", "moe", "mixture of expert", "sparse"],
    "pretraining-paradigm": ["pretrain", "pre-training", "pre train", "masked", "contrastive", "simclr", "moco", "byol", "mae", "next-token", "ntp", "diffusion"],
    "multi-scale-feature-extraction": ["multi-scale", "pyramid", "resolution", "scale", "spatial", "hierarchical", "feature extract"],
    "open-source-reproducibility": ["open source", "reproducibility", "code", "benchmark", "reproducible"],
}

def find_l3_pages(full_text: str, n=2) -> list[Path]:
    """Select most relevant L3 pages by keyword matching."""
    text = full_text.lower()
    scores = Counter()
    for name, keywords in L3_KEYWORD_MAP.items():
        p = L3 / f"{name}.md"
        if not p.exists():
            continue
        score = sum(1 for kw in keywords if kw in text)
        if score > 0:
            scores[p] = score
    return [p for p, _ in scores.most_common(n)]

# ── Citation handling ──────────────────────────────────────────────

def slugs_in_l0() -> set[str]:
    return {d.name for d in L0.iterdir() if d.is_dir()}

def l0_title_index() -> dict[str, str]:
    """Build {normalized_title: slug} index."""
    idx = {}
    for d in L0.iterdir():
        rp = d / "review.md"
        if not rp.exists():
            continue
        try:
            text = read(rp)
            m = re.search(r"title:\s*\"(.+?)\"", text)
            if m:
                nt = re.sub(r"[^a-z0-9\s]", "", m.group(1).lower().strip())
                idx[nt] = d.name
        except Exception:
            pass
    return idx

def cite_in_l0(cite_line: str, title_idx: dict) -> bool:
    """Check if citation is already in L0_raw."""
    first = cite_line.split("(")[0].strip().lstrip("- ").split(":")[0].strip()
    first_lower = first.lower().rstrip(",-:/")
    for slug in slugs_in_l0():
        if slug.startswith(first_lower):
            return True
    cite_title = first.lower()
    for nt in title_idx:
        if cite_title in nt or nt in cite_title:
            return True
    return False

def add_citation(entry: str):
    """Safely append citation to to-read.md (skip dups and already-in-L0)."""
    title_idx = l0_title_index()
    if cite_in_l0(entry, title_idx):
        return

    existing = read(TO_READ)
    first_word = entry.split("(")[0].strip().split()[0].lower().rstrip(":,-")
    if first_word and first_word in existing.lower():
        return

    raw = entry.strip()
    if not raw.startswith("- "):
        raw = f"- {raw}"
    if "—" not in raw:
        raw = re.sub(r"(\))\s+(https?://)", r"\1 — ", raw)
    append(TO_READ, raw)

# ── Main flow: read_paper ──────────────────────────────────────────────────

def read_paper(slug: str, model=None) -> dict:
    """Execute full reading flow, return structured report."""
    paper_dir = L0 / slug
    if not paper_dir.exists():
        return {"error": f"slug not found: {slug}"}

    review_md = read(paper_dir / "review.md")
    full_md = read(paper_dir / "full.md")
    if not full_md:
        return {"error": f"no full.md for {slug}"}

    # Step 1: Find L2 page
    l2_page = find_l2_for_slug(slug)
    l2_meta = parse_l2_frontmatter(l2_page) if l2_page else {}
    l2_content = read(l2_page) if l2_page else ""

    # Step 2: Find L3 pages
    l3_pages = find_l3_pages(review_md + " " + full_md, n=2)
    l3_content = ("\n\n---\n\n".join(
        f"## {p.stem}\n{read(p)}" for p in l3_pages
    )) if l3_pages else ""

    # Step 3: Build prompt + call LLM
    prompt = build_prompt(slug, review_md, full_md, l2_content, l3_content)
    result = call_llm(prompt, model=model, max_tokens=3072)

    # Step 4: Parse output → write review.md
    new_section = parse_section(result, slug)
    if new_section:
        append(paper_dir / "review.md", new_section)

    # Step 5: Parse citations → write to-read.md
    added = 0
    for c in parse_citations(result):
        add_citation(c)
        added += 1

    # Step 6: Write log.md
    date = today()
    log_line = (
        f"## [{date}] re-read | {slug} (agent) — "
        f"L2={l2_page.stem if l2_page else 'none'}, "
        f"L3={','.join(p.stem for p in l3_pages) if l3_pages else 'none'}, "
        f"full.md={len(full_md.splitlines())} lines, "
        f"+{added} citations"
    )
    append(LOG, log_line)

    return {
        "ok": True,
        "slug": slug,
        "l2": str(l2_page) if l2_page else None,
        "l3": [str(p) for p in l3_pages],
        "citations": added,
        "log": log_line,
    }

# ── Prompt building ───────────────────────────────────────────────────────────

def build_prompt(slug, review_md, full_md, l2_content, l3_content) -> list:
    """Build message list for LLM (system + user)."""
    full_trimmed = full_md

    l2_trimmed = l2_content[:4000] if l2_content else "(no L2 lineage page found for this paper)"
    l3_trimmed = l3_content[:4000] if l3_content else "(no L3 module pages selected)"

    existing = "\n".join(review_md.splitlines()[-15:]) if review_md else "(no existing review)"

    system = textwrap.dedent("""\
    You are running the Paperweave reading flow. You are given a paper, its existing review,
    the L2 lineage context (what methods exist in this subfield), and L3 module context
    (what open problems and design trade-offs are documented).

    Your job:
    1. Read the full paper text and existing review
    2. Use the L2/L3 context to identify what the existing review MISSED
    3. Mine 0-5 citations from the References section that pass quality filter:
       - Top venue: Nature, Science, CVPR, ICCV, ECCV, NeurIPS, ICML, ICLR, AAAI, IJCAI,
         ACL, EMNLP, IEEE TGRS/GRSL, ISPRS, RSE
       - OR >20 citations
       - OR from: FAIR, DeepMind, OpenAI, MSR, Stanford, MIT, Berkeley, ETH, BAAI,
         清华, 北大, 武大LIESMARS, 中科院遥感所
       - OR RS core topics (foundation model, change detection, hyperspectral, SAR)

    LANGUAGE: Write the entire report in Chinese. Keep untranslatable technical terms
    in English (e.g., model names, algorithm names, metric names, dataset names).
    Do NOT Romanize or translate proper nouns.

    IMPORTANT OUTPUT FORMAT — follow exactly:

    ## [DATE] Re-review — agent

    **What I read:**
    - L2: <path or "not found">
    - L3: <paths or "none">
    - full.md: <N> lines

    **新见解（基于L2/L3领域知识）：**
    1. ...
    2. ...
    3. ...

    **引文挖掘：**
    - Paper Title (FirstAuthor et al., Year) — Venue — 1
    - Paper Title (FirstAuthor et al., Year) — Venue — 1

    **跨Wiki连接：**
    - 对比 [[L2_lineage/...]] — 原因
    - 关联 [[L3_module/...]] — 原因
    """)

    user = textwrap.dedent(f"""\
    ## Paper
    Slug: {slug}

    ## Existing Review
    {existing}

    ## Full Text
    {full_trimmed}

    ## L2 Lineage Context
    {l2_trimmed}

    ## L3 Module Context
    {l3_trimmed}

    ---
    Produce the re-review now. Use DATE={today()}. Ensure the output format matches exactly.
    """)

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]

# ── Output parsing ──────────────────────────────────────────────────────────────

def parse_section(result: str, slug: str) -> str:
    """Extract review section from LLM output."""
    m = re.search(r"(## \d{4}-\d{2}-\d{2} Re-review.*?)(?=\n## \d|\n```|\Z)", result, re.DOTALL)
    if m:
        return m.group(1).strip()
    idx = result.find("## ")
    if idx >= 0:
        return result[idx:].strip()
    return ""

def parse_citations(result: str) -> list[str]:
    """Extract citation entries from LLM output."""
    lines = []
    in_citation_section = False
    for line in result.splitlines():
        s = line.strip()
        if "**Citation" in s or s.startswith("### Citation"):
            in_citation_section = True
            continue
        if not in_citation_section:
            continue
        if s.startswith("## ") or s.startswith("**Cross"):
            break
        if re.match(r"^- .+\(.+?\d{4}\).*—", s):
            lines.append(s)
    return lines

# ── CLI ───────────────────────────────────────────────────────────────────

def cmd_read(args):
    if args.slug:
        slugs = [args.slug]
    else:
        candidates = [d.name for d in L0.iterdir() if d.is_dir() and (d / "full.md").exists()]
        import random
        random.shuffle(candidates)
        slugs = candidates[:args.batch]

    results = []
    for slug in slugs:
        print(f"\n{'='*60}\nReading: {slug}")
        try:
            r = read_paper(slug, model=args.model)
            results.append(r)
            status = "OK" if r.get("ok") else f"FAIL: {r.get('error', 'unknown')}"
            print(f"  → {status} | citations: {r.get('citations', 0)}")
        except Exception as e:
            err(f"Failed: {slug}: {e}")
            results.append({"error": str(e), "slug": slug})

    print(f"\n=== REPORT ({len(results)} papers) ===")
    print(json.dumps(results, indent=2, ensure_ascii=False))


def cmd_check(args):
    """Scan for reviews >N days stale."""
    limit = datetime.date.today() - datetime.timedelta(days=args.days)
    stale = []
    for d in sorted(L0.iterdir()):
        rp = d / "review.md"
        if not rp.exists():
            continue
        mtime = datetime.date.fromtimestamp(rp.stat().st_mtime)
        if mtime < limit:
            stale.append((d.name, mtime.isoformat()))

    if not stale:
        print(f"No stale reviews (> {args.days} days)")
    else:
        print(f"{len(stale)} stale reviews (> {args.days} days):")
        for slug, dt in stale[:20]:
            print(f"  {dt}  {slug}")


def cmd_scan(args):
    """Check to-read queue status."""
    content = read(TO_READ)
    lines = [l for l in content.splitlines() if l.startswith("- ")]
    print(f"to-read.md has {len(lines)} queued papers")
    for l in lines[:10]:
        print(f"  {l.strip()}")


def main():
    p = argparse.ArgumentParser(prog="agent", description="paperweave agent")
    p.add_argument("--model", help="LLM model override (e.g., openrouter/anthropic/claude-sonnet-4)")
    sub = p.add_subparsers(dest="cmd", required=True)

    r = sub.add_parser("read", help="Read random paper(s) from L0_raw")
    r.add_argument("--slug", help="Specific slug")
    r.add_argument("--batch", type=int, default=1, help="How many random papers")

    c = sub.add_parser("check", help="Find stale reviews")
    c.add_argument("--days", type=int, default=30, help="Stale threshold (days)")

    sub.add_parser("scan", help="Check to-read queue status")

    args = p.parse_args()
    if args.cmd == "read":
        cmd_read(args)
    elif args.cmd == "check":
        cmd_check(args)
    elif args.cmd == "scan":
        cmd_scan(args)


if __name__ == "__main__":
    main()
