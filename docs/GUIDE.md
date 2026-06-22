# Paperweave — Literature Curation System

> **Domain-agnostic, 5-layer system for organizing academic literature.**  
> Classify papers, build knowledge maps, and evolve your understanding with every re-read.
>
> Project root: `${PAPERWEAVE_ROOT}/`  
> Wiki: `paperweave/` — documentation & knowledge base  
> Tools: `tools/` — MinerU extraction, sync, zotero bridge, agent
> Legacy: `legacy/` — archived projects (pi-wiki-manager)

---

## Table of Contents

1. [What is Paperweave](#1-what-is-paperweave)
2. [Quick Start](#2-quick-start)
3. [The 5-Layer Knowledge Model](#3-the-5-layer-knowledge-model)
4. [Reading Papers](#4-reading-papers)
5. [Ingesting Papers from arXiv](#5-ingesting-papers-from-arxiv)
6. [Building L2 Lineage Pages](#6-building-l2-lineage-pages)
7. [Building L3 Module Pages](#7-building-l3-module-pages)
8. [Reference](#8-reference)

---

## 1. What is Paperweave

Paperweave is a literature curation system that organizes academic papers into a **5-layer knowledge hierarchy**:

| Layer | Name | Question |
|-------|------|----------|
| L0 | Raw source material | What papers do I have? |
| L1 | Ecology | Who works with whom? |
| L2 | Lineage | How do solutions evolve? |
| L3 | Module | What problems exist? |
| L4 | Editorial | Where to publish? |

Each layer serves a distinct purpose, from immutable paper storage to synthesized knowledge.

### Philosophy

- **Every read is a full read.** There is no "quick scan" or "shallow read" — every paper reading involves reading the full text (`full.md`).
- **Citation mining is not a separate task.** It happens naturally during full-text reading. When you read a paper's Related Work section, you discover new papers to read — update `to-read.md` immediately.
- **Re-read often.** "常看常新" (fresh eyes with accumulated knowledge). Each re-read may reveal new insights.
- **Open by design.** Anyone (human or agent) can use this system by following this guide.

---

## 2. Quick Start

```bash
# Explore the wiki structure
ls paperweave/

# See all ingested papers
ls paperweave/L0_raw/

# Check the citation mining queue
cat paperweave/to-read.md

# See the latest activity
tail -20 paperweave/log.md
```

### Prerequisites

- **Python 3.10+** for scripts
- **MinerU API key** (for PDF extraction): set `MINERU_TOKEN` in `.env` at project root
- **Git** for code review (clone repos)

### Key Files

| File | Purpose |
|------|---------|
| `paperweave/AGENT.md` | Agent operational rules |
| `paperweave/SCHEMA.md` | Framework constitution & taxonomy |
| `paperweave/index.md` | Full catalog of all wiki pages |
| `paperweave/log.md` | Append-only audit trail |
| `paperweave/to-read.md` | Citation mining queue |
| `tools/mineru_extract.py` | PDF → full.md extraction via MinerU API |
| `tools/sync.sh` | Nutstore WebDAV sync |
| `tools/zotero_bridge.py` | Zotero SQLite queries |

---

## 3. The 5-Layer Knowledge Model

```
paperweave/
├── L0_raw/              L0: Immutable source material
├── L1_ecology/          L1: Who works with whom?
├── L2_lineage/          L2: How do solutions evolve?
├── L3_module/           L3: What problems exist?
├── L4_editorial/        L4: Where to publish?
├── to-read.md           Meta: citation mining queue
├── AGENT.md             Meta: agent operation rules
├── SCHEMA.md            Meta: framework constitution
├── index.md             Meta: catalog of all pages
└── log.md               Meta: append-only audit trail
```

### L0 — Raw Source Material

**Location:** `paperweave/L0_raw/<slug>/`

Each paper gets a directory named by a slug of its title. Each directory contains:

| File | Content |
|------|---------|
| `full.md` | Full paper text (extracted by MinerU), including figures, tables, formulas |
| `review.md` | Human/agent review notes, score, citation mining, code review |
| `images/` | Extracted figures |
| `code/` | Cloned code repository (if open source) |

**Slug convention:** Lowercase, hyphen-separated, truncated to ~80 chars.  
Example: `ringmo-a-remote-sensing-foundation-model-with-masked-image-modeling`

**The `full.md` is the single source of truth.** All review decisions must be grounded in full.md content. `review.md` is the output (summary of the reading), not a replacement.

### L1 — Ecology (文献社交生态)

**Location:** `paperweave/L1_ecology/`

Answers: *Who are the key players? What are the research communities?*

Three registry files, updated every time a paper is read:

| File | Content |
|------|---------|
| `authors.md` | Author → Papers + Affiliations |
| `institutions.md` | Institution → Papers + Core Authors |
| `journals.md` | Venue → Papers + Links to L4 editorial pages |

### L2 — Lineage (方法演化)

**Location:** `paperweave/L2_lineage/<domain>/<task>/<approach>.md`

Answers: *How do solutions evolve?*

Method papers follow `domain → task → approach`:

```
lineage/
  <domain>/
    <task>/
      <approach>.md        ← method papers
    dataset/<name>.md      ← dataset papers
    benchmark/<name>.md    ← benchmark papers
    survey/<name>.md       ← survey papers
```

**Threshold:** 0 — even a single paper gets a page.
**Hybrid papers** (method + dataset) appear in both branches.

#### L2 Approach Page Template (9 sections)

1. **YAML frontmatter** — title, created, updated, type, domain, task, approach, tags, sources
2. **Overview** — what this approach is, paradigm evolution
3. **Evolution Timeline** — ASCII art chronological arc with milestones
4. **Comparison Table** — MANDATORY:

| Paper | Year | Score | Contribution | Compute | Dataset | Open Source | Code URL | Key Insight |
|-------|------|-------|-------------|---------|---------|-------------|----------|-------------|

5. **Design Taxonomy** — group papers by design dimension
6. **Cross-Paper Synthesis** — optional for 5+ paper pages
7. **Current SOTA** — best method per benchmark
8. **Open Issues** — synthesized from paper conclusions
9. **Related Approaches** — [[wikilinks]]

#### Deployability Assessment (in every comparison table)

| Field | Values | Question |
|-------|--------|----------|
| `open_source` | `true` / `false` / `partial` | Can I run their code? |
| `code_url` | URL or `—` | Where is it? |
| `compute` | e.g. `8×A100 80GB` or `—` | Can I afford it? |
| `dataset_access` | `public` / `private` / `upon-request` / `synthetic` | Can I get the data? |

### L3 — Module (问题驱动)

**Location:** `paperweave/L3_module/<problem>.md`

Answers: *What problems exist in this research area?*

Organized by **problem**, not by method. Each page:

1. **Problem definition** — why this is hard
2. **Design axes** — key trade-off dimensions
3. **Solution strategies** — organized by approach type, with paper evidence
4. **Evolution** — how solutions changed over time
5. **Open problems** — what remains unsolved
6. **Related problems** — cross-links to other L3 modules

Key L3 module topics for remote sensing:
- `modality-fusion` — fusion paradigms (early/intermediate/late/cross-attention/MoE)
- `geo-foundation-models` — design questions for RS FMs
- `model-efficiency` — architecture/data/training/inference efficiency
- `data-scarcity` — self-supervised, few-shot, transfer, weak labels
- `pretraining-paradigm` — objective × data source × scale trade-offs

### L4 — Editorial (出版指南)

**Location:** `paperweave/L4_editorial/`

Answers: *Where to publish?*

Venue-organized pages with key papers, acceptance rates, review guidelines.

### Meta Files

| File | Purpose |
|------|---------|
| `to-read.md` | Citation mining queue — aggregated from all paper readings. Format: `Paper (Authors, Year) — Venue — N` |
| `AGENT.md` | Agent operational rules (read by AI agents before operating the wiki) |
| `SCHEMA.md` | Framework constitution — taxonomy, tags, page templates |
| `index.md` | Full catalog with page counts per domain |
| `log.md` | Append-only audit trail of all actions |

---

## 4. Reading Papers

> **Every read is a full read of `full.md`.**  
> Citation mining is NOT a separate task — it happens naturally during reading.  
> review.md is the output (record of the reading), not a shortcut.

### Reading Flow

```
                  ┌─────────────────────────┐
                  │   if review.md exists?   │
                  └────────────┬────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Read review.md      │
                    │  ├── verify info     │
                    │  ├── fresh eyes      │
                    │  ├── discover new    │
                    │  ├── compare works   │
                    │  └── mine citations  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Load domain context │
                    │  ├── relevant L2 pg  │
                    │  └── related L3 pgs  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Read full.md        │
                    │  ├── verify review   │
                    │  ├── find new stuff  │
                    │  ├── check refs      │
                    │  └── note citations  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  If code available:  │
                    │  ├── git clone       │
                    │  └── check code      │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Update review.md    │
                    │  ├── fix/add content │
                    │  ├── new findings    │
                    │  ├── citation mining │
                    │  └── code review     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  If new L2/L3:       │
                    │  Update L2/L3 pages  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Update to-read.md  │
                    │  (citation results)  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Summarize reading   │
                    │  Update index.md     │
                    │  Write log.md        │
                    └──────────────────────┘
```

### Detailed Steps

#### Step 1: Read review.md (if it exists)

Goals when re-reading a paper:

| Goal | Question |
|------|----------|
| Verify | Is the YAML frontmatter correct? Is the score still reasonable? |
| Fresh eyes | With accumulated knowledge, do I see the paper differently? |
| Discover | What details did I miss last time? |
| Compare | How does this compare with papers I've read since? |
| Cite mine | Check Related Work, experimental baselines, direct predecessors |

#### Step 2: Load Domain Context (relevant L2 + L3)

**The problem:** Reading a paper with no accumulated knowledge leads to shallow reviews — the reader doesn't know what methods already exist in this lineage, what design trade-offs have been explored, or what open problems remain.

**The solution:** Before reading full.md, load the relevant domain knowledge pages. **Not all of them — only those directly relevant to this paper.**

How to find the right pages:

1. **For an already-classified paper (review.md exists):**
   ```
   # Read the paper's assigned L2 lineage page
   read paperweave/L2_lineage/<domain>/<task>/<approach>.md
   ```

2. **For a new paper (ingestion):**
   ```
   # Step a: Determine domain/task from title + abstract
   # Step b: Find the L2 page that best matches
   find paperweave/L2_lineage/<domain>/ -name "*.md"
   # Step c: Read the best match
   ```

3. **L3 module pages — load by relevance, not all of them:**
   - From the paper's tags or domain: select 1-2 most relevant L3 pages
   - Example: a remote sensing VLM paper → `L3_module/modality-fusion.md` + `L3_module/geo-foundation-models.md`
   - Example: a self-supervised pre-training paper → `L3_module/pretraining-paradigm.md` + `L3_module/data-scarcity.md`
   - If unsure which L3 pages are relevant, list the available pages (`ls paperweave/L3_module/`) and pick based on the paper's abstract keywords

**Scoping rules:**
- **Minimum:** 1 L2 page (the one the paper belongs to)
- **Maximum:** 1 L2 page + 2 L3 pages
- **Never load all L2/L3** — this violates the purpose. 全量加载不是知识积累，是 token 浪费。

With the L2 page loaded, you now know:
- What methods precede this paper in the lineage
- What baselines and benchmarks are standard in this subfield
- Where this paper fits in the evolution timeline

With the L3 pages loaded, you now know:
- What open problems exist in this area
- What design trade-offs are documented
- What "unsolved questions" this paper may (or may not) address

#### Step 3: Read full.md

- Verify review.md claims against the full text
- Check the References section for new papers to read
- Look for experiments/discussions that were missed
- Record new Key Insights

#### Step 4: Code Review (if open source)

```bash
# Clone code (skip datasets and weights)
git clone --depth 1 --filter=blob:none <repo> paperweave/L0_raw/<slug>/code/
rm -rf code/.git code/*.pth code/*.ckpt code/data/

# Review:
# - Does the implementation match the paper's claims?
# - Do the experiments support the conclusions?
# - How does the code compare with similar works?
```

Output goes into review.md's Notes section.

#### Step 5: Update review.md

Update or create the paper's `review.md`:

```yaml
---
slug: "paper-slug"
title: "Full Title"
authors:
  - "Author One"
  - "Author Two"
year: 2024
venue: "CVPR 2024"
tags: [domain, method, task]
score: 4
contribution: 4
soundness: 4
relevance: 5
open_source: true
code_url: "https://github.com/author/repo"
compute: "8×A100 80GB"
dataset_access: public
---

> **Abstract:** One-line summary from the paper.

## [YYYY-MM-DD] Review / Re-review

**Score:** 4/5
- Contribution: 4/5 — why
- Soundness: 4/5 — why
- Relevance: 5/5 — why

**Key Insights:**
- First insight
- Second insight

**Notes:**
- Venue info, compute, code availability
- Related papers noted

**Code Review:**
- (if applicable)
```

#### Step 6: Update L2/L3 (if warranted)

If the paper reveals new cross-paper patterns or suggests modifications to problem organization:

- Update existing L2 approach page comparison tables
- Update L3 module pages with new solution strategies
- Do NOT create new L2 pages without reviewing the full classification

#### Step 7: Update to-read.md

Citation mining happens *during* reading. When you find a paper worth reading:

1. Check if it's already in L0_raw (`grep -l "keyword" paperweave/L0_raw/*/review.md`)
2. Check if it's already in to-read.md
3. If new: add entry in format `- Short Name / Full Title (Authors, Year) — Venue — 1`
4. If already listed: increment the count

**Citation curation — quality over quantity.** Do NOT dump every qualifying reference. Select only 3-8 papers essential to understanding the paper's narrative, organized by relationship:

| Category | What to include |
|----------|----------------|
| 直接谱系 | Direct predecessors, same team |
| 范式基础 | Foundational techniques the paper relies on |
| 关键对手 | The approaches this paper claims to beat |
| 设计空间对比 | Sibling approaches with different design choices |

**Double-check against L0_raw by title, not just slug.** Many papers have slugs unrelated to their common name (e.g., LLaVA = `visual-instruction-tuning`, CLIP = `learning-transferable-visual-models-from-natural-language-supervision`). Always ALSO grep for the paper's short title in review.md frontmatter before adding to to-read.md:

```bash
grep -ril "LLaVA|CLIP" paperweave/L0_raw/*/review.md 2>/dev/null
```

**Quality filter** — only add papers meeting at least one:
- **Top venue:** Nature, Science, CVPR, ICCV, ECCV, NeurIPS, ICML, ICLR, AAAI, IJCAI, ACL, EMNLP, IEEE TGRS/GRSL, ISPRS, RSE, 遥感学报
- **RS core topic:** RS foundation model, change detection, hyperspectral, SAR, RS VLM
- **High impact:** >20 citations OR from top lab (FAIR, DeepMind, OpenAI, MSR, Stanford, MIT, Berkeley, ETH, 清华, 北大, 武大LIESMARS, 中科院遥感所)
- **Exception:** RS core papers (RS FM, RS+MoE/Mamba, hyperspectral+DL, SAR+DL, RS CD new paradigm) even if low citations

#### Step 8: Summarize + Update index + Log

- Review whether the wiki needs structural updates
- If new L2/L3 pages were created: update `index.md` counts
- Append to `log.md`:

```markdown
## YYYY-MM-DD action | description
- read: Paper Title (Authors, Year) — score N/5 — key takeaway
```

### Parallel Batch Reading (via subagents)

When processing many papers, delegate to parallel subagents:

```
delegate_task(tasks=[
  {goal: "read paper A", context: "..."},
  {goal: "read paper B", context: "..."},
  {goal: "read paper C", context: "..."},
])
```

**Rules:**
- Max 3 concurrent subagents
- 1 paper per subagent
- L1_ecology (shared state) → output to `/tmp/weaver-N-l1.json`, parent merges later
- Each subagent follows the full reading flow above

**Context template for subagents:**

```
Wiki: ${PAPERWEAVE_ROOT}/paperweave/
Paper slug: <slug>
full.md: <N> lines

Follow the Paperweave reading flow:
1. IF review.md exists: read it first
2. Load relevant L2 lineage page(s) + 1-2 L3 module pages for domain context
3. Read full.md fully (no skipping)
4. IF code open source: clone and review
5. Update/create review.md
6. Update L1_ecology registries
7. IF new L2/L3 thoughts: update pages
8. Update to-read.md (citation mining)
9. Update index.md + log.md
```

### Running the Flow on Other Agents (OpenCode, Claude Code, etc.)

The reading flow is agent-agnostic. To run it on a different coding agent (non-Hermes), use this step-by-step prompt template:

```
You are running the Paperweave reading flow on a paper.
Project: ${PAPERWEAVE_ROOT}/
Wiki: ${PAPERWEAVE_ROOT}/paperweave/

## Step 1: Read GUIDE.md sections 4 (Reading Papers)
Read the full reading flow at GUIDE.md "Reading Papers" section.

## Step 2: Load domain context
Find and read the relevant L2 lineage page for this paper.
Also read 1 relevant L3 module page.

## Step 3: Read the paper
Paper slug: <slug>

1. Read ${PAPERWEAVE_ROOT}/paperweave/L0_raw/<slug>/review.md (if exists)
2. Read ${PAPERWEAVE_ROOT}/paperweave/L0_raw/<slug>/full.md fully

## Step 4: Produce new knowledge
Write a NEW section to the end of ${PAPERWEAVE_ROOT}/paperweave/L0_raw/<slug>/review.md with format:

## [YYYY-MM-DD] Re-review — <agent-name>

**What I read:** 
- L2 page: <path>
- L3 page: <path>
- full.md: <line count> lines

**New insights not in previous review:**
1. <your own analysis, informed by L2/L3 context>
2. ...

**Citation mining:** List 2-3 papers from References section that pass the quality filter (top venue or top lab) and are NOT already in L0_raw/

**Cross-wiki connections:**
- Compare with [[L2_lineage/...]]
- Connects to [[L3_module/...]]

## Step 5: Update to-read.md
Append new citation entries. Update the header count.

## Step 6: Update log.md
Append: ## [YYYY-MM-DD] re-read | <paper-title> — score X/5 | L2 <page> + L3 <page> context, full.md <N> lines, <M> new insights + <K> citation mining


---

## 5. Ingesting Papers from arXiv

### Pipeline

```
SEARCH → QUALITY FILTER → DEDUP → FETCH → RAW PAGE → CLASSIFY → L2 PAGE
```

### Step 1: Search arXiv

Two methods:

**Method A — web_search (discovery):**

```
web_search("site:arxiv.org remote sensing foundation model 2025")
```

**Method B — arXiv API (structured metadata):**

```
python3 tools/search_arxiv.py "<query>" --max 10 --sort date
```

### Step 2: Quality Filter

Only ingest papers meeting at least one criterion:

| Tier | Remote Sensing | CV | ML/AI | NLP |
|------|---------------|----|-------|-----|
| S | ISPRS, RSE, Nature | CVPR, ICCV, ECCV | NeurIPS, ICML, ICLR | ACL, EMNLP |
| A | IEEE TGRS, GRSL | AAAI, IJCAI | JMLR, TPAMI | NAACL, TACL |
| A- | 遥感学报 | WACV, BMVC | AISTATS, UAI | CoNLL |

**Fallback:** citationCount > 20 OR from a top lab.
**Exception:** RS core topics (RS FM, RS+MoE/Mamba, hyperspectral+DL, SAR+DL, RS CD new paradigm) — always ingest.

Check venue via Semantic Scholar:

```bash
curl -s "https://api.semanticscholar.org/graph/v1/paper/arXiv:<id>?fields=publicationVenue,citationCount"
```

### Step 3: Deduplicate Against Zotero

```python
import sqlite3, re

DB = "${PAPERWEAVE_ROOT}/path/to/zotero.sqlite"  # Path to your Zotero SQLite database

def normalize(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())

def check_exists(title):
    """Check if paper exists in Zotero by title similarity."""
    norm = normalize(title)
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("""
        SELECT i.key, (SELECT v.value FROM itemData d
            JOIN itemDataValues v ON d.valueID = v.valueID
            JOIN fields f ON d.fieldID = f.fieldID
            WHERE d.itemID = i.itemID AND f.fieldName = 'title') as title
        FROM items i
        WHERE i.itemTypeID IN (
            SELECT itemTypeID FROM itemTypes
            WHERE typeName IN ('journalArticle','conferencePaper','preprint')
        )
    """).fetchall()
    for row in rows:
        if row['title'] and len(norm) > 20:
            n2 = normalize(row['title'])
            if norm in n2 or n2 in norm:
                return (True, row['title'], row['key'])
            w1, w2 = set(norm.split()), set(n2.split())
            if len(w1) > 5 and len(w2) > 5:
                overlap = len(w1 & w2) / min(len(w1), len(w2))
                if overlap > 0.75:
                    return (True, row['title'], row['key'])
    return (False, None, None)
```

### Step 4: Fetch + Create Raw Page

```bash
# Get metadata
web_extract(urls=["https://arxiv.org/abs/<id>"])

# Extract full text (if needed)
python3 tools/mineru_extract.py \
  --url "https://arxiv.org/pdf/<id>" \
  --slug "<paper-slug>" \
  --language en
```

Output lands in `paperweave/L0_raw/<slug>/full.md` and `paperweave/L0_raw/<slug>/images/`.

**Batch extraction — two-phase strategy:**

Phase 1 — URL priority (fast):
```bash
cd ${PAPERWEAVE_ROOT}
python3 -u tools/batch_extract.py
```
Uses arXiv/DOI URLs when available, fallback to file upload. Rate-limited (10s between submissions). Resume-safe — skips papers where `full.md` already exists.

Phase 2 — file retry for remaining papers (slower):
```bash
python3 -u tools/retry_file_extract.py
```
Extracts PDF from Zotero zip attachments and uploads via `mineru_extract.py --file`. Catches papers behind paywalls (Elsevier, IEEE, Springer) that Phase 1 couldn't access via URL.

Expected yield: ~67% via URL (Phase 1) + ~30% via file (Phase 2) + ~2% unextractable (no zip file on disk).

**Diagnostic checklist after extraction:**
```bash
# 1. Check all L0_raw entries have full.md + images/
for d in paperweave/L0_raw/*/; do
  name=$(basename "$d"); ok="Y"
  [ ! -f "$d/full.md" ] && ok="N"; [ ! -d "$d/images" ] && ok="N"
  [ "$ok" != "Y" ] && echo "INCOMPLETE: $name"
done && echo "Done"

# 2. Check extraction progress
ls paperweave/L0_raw/*/full.md | wc -l
```

### Step 5: Classify into L2

Determine `domain → task → approach`:

```python
def classify(title, abstract, categories):
    text = (title + " " + abstract).lower()
    # Domain keywords
    if any(k in text for k in ['remote sensing', 'satellite', 'sar', 'hyperspectral']):
        domain = 'remote-sensing'
    elif any(k in text for k in ['vision-language', 'multimodal', 'vlm']):
        domain = 'multimodal'
    elif any(k in text for k in ['image', 'segmentation', 'detection']):
        domain = 'computer-vision'
    # ... more domains
    return (domain, task, approach)
```

### Step 6: Update L2 Page

Add paper to the appropriate L2 approach page's comparison table. If no page exists for this approach, create a new one using the template.

### Step 7: Post-Ingestion Checklist

- [ ] Paper appears in `paperweave/L0_raw/<slug>/`
- [ ] Paper is referenced by at least one L2 approach page (`sources` frontmatter)
- [ ] `index.md` reflects new counts
- [ ] `log.md` has ingestion summary
- [ ] No duplicates (Zotero check passed)

---

## 6. Building L2 Lineage Pages

### From Scratch

Use the L2 page template (see §3 above). When building many pages at once:

```python
# Batch create directories
for domain, tasks in taxonomy.items():
    for task in tasks:
        mkdir -p f"paperweave/L2_lineage/{domain}/{task}/"

# Generate pages
for page_spec in pages:
    write_file(f"paperweave/L2_lineage/{page_spec['path']}", template_content)
```

### Extracting Data from Papers for Comparison Tables

For each paper in an approach page, extract:

| Field | Source | Example |
|-------|--------|---------|
| title | full.md title | "RingMo" |
| year | full.md metadata | 2022 |
| venue | publication info | "IEEE TGSR" |
| method | Abstract + Method section | MAE + Swin Transformer |
| pretraining_data | Dataset section | {dataset, size, resolution, sources} |
| downstream_tasks | Experiments | scene_classification: AID, NWPU |
| key_metrics | Results tables | {"DIOR mAP50": "75.90%"} |
| compute | Methods/Appendix | 8×A100-80G, 300 epochs |
| code_url | Conclusion/GitHub | "https://..." |

**Do NOT regex-extract from MinerU output.** MinerU mixes markdown, HTML tables, and LaTeX — regex fails miserably. Use a subagent to read each full.md and extract structured data.

### Coverage Check

After building/updating approach pages, verify every L0_raw paper has an L2 home:

```python
all_slugs = set(os.listdir("paperweave/L0_raw"))
all_sources = set()
# Collect all slugs from L2 page frontmatter `sources` fields
uncovered = all_slugs - all_sources
# Target: >80% coverage
```

---

## 7. Building L3 Module Pages

L3 pages are **problem-organized**, not method-organized. They answer *"What are the key unsolved problems in this field, and how do different papers approach them?"*

### Structure

1. **Problem definition** — why this is hard
2. **Design axes** — key trade-off dimensions
3. **Solution strategies** — by approach type, with paper evidence
4. **Evolution** — how solutions changed over time
5. **Paper mapping** — which papers exemplify which paradigm
6. **Open problems** — what remains unsolved
7. **Related problems** — cross-links to other L3 modules

### Key L3 Topics (Remote Sensing)

| Module | Core Questions |
|--------|---------------|
| `modality-fusion` | Early vs late vs cross-attention vs MoE fusion? |
| `geo-foundation-models` | What makes a good RS FM? MAE vs contrastive vs supervised? |
| `model-efficiency` | How to reduce compute without sacrificing accuracy? |
| `data-scarcity` | Self-supervised, few-shot, transfer, weak labels — which works when? |
| `pretraining-paradigm` | MIM vs contrastive vs supervised — trade-offs by scale? |

---

## 8. Reference

### Tag Taxonomy

5 fixed slots:

| Slot | Meaning | Examples |
|------|---------|---------|
| 领域 (Domain) | L2 domain scope | `remote-sensing`, `cv`, `nlp`, `graph` |
| 方法 (Method) | L2 approach resolution | `transformer`, `cnn`, `contrastive`, `moe` |
| 任务 (Task) | L2 task resolution | `classification`, `segmentation`, `detection` |
| 属性 (Attribute) | Cross-cutting | `dataset`, `benchmark`, `survey`, `theory` |
| 元 (Meta) | Knowledge about knowledge | `comparison`, `controversy`, `tutorial` |

**Expansion rule:** Prefer `existing-tag-1 + existing-tag-2` over creating new tags.

### Scoring Rubric

| Score | Meaning |
|-------|---------|
| 5 | Exceptional — changes how I think |
| 4 | Strong — would build on or cite |
| 3 | Decent — useful but incremental |
| 2 | Weak — major flaws |
| 1 | Poor — not worth reading |

Sub-dimensions: `contribution` (novelty), `soundness` (rigor), `relevance` (to your research).

### Files to Update After Changes

1. `SCHEMA.md` — if threshold or taxonomy rules change
2. `AGENT.md` — if workflow steps change
3. `index.md` — on every structural change (create/archive/split)
4. `log.md` — on every action (append-only)
5. `to-read.md` — on every paper reading (citation mining)

### Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| review.md too brief for citation mining | Always read full.md. review.md is the output, not input. |
| Subagents timeout on large full.md | 1000+ lines → use pro model or reduce batch size |
| Domain name inconsistency | Always normalize after Phase 1 classification |
| L1 file conflicts with parallel subagents | Output to /tmp/weaver-N-l1.json, merge centrally |
| Orphan papers (no L2 home) | Run coverage check after every rebuild |
| MinerU artifact accumulation | Clean up layout.json, content_list.json after extraction |
| Year extraction errors from subagents | Verify years manually, especially for preprints |
