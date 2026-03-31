import { describe, it, expect } from 'vitest';
import { stripMarkdown, markdownToHtml, markdownToHtmlClean, escapeHtml, escapeAttr } from '../src/lib/markdown.js';

describe('stripMarkdown', () => {
  it('removes headers', () => {
    expect(stripMarkdown('# Hello')).toBe('Hello');
    expect(stripMarkdown('### Deep header')).toBe('Deep header');
  });

  it('removes bold and italic', () => {
    expect(stripMarkdown('**bold** and *italic*')).toBe('bold and italic');
  });

  it('removes inline code', () => {
    expect(stripMarkdown('use `npm install`')).toBe('use npm install');
  });

  it('converts links to text (url)', () => {
    expect(stripMarkdown('[GitHub](https://github.com)')).toBe('GitHub (https://github.com)');
  });

  it('removes list markers', () => {
    expect(stripMarkdown('- item one\n- item two')).toBe('item one\nitem two');
  });

  it('removes blockquote markers', () => {
    expect(stripMarkdown('> quote text')).toBe('quote text');
  });

  it('removes code blocks but keeps content', () => {
    const input = '```js\nconst x = 1;\n```';
    expect(stripMarkdown(input)).toBe('const x = 1;');
  });

  it('removes strikethrough', () => {
    expect(stripMarkdown('~~deleted~~ text')).toBe('deleted text');
  });

  it('strips task list checkboxes', () => {
    expect(stripMarkdown('- [x] done\n- [ ] todo')).toBe('done\ntodo');
  });
});

describe('markdownToHtml', () => {
  it('converts headers', () => {
    expect(markdownToHtml('# Title')).toContain('<h1>Title</h1>');
    expect(markdownToHtml('## Sub')).toContain('<h2>Sub</h2>');
  });

  it('converts bold and italic', () => {
    expect(markdownToHtml('**bold**')).toContain('<b>bold</b>');
    expect(markdownToHtml('*italic*')).toContain('<i>italic</i>');
  });

  it('converts inline code and escapes content', () => {
    const result = markdownToHtml('use `<div>`');
    expect(result).toContain('<code');
    expect(result).toContain('&lt;div&gt;');
    expect(result).not.toContain('<div>');
  });

  it('converts links with escaped URLs', () => {
    const result = markdownToHtml('[GH](https://example.com?a=1&b=2)');
    expect(result).toContain('href="https://example.com?a=1&amp;b=2"');
  });

  it('converts code blocks with language class', () => {
    const input = '```js\nconst x = 1;\n```';
    const result = markdownToHtml(input);
    expect(result).toContain('class="language-js"');
    expect(result).toContain('const x = 1;');
  });

  it('converts strikethrough', () => {
    expect(markdownToHtml('~~deleted~~')).toContain('<del>deleted</del>');
  });

  it('converts horizontal rules', () => {
    expect(markdownToHtml('---')).toContain('<hr>');
  });

  it('supports nested lists', () => {
    const input = '- item 1\n  - nested\n- item 2';
    const result = markdownToHtml(input);
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>item 1');
    expect(result).toContain('<li>nested</li>');
    expect(result).toContain('<li>item 2</li>');
  });

  it('includes inline styles by default', () => {
    const result = markdownToHtml('`code`');
    expect(result).toContain('style=');
  });

  it('strips styles with includeStyles: false', () => {
    const result = markdownToHtml('`code`', { includeStyles: false });
    expect(result).not.toContain('style=');
    expect(result).toContain('<code>');
  });
});

describe('markdownToHtmlClean', () => {
  it('produces HTML without styles', () => {
    const result = markdownToHtmlClean('**bold** and `code`');
    expect(result).toContain('<b>bold</b>');
    expect(result).toContain('<code>');
    expect(result).not.toContain('style=');
  });
});

describe('escapeHtml', () => {
  it('escapes special characters', () => {
    expect(escapeHtml('<script>"test"</script>')).toBe('&lt;script&gt;&quot;test&quot;&lt;/script&gt;');
  });
});

describe('escapeAttr', () => {
  it('escapes ampersands in URLs', () => {
    expect(escapeAttr('https://x.com?a=1&b=2')).toBe('https://x.com?a=1&amp;b=2');
  });

  it('escapes quotes', () => {
    expect(escapeAttr('alt "text"')).toBe('alt &quot;text&quot;');
  });
});
