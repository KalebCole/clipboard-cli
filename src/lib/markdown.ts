/**
 * Shared markdown utilities for formatters.
 * Handles stripping markdown to plain text and common regex patterns for HTML conversion.
 */

/** Strip all markdown formatting → clean plain text. */
export function stripMarkdown(md: string): string {
  let text = md;

  // Remove code blocks (preserve content)
  text = text.replace(/```[\s\S]*?```/g, (match) => {
    return match.replace(/```\w*\n?/g, '').replace(/```/g, '').trim();
  });

  // Remove inline code backticks
  text = text.replace(/`([^`]+)`/g, '$1');

  // Remove images
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

  // Convert links to "text (url)"
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

  // Remove headers (keep text)
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Remove strikethrough
  text = text.replace(/~~(.+?)~~/g, '$1');

  // Remove bold/italic markers
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '$1');
  text = text.replace(/\*\*(.+?)\*\*/g, '$1');
  text = text.replace(/\*(.+?)\*/g, '$1');
  text = text.replace(/___(.+?)___/g, '$1');
  text = text.replace(/__(.+?)__/g, '$1');
  text = text.replace(/_(.+?)_/g, '$1');

  // Remove blockquote markers
  text = text.replace(/^>\s?/gm, '');

  // Remove horizontal rules
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');

  // Remove task list checkboxes
  text = text.replace(/^(\s*)([-*+])\s+\[([ xX])\]\s+/gm, '$1$2 ');

  // Remove list markers (keep text)
  text = text.replace(/^(\s*)([-*+]|\d+\.)\s+/gm, '$1');

  // Collapse multiple blank lines
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/** Convert markdown to HTML with inline styles for rich-text pasting. */
export function markdownToHtml(md: string, options: { includeStyles?: boolean } = {}): string {
  const styled = options.includeStyles !== false; // default true
  let html = md;

  // Code blocks → <pre><code>
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang: string, code: string) => {
    const escaped = escapeHtml(code.trim());
    const langClass = lang ? ` class="language-${lang}"` : '';
    if (styled) {
      return `<pre style="background:#f4f4f4;padding:8px 12px;border-radius:4px;font-family:Consolas,monospace;font-size:13px;white-space:pre-wrap;word-wrap:break-word;"><code${langClass}>${escaped}</code></pre>`;
    }
    return `<pre><code${langClass}>${escaped}</code></pre>`;
  });

  // Inline code → <code> (escape content!)
  html = html.replace(/`([^`]+)`/g, (_match, code: string) => {
    const escaped = escapeHtml(code);
    if (styled) {
      return `<code style="background:#f4f4f4;padding:2px 4px;border-radius:3px;font-family:Consolas,monospace;font-size:13px;">${escaped}</code>`;
    }
    return `<code>${escaped}</code>`;
  });

  // Images (before links)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt: string, src: string) => {
    return `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}">`;
  });

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text: string, url: string) => {
    return `<a href="${escapeAttr(url)}">${text}</a>`;
  });

  // Headers
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<b><i>$1</i></b>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  html = html.replace(/\*(.+?)\*/g, '<i>$1</i>');

  // Horizontal rules
  html = html.replace(/^[-*_]{3,}\s*$/gm, '<hr>');

  // Blockquotes
  if (styled) {
    html = html.replace(/^>\s?(.+)$/gm, '<blockquote style="border-left:3px solid #ccc;padding-left:12px;margin:8px 0;color:#555;">$1</blockquote>');
  } else {
    html = html.replace(/^>\s?(.+)$/gm, '<blockquote>$1</blockquote>');
  }

  // Tables
  html = convertTables(html, styled);

  // Lists (with nesting support)
  html = convertLists(html);

  // Paragraphs — wrap remaining loose lines
  html = wrapParagraphs(html);

  return html;
}

/** Variant: HTML without inline styles (for Teams, ADO). */
export function markdownToHtmlClean(md: string): string {
  return markdownToHtml(md, { includeStyles: false });
}

