#!/usr/bin/env python3
"""
SciJudge Smart To-Read Filter: evaluate whether papers in to-read.md are worth ingesting.

Logic:
1. Read to-read.md, find unevaluated new entries
2. For each, search arxiv for abstract
3. SciJudge compares against Paperweave anchor papers, evaluates if worth reading
4. Update to-read.md: append [SciJudge: SCORE] markers

Usage:
  python3 toread_filter.py
  python3 toread_filter.py --dry-run  # output only, no write
"""
import os, sys, json, time, re
from pathlib import Path
from urllib.request import Request, urlopen

# Configurable LLM endpoint via env var
API = os.environ.get("PAPERWEAVE_LLM_API", "http://localhost:8000/v1/chat/completions")
PAPERWEAVE_ROOT = os.environ.get("PAPERWEAVE_ROOT", "/mnt/disk1/Gongzs/paperweave")
TO_READ = os.path.join(PAPERWEAVE_ROOT, "wiki", "to-read.md")
WIKI = os.path.join(PAPERWEAVE_ROOT, "wiki")

def parse_to_read():
    """Parse to-read.md, return list of unevaluated entries"""
    text = Path(TO_READ).read_text()
    entries = []
    for line in text.split("\n"):
        line = line.strip()
        if not line.startswith("- "):
            continue
        if "SciJudge:" in line:
            continue  # already evaluated
        entries.append(line[2:])  # remove "- "
    return entries, text

def get_anchor_papers():
    """Collect high-score papers from Paperweave as anchors"""
    anchors = []
    for d in Path(f"{WIKI}/L0_raw").iterdir():
        if d.is_dir() and (d / "review.md").exists():
            review = (d / "review.md").read_text()
            title_m = re.search(r'title:\s*"(.+?)"', review)
            score_m = re.search(r'score:\s*(\d+)', review)
            abstract_m = re.search(r'Abstract:\*\*\s*(.+?)(?:\n|$)', review)
            if title_m and score_m and int(score_m.group(1)) >= 4:
                anchors.append({
                    "title": title_m.group(1),
                    "abstract": abstract_m.group(1)[:300] if abstract_m else "N/A",
                    "score": int(score_m.group(1)),
                })
    return anchors[:30]  # limit to 30 to avoid token overflow

def search_arxiv(title):
    """Search arxiv for abstract (simplified)"""
    import urllib.parse
    try:
        url = f"https://export.arxiv.org/api/query?search_query=ti:{urllib.parse.quote(title[:80])}&max_results=1"
        req = Request(url, headers={"User-Agent": "SciJudge-Curator/1.0"})
        resp = urlopen(req, timeout=15)
        data = resp.read().decode()
        abstract_m = re.search(r'<summary>(.+?)</summary>', data, re.DOTALL)
        published_m = re.search(r'<published>(\d{4}-\d{2}-\d{2})', data)
        if abstract_m:
            abstract = re.sub(r'\s+', ' ', abstract_m.group(1).strip())
            date = published_m.group(1) if published_m else "unknown"
            return abstract[:800], date
    except Exception as e:
        print(f"  Search warning: {e}")
    return None, None

def ask_scijudge(system, user, max_tokens=512, timeout=120):
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

def evaluate_entry(entry: str, anchors: list):
    """Evaluate a single to-read entry"""
    parts = entry.split(" — ")
    title = parts[0].strip()
    venue = parts[1].strip() if len(parts) > 1 else "unknown"
    rec_count = parts[2].strip() if len(parts) > 2 else "0"

    abstract, pub_date = search_arxiv(title)

    anchor_text = "\n".join(
        f"- {a['title']} (score {a['score']})" for a in anchors[:15]
    )

    system = """You are a research curator evaluating whether a paper should be added to a remote sensing knowledge base.
Output ONLY one line with the format: [SciJudge: X/5] — brief reason (≤80 chars)
Where X is 1-5 based on:
- 5: Must-read, likely high-impact
- 4: Worth reading, solid contribution
- 3: Borderline, read if time permits
- 2: Low priority
- 1: Skip, unlikely to be useful
Consider: novelty, relevance to multimodal remote sensing / foundation models / agriculture, venue prestige."""

    user = f"""Evaluate this paper:

Title: {title}
Venue: {venue}
Recommendations: {rec_count}
Abstract: {abstract or 'Not found'}
Published: {pub_date or 'unknown'}

Compare against existing top papers in our knowledge base:
{anchor_text}

Output format: [SciJudge: X/5] — reason"""

    return ask_scijudge(system, user, max_tokens=128, timeout=90)


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    entries, original_text = parse_to_read()
    anchors = get_anchor_papers()

    print(f"# SciJudge To-Read Filter")
    print(f"Entries to evaluate: {len(entries)}")
    print(f"Anchor papers: {len(anchors)}")
    print(f"Mode: {'DRY RUN' if dry_run else 'LIVE UPDATE'}")
    print()

    results = []
    for i, entry in enumerate(entries[:10]):  # max 10 per run
        print(f"[{i+1}/{min(len(entries),10)}] {entry[:80]}...")
        try:
            score_line = evaluate_entry(entry, anchors)
            results.append((entry, score_line))
            print(f"  → {score_line}")
        except Exception as e:
            results.append((entry, f"[SciJudge: ?/5] — API error: {e}"))
            print(f"  ✗ Error: {e}")

    if not dry_run and results:
        new_text = original_text
        for entry, score_line in results:
            old_line = f"- {entry}"
            new_line = f"- {entry} {score_line}"
            new_text = new_text.replace(old_line, new_line)
        Path(TO_READ).write_text(new_text)
        print(f"\n✓ Updated {TO_READ}")

    from datetime import date
    log_dir = Path(os.path.expanduser(f"~/scijudge_curation"))
    log_dir.mkdir(exist_ok=True)
    log_file = log_dir / f"{date.today().isoformat()}.json"
    json.dump({"date": date.today().isoformat(), "results": [(e, s) for e, s in results]},
              open(log_file, "w"), ensure_ascii=False, indent=2)
    print(f"Log: {log_file}")
