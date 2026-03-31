---
name: clipboard-shared
version: 1.0.0
description: "clipboard-cli: Shared patterns for global flags, output formatting, and formatters."
metadata:
  requires:
    bins: ["clipboard"]
---

# clipboard — Shared Reference

## Installation

```bash
npm install -g clipboard-cli
# Or: git clone, npm install, npm run build, npm link
```

## CLI Syntax

```
clipboard <resource> <method> [flags]
clipboard +<helper> [flags]
```

## Global Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--format <F>` | Output format: json, table | json |
| `--dry-run` | Preview without copying to clipboard | off |
| `-v, --verbose` | Show conversion details on stderr | off |
| `-o, --output <path>` | Write output to file | stdout |
| `--no-color` | Disable colored output | off |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Clipboard error |
| 3 | Validation error |
| 4 | Not found |
| 5 | Internal error |

## JSON Output

Every response follows the envelope:

```json
{ "status": "success", "data": { ... }, "metadata": {} }
```

Errors:

```json
{ "status": "error", "error": { "code": 3, "type": "validation_error", "message": "..." } }
```

## Available Formatters

| Format | Target Apps | Notes |
|--------|------------|-------|
| `plain` | Any app | Strips all markdown |
| `raw` | Markdown editors | Passthrough |
| `teams` | Teams | CF_HTML with bold, headers, code, links, lists |
| `loop` | Loop | CF_HTML + tables, blockquotes |
| `outlook` | Outlook | Aliases teams (fork later if needed) |
| `ado` | ADO comments | Limited HTML subset, no CSS |

## Security Rules

- Never output clipboard content to stdout (only metadata)
- Use `--dry-run` to preview without copying
- Stderr for humans, stdout for machines (JSON)
