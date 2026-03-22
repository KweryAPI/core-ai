#!/usr/bin/env bash
# Run security checks before publishing.
#
# Usage: bash scripts/security-check.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PASS=0
FAIL=0

log_pass() { echo "  ✓ $1"; ((PASS++)) || true; }
log_fail() { echo "  ✗ $1"; ((FAIL++)) || true; }

echo ""
echo "▶ Checking for secrets in tracked files..."

# Check that no real API keys are committed
# Real kwery keys are long alphanumeric strings
if git -C "$REPO_ROOT" grep -r "kwery_" -- ":(exclude)*.md" ":(exclude)CHANGELOG.md" \
   ":(exclude)scripts/" 2>/dev/null | grep -v "kwery_live_\.\.\.\|kwery_test_\.\.\.\|kwery_" | grep -q .; then
  log_fail "Possible API key found in tracked files — check git grep output"
else
  log_pass "No API keys in tracked files"
fi

# Check .env is not tracked
if git -C "$REPO_ROOT" ls-files ".env" 2>/dev/null | grep -q ".env$"; then
  log_fail ".env is tracked by git — run: git rm --cached .env"
else
  log_pass ".env is not tracked by git"
fi

# Check .env.example exists and has no real values
if [ -f "$REPO_ROOT/.env.example" ]; then
  if grep -q "KWERY_API_KEY=.\{10,\}" "$REPO_ROOT/.env.example" 2>/dev/null; then
    log_fail ".env.example appears to contain a real API key value"
  else
    log_pass ".env.example has no real key values"
  fi
else
  log_fail ".env.example is missing"
fi

echo ""
echo "▶ Running npm audit..."

for pkg in kwery-mcp kwery-cli; do
  cd "$REPO_ROOT/$pkg"
  AUDIT_OUTPUT=$(npm audit --audit-level=high --json 2>/dev/null || true)
  HIGH=$(echo "$AUDIT_OUTPUT" | jq -r '.metadata.vulnerabilities.high // 0' 2>/dev/null || echo "0")
  CRITICAL=$(echo "$AUDIT_OUTPUT" | jq -r '.metadata.vulnerabilities.critical // 0' 2>/dev/null || echo "0")

  if [ "$HIGH" -gt 0 ] || [ "$CRITICAL" -gt 0 ]; then
    log_fail "$pkg has $CRITICAL critical and $HIGH high vulnerabilities"
  else
    log_pass "$pkg audit clean"
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
printf "  Results: %d passed, %d failed\n" "$PASS" "$FAIL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$FAIL" -gt 0 ]; then
  echo "✗ Security check failed"
  exit 1
fi

echo "✓ Security check passed"
