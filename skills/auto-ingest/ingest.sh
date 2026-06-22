#!/bin/bash
# Batch ingest Zotero collection → Wiki (metadata extraction)
# PDF full-text parsing requires separate call: python3 tools/mineru_extract.py
# Usage: ./ingest.sh <collection_id> [limit]

set -e

COLLECTION_ID="${1:?Usage: ./ingest.sh <collection_id> [limit]}"
LIMIT="${2:-0}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

python3 -c "
import sys, os, json
sys.path.insert(0, 'tools')
from zotero_bridge import ZoteroBridge

zb = ZoteroBridge()
items = zb.get_collection_items($COLLECTION_ID)
limit = $LIMIT
if limit > 0:
    items = items[:limit]

wiki_dir = '$PROJECT_DIR/wiki/L0_raw'
os.makedirs(wiki_dir, exist_ok=True)

print(f'Ingesting {len(items)} paper metadata into wiki/L0_raw/ ...')
success = 0
for item in items:
    try:
        key = item.get('key', '?')
        title = item.get('title', key)[:80]
        safe = title.lower().replace(' ', '-')
        safe = ''.join(c for c in safe if c.isalnum() or c in '-')
        out_dir = os.path.join(wiki_dir, safe)
        os.makedirs(out_dir, exist_ok=True)

        # Store metadata as metadata.json, mineru_extract.py can read it
        meta_path = os.path.join(out_dir, 'metadata.json')
        with open(meta_path, 'w') as f:
            json.dump(item, f, ensure_ascii=False, indent=2)

        print(f'  ✓ {title[:60]}')
        success += 1
    except Exception as e:
        print(f'  ✗ {item.get(\"key\",\"?\")}: {e}')

print(f'\nDone: {success}/{len(items)} metadata written to wiki/L0_raw/')
print(f'For PDF full-text parsing, run: python3 tools/mineru_extract.py --file <pdf_path> --slug <paper-slug>')
"