/** Convert markdown tables to HTML tables. */
function convertTables(html: string, styled: boolean): string {
  const tableRegex = /(?:^|\n)((?:\|.+\|\n)+)/g;

  return html.replace(tableRegex, (_match, tableBlock: string) => {
    const rows = tableBlock.trim().split('\n').filter(r => r.trim());
    if (rows.length < 2) return tableBlock;

    // Check if second row is separator
    const isSeparator = /^\|[\s:-]+(\|[\s:-]+)*\|$/.test(rows[1].trim());
    if (!isSeparator) return tableBlock;

    const parseRow = (row: string) =>
      row.split('|').slice(1, -1).map(cell => cell.trim());

    const headers = parseRow(rows[0]);
    const dataRows = rows.slice(2).map(parseRow);

    if (styled) {
      const headerHtml = headers.map(h => `<th style="border:1px solid #ddd;padding:6px 10px;background:#f6f6f6;text-align:left;">${h}</th>`).join('');
      const bodyHtml = dataRows.map(row =>
        '<tr>' + row.map(cell => `<td style="border:1px solid #ddd;padding:6px 10px;">${cell}</td>`).join('') + '</tr>'
      ).join('\n');
      return `\n<table style="border-collapse:collapse;margin:8px 0;">\n<thead><tr>${headerHtml}</tr></thead>\n<tbody>\n${bodyHtml}\n</tbody>\n</table>\n`;
    } else {
      const headerHtml = headers.map(h => `<th>${h}</th>`).join('');
      const bodyHtml = dataRows.map(row =>
        '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>'
      ).join('\n');
      return `\n<table border="1" cellpadding="4">\n<thead><tr>${headerHtml}</tr></thead>\n<tbody>\n${bodyHtml}\n</tbody>\n</table>\n`;
    }
  });
}

/** Convert markdown lists (unordered and ordered) to HTML with nesting support. */
function convertLists(html: string): string {
  // Match blocks of lines that start with optional indent + list marker
  const listBlockRegex = /((?:^[ \t]*(?:[-*+]|\d+\.)\s+.+\n?)+)/gm;

  return html.replace(listBlockRegex, (match) => {
    return parseListBlock(match.trim());
  });
}

/** Parse a block of list lines into nested HTML lists. */
function parseListBlock(block: string): string {
  const lines = block.split('\n').filter(l => l.trim());

  interface ListItem {
    indent: number;
    ordered: boolean;
    content: string;
  }

  const items: ListItem[] = lines.map(line => {
    const indentMatch = line.match(/^([ \t]*)/);
    const indent = indentMatch ? indentMatch[1].replace(/\t/g, '  ').length : 0;
    const ordered = /^\s*\d+\.\s+/.test(line);
    const content = line.replace(/^\s*(?:[-*+]|\d+\.)\s+/, '');
    return { indent, ordered, content };
  });

  function buildList(startIdx: number, parentIndent: number): { html: string; endIdx: number } {
    if (startIdx >= items.length) return { html: '', endIdx: startIdx };

    const isOrdered = items[startIdx].ordered;
    const tag = isOrdered ? 'ol' : 'ul';
    let result = `<${tag}>\n`;
    let i = startIdx;

    while (i < items.length && items[i].indent >= parentIndent) {
      if (items[i].indent < parentIndent) break;

      if (items[i].indent === parentIndent) {
        result += `<li>${items[i].content}`;
        i++;

        // Check for nested items
        if (i < items.length && items[i].indent > parentIndent) {
          const nested = buildList(i, items[i].indent);
          result += `\n${nested.html}`;
          i = nested.endIdx;
        }

        result += '</li>\n';
      } else {
        // Deeper than expected — start nested list
        const nested = buildList(i, items[i].indent);
        result += nested.html;
        i = nested.endIdx;
      }
    }

    result += `</${tag}>\n`;
    return { html: result, endIdx: i };
  }

  const { html } = buildList(0, items[0]?.indent ?? 0);
  return html;
}

/** Wrap loose lines in <p> tags. */
function wrapParagraphs(html: string): string {
  const blockTags = /^<(h[1-6]|p|ul|ol|li|pre|blockquote|table|thead|tbody|tr|th|td|hr|div|img)/;

  return html
    .split('\n\n')
    .map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (blockTags.test(trimmed)) return trimmed;
      return `<p>${trimmed}</p>`;
    })
    .join('\n');
}

/** Escape HTML special characters. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Escape for use in HTML attributes (href, alt, src). */
export function escapeAttr(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
