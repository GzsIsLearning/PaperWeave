---
name: auto-ingest
description: Batch paper ingestion pipeline from search through extraction to classification
---

# Auto Ingest

## What it does
Complete batch paper ingestion pipeline that reads the Zotero library, identifies unparsed papers, submits them to MinerU for PDF-to-Markdown extraction, and writes results into the paperweave wiki `L0_raw/` directory. Includes a retry script for papers that failed on first attempt and shell scripts for metadata-only ingest and daily curation.

## Prerequisites
- All prerequisites from `pdf-extract` and `zotero-bridge` skills
- `PAPERWEAVE_ROOT` env var or default `/mnt/disk1/Gongzs/paperweave`
- `ZOTERO_DB` and `ZOTERO_DATA` env vars
- `MINERU_TOKEN` for API access

## Pipeline Overview

### Stage 1: Batch Extract (`batch_extract.py`)
- Reads all papers with PDF attachments from Zotero
- Skips already-parsed papers (checks `wiki/L0_raw/<slug>/full.md`)
- **URL mode first**: arXiv URLs → direct PDF links, OpenReview → PDF links
- Falls back to **file mode**: extracts PDF from Zotero zip storage and uploads
- Runs `mineru_extract.py` as subprocess with 15-minute timeout
- 10-second rate limit between calls to respect API limits
- Reports: success / failed / skipped with elapsed time and ETA

```bash
python3 batch_extract.py
```

### Stage 2: Retry Failed (`retry_file_extract.py`)
- Targets papers still missing `full.md` after batch run
- Uses --file mode exclusively (extracts PDF from Zotero zip)
- Tries multiple zip locations: `<key>.zip` and `data/storage/<key>/content.zip`

```bash
python3 retry_file_extract.py
```

### Stage 3: Metadata Ingest (`ingest.sh`)
- Quick metadata-only ingest from a Zotero collection
- Writes `metadata.json` per paper without full-text extraction
- Useful for bootstrapping the wiki before PDF parsing

```bash
./ingest.sh <collection_id> [limit]
```

### Stage 4: Curation Trigger (`pi-curate.sh`)
- Daily cron-driven curation using the `pi` CLI tool
- Randomly selects a paper for re-reading against wiki knowledge network
- Uses DeepSeek v4-pro as the curation LLM

```bash
./pi-curate.sh
```

## Cron Setup
```cron
# Daily batch ingest + curation
0 2 * * * cd /mnt/disk1/Gongzs/paperweave && ./skills/auto-ingest/batch_extract.py && ./skills/auto-ingest/pi-curate.sh
```

## Files
- `batch_extract.py`: Main batch extraction orchestrator (URL-first, then file fallback)
- `retry_file_extract.py`: Retry script for failed extractions (file mode only)
- `ingest.sh`: Shell script for metadata-only ingest from Zotero collection
- `pi-curate.sh`: Shell script for daily AI curation via pi CLI
