# clipboard-cli 📋

> Universal clipboard formatter — copy content formatted for Teams, Loop, Outlook, ADO, and more.

[![npm version](https://img.shields.io/npm/v/clipboard-cli)](https://www.npmjs.com/package/clipboard-cli)
[![license](https://img.shields.io/npm/l/clipboard-cli)](LICENSE)
[![node](https://img.shields.io/node/v/clipboard-cli)](package.json)

## Try it now

```bash
npx clipboard-cli --help
```

## Install

```bash
# Install globally
npm install -g clipboard-cli

# Or clone and link
git clone https://github.com/KalebCole/clipboard-cli && cd clipboard-cli
npm install && npm run build && npm link
```

## Requirements

- **Windows 10/11** with PowerShell 5.0+
- **Node.js 18+**
- **Copilot CLI** (optional — for `+last` and session commands)

> ⚠️ This is a Windows-only tool. It uses PowerShell and the Windows clipboard API (CF_HTML) for rich-text support. macOS and Linux are not supported.

## Quick Start

```bash
# 1. Copy last Copilot response, formatted for Teams
clipboard copy teams

# 2. Copy a file, formatted for ADO comments
clipboard copy ado --source docs/design.md

# 3. Pipe from stdin
echo "**hello world**" | clipboard copy loop --stdin

# 4. List available formatters
clipboard formats list
```

## Commands

### `copy` — Format and copy to clipboard

```bash
clipboard copy teams                      # Last Copilot response → Teams
clipboard copy loop --source file.md      # File → Loop
echo "**hi**" | clipboard copy ado --stdin # Stdin → ADO
clipboard copy outlook                    # Last response → Outlook
clipboard copy plain                      # Strip markdown → plain text
clipboard copy raw                        # Raw markdown passthrough
```

### `+last` — Shortcut for last response

```bash
clipboard +last teams        # Same as: clipboard copy teams
clipboard +last ado
```

### `formats` — Inspect formatters

```bash
clipboard formats list          # All formatters with descriptions
clipboard formats get ado       # Details for a specific formatter
```

### `session` — Copilot session info

```bash
clipboard session detect        # Show current session ID
clipboard session read          # Output last assistant response
```

### `doctor` — Health check

```bash
clipboard doctor                # Check PowerShell, clipboard, session
```

### `schema` — Introspect commands

```bash
clipboard schema copy           # Show copy command parameters
clipboard schema +last          # Show +last parameters
```

## Formatters

| Format | Target Apps | Notes |
|--------|------------|-------|
| `plain` | Any app | Strips all markdown |
| `raw` | Markdown editors | Passthrough |
| `teams` | Microsoft Teams | Clean semantic HTML (no inline styles) |
| `loop` | Microsoft Loop | Full styled HTML with tables, blockquotes |
| `outlook` | Outlook email | Email-safe HTML, Segoe UI font wrapper |
| `ado` | ADO comments/work items | Limited HTML subset, no CSS |

## Adding a New Formatter

1. Create `src/formatters/<name>.ts` implementing the `Formatter` interface:

   ```typescript
   import type { Formatter } from '../types.js';
   import { markdownToHtml, stripMarkdown } from '../lib/markdown.js';

   const notion: Formatter = {
     name: 'notion',
     description: 'Rich text for Notion paste',
     clipboardFormats: ['HTML Format', 'UnicodeText'],
     format(markdown) {
       return { html: markdownToHtml(markdown), plainText: stripMarkdown(markdown) };
     },
   };
   export default notion;
   ```

2. Register in `src/formatters/registry.ts`:

   ```typescript
   import notion from './notion.js';
   const formatters: Formatter[] = [...existing, notion];
   ```

3. Build: `npm run build`

That's it — `clipboard copy notion` works immediately.

## Global Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--format <F>` | Output: json, table | json |
| `--dry-run` | Preview without copying | off |
| `-v, --verbose` | Details on stderr | off |
| `-o, --output <path>` | Write to file | stdout |
| `--no-color` | No ANSI colors | off |

## JSON Output

All commands return structured JSON:

```json
{
  "status": "success",
  "data": {
    "format": "teams",
    "contentLength": 1234,
    "clipboardFormats": ["HTML Format", "UnicodeText"]
  },
  "metadata": {}
}
```

Errors: `{ "status": "error", "error": { "code": 3, "type": "validation_error", "message": "..." } }`

Exit codes: `0` success · `1` clipboard error · `3` validation · `4` not found · `5` internal

## Architecture

```
src/
├── cli.ts              # Main entry, commander setup
├── types.ts            # Formatter interface
├── commands/           # One file per resource (copy, formats, session, doctor, schema)
├── helpers/            # + commands (last)
├── lib/                # Shared utilities (output, errors, clipboard, session, cfhtml, markdown)
└── formatters/         # One file per formatter + registry
```

## Development

```bash
npm install             # Install dependencies
npm run build           # tsc → dist/
npm run dev             # tsc --watch
npm test                # vitest
npm run lint            # tsc --noEmit
```

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).

## License

MIT
