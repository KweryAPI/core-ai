#!/usr/bin/env bash
# scripts/link-agents-skills.sh
# Replaces .agents/skills/*/SKILL.md files with symlinks to canonical
# kwery-skills/*/SKILL.md versions to avoid duplication.
#
# Run from the repo root:
#   chmod +x scripts/link-agents-skills.sh
#   bash scripts/link-agents-skills.sh
#
# NOTE: On Windows, symlinks require Developer Mode or elevated privileges.
# If this fails, skip this step — the files in .agents/skills/ are the source
# of truth and should be kept in sync with kwery-skills/ manually.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

for skill in backtest signal derivatives research; do
  target="$REPO_ROOT/.agents/skills/$skill/SKILL.md"
  canonical="$REPO_ROOT/kwery-skills/$skill/SKILL.md"
  link_path="../../../kwery-skills/$skill/SKILL.md"

  if [ ! -f "$canonical" ]; then
    echo "  SKIP $skill — kwery-skills/$skill/SKILL.md does not exist (not yet created)"
    continue
  fi

  mkdir -p "$REPO_ROOT/.agents/skills/$skill"
  rm -f "$target"
  ln -sf "$link_path" "$target"
  echo "  ✓ Symlinked .agents/skills/$skill/SKILL.md → kwery-skills/$skill/SKILL.md"
done

echo ""
echo "Done. Verify with:"
echo "  cat .agents/skills/backtest/SKILL.md"
