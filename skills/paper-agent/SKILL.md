---
name: paper-agent
description: Autonomous agent that reads papers and writes structured reviews
---

# Paper Agent

## What it does
An autonomous LLM-powered agent that reads papers from the wiki, analyzes them against L2 lineage and L3 module context, and writes structured reviews to `review.md`. It also mines citations from reference sections and adds quality-filtered papers to the `to-read.md` queue.

## Prerequisites
- LLM API key: `DEEPSEEK_API_KEY`, `OPENAI_API_KEY`, or `OPENROUTER_API_KEY` in `.env`
- `PAPERWEAVE_MODEL` env var (default: `deepseek-v4-flash`)
- `DEEPSEEK_BASE_URL` (optional, for custom endpoints)
- Python: `requests`, `dotenv` (optional)
- Wiki structure: `wiki/L0_raw/<slug>/full.md` and `review.md` must exist
- `grep` available for L2 page discovery

## Agent Workflow
1. **Find L2 page**: Greps `wiki/L2_lineage/` for references to the paper slug
2. **Find L3 pages**: Keyword-matches paper text against L3 module topics (foundation models, modality fusion, data scarcity, etc.)
3. **Build prompt**: Assembles system + user messages with paper full text, existing review, L2 context, and L3 context
4. **Call LLM**: Sends to API (DeepSeek, OpenAI, or OpenRouter), gets structured re-review
5. **Parse output**: Extracts review section and citation entries from LLM response
6. **Write results**: Appends to `review.md`, adds new citations to `to-read.md`, writes log entry to `log.md`

## Subcommands

### `read` — Read and review papers
```bash
# Read a specific paper by slug
python3 agent.py read --slug my-paper-slug

# Read N random papers from L0_raw
python3 agent.py read --batch 3

# Use a different model
python3 agent.py read --batch 2 --model openrouter/anthropic/claude-sonnet-4
```

### `check` — Find stale reviews
```bash
# Find reviews older than 30 days
python3 agent.py check

# Custom threshold
python3 agent.py check --days 60
```

### `scan` — Check to-read queue
```bash
python3 agent.py scan
```

## LLM Config
The agent auto-detects the provider from the model name:
- `deepseek*` → `https://api.deepseek.com/v1/chat/completions`
- `openrouter*` → `https://openrouter.ai/api/v1/chat/completions`
- Default (gpt-*, etc.) → `https://api.openai.com/v1/chat/completions`

The review prompt instructs the LLM to:
- Write in Chinese (technical terms kept in English)
- Mine 0-5 citations with quality filter (top venues, >20 citations, top institutions)
- Output a structured `## [DATE] Re-review — agent` section

## Parallel Subagent Pattern
For batch reading, the script processes papers sequentially in a loop. For parallel execution, wrap in shell:
```bash
for slug in slug1 slug2 slug3; do
    python3 agent.py read --slug "$slug" &
done
wait
```

## Files
- `agent.py`: Complete agent with LLM calling, wiki parsing, citation mining, and CLI
