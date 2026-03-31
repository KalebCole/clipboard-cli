import type { Formatter } from '../types.js';
import { markdownToHtmlClean, stripMarkdown } from '../lib/markdown.js';

/** Convert markdown tables to formatted lists (Teams can't render <table> from CF_HTML). */
function tablesToLists(md: string): string {
  const tableRegex = /((?:^\|.+\|\n?)+)/gm;

  return md.replace(tableRegex, (block) => {
    const rows = block.trim().split('\n').filter(r => r.trim());
    if (rows.length < 3) return block;

    const isSeparator = /^\|[\s:-]+(\|[\s:-]+)*\|$/.test(rows[1].trim());
    if (!isSeparator) return block;

    const parseRow = (row: string) =>
      row.split('|').slice(1, -1).map(cell => cell.trim());

    const headers = parseRow(rows[0]);
    const dataRows = rows.slice(2).map(parseRow);

    return dataRows
      .map(cells =>
        headers.map((h, i) => `**${h}:** ${cells[i] ?? ''}`).join(' | ')
      )
      .join('\n') + '\n';
  });
}

/** Pre-process markdown and convert to clean HTML suitable for Teams. */
function formatForTeams(md: string): string {
  const preprocessed = tablesToLists(md);
  let html = markdownToHtmlClean(preprocessed);
  // Teams doesn't support <hr> — replace with a line break
  html = html.replace(/<hr\s*\/?>/g, '<br>');
  return html;
}

const teams: Formatter = {
  name: 'teams',
  description: 'Rich text (CF_HTML) for Microsoft Teams — bold, headers, code blocks, links, lists',
  clipboardFormats: ['HTML Format', 'UnicodeText'],

  format(markdown: string) {
    return {
      html: formatForTeams(markdown),
      plainText: stripMarkdown(markdown),
    };
  },
};

export default teams;
