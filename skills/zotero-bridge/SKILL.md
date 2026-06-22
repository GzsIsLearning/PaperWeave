---
name: zotero-bridge
description: Query Zotero SQLite library for paper metadata and deduplication
---

# Zotero Bridge

## What it does
Reads the Zotero SQLite database directly (read-only) and provides a structured Python query interface. Supports searching by title/abstract/author, fetching full item metadata (creators, fields, tags, collections), listing collections with item counts, retrieving annotations, notes, and PDF attachment paths. Also includes a data sync script via rclone.

## Prerequisites
- `ZOTERO_DB` environment variable pointing to `zotero.sqlite` (falls back to `/mnt/disk1/Gongzs/Zotero-data/zotero.sqlite`)
- `ZOTERO_DATA` environment variable for PDF storage path resolution
- Python standard library only (no extra deps beyond `sqlite3`)
- `rclone` (for sync.sh): configured with a `nutstore:` remote

## Usage

### Python API
```python
from zotero_bridge import ZoteroBridge
zb = ZoteroBridge("~/Zotero-Data/zotero.sqlite")

# Library stats
stats = zb.stats()

# Search papers
papers = zb.search("transformer attention")

# Get full item details
paper = zb.get_item("ABCD1234")

# List collections
collections = zb.list_collections()

# Get annotations, notes, attachments
notes = zb.get_notes("ABCD1234")
annotations = zb.get_annotations("ABCD1234")
pdf_path = zb.get_pdf_path("ABCD1234")

# Recent items
recent = zb.get_recent(20)
```

### CLI
```bash
python3 zotero_bridge.py stats              # Library statistics
python3 zotero_bridge.py search "query"     # Search by title/abstract/author
python3 zotero_bridge.py item <key>         # Full item details (JSON)
python3 zotero_bridge.py collections        # List all collections
python3 zotero_bridge.py collection <id>    # Items in a collection
python3 zotero_bridge.py recent [N]         # Recently added items
python3 zotero_bridge.py annotations <key>  # PDF annotations
python3 zotero_bridge.py notes <key>        # Zotero notes
python3 zotero_bridge.py attachments <key>  # Attachment list
python3 zotero_bridge.py pdf <key>          # Get PDF filesystem path
```

## Sync Flow
```bash
./sync.sh down   # Download Zotero data from Nutstore via rclone
./sync.sh up     # Upload wiki to Nutstore via rclone
```
The `down` command also triggers the ingest hook by creating a `.trigger_ingest` timestamp file.

## Files
- `zotero_bridge.py`: ZoteroBridge class + CLI — read-only SQLite access layer
- `sync.sh`: Rclone-based bidirectional sync script (Zotero data ↔ Nutstore)
