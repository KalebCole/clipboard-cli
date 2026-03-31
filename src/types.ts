/** Interface that every clipboard formatter must implement. */
export interface Formatter {
  /** Short name used as the CLI argument (e.g., 'teams', 'ado'). */
  name: string;

  /** Human-readable description shown in `clipboard formats list`. */
  description: string;

  /** Clipboard data formats this formatter produces (e.g., ['HTML Format', 'UnicodeText']). */
  clipboardFormats: string[];

  /** Convert markdown content to the target format. */
  format(markdown: string): FormatterResult;
}

export interface FormatterResult {
  /** HTML content for CF_HTML clipboard. Undefined for plain-text-only formatters. */
  html?: string;

  /** Plain text fallback (always required). */
  plainText: string;
}

export interface GlobalOptions {
  format?: string;
  dryRun?: boolean;
  verbose?: boolean;
  output?: string;
  yes?: boolean;
  force?: boolean;
  noColor?: boolean;
}
