import type { Formatter } from '../types.js';
import { stripMarkdown } from '../lib/markdown.js';

const plain: Formatter = {
  name: 'plain',
  description: 'Plain text — strips all markdown formatting',
  clipboardFormats: ['UnicodeText'],

  format(markdown: string) {
    return { plainText: stripMarkdown(markdown) };
  },
};

export default plain;
