#!/usr/bin/env python3
"""
SciJudge Re-Read — directly append to review.md
==============================================
Flow:
  1. Read review.md (accumulated "fresh eyes" perspective)
  2. Load domain context (L2 lineage + 1-2 L3 modules)
  3. Read full.md fully (verify review, discover new, check refs)
  4. Skip code review
  5. APPEND to review.md: ## [YYYY-MM-DD] SciJudge Re-Read
  6. Check if L2/L3 need updates
  7. Update to-read.md (citation mining results)
  8. Write log

Usage: python3 rereview.py [--slugs slug1,slug2]
Output: directly appended to wiki/L0_raw/<slug>/review.md
        comparison diff also written to same file
"""

import os, sys, json, time, random, re
from pathlib import Path
from datetime import date, datetime
from urllib.request import Request, urlopen

# Configurable LLM endpoint via env var
API = os.environ.get("PAPERWEAVE_LLM_API", "http://localhost:8000/v1/chat/completions")
PAPERWEAVE_ROOT = os.environ.get("PAPERWEAVE_ROOT", "/mnt/disk1/Gongzs/paperweave")
WIKI = os.path.join(PAPERWEAVE_ROOT, "wiki")
TODAY = date.today().isoformat()

# ══════════════════════════ Utility functions ══════════════════════════

def call_scijudge(system: str, user: str, max_tokens: int = 1536, timeout: int = 300) -> str:
    body = json.dumps({
        "model": "SciJudge-30B",
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "max_tokens": max_tokens,
        "temperature": 0.7,
    }).encode()
    req = Request(API, body, {"Content-Type": "application/json"})
    resp = urlopen(req, timeout=timeout)
    return json.loads(resp.read())["choices"][0]["message"]["content"]


def read_file(path: str) -> str:
    p = Path(path)
    if not p.exists():
        return ""
    return p.read_text(encoding="utf-8", errors="replace")


def all_paper_slugs():
    slugs = []
    for d in Path(f"{WIKI}/L0_raw").iterdir():
        if d.is_dir() and (d / "full.md").exists():
            slugs.append(d.name)
    return slugs


def pick_random(slugs, n=2):
    # Prefer medium-sized (5KB-150KB), too small = no content, too large = token bomb
    good = [s for s in slugs if 5000 < (Path(WIKI)/"L0_raw"/s/"full.md").stat().st_size < 150000]
    pool = good if len(good) >= n else slugs
    return random.sample(pool, min(n, len(pool)))


def parse_review_frontmatter(review_text: str) -> dict:
    """Extract YAML metadata from review.md."""
    m = re.search(r'^---\s*\n(.*?)\n---', review_text, re.DOTALL)
    if not m:
        return {}
    fm = {}
    for line in m.group(1).strip().split("\n"):
        if ":" in line:
            k, v = line.split(":", 1)
            fm[k.strip()] = v.strip().strip('"')
    return fm


# ══════════════════════════ Main flow ══════════════════════════

def find_l2_page(slug: str, review_text: str) -> str:
    """Find corresponding L2 lineage page for a paper."""
    fm = parse_review_frontmatter(review_text)

    for l2 in Path(f"{WIKI}/L2_lineage").rglob("*.md"):
        content = l2.read_text(encoding="utf-8", errors="replace")
        if slug in content:
            return l2.read_text(encoding="utf-8", errors="replace")[:4000]

    tags = fm.get("tags", "")
    domain = "remote-sensing"
    if "computer-vision" in tags:
        domain = "computer-vision"

    domain_dir = Path(f"{WIKI}/L2_lineage") / domain
    if domain_dir.exists():
        for l2 in domain_dir.rglob("*.md"):
            return l2.read_text(encoding="utf-8", errors="replace")[:4000]

    return ""


def find_l3_pages(slug: str, review_text: str, full_text: str) -> list:
    """Find 1-2 most relevant L3 module pages."""
    keywords = []
    if "fusion" in full_text[:3000].lower() or "multi-modal" in full_text[:3000].lower():
        keywords.append("modality-fusion")
    if "foundation model" in full_text[:3000].lower() or "pretrain" in full_text[:3000].lower():
        keywords.append("geo-foundation-models")
    if "few-shot" in full_text[:3000].lower() or "self-supervised" in full_text[:3000].lower():
        keywords.append("data-scarcity")
    if "efficiency" in full_text[:3000].lower():
        keywords.append("model-efficiency")
    if "pre-train" in full_text[:3000].lower() or "mae" in full_text[:3000].lower():
        keywords.append("pretraining-paradigm")
    if "vlm" in full_text[:3000].lower() or "vision-language" in full_text[:3000].lower():
        keywords.append("vision-language")
    if "change detection" in full_text[:3000].lower():
        keywords.append("change-detection")
    if "representation" in full_text[:3000].lower():
        keywords.append("representation-learning")

    pages = []
    l3_dir = Path(f"{WIKI}/L3_module")
    for kw in keywords[:2]:
        for p in l3_dir.glob(f"*{kw}*.md"):
            pages.append(p.read_text(encoding="utf-8", errors="replace")[:3000])
            break
    return pages


