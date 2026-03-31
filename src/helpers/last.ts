import { Command } from 'commander';
import { getFormatter, getFormatterNames } from '../formatters/registry.js';
import { getLastResponse } from '../lib/session.js';
import { copyToClipboard } from '../lib/clipboard.js';
import { jsonOutput, jsonError, EXIT } from '../lib/output.js';
import type { GlobalOptions } from '../types.js';

export function registerLastHelper(program: Command): void {
  program
    .command('+last')
    .description('Shortcut: copy last Copilot response, formatted for target app')
    .argument('<format>', `Target format: ${getFormatterNames().join(', ')}`)
    .action((formatName: string, _opts, cmd) => {
      const globalOpts: GlobalOptions = cmd.optsWithGlobals();

      const formatter = getFormatter(formatName);
      if (!formatter) {
        jsonError(
          `Unknown format "${formatName}". Available: ${getFormatterNames().join(', ')}`,
          EXIT.VALIDATION_ERROR,
          'validation_error',
        );
      }

      let content: string;
      try {
        content = getLastResponse();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        jsonError(message, EXIT.NOT_FOUND, 'not_found');
      }

      const result = formatter.format(content);

      if (globalOpts.dryRun) {
        jsonOutput({
          format: formatter.name,
          source: 'session',
          contentLength: content.length,
          clipboardFormats: formatter.clipboardFormats,
        }, {}, globalOpts);
        return;
      }

      const { formats } = copyToClipboard(result);

      if (globalOpts.verbose) {
        process.stderr.write(`Copied last response as ${formatter.name} → [${formats.join(', ')}]\n`);
      }

      jsonOutput({
        format: formatter.name,
        source: 'session',
        contentLength: content.length,
        clipboardFormats: formats,
      }, {}, globalOpts);
    });
}
