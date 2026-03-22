#!/usr/bin/env bash
# update-org-placeholders.sh
#
# Replaces all organization and package name placeholders throughout the
# kwery-agents repo with the correct values:
#
#   GitHub org:   KweryAPI    (github.com/KweryAPI)
#   X username:   KweryAPI    (@KweryAPI)
#   npm account:  Kwery       (npmjs.com/~kwery)
#   npm packages: kwery-mcp, kwery-cli  (unscoped, owned by Kwery npm account)
#
# Run this from the repo root ONCE after initial setup:
#   bash scripts/update-org-placeholders.sh
#
# Safe to re-run — skips files where nothing changes.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# ── Replacement values ─────────────────────────────────────────────────────────

# GitHub — all GitHub references use KweryAPI
OLD_ORG="KweryAPI"
NEW_GITHUB_ORG="KweryAPI"

OLD_GITHUB_URL="https://github.com/KweryAPI/kwery-agents"
NEW_GITHUB_URL="https://github.com/KweryAPI/kwery-agents"

OLD_REPO_PATH="KweryAPI/kwery-agents"
NEW_REPO_PATH="KweryAPI/kwery-agents"

OLD_PLUGIN_INSTALL="kwery@KweryAPI/kwery-agents"
NEW_PLUGIN_INSTALL="kwery@KweryAPI/kwery-agents"

# npm packages stay UNSCOPED: kwery-mcp and kwery-cli
# No name changes needed — they are already correct in the prompts.
# The Kwery npm account will own them after first publish.

# ── Replacement function ───────────────────────────────────────────────────────

CHANGED_FILES=0
UNCHANGED_FILES=0

replace_in_file() {
  local file="$1"

  local original
  original=$(cat "$file")
  local updated="$original"

  # Most specific replacements first to avoid double-replacing substrings
  updated="${updated//$OLD_GITHUB_URL/$NEW_GITHUB_URL}"
  updated="${updated//$OLD_PLUGIN_INSTALL/$NEW_PLUGIN_INSTALL}"
  updated="${updated//$OLD_REPO_PATH/$NEW_REPO_PATH}"
  updated="${updated//$OLD_ORG/$NEW_GITHUB_ORG}"

  if [ "$updated" != "$original" ]; then
    printf '%s' "$updated" > "$file"
    echo "  ✓ Updated: ${file#$REPO_ROOT/}"
    ((CHANGED_FILES++)) || true
  else
    ((UNCHANGED_FILES++)) || true
  fi
}

# ── Run ────────────────────────────────────────────────────────────────────────

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║     Kwery Agents — Update Org Placeholders             ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "  GitHub org:    $OLD_ORG  →  $NEW_GITHUB_ORG"
echo "  GitHub URL:    $OLD_GITHUB_URL"
echo "             →   $NEW_GITHUB_URL"
echo "  npm packages:  kwery-mcp, kwery-cli (unscoped, no change)"
echo "  npm account:   Kwery  (npmjs.com/~kwery)"
echo ""

SELF="$(realpath "${BASH_SOURCE[0]}")"

while IFS= read -r -d '' file; do
  # Skip this script itself — it intentionally contains the placeholder as a variable value
  [ "$(realpath "$file")" = "$SELF" ] && continue
  replace_in_file "$file"
