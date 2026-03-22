#!/usr/bin/env bash
# kwery-cursor/install.sh
# Copies the Kwery Cursor plugin files into the target project.
# Run from the repo root: bash kwery-cursor/install.sh [target-dir]
# Default target: current directory.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${1:-.}"

echo "Installing Kwery Cursor plugin into: $TARGET_DIR"

# Create .cursor directories
mkdir -p "$TARGET_DIR/.cursor/rules"

# Copy MCP config
cp "$SCRIPT_DIR/.cursor/mcp.json" "$TARGET_DIR/.cursor/mcp.json"
echo "  Copied .cursor/mcp.json"

# Copy rules from the flat rules/ directory
for rule in "$SCRIPT_DIR/rules/"*.mdc; do
  cp "$rule" "$TARGET_DIR/.cursor/rules/$(basename "$rule")"
  echo "  Copied .cursor/rules/$(basename "$rule")"
done

echo ""
echo "Done. Next steps:"
echo "  1. Set KWERY_API_KEY in your environment or .env file"
echo "  2. Restart Cursor to load the MCP server"
echo "  3. Get an API key at https://kwery.xyz/dashboard"
