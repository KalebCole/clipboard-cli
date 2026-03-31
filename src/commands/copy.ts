import { Command } from 'commander';
import fs from 'fs';
import { getFormatter, getFormatterNames } from '../formatters/registry.js';
import { getLastResponse } from '../lib/session.js';
import { copyToClipboard } from '../lib/clipboard.js';
import { jsonOutput, jsonError, EXIT } from '../lib/output.js';
import type { GlobalOptions } from '../types.js';

export function registerCopyCommand(program: Command): void {
  program
    .command('copy')
    .description('Copy content to clipboard, formatted for a target application')
    .argument('<format>', `Target format: ${getFormatterNames().join(', ')}`)
    .option('-s, --source <path>', 'Read from a file instead of last Copilot response')
    .option('--stdin', 'Read from stdin')
    .action(async (formatName: string, opts: { source?: string; stdin?: boolean }, cmd) => {
      const globalOpts: GlobalOptions = cmd.optsWithGlobals();

      // Validate format
      const formatter = getFormatter(formatName);
      if (!formatter) {
        jsonError(
          `Unknown format "${formatName}". Available: ${getFormatterNames().join(', ')}`,
          EXIT.VALIDATION_ERROR,
          'validation_error',
        );
      }

      // Get content
      let content: string;
      try {
        if (opts.stdin) {
          content = fs.readFileSync(0, 'utf-8'); // stdin = fd 0
        } else if (opts.source) {
          if (!fs.existsSync(opts.source)) {
            jsonError(`File not found: ${opts.source}`, EXIT.NOT_FOUND, 'not_found');
          }
          content = fs.readFileSync(opts.source, 'utf-8');
        } else {
          content = getLastResponse();
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        jsonError(message, EXIT.NOT_FOUND, 'not_found');
      }

      // Format
      const result = formatter.format(content);

      // Dry run
      if (globalOpts.dryRun) {
        jsonOutput({
          format: formatter.name,
          source: opts.stdin ? 'stdin' : opts.source ? 'file' : 'session',
          contentLength: content.length,
          clipboardFormats: formatter.clipboardFormats,
          preview: result.html ? result.html.slice(0, 500) : result.plainText.slice(0, 500),
        }, {}, globalOpts);
        return;
      }

      // Copy
      const { formats } = copyToClipboard(result);

      if (globalOpts.verbose) {
        process.stderr.write(`Copied ${content.length} chars as ${formatter.name} → [${formats.join(', ')}]\n`);
      }

      jsonOutput({
        format: formatter.name,
        source: opts.stdin ? 'stdin' : opts.source ? 'file' : 'session',
        contentLength: content.length,
        clipboardFormats: formats,
      }, {}, globalOpts);
    });
}
