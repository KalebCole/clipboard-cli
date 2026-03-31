import { describe, it, expect } from 'vitest';
import { buildCfHtml } from '../src/lib/cfhtml.js';

describe('buildCfHtml', () => {
  it('produces a valid CF_HTML envelope', () => {
    const result = buildCfHtml('<b>Hello</b>');

    expect(result).toContain('Version:0.9');
    expect(result).toContain('StartHTML:');
    expect(result).toContain('EndHTML:');
    expect(result).toContain('StartFragment:');
    expect(result).toContain('EndFragment:');
    expect(result).toContain('<!--StartFragment-->');
    expect(result).toContain('<!--EndFragment-->');
    expect(result).toContain('<b>Hello</b>');
  });

  it('has correct offset padding (10 digits)', () => {
    const result = buildCfHtml('<p>test</p>');
    const match = result.match(/StartHTML:(\d{10})/);
    expect(match).not.toBeNull();
    expect(match![1].length).toBe(10);
  });

  it('wraps content in html/body tags', () => {
    const result = buildCfHtml('<b>test</b>');
    expect(result).toContain('<html>');
    expect(result).toContain('<body>');
    expect(result).toContain('</body>');
    expect(result).toContain('</html>');
  });
});
