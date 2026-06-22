---
name: curation
description: Daily arXiv curation and to-read queue filtering
---

# Curation

## What it does
Two-part daily curation system:
1. **Re-Review** (`rereview.py`): Selects random papers from the wiki, re-reads them with domain context (L2/L3), and appends a fresh SciJudge review to `review.md` with cross-review diff analysis.
2. **To-Read Filter** (`toread_filter.py`): Evaluates new entries in `to-read.md`, searches arXiv for abstracts, and uses SciJudge to score each paper (1-5) based on relevance to the knowledge base.

## Prerequisites
- SciJudge LLM API running at `PAPERWEAVE_LLM_API` (default: `http://localhost:8000/v1/chat/completions`)
- `PAPERWEAVE_ROOT` env var
- Python standard library only (no extra deps beyond `urllib`)

## Curation Workflow

### Re-Review (`rereview.py`)
1. Selects 2 random papers from `wiki/L0_raw/` (prefers medium-sized papers: 5KB–150KB `full.md`)
2. For each paper:
   - Loads existing `review.md`
   - Finds L2 lineage page (by slug search or domain inference)
   - Finds 1-2 L3 module pages (by keyword matching)
   - Builds a SciJudge review prompt with full paper text + domain context
   - Calls SciJudge API for a fresh re-review
   - Runs a comparison prompt to diff old vs new review
   - Appends review + diff to `review.md`
   - Saves a copy to `~/scijudge_rereviews/<date>/<slug>/`

```bash
# Random 2 papers
python3 rereview.py

# Specific papers
python3 rereview.py --slugs slug1,slug2
```

### To-Read Filter (`toread_filter.py`)
1. Parses `wiki/to-read.md` for unevaluated entries (without `[SciJudge:` marker)
2. Collects anchor papers: top-scored (≥4) papers from L0_raw as comparison baseline
3. For each entry: searches arXiv API for abstract, then asks SciJudge to score 1-5
4. Updates `to-read.md` inline: appends `[SciJudge: X/5] — reason` to each entry
5. Saves evaluation log to `~/scijudge_curation/<date>.json`

```bash
# Live update to-read.md
python3 toread_filter.py

# Dry run (no file writes)
python3 toread_filter.py --dry-run
```

### LLM Filter Logic
SciJudge scores papers based on:
- **5**: Must-read, likely high-impact
- **4**: Worth reading, solid contribution
- **3**: Borderline, read if time permits
- **2**: Low priority
- **1**: Skip, unlikely to be useful

Evaluation criteria: novelty, relevance to multimodal remote sensing / foundation models / agriculture, venue prestige.

## Cron Setup
```cron
# Daily curation run
0 4 * * * cd /mnt/disk1/Gongzs/paperweave && python3 skills/curation/rereview.py && python3 skills/curation/toread_filter.py
```

## Files
- `rereview.py`: SciJudge-driven paper re-review with L2/L3 context and diff analysis
- `toread_filter.py`: SciJudge-driven to-read queue scoring with arXiv abstract lookup
