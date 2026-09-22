## What changed
<!-- What was added, fixed or removed. -->

## Why
<!-- The problem or motivation. Link the issue: Closes #123 -->

## How to test
<!-- Numbered steps, the commands to run and what to expect. -->

## Checklist
- [ ] The PR title follows Conventional Commits (`type(scope): summary`)
- [ ] `npm run lint`, `npm test -- --run` and `npm run build` pass
- [ ] UI change: screenshots attached for phone, tablet and desktop, in light and dark scheme (see `CLAUDE.md`)
- [ ] New third-party asset or code: credited in `packages/react-chessmaster/THIRD_PARTY_LICENSES.md`
- [ ] Public API or saved-game format changed: docs updated, and `PERSIST_VERSION` bumped with a migration in `migratePersistedGame` if the snapshot changed shape
