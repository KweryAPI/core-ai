# Release Checklist

Follow these steps every time you publish a new version.

## Before You Start

- [ ] All tests pass: `pnpm test:all`
- [ ] Security check passes: `bash scripts/security-check.sh`
- [ ] Pre-publish check passes: `bash scripts/prepublish-check.sh`
- [ ] Smoke tests pass: `KWERY_API_KEY=your_key pnpm test:all:smoke`
- [ ] README files in `kwery-mcp/` and `kwery-cli/` are up to date

## Cut a Release

1. Create a changeset describing what changed:
   ```bash
   pnpm changeset
   ```
   Select the bump type:
   - `patch` — bug fixes, no API changes
   - `minor` — new tools, new commands, backward-compatible changes
   - `major` — breaking changes (tool renames, removed params, behavior changes)

2. Commit the changeset:
   ```bash
   git add .changeset/
   git commit -m "chore: add changeset"
   git push
   ```

3. CI will open a "Version Packages" PR automatically.
   Review it, then merge to trigger publish.

## Manual Release (if CI fails)

```bash
pnpm changeset version          # bump versions + generate CHANGELOG
git add . && git commit -m "chore: release packages"
pnpm changeset publish          # publishes (runs prepublishOnly first)
git push --follow-tags
```

## After Publishing

- [ ] Verify packages appear on npm:
  - https://npmjs.com/package/kwery-mcp
  - https://npmjs.com/package/kwery-cli
- [ ] Test `npx kwery-mcp@latest` in a fresh terminal
- [ ] Test `npm install -g kwery-cli@latest && kwery --version`
- [ ] Tag the release on GitHub
- [ ] Update kwery.xyz/docs if any API or behavior changed

## Version Guidelines

| Change | Bump |
|--------|------|
| Bug fix in tool handler | patch |
| New tool added | minor |
| New CLI command | minor |
| Tool renamed or removed | major |
| Required param added | major |
| Optional param added | minor |
| Response field added | patch |
| Response field removed | major |
