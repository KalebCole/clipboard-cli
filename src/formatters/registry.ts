import type { Formatter } from '../types.js';
import plain from './plain.js';
import raw from './raw.js';
import teams from './teams.js';
import loop from './loop.js';
import outlook from './outlook.js';
import ado from './ado.js';

const formatters: Formatter[] = [plain, raw, teams, loop, outlook, ado];

const formatterMap = new Map(formatters.map(f => [f.name, f]));

/** Get a formatter by name. Returns undefined if not found. */
export function getFormatter(name: string): Formatter | undefined {
  return formatterMap.get(name);
}

/** Get all registered formatters. */
export function getAllFormatters(): Formatter[] {
  return [...formatters];
}

/** Get all registered formatter names. */
export function getFormatterNames(): string[] {
  return formatters.map(f => f.name);
}
