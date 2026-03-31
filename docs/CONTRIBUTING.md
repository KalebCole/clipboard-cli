# Contributing to clipboard-cli

## Development Tools

This project uses two AI-assisted development tools:

### GitHub Copilot CLI (Windows)
- **Session state:** `~/.copilot/session-state/` (ephemeral per-session)
- **Task tracking:** SQL-based todos within sessions
- **Skills:** `skills/` directory in repo (auto-loaded)
- **Best for:** Quick implementations, GitHub workflow

### Claude Code (Linux/Mac)
- **Config:** `.claude/` directory in repo root
- **Plans:** `docs/plans/*.md` (persistent, committed)
- **Best for:** Long-running sessions, parallel worktree development

## Local Development

```bash
git clone https://github.com/KalebCole/clipboard-cli
cd clipboard-cli
npm install
npm run build
npm link        # makes `clipboard` available globally
npm test        # run tests
```

> **Note:** This project requires Windows with PowerShell 5.0+ for clipboard operations.

## Code Style

- TypeScript with ESM (`"type": "module"`)
- Commander.js for CLI framework, Vitest for tests
- One file per command in `src/commands/`
- One file per formatter in `src/formatters/`
- Structured JSON output: `{ status, error: { code, type, message } }`
- `src/lib/` for shared utilities

## Adding a Formatter

1. Create `src/formatters/<name>.ts` implementing the `Formatter` interface from `src/types.ts`
2. Import and register in `src/formatters/registry.ts`
3. `npm run build` — TypeScript catches interface violations
4. Add tests in `tests/`

## Commit Messages

Follow conventional commits:

```
feat: add notion formatter
fix: escape ampersands in ADO links
docs: update formatter table in README
```

Always include attribution trailers:
- Copilot CLI: `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`
- Claude Code: `Co-authored-by: Claude <noreply@anthropic.com>`

## Pull Requests

1. Create a feature branch: `feat/<short-name>`
2. Run `npm test` and `npm run lint` before submitting
3. Update docs if adding formatters or commands
4. Keep PRs focused — one feature/fix per PR
