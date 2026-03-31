import { Command } from 'commander';
import { getAllFormatters, getFormatter } from '../formatters/registry.js';
import { jsonOutput, jsonError, formatTable, EXIT } from '../lib/output.js';
import type { GlobalOptions } from '../types.js';

export function registerFormatsCommand(program: Command): void {
  const formats = program
    .command('formats')
    .description('List and inspect available clipboard formatters');

  formats
    .command('list')
    .description('List all available formatters')
    .action((_opts, cmd) => {
      const globalOpts: GlobalOptions = cmd.optsWithGlobals();
      const all = getAllFormatters();

      if (globalOpts.format === 'table') {
        const table = formatTable(
          all.map(f => ({ name: f.name, description: f.description, formats: f.clipboardFormats.join(', ') })),
          ['name', 'description', 'formats'],
        );
        process.stdout.write(table + '\n');
        return;
      }

      jsonOutput(
        all.map(f => ({
          name: f.name,
          description: f.description,
          clipboardFormats: f.clipboardFormats,
        })),
        { count: all.length },
        globalOpts,
      );
    });

  formats
    .command('get')
    .description('Show details for a specific formatter')
    .argument('<name>', 'Formatter name')
    .action((name: string, _opts, cmd) => {
      const globalOpts: GlobalOptions = cmd.optsWithGlobals();
      const formatter = getFormatter(name);
      if (!formatter) {
        jsonError(
          `Unknown formatter "${name}". Run "clipboard formats list" to see available formatters.`,
          EXIT.NOT_FOUND,
          'not_found',
        );
      }

      jsonOutput({
        name: formatter.name,
        description: formatter.description,
        clipboardFormats: formatter.clipboardFormats,
      }, {}, globalOpts);
    });
}