done < <(find "$REPO_ROOT" \
  -not -path "*/.git/*" \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/coverage/*" \
  \( \
    -name "*.json" \
    -o -name "*.md" \
    -o -name "*.sh" \
    -o -name "*.ts" \
    -o -name "*.yml" \
    -o -name "*.yaml" \
    -o -name "*.mdc" \
    -o -name ".env.example" \
    -o -name ".gitignore" \
  \) \
  -type f \
  -print0 2>/dev/null)

# ── Summary ────────────────────────────────────────────────────────────────────

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
printf "  Files updated:   %d\n" "$CHANGED_FILES"
printf "  Files unchanged: %d\n" "$UNCHANGED_FILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── Verify no old placeholders remain ─────────────────────────────────────────

echo "▶ Checking for remaining 'KweryAPI' placeholders..."
echo ""

REMAINING=$(grep -r "$OLD_ORG" "$REPO_ROOT" \
  --include="*.json" \
  --include="*.md" \
  --include="*.sh" \
  --include="*.ts" \
  --include="*.yml" \
  --include="*.yaml" \
  --include="*.mdc" \
  --exclude-dir=".git" \
  --exclude-dir="node_modules" \
  --exclude-dir="dist" \
  --exclude-dir="coverage" \
  -l 2>/dev/null || true)

if [ -n "$REMAINING" ]; then
  echo "  ⚠ '$OLD_ORG' still found in:"
  echo "$REMAINING" | sed "s|$REPO_ROOT/||g" | sed 's/^/    /'
  echo ""
  echo "  Review these files manually."
else
  echo "  ✓ No remaining '$OLD_ORG' placeholders"
fi

echo ""

# ── Spot-check key files ───────────────────────────────────────────────────────

echo "▶ Spot-checking key files..."
echo ""

check_value() {
  local label="$1"
  local filepath="$REPO_ROOT/$2"
  local needle="$3"

  if [ ! -f "$filepath" ]; then
    echo "  - $label (not found yet — applies when created)"
    return
  fi

  if grep -q "$needle" "$filepath" 2>/dev/null; then
    echo "  ✓ $label"
  else
    echo "  ✗ $label — expected to contain: $needle"
  fi
}

echo "  GitHub org references (all should be KweryAPI):"
check_value "kwery-mcp/package.json"                      "kwery-mcp/package.json"                  "KweryAPI/kwery-agents"
check_value "kwery-cli/package.json"                      "kwery-cli/package.json"                  "KweryAPI/kwery-agents"
check_value ".changeset/config.json"                      ".changeset/config.json"                  "KweryAPI/kwery-agents"
check_value "kwery-plugin/.claude-plugin/plugin.json"     "kwery-plugin/.claude-plugin/plugin.json" "KweryAPI/kwery-agents"
check_value "kwery-plugin/README.md"                      "kwery-plugin/README.md"                  "KweryAPI/kwery-agents"
check_value "kwery-cursor/README.md"                      "kwery-cursor/README.md"                  "KweryAPI/kwery-agents"
check_value "root README.md"                              "README.md"                               "KweryAPI/kwery-agents"
check_value "RELEASE.md"                                  "RELEASE.md"                              "KweryAPI/kwery-agents"
check_value "AGENTS.md"                                   "AGENTS.md"                               "KweryAPI/kwery-agents"
check_value "CLAUDE.md"                                   "CLAUDE.md"                               "KweryAPI"
echo ""

echo "  npm package names (should stay unscoped):"
check_value "kwery-mcp name is 'kwery-mcp'"               "kwery-mcp/package.json"                  "\"name\": \"kwery-mcp\""
check_value "kwery-cli name is 'kwery-cli'"               "kwery-cli/package.json"                  "\"name\": \"kwery-cli\""
check_value "kwery-mcp author links to kwery.xyz"         "kwery-mcp/package.json"                  "kwery.xyz"
check_value "kwery-cli author links to kwery.xyz"         "kwery-cli/package.json"                  "kwery.xyz"
echo ""

echo "  npm publish command in release.yml uses correct packages:"
check_value ".github/workflows/release.yml"               ".github/workflows/release.yml"           "changeset publish"
echo ""

# ── npm name availability reminder ────────────────────────────────────────────

echo "▶ npm name availability check (run manually):"
echo ""
echo "  npm view kwery-mcp    # expect: 404 Not Found"
echo "  npm view kwery-cli    # expect: 404 Not Found"
echo ""
echo "  If either is taken, switch to scoped packages:"
echo "  @kwery/mcp and @kwery/cli"
echo "  Then update the package names and re-run this script."
echo ""

# ── Next steps ────────────────────────────────────────────────────────────────

echo "▶ Next steps:"
echo ""
echo "  1. Review all changes:"
echo "     git diff"
echo ""
echo "  2. Commit:"
echo "     git add -A"
echo "     git commit -m \"chore: update org to KweryAPI\""
echo ""
echo "  3. Create GitHub org (if not already):"
echo "     github.com/organizations/new  →  name: KweryAPI"
echo ""
echo "  4. Create the public repo:"
echo "     gh repo create KweryAPI/kwery-agents --public --source=. --push"
echo ""
echo "  5. Or set remote manually:"
echo "     git remote set-url origin https://github.com/KweryAPI/kwery-agents.git"
echo "     git push -u origin main"
echo ""
echo "  6. Set GitHub secrets (repo settings → Secrets → Actions):"
echo "     NPM_TOKEN   — automation token from npmjs.com → Access Tokens"
echo "     (GITHUB_TOKEN is automatic)"
echo ""
echo "  7. Log in to npm as Kwery:"
echo "     npm login"
echo "     # username: kwery (or however the account is registered)"
echo ""
echo "  8. First publish (manual — after this CI handles it):"
echo "     bash scripts/security-check.sh"
echo "     bash scripts/prepublish-check.sh"
echo "     pnpm changeset"
echo "     pnpm changeset version"
echo "     pnpm changeset publish"
echo ""