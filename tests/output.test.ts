import { describe, it, expect } from 'vitest';
import { jsonOutput, jsonError, formatTable, EXIT } from '../src/lib/output.js';

describe('EXIT codes', () => {
  it('has expected values', () => {
    expect(EXIT.SUCCESS).toBe(0);
    expect(EXIT.CLIPBOARD_ERROR).toBe(1);
    expect(EXIT.VALIDATION_ERROR).toBe(3);
    expect(EXIT.NOT_FOUND).toBe(4);
    expect(EXIT.INTERNAL_ERROR).toBe(5);
  });
});

describe('formatTable', () => {
  it('formats rows into a table', () => {
    const rows = [
      { name: 'teams', desc: 'Teams format' },
      { name: 'ado', desc: 'ADO format' },
    ];
    const result = formatTable(rows, ['name', 'desc']);
    expect(result).toContain('teams');
    expect(result).toContain('ado');
    expect(result).toContain('─');
  });

  it('returns (no results) for empty array', () => {
    expect(formatTable([], ['name'])).toBe('(no results)');
  });
});
