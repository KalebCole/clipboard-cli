# AGENTS.md — clipboard-cli

Universal clipboard formatter for Windows. Copies content formatted for Teams, Loop, Outlook, ADO, and more. Uses CF_HTML for rich-text clipboard support.

Run `clipboard --help` and `clipboard <command> --help` for command reference. Run `clipboard schema [command]` for parameter introspection (e.g., `clipboard schema copy`).

## Things you will get wrong without reading this

### This is Windows-only
The CLI shells out to PowerShell for all clipboard operations. `Set-Clipboard` handles plain text; `System.Windows.Forms.Clipboard` handles CF_HTML rich text. There is no macOS or Linux support — no `pbcopy` or `xclip` fallback.

### Teams cannot render tables from CF_HTML
The Teams formatter converts markdown tables to `**Header:** value` formatted lines instead of `<table>` HTML. If you paste raw HTML tables into Teams, they appear as broken text. This is a Teams limitation, not a bug.

### Teams ignores inline CSS styles
The Teams formatter uses `markdownToHtmlClean()` — no `style=` attributes. Teams strips them anyway. Use semantic HTML only (`<b>`, `<code>`, `<h1>`, etc.).

### Outlook is NOT the same as Teams
Outlook Desktop uses the Microsoft Word rendering engine, not a browser. It has different CSS support — no `overflow-x`, no `border-radius`. The Outlook formatter adds `border` attributes on tables and wraps content in a `font-family: Segoe UI` div.

### ADO has a limited HTML subset
ADO comments and work item descriptions support only: `b`, `i`, `code`, `pre`, `a`, `ul`, `ol`, `li`, `h1`-`h6`, `br`, `hr`, `table`, `p`, `img`, `del`. No `<style>` tags, no custom CSS. The ADO formatter deliberately strips all styling.

### Session detection is best-effort
`clipboard copy teams` (no `--source` flag) reads the last Copilot CLI response. It finds the session by walking the process tree to locate `copilot.exe`, then matching by start time. If that fails, it falls back to the most recently modified session. If you have multiple Copilot sessions, it picks the closest time match.

### The `+last` helper is just a shortcut
`clipboard +last teams` does exactly the same thing as `clipboard copy teams`. It exists for ergonomics — no `--source` flag needed, no `--stdin`.

### Default output is JSON
Every command returns structured JSON to stdout. Human-readable output goes to stderr. Use `--format table` for human output. This follows the GWS CLI pattern.

### Adding a formatter is two lines of code
1. Create `src/formatters/<name>.ts` implementing the `Formatter` interface
2. Import and add to the array in `src/formatters/registry.ts`

That's it. `clipboard copy <name>` works immediately after `npm run build`.

## Testing

```bash
npm test           # vitest run
npm run test:watch # vitest watch
npm run build      # tsc
npm run lint       # tsc --noEmit
```

## Code conventions

- TypeScript with ESM (`"type": "module"`)
- Commander.js CLI framework, Vitest for tests
- One file per command in `src/commands/`, one per formatter in `src/formatters/`
- Structured error objects: `{ status, error: { code, type, message } }`
- Exit codes: 0 success, 1 clipboard error, 3 validation, 4 not found, 5 internal
- JSON to stdout, human text to stderr
- `--dry-run` on copy commands to preview without writing to clipboard

## Boundaries

- ✅ **Always:** Use `--dry-run` to preview. Use default JSON output for agent flows.
- ⚠️ **Ask first:** Before overwriting clipboard contents (it replaces what's there).
- 🚫 **Never:** Log clipboard content to stdout (only metadata). Ship without running tests.
