import { Command } from 'commander';
import { getFormatterNames } from '../formatters/registry.js';
import { jsonOutput, jsonError, EXIT } from '../lib/output.js';
import type { GlobalOptions } from '../types.js';

interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: string;
}

interface Schema {
  command: string;
  description: string;
  fields: SchemaField[];
}

const schemas: Record<string, Schema> = {
  'copy': {
    command: 'clipboard copy <format>',
    description: 'Copy content to clipboard, formatted for a target application',
    fields: [
      { name: 'format', type: 'string', required: true, description: `Target format: ${getFormatterNames().join(', ')}` },
      { name: '--source', type: 'path', required: false, description: 'Read from a file instead of last Copilot response' },
      { name: '--stdin', type: 'boolean', required: false, description: 'Read from stdin', default: 'false' },
    ],
  },
  'formats.list': {
    command: 'clipboard formats list',
    description: 'List all available formatters',
    fields: [],
  },
  'formats.get': {
    command: 'clipboard formats get <name>',
    description: 'Show details for a specific formatter',
    fields: [
      { name: 'name', type: 'string', required: true, description: 'Formatter name' },
    ],
  },
  'session.detect': {
    command: 'clipboard session detect',
    description: 'Detect current Copilot session ID',
    fields: [],
  },
  'session.read': {
    command: 'clipboard session read',
    description: 'Output last assistant response',
    fields: [],
  },
  '+last': {
    command: 'clipboard +last <format>',
    description: 'Shortcut: copy last Copilot response in target format',
    fields: [
      { name: 'format', type: 'string', required: true, description: `Target format: ${getFormatterNames().join(', ')}` },
    ],
  },
  'doctor': {
    command: 'clipboard doctor',
    description: 'Health check for clipboard, PowerShell, and session',
    fields: [],
  },
};

export function registerSchemaCommand(program: Command): void {
  program
    .command('schema')
    .description('Introspect command parameters and types')
    .argument('<command>', 'Command to introspect (e.g., copy, formats.list, +last)')
    .action((commandName: string, _opts, cmd) => {
      const globalOpts: GlobalOptions = cmd.optsWithGlobals();
      const schema = schemas[commandName];
      if (!schema) {
        jsonError(
          `Unknown command "${commandName}". Available: ${Object.keys(schemas).join(', ')}`,
          EXIT.VALIDATION_ERROR,
          'validation_error',
        );
      }
      jsonOutput(schema, {}, globalOpts);
    });
}
