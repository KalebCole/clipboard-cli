import type { Formatter } from '../types.js';
import { stripMarkdown, escapeHtml, escapeAttr } from '../lib/markdown.js';

/**
 * ADO comments/work items formatter.
 * ADO supports a limited HTML subset — no <style> tags, no custom CSS attributes.
 * Supported tags: b, i, code, pre, a, ul, ol, li, h1-h6, br, hr, table, thead, tbody, tr, th, td, p, img
 */
const ado: Formatter = {
  name: 'ado',
  description: 'HTML for Azure DevOps comments/work items — limited tag subset, no custom CSS',
  clipboardFormats: ['HTML Format', 'UnicodeText'],

  format(markdown: string) {
    let html = markdown;

    // Code blocks → <pre><code> (no style attributes)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
      return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code (escape content)
    html = html.replace(/`([^`]+)`/g, (_match, code: string) => {
      return `<code>${escapeHtml(code)}</code>`;
    });

    // Images
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

    // Bold + italic (no style attrs)
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<b><i>$1</i></b>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    html = html.replace(/\*(.+?)\*/g, '<i>$1</i>');

    // Strikethrough
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // Horizontal rules
    html = html.replace(/^[-*_]{3,}\s*$/gm, '<hr>');

    // Blockquotes → just wrap in <p> with "> " prefix stripped (ADO doesn't support <blockquote> well)
    html = html.replace(/^>\s?(.+)$/gm, '<p>$1</p>');

    // Tables (no style attributes)
    html = convertAdoTables(html);

    // Unordered lists
    html = html.replace(/((?:^[-*+]\s+.+\n?)+)/gm, (match) => {
      const items = match.trim().split('\n').map(line =>
        `<li>${line.replace(/^[-*+]\s+/, '')}</li>`
      ).join('\n');
      return `<ul>\n${items}\n</ul>\n`;
    });

    // Ordered lists
    html = html.replace(/((?:^\d+\.\s+.+\n?)+)/gm, (match) => {
      const items = match.trim().split('\n').map(line =>
        `<li>${line.replace(/^\d+\.\s+/, '')}</li>`
      ).join('\n');
      return `<ol>\n${items}\n</ol>\n`;
    });

    // Wrap loose lines in <p>
    const blockTags = /^<(h[1-6]|p|ul|ol|li|pre|table|thead|tbody|tr|th|td|hr|div|img)/;
    html = html
      .split('\n\n')
      .map(block => {
        const trimmed = block.trim();
        if (!trimmed) return '';
        if (blockTags.test(trimmed)) return trimmed;
        return `<p>${trimmed}</p>`;
      })
      .join('\n');

    return {
      html,
      plainText: stripMarkdown(markdown),
    };
  },
};

function convertAdoTables(html: string): string {
  const tableRegex = /(?:^|\n)((?:\|.+\|\n)+)/g;

  return html.replace(tableRegex, (_match, tableBlock: string) => {
    const rows = tableBlock.trim().split('\n').filter(r => r.trim());
    if (rows.length < 2) return tableBlock;

    const isSeparator = /^\|[\s:-]+(\|[\s:-]+)*\|$/.test(rows[1].trim());
    if (!isSeparator) return tableBlock;

    const parseRow = (row: string) =>
      row.split('|').slice(1, -1).map(cell => cell.trim());

    const headers = parseRow(rows[0]);
    const dataRows = rows.slice(2).map(parseRow);

    const headerHtml = headers.map(h => `<th>${h}</th>`).join('');
    const bodyHtml = dataRows.map(row =>
      '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>'
    ).join('\n');

    return `\n<table>\n<thead><tr>${headerHtml}</tr></thead>\n<tbody>\n${bodyHtml}\n</tbody>\n</table>\n`;
  });
}

export default ado;
