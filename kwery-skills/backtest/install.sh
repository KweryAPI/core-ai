#!/usr/bin/env bash
# kwery-skills/backtest/install.sh
# Installs the backtest skill into Claude Code.
#
# Usage:
#   bash install.sh                   — install to ~/.claude/skills/backtest/
#   bash install.sh --project <dir>   — install to <dir>/.claude/skills/backtest/

set -euo pipefail

SKILL_NAME="backtest"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_FILE="$SCRIPT_DIR/SKILL.md"

# Parse --project flag
PROJECT_DIR=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --project)
      PROJECT_DIR="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

if [ -n "$PROJECT_DIR" ]; then
  DEST="$PROJECT_DIR/.claude/skills/$SKILL_NAME"
else
  DEST="$HOME/.claude/skills/$SKILL_NAME"
fi

mkdir -p "$DEST"
cp "$SKILL_FILE" "$DEST/SKILL.md"
echo "✓ Installed $SKILL_NAME skill to $DEST/SKILL.md"
