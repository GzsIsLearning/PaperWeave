#!/usr/bin/env bash
# paperweave reader — start online reader or export paper
# Usage:
#   ./start.sh                  Start reader (http://localhost:8899)
#   ./start.sh export <slug>    Export single paper to HTML (to /tmp/)
#
# Requirements:
#   - Python 3.10+
#   - python-dotenv installed (pip install python-dotenv)
#   - The PAPERWEAVE_ROOT env var can override the wiki location
#   - DEEPSEEK_API_KEY or OPENAI_API_KEY in .env for LLM features

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Use python3 from PATH (user is responsible for having the right env active)
PYTHON="${PAPERWEAVE_PYTHON:-python3}"
SERVER="$SCRIPT_DIR/server.py"
EXPORT="$SCRIPT_DIR/export.py"

case "${1:-serve}" in
  serve|start)
    echo "Starting paperweave reader → http://localhost:8899"
    cd "$ROOT"
    $PYTHON "$SERVER" --host 0.0.0.0 --port 8899
    ;;
  export)
    if [ -z "$2" ]; then
      echo "Usage: $0 export <slug>"
      echo "Available slugs:"
      WIKI_DIR="${PAPERWEAVE_ROOT:-$ROOT}/wiki/L0_raw"
      if [ -d "$WIKI_DIR" ]; then
        ls "$WIKI_DIR" | head -20
      fi
      exit 1
    fi
    cd "$ROOT"
    $PYTHON "$EXPORT" --slug "$2" --output "/tmp/$2.html"
    echo ""
    echo "→ /tmp/$2.html"
    echo "   Can be shared via WeChat: /tmp/$2.html"
    ;;
  *)
    echo "Usage: $0 [serve|export <slug>]"
    ;;
esac
