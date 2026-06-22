#!/bin/bash
# Paperweave daily curation — pi non-interactive mode
# Called by cron daily, pi runs autonomously as "silent weaver"
set -e

DIR="$(cd "$(dirname "$0")/.." && pwd)"
PI_BIN="${DIR}/pi-wiki-manager/node_modules/.bin/pi"
WIKI="${DIR}/wiki"

export PI_CODING_AGENT_DIR="${DIR}/pi-wiki-manager/.pi"
export PAPERWEAVE_WIKI_PATH="${WIKI}"

# Curation prompt
exec "${PI_BIN}" \
  -p \
  --provider deepseek \
  --model deepseek-v4-pro \
  --append-system-prompt "${DIR}/pi-wiki-manager/curator-system.md" \
  "开始今天的论文策展。按常看常新的原则，随机选一篇 L0_raw/ 中的论文，结合 wiki 现有知识网络重读，重新发掘闪光点，更新评分，追加评语。具体流程参考 system prompt。"
