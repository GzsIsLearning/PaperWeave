---
name: pdf-extract
description: Extract PDF papers to Markdown via MinerU API
---

# PDF Extract

## What it does
Submits PDF papers to the MinerU cloud API (OpenXLab) for precision parsing. Supports both remote URL mode and local file upload mode. Async polling with progress display, downloads the result ZIP, and extracts `full.md` + images into the paperweave wiki `L0_raw/` directory.

## Prerequisites
- `MINERU_TOKEN` environment variable (or set in `.env` file) — get from MinerU/OpenXLab
- Python packages: `requests`, `tqdm` (for progress bars)
- MinerU API supports models: `vlm` (recommended), `pipeline`, `MinerU-HTML`

## Usage

### URL mode (submit remote PDF link)
```bash
python3 mineru_extract.py --url "https://arxiv.org/pdf/2301.12345"
python3 mineru_extract.py --url "https://arxiv.org/abs/2301.12345" --model vlm --language en
```

### Local file mode (upload from disk)
```bash
python3 mineru_extract.py --file /path/to/paper.pdf
python3 mineru_extract.py --file paper.pdf --slug my-paper --out /custom/output
```

### Full options
```
--url URL          Remote PDF/file URL
--file PATH        Local PDF/file path
--out DIR          Output directory (default: wiki/L0_raw)
--slug SLUG        Paper slug for subdirectory and image prefix
--model MODEL      vlm | pipeline | MinerU-HTML (default: vlm)
--language LANG    Document language (default: ch, use 'en' for English papers)
--pages RANGE      Page range, e.g. 2,4-6
--no-formula       Disable formula recognition
--no-table         Disable table recognition
--extra-formats    docx html latex (extra export formats)
```

## API Flow
1. Script loads `MINERU_TOKEN` from env var or `.env` file
2. **URL mode**: POST to `/extract/task` → get `task_id` → poll until `done` → download ZIP
3. **File mode**: POST to `/file-urls/batch` → get presigned upload URL → PUT file → poll batch → download ZIP
4. ZIP is extracted into output dir, preserving `full.md` and `images/` structure
5. Paper slug prefixes images to avoid name collisions

## Output
- `wiki/L0_raw/<slug>/full.md` — full Markdown text
- `wiki/L0_raw/<slug>/images/` — extracted figures and tables

## Files
- `mineru_extract.py`: Main extraction script with CLI and Python API