def build_review_prompt(full_text: str, orig_review: str, l2_context: str, l3_contexts: list) -> str:
    """Build prompt — output is a section to append to review.md."""

    l2_block = l2_context[:3000] if l2_context else "No L2 lineage page found."
    l3_block = "\n\n---\n\n".join(l3_contexts[:2]) if l3_contexts else "No L3 module pages loaded."

    return f"""# Paperweave Re-Read — SciJudge

You are re-reading a paper already in the knowledge base. Output a review section to be APPENDED to the paper's review.md.

## Original Review (accumulated knowledge)
{orig_review[:3000]}

## Domain Context — L2 Lineage
{l2_block}

## Domain Context — L3 Module Pages
{l3_block}

## Paper Full Text (full.md)
{full_text[:12000]}

## Instructions

Output a markdown section to be appended to review.md. Use exactly this format:

## [{TODAY}] SciJudge Re-Read

**Score:** N/5
- Contribution: N/5 — rationale
- Soundness: N/5 — rationale
- Relevance: N/5 — rationale

**Key Insights:**
- [Insight 1 — with specific evidence from the paper]
- [Insight 2]
- ...

**Compared to L2 Lineage:**
- [How this paper compares to others in same lineage]

**Notes:**
- Venue, compute, code availability
- Any discrepancies with original review

**Citation Mining (3-8 papers):**
- 直接谱系: Paper Title — Venue — why
- 范式基础: Paper Title — Venue — why
- 关键对手: Paper Title — Venue — why
- 设计空间对比: Paper Title — Venue — why

**原始 review 验证:**
- [What still holds / what needs updating]

Do NOT output YAML frontmatter. The frontmatter already exists in review.md.
Output in Chinese (or English). Be specific — cite evidence from the paper text."""


def re_review_paper(slug: str):
    """Execute full GUIDE.md reading flow for one paper, append to review.md."""
    base = Path(f"{WIKI}/L0_raw") / slug
    review_path = base / "review.md"

    full_text = read_file(base / "full.md")[:20000]
    orig_review = read_file(review_path)[:5000]

    # ── Step 2: Load domain context ──
    l2 = find_l2_page(slug, orig_review)
    l3 = find_l3_pages(slug, orig_review, full_text)

    # ── Step 3: Build prompt and call SciJudge ──
    prompt = build_review_prompt(full_text, orig_review, l2, l3)

    system = """You are a scientific reviewer following the Paperweave reading flow.
You have domain context from L2 lineage pages and L3 module pages.
Use this context to produce a deeper, more context-aware re-review.
Do NOT output YAML frontmatter. Output ONLY the markdown section starting with '## [DATE] SciJudge Re-Read'."""

    new_review = call_scijudge(system, prompt, max_tokens=1536)

    # ── Comparison analysis ──
    diff_prompt = f"""Compare these two reviews of the same paper.
Identify 3-5 key differences in depth, insight, or assessment.
Focus on what SciJudge noticed or missed compared to the original review.

=== Existing review.md (before this re-read) ===
{orig_review[:2500]}

=== SciJudge Re-Read (just generated) ===
{new_review[:2500]}

Output in Chinese. Format:
1. [差异点]: 具体差异描述
2. ...
3. ...
4. (if applicable)
5. (if applicable)"""

    diff = call_scijudge(
        "You are comparing two AI-generated paper reviews. Be fair and specific.",
        diff_prompt, max_tokens=600,
    )

    # ── Build append content ──
    append_text = f"\n\n{new_review.strip()}\n\n### Cross-Review Diff (vs previous reviews)\n\n{diff.strip()}\n"

    # ── Write to review.md ──
    existing = read_file(review_path)
    with open(review_path, "a", encoding="utf-8") as f:
        f.write(append_text)

    # ── Also save copy to scijudge_rereviews directory ──
    out_dir = Path(os.path.expanduser(f"~/scijudge_rereviews/{TODAY}")) / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "original_review.md").write_text(orig_review)
    (out_dir / "scijudge_review.md").write_text(new_review)
    (out_dir / "diff.txt").write_text(diff)

    return slug, new_review, diff


# ══════════════════════════ Main ══════════════════════════

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--slugs", help="Comma-separated slugs, or leave empty for random")
    args = parser.parse_args()

    if args.slugs:
        slugs = args.slugs.split(",")
    else:
        all_slugs = all_paper_slugs()
        slugs = pick_random(all_slugs, n=2)

    # API health check
    health_url = API.rsplit("/v1/chat/completions", 1)[0] + "/health"
    try:
        urlopen(Request(health_url), timeout=5)
    except:
        print(f"ERROR: SciJudge API not reachable at {API}")
        sys.exit(1)

    print(f"# SciJudge Re-Read {TODAY}")
    print(f"Papers: {slugs}")
    print(f"Output: APPENDING to wiki/L0_raw/<slug>/review.md")

    for slug in slugs:
        print(f"\n{'='*60}")
        print(f"Processing: {slug[:80]}")
        try:
            s, review, diff = re_review_paper(slug)
            print(f"  ✓ SciJudge review: {len(review)} chars")
            print(f"  ✓ Diff analysis: {len(diff)} chars")
            print(f"  ✓ Appended to review.md")
            score_m = re.search(r'\*\*Score:\*\*\s*(\d+)/5', review)
            if score_m:
                print(f"  Score: {score_m.group(1)}/5")
        except Exception as e:
            print(f"  ✗ FAILED: {e}")

    print(f"\nDone. → {WIKI}/L0_raw/<slug>/review.md (appended)")
