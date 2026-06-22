# Paperweave Knowledge Base

## What This Is

**👤 For Human**

A curated, five-layer academic literature knowledge base — 144 papers, 61 method lineage pages, 8 problem modules, 4 venue profiles across remote sensing, computer vision, multimodal, NLP, graph learning, and beyond.

This is not a demo. This is an active, researcher-maintained knowledge base you can clone and continue building upon. Every page is the product of full-text reading, cross-paper synthesis, and citation mining.

## Stats

**🤖👤 For Both**

- 144 papers in L0_raw (not included — build via ingestion)
- 141 paper reviews (scores, insights, citation mining)
- 61 L2 lineage pages across 10 research domains
- 8 L3 problem modules
- 4 L4 venue profiles
- 3 L1 ecology registries (461+ authors, 80 institutions, 36 journals)

## Five-Layer Model

**👤 For Human**

| Layer | Directory | Core Question | Content |
|-------|-----------|---------------|---------|
| **L0** | `L0_raw/` | What does the original say? | Immutable. Full text, images, code. *(not included — build your own via ingestion pipeline)* |
| **L1** | `L1_ecology/` | Who works with whom? | 3 registries: 461+ authors, 80 institutions, 36 journals |
| **L2** | `L2_lineage/` | How do methods evolve? | 61 method comparison pages, domain → task → approach |
| **L3** | `L3_module/` | What problems exist? | 8 cross-paper problem syntheses with evidence and trade-offs |
| **L4** | `L4_editorial/` | Where to submit? | 4 venue profiles with RS-specific positioning strategies |

Each layer organizes knowledge from a different dimension. Cross-references between layers use `[[wikilink]]` syntax.

## What You Can Do With This

**👤 For Human**

- **Continue reading**: Clone and use the papereader to read papers already reviewed here
- **Extend**: The L1 registries and L2 lineage pages are designed to grow — add your own papers
- **Learn the method**: Study the strand pages to understand how to organize your own literature
- **Build your own wiki**: Use `docs/BUILD.md` to set up ingestion pipeline and start your own instance

## Review Format

**🤖 For Agent**

Reviews live at `L0_reviews/<slug>/review.md`. Each review is a product of full-text reading by a human researcher and/or AI Agent.

**YAML frontmatter:**
- `title`, `authors`, `year`, `venue`
- `score` (1-5 holistic), `contribution`, `soundness`, `relevance`
- `tags` — domain, method type, task
- `open_source`, `code_url`, `compute`, `dataset_access`

**Body:**
- Abstract summary
- Dated review sections (initial read + re-reviews)
- Key insights and notes
- Citation mining results (discovered papers added to to-read queue)

**When writing a review**, use the above structure. Cross-reference other layers via `[[wikilink]]` inside review bodies. Stats: 141 of 144 papers reviewed; many have 2+ re-review entries tracking evolving understanding (2025-05 through 2026-06).

## Directory Structure

**🤖👤 For Both**

```
paperweave/
├── L0_reviews/        # 141 paper reviews (scores, insights, citation mining)
├── L1_ecology/        # 3 registry files: authors, institutions, journals
├── L2_lineage/        # 61 pages across 10 domains
├── L3_module/         # 8 problem syntheses
├── L4_editorial/      # 4 venue profiles
├── README.md
└── README_zh.md
```

## Related Docs

- [docs/SPEC.md](../docs/SPEC.md) — Protocol specification (five-layer model, YAML schema, API contract)
- [docs/GUIDE.md](../docs/GUIDE.md) — Full user guide (reading workflow, ingestion, agent usage)
- [docs/BUILD.md](../docs/BUILD.md) — Build guide (environment setup, ingestion pipeline, cron)
