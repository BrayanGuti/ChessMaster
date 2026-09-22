# Contributing to ChessMaster

Thanks for your interest in ChessMaster! This guide explains how to set up the project, report issues, write commits and open pull requests. Contributions of every size are welcome: bug reports, docs fixes, tests, and new features.

By contributing, you agree that your work is released under the project's [MIT License](LICENSE).

## Table of contents

- [Project layout](#project-layout)
- [Getting started](#getting-started)
- [Reporting issues](#reporting-issues)
- [Branches](#branches)
- [Commit format](#commit-format)
- [Pull request title](#pull-request-title)
- [Pull request description](#pull-request-description)
- [Code style](#code-style)
- [Tests](#tests)
- [Third-party assets and dependencies](#third-party-assets-and-dependencies)

## Project layout

This is an npm workspaces monorepo:

```
packages/react-chessmaster/   # The npm package @brayanguti/react-chessmaster (the <ChessBoard> component)
apps/web/                     # The ChessMaster website: demo + docs, consumes the package
docs/media/                   # Screenshots and GIFs used by the READMEs
```

`apps/web` imports the component from the package source, so changes in `packages/react-chessmaster` show up in the site immediately with HMR. See [`CLAUDE.md`](CLAUDE.md) for a deeper tour of the architecture.

## Getting started

Requirements: a recent Node.js LTS and npm.

```bash
git clone git@github.com:BrayanGuti/ChessMaster.git
cd ChessMaster
npm install       # installs everything and links the package into apps/web
npm run dev       # site dev server on http://localhost:5173
```

Useful commands (all run from the repo root):

| Command                     | What it does                                           |
| --------------------------- | ------------------------------------------------------ |
| `npm run dev`               | Vite dev server for the site                           |
| `npm run build`             | Type-checks the package, then type-checks/builds site  |
| `npm run build:package`     | Builds the npm package into `dist/`                    |
| `npm run lint`              | ESLint on the whole monorepo                           |
| `npm test`                  | Vitest for the package (watch mode)                    |
| `npm test -- --run`         | Vitest, single run                                     |

## Reporting issues

Search [existing issues](https://github.com/BrayanGuti/ChessMaster/issues) first; if you find a match, add your details there instead of opening a duplicate.

Use a title that names the problem, optionally prefixed with the same type used for commits (`bug:`/`feat:`/`docs:`), e.g. `bug: en passant not offered after a double pawn push`.

### Bug reports

Include:

1. **Summary**: one or two sentences on what goes wrong.
2. **Steps to reproduce**: numbered and minimal. For chess-logic bugs, include the moves played (or a FEN) that lead to the problem.
3. **Expected behavior**: what should have happened.
4. **Actual behavior**: what happened instead, with screenshots, GIFs or console errors if useful.
5. **Environment**: browser and version, OS, device (desktop/phone), package version (`@brayanguti/react-chessmaster`), React version, and bundler/framework if you use the package in your own app (Vite, Next.js, ...).

### Feature requests

Include:

1. **Problem**: what you are trying to do and why the current behavior is not enough.
2. **Proposal**: how you imagine it working (a prop, a UI control, ...).
3. **Alternatives**: other approaches you considered.

For larger features, open an issue and wait for feedback **before** writing code, so nobody spends time on something that does not fit the project.

### Security issues

Do not open a public issue for a vulnerability. Contact the maintainer privately through the email on their GitHub profile.

## Branches

Create a branch from `master` named `<type>/<short-kebab-description>`, using the same types as commits:

```
feat/promotion-sound
fix/castling-through-check
docs/contributing-guide
```

## Commit format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short summary>

<optional body: what and why, wrapped at ~72 columns>

<optional footer: Closes #123, BREAKING CHANGE: ...>
```

**Types**

| Type       | Use it for                                                       |
| ---------- | ---------------------------------------------------------------- |
| `feat`     | A new user-facing feature or public API addition                 |
| `fix`      | A bug fix                                                        |
| `docs`     | Documentation only (READMEs, this guide, code comments)          |
| `style`    | Formatting or CSS-only visual tweaks with no logic change        |
| `refactor` | Code change that neither fixes a bug nor adds a feature          |
| `perf`     | Performance improvement                                          |
| `test`     | Adding or fixing tests                                           |
| `build`    | Build system or dependency changes                               |
| `ci`       | CI configuration                                                 |
| `chore`    | Maintenance that does not touch `src` (releases, tooling, etc.)  |

**Scopes** (optional but encouraged): `package` for `packages/react-chessmaster`, `web` for `apps/web`, or a narrower area such as `engine`, `store` or `styles`.

**Rules**

- Use the imperative mood and lowercase after the colon: `fix(package): handle en passant after saved game restore`.
- Keep the summary line at 72 characters or fewer, with no trailing period.
- One logical change per commit. Do not mix a refactor with a bug fix.
- Mark breaking changes with `!` (`feat(package)!: rename colorScheme prop`) and a `BREAKING CHANGE:` footer.
- Reference issues in the footer: `Closes #42`.
- The summary may be written in English or Spanish; keep the type and scope in English.

Examples:

```
feat(package): add resign button to the game panel
fix(web): keep GetStartedSection inside 100vh on small screens
docs: document the persist prop in the package README
refactor(store): extract move recording out of movePiece
```

## Pull request title

GitHub suggests the PR title as the squash-merge commit message, so it should follow the same
Conventional Commits format even if the PR itself is merged another way:

```
<type>(<optional scope>): <short summary>
```

Good:

- `feat(package): add resign button to the game panel`
- `fix(package): allow castling when the rook is attacked`
- `docs: add CONTRIBUTING guide`

Bad:

- `Update stuff`
- `Fixed bug`
- `feat: Add Resign Button.`

## Pull request description

Every PR description uses these sections:

```markdown
## What changed
A concise summary of the change: what was added, fixed or removed.

## Why
The problem or motivation. Link the issue if there is one (`Closes #123`).

## How to test
Numbered steps a reviewer can follow to verify the change, including the
commands to run and what they should see. Add screenshots or GIFs for UI changes.

## Checklist
- [ ] The PR title follows Conventional Commits
- [ ] Commits follow the commit format
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] `npm test -- --run` passes (new logic has tests)
- [ ] UI changes were checked manually in the dev server (light and dark scheme, desktop and phone width)
- [ ] Docs updated if behavior or public API changed (READMEs, `store/types.ts` props docs)
- [ ] Third-party assets/code are credited in `THIRD_PARTY_LICENSES.md` (if any)
```

Keep PRs small and focused. If a PR grows beyond one concern, split it. Mark work in progress as a **draft PR**.

## Code style

- **TypeScript strict mode** is on. Avoid `any`; put shared types in `packages/react-chessmaster/src/store/types.ts`.
- **ESLint** is the source of truth (`npm run lint`), with emphasis on React hooks dependency arrays and React Refresh rules. Fix warnings instead of disabling rules.
- **React**: function components and hooks only. Components are `PascalCase` and live in a folder of the same name with their CSS Module (`ChessCell/ChessCell.tsx`, `ChessCell.module.css`).
- **State**: use the built-in store (`store/createStore.ts`) through `useChessStore`. Do not add a state library.
- **Naming**: `camelCase` for variables and functions, `PascalCase` for components and types, `UPPER_SNAKE_CASE` for constants. Chess pieces use the 4-character notation `[Color][Type][File][Rank]` (e.g. `WPe2`).
- **CSS**: use CSS Modules (`*.module.css`) for chess components. Never hardcode UI colors; use the theme tokens (`--light-square`, `--accent`, `--text`, `--panel`, ...) so the component works on light and dark pages. Site pages use the global styles in `apps/web/src/index.css`.
- **Package boundaries**: `packages/react-chessmaster` must be self-contained. It must not import from outside its folder, and its only runtime dependency is the `react` peer. Icons are inline SVGs; do not add icon or UI libraries. The public API is exported only from `src/index.ts`.
- **Comments**: explain *why*, not *what*. Match the density and language of the surrounding code.
- **Formatting**: 2-space indentation, double quotes, semicolons, matching the file you are editing.

## Tests

Chess logic is tested with Vitest in `packages/react-chessmaster/src/__tests__/`.

- Add or update tests for any change in move calculation, check/checkmate detection, castling, en passant, promotion, FEN output or persistence.
- Run `npm test -- --run` before pushing.
- If the persisted snapshot changes shape, bump `PERSIST_VERSION` and add a migration in `migratePersistedGame`.
- UI changes cannot be fully covered by unit tests: verify them in the dev server and attach screenshots to the PR.

## Third-party assets and dependencies

- Only add assets or code under licenses that do not force copyleft on the package: CC0, MIT, BSD, CC BY. Never GPL or CC BY-SA (for example, do not add Stockfish).
- Credit every third-party asset or code in `packages/react-chessmaster/THIRD_PARTY_LICENSES.md`.
- Each workspace declares the tools its own scripts use, since Vercel installs only `apps/web` dependencies.

## Releases

Releases and `npm publish` are done by the maintainer. Contributors should not bump the package `version`.

---

Questions? Open an issue and we will help you get started. Thank you for contributing!
