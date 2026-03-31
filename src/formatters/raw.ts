import type { Formatter } from '../types.js';

const raw: Formatter = {
  name: 'raw',
  description: 'Raw markdown — passthrough with no transformation',
  clipboardFormats: ['UnicodeText'],

  format(markdown: string) {
    return { plainText: markdown };
  },
};

export default raw;
