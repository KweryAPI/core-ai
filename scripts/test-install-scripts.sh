#!/usr/bin/env bash
# Test that all kwery-skills install.sh scripts work correctly
# in temporary directories. Safe to run repeatedly.
#
# Usage: bash scripts/test-install-scripts.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SKILLS=("backtest" "signal" "derivatives" "research")
PASS=0
FAIL=0

echo "Testing kwery-skills install scripts..."
echo ""

for skill in "${SKILLS[@]}"; do
  INSTALL_SCRIPT="$REPO_ROOT/kwery-skills/$skill/install.sh"

  # Check script exists
  if [ ! -f "$INSTALL_SCRIPT" ]; then
    echo "✗ $skill — install.sh not found at $INSTALL_SCRIPT"
    ((FAIL++)) || true
    continue
  fi

  # Check script is executable (or can be made executable)
  if [ ! -x "$INSTALL_SCRIPT" ]; then
    echo "  ⚠ $skill — install.sh is not executable, fixing..."
    chmod +x "$INSTALL_SCRIPT"
  fi

  # Create a temp dir to install into
  TMPDIR="$(mktemp -d)"
  trap "rm -rf $TMPDIR" EXIT

  # Run install with --project flag to install into temp dir
  if bash "$INSTALL_SCRIPT" --project "$TMPDIR" > /dev/null 2>&1; then
    # Verify SKILL.md was installed
    INSTALLED_SKILL="$TMPDIR/.claude/skills/$skill/SKILL.md"
    if [ -f "$INSTALLED_SKILL" ]; then
      # Verify content matches source
      SOURCE="$REPO_ROOT/kwery-skills/$skill/SKILL.md"
      if diff -q "$SOURCE" "$INSTALLED_SKILL" > /dev/null 2>&1; then
        echo "✓ $skill — installed and content matches"
        ((PASS++)) || true
      else
        echo "✗ $skill — installed but content differs from source"
        ((FAIL++)) || true
      fi
    else
      echo "✗ $skill — install ran but SKILL.md not found at $INSTALLED_SKILL"
      ((FAIL++)) || true
    fi
  else
    echo "✗ $skill — install.sh exited with error"
    ((FAIL++)) || true
  fi

  rm -rf "$TMPDIR"
  trap - EXIT
done

echo ""

# Test kwery-cursor install.sh
echo "Testing kwery-cursor install.sh..."
CURSOR_INSTALL="$REPO_ROOT/kwery-cursor/install.sh"

if [ -f "$CURSOR_INSTALL" ]; then
  TMPDIR="$(mktemp -d)"
  trap "rm -rf $TMPDIR" EXIT

  # Run non-interactively (skip the MCP config prompt)
  if echo "n" | bash "$CURSOR_INSTALL" "$TMPDIR" > /dev/null 2>&1; then
    # Verify at least one .mdc file was installed
    MDC_COUNT=$(find "$TMPDIR/.cursor/rules" -name "*.mdc" 2>/dev/null | wc -l)
    if [ "$MDC_COUNT" -gt 0 ]; then
      echo "✓ kwery-cursor — installed $MDC_COUNT .mdc rule files"
      ((PASS++)) || true
    else
      echo "✗ kwery-cursor — no .mdc files found after install"
      ((FAIL++)) || true
    fi
  else
    echo "✗ kwery-cursor — install.sh exited with error"
    ((FAIL++)) || true
  fi

  rm -rf "$TMPDIR"
  trap - EXIT
else
  echo "⚠ kwery-cursor/install.sh not found — skipping"
fi

echo ""
echo "Results: $PASS passed, $FAIL failed"
echo ""

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi

echo "✓ All install scripts passed"
