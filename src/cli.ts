import { Command } from 'commander';
import { registerCopyCommand } from './commands/copy.js';
import { registerFormatsCommand } from './commands/formats.js';
import { registerSessionCommand } from './commands/session.js';
import { registerDoctorCommand } from './commands/doctor.js';
import { registerSchemaCommand } from './commands/schema.js';
import { registerLastHelper } from './helpers/last.js';
import { jsonOutput } from './lib/output.js';

export function run(): void {
  const program = new Command();

  program
    .name('clipboard')
    .description('Universal clipboard formatter — copy content formatted for Teams, Loop, Outlook, ADO, and more')
    .version('1.0.0')
    .option('--format <format>', 'Output format: json, table', process.env.CLIPBOARD_FORMAT ?? 'json')
    .option('--dry-run', 'Preview without copying to clipboard')
    .option('-v, --verbose', 'Show conversion details on stderr')
    .option('-o, --output <path>', 'Write output to file instead of clipboard')
    .option('--no-color', 'Disable colored output');

  registerCopyCommand(program);
  registerFormatsCommand(program);
  registerSessionCommand(program);
  registerDoctorCommand(program);
  registerSchemaCommand(program);
  registerLastHelper(program);

  program
    .command('version')
    .description('Show CLI version and info')
    .action((_opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      jsonOutput({ version: program.version(), cli: 'clipboard', node: process.version }, {}, globalOpts);
    });

  program.parse();
}
