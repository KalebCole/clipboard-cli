import type { Formatter } from '../types.js';
import { markdownToHtml, stripMarkdown } from '../lib/markdown.js';

const outlook: Formatter = {
  name: 'outlook',
  description: 'Rich text (CF_HTML) for Outlook email compose — email-safe HTML with font styling',
  clipboardFormats: ['HTML Format', 'UnicodeText'],

  format(markdown: string) {
    // Use styled HTML but post-process for Outlook compatibility
    let html = markdownToHtml(markdown, { includeStyles: true });

    // Remove overflow-x:auto (Outlook Desktop doesn't support it)
    html = html.replace(/overflow-x:\s*auto;?/g, '');

    // Remove border-radius (Outlook Desktop ignores it)
    html = html.replace(/border-radius:\s*\d+px;?/g, '');

    // Add HTML border attribute fallback on tables (for Outlook Desktop Word engine)
    html = html.replace(/<table style="/g, '<table border="1" cellpadding="4" style="');

    // Wrap in a div with email-safe font
    html = `<div style="font-family:Segoe UI,Arial,sans-serif;font-size:11pt;">${html}</div>`;

    return {
      html,
      plainText: stripMarkdown(markdown),
    };
  },
};

export default outlook;
