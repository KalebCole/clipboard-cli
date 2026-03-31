import fs from 'fs';
import type { GlobalOptions } from '../types.js';

export const EXIT = {
  SUCCESS: 0,
  CLIPBOARD_ERROR: 1,
  AUTH_ERROR: 2,
  VALIDATION_ERROR: 3,
  NOT_FOUND: 4,
  INTERNAL_ERROR: 5,
} as const;

export function jsonOutput(data: unknown, metadata: Record<string, unknown> = {}, opts: GlobalOptions = {}): void {
  const envelope = { status: 'success', data, metadata };
  const json = JSON.stringify(envelope);
  if (opts.output) {
    fs.writeFileSync(opts.output, json + '\n');
  } else {
    process.stdout.write(json + '\n');
  }
}

export function jsonError(message: string, code: number = EXIT.INTERNAL_ERROR, type: string = 'internal_error', details?: unknown): never {
  const envelope = {
    status: 'error',
    error: { code, type, message, ...(details ? { details } : {}) },
  };
  process.stdout.write(JSON.stringify(envelope) + '\n');
  process.exit(code);
}

export function formatTable(rows: Record<string, unknown>[], columns: string[]): string {
  if (!rows || rows.length === 0) return '(no results)';
  const widths = columns.map(col =>
    Math.max(col.length, ...rows.map(r => String(r[col] ?? '').length))
  );
  const header = columns.map((col, i) => col.padEnd(widths[i])).join('  ');
  const sep = widths.map(w => '─'.repeat(w)).join('──');
  const body = rows
    .map(r => columns.map((col, i) => String(r[col] ?? '').padEnd(widths[i])).join('  '))
    .join('\n');
  return `${header}\n${sep}\n${body}`;
}
