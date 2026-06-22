#!/bin/bash
# Paperweave data sync script
# Usage:
#   ./sync.sh down    # Download Zotero data from Nutstore
#   ./sync.sh up      # Upload wiki to Nutstore
set -e

# Configurable via env vars
RCLONE="${RCLONE_BIN:-$HOME/.local/bin/rclone}"
PAPERWEAVE_ROOT="${PAPERWEAVE_ROOT:-/mnt/disk1/Gongzs/paperweave}"
LOCAL_DB="${ZOTERO_DATA:-/mnt/disk1/Gongzs/Zotero-data}"
LOCAL_WIKI="$PAPERWEAVE_ROOT/wiki"
# Nutstore rate limits (prevent 403/503)
RLIMIT="--tpslimit 1 --tpslimit-burst 1 --transfers 1 --checkers 1 --retries 20"

case "${1:-down}" in
  down)
    echo "↓ Downloading Zotero data: nutstore:/zotero → $LOCAL_DB"
    $RCLONE copy nutstore:/zotero "$LOCAL_DB" \
      $RLIMIT \
      --progress \
      --exclude "*.lock" --exclude "*.bak" --exclude "*.journal" \
      --exclude "translators/**" --exclude "locate/**" --exclude "styles/**"
    echo "Download complete"
    ls -lh "$LOCAL_DB/zotero.sqlite"
    # Hook: trigger paper ingest monitor
    TRIGGER_FILE="$PAPERWEAVE_ROOT/.trigger_ingest"
    date -u +%s > "$TRIGGER_FILE"
    echo "✓ Ingest hook triggered ($TRIGGER_FILE)"
    ;;
  up)
    echo "↑ Uploading wiki: $LOCAL_WIKI → nutstore:/paperweave/wiki"
    $RCLONE copy "$LOCAL_WIKI" nutstore:/paperweave/wiki/ \
      $RLIMIT --progress
    echo "Upload complete"
    ;;
  *)
    echo "Usage: $0 {down|up}"
    ;;
esac
