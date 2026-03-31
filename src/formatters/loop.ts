import type { Formatter } from '../types.js';
import { markdownToHtml, stripMarkdown } from '../lib/markdown.js';

const loop: Formatter = {
  name: 'loop',
  description: 'Rich text (CF_HTML) for Microsoft Loop — full styles, tables, blockquotes, code blocks',
  clipboardFormats: ['HTML Format', 'UnicodeText'],

  format(markdown: string) {
    // Loop renders inline CSS reliably — use full styled output
    return {
      html: markdownToHtml(markdown, { includeStyles: true }),
      plainText: stripMarkdown(markdown),
    };
  },
};

export default loop;
