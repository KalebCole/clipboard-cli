---
name: clipboard-copy
version: 1.0.0
description: "clipboard copy: Format and copy content to clipboard for Teams, Loop, Outlook, ADO. Use when user asks to copy, paste, format for an app, or clipboard operations."
metadata:
  requires:
    bins: ["clipboard"]
    cliHelp: "clipboard copy --help"
---

# clipboard copy

> **PREREQUISITE:** Read `../clipboard-shared/SKILL.md` for global flags and output format.

## Commands

### Copy last Copilot response

```bash
clipboard copy teams        # Rich text for Teams
clipboard copy loop         # Rich text for Loop
clipboard copy ado          # HTML for ADO comments
clipboard copy outlook      # Rich text for Outlook
clipboard copy plain        # Plain text (markdown stripped)
clipboard copy raw          # Raw markdown preserved
```

### Copy a specific file

```bash
clipboard copy teams --source path/to/file.md
```

### Pipe from stdin

```bash
echo "**hello**" | clipboard copy teams --stdin
```

### Shortcut: copy last response

```bash
clipboard +last teams       # Same as: clipboard copy teams
clipboard +last ado
```

## Helper Commands

| Helper | What it does |
|--------|-------------|
| `+last <format>` | Copy last Copilot response in target format |

## Introspection

```bash
clipboard formats list          # List all formatters
clipboard formats get ado       # Details for a specific formatter
clipboard schema copy           # Show copy command parameters
clipboard doctor                # Health check
```

## Examples

```bash
# Copy last response for pasting into Teams chat
clipboard copy teams

# Copy a design doc for ADO work item description
clipboard copy ado --source docs/design.md

# Preview what would be copied without actually copying
clipboard copy loop --dry-run

# Verbose output
clipboard copy teams -v
```
