import { Command } from 'commander';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { detectSessionId, getMostRecentSessionId } from '../lib/session.js';
import { jsonOutput } from '../lib/output.js';
import type { GlobalOptions } from '../types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = path.resolve(__dirname, '..', '..', 'scripts', 'set-clipboard.ps1');

interface Check {
  name: string;
  status: 'ok' | 'warn' | 'fail';
  message: string;
}

export function registerDoctorCommand(program: Command): void {
  program
    .command('doctor')
    .description('Check clipboard, PowerShell, and Copilot session health')
    .action((_opts, cmd) => {
      const globalOpts: GlobalOptions = cmd.optsWithGlobals();
      const checks: Check[] = [];

      // Check PowerShell
      try {
        const psVersion = execSync('powershell -NoProfile -Command "$PSVersionTable.PSVersion.Major"', {
          encoding: 'utf-8',
          timeout: 5000,
        }).trim();
        checks.push({ name: 'powershell', status: 'ok', message: `PowerShell v${psVersion} available` });
      } catch {
        checks.push({ name: 'powershell', status: 'fail', message: 'PowerShell not found or timed out' });
      }

      // Check set-clipboard.ps1
      if (fs.existsSync(SCRIPT_PATH)) {
        checks.push({ name: 'bridge_script', status: 'ok', message: `Found ${SCRIPT_PATH}` });
      } else {
        checks.push({ name: 'bridge_script', status: 'fail', message: `Missing: ${SCRIPT_PATH}` });
      }

      // Check clipboard write
      try {
        execSync('powershell -NoProfile -Command "Set-Clipboard -Value \'clipboard-cli doctor test\'"', {
          encoding: 'utf-8',
          timeout: 5000,
        });
        checks.push({ name: 'clipboard_write', status: 'ok', message: 'Clipboard write successful' });
      } catch {
        checks.push({ name: 'clipboard_write', status: 'fail', message: 'Cannot write to clipboard' });
      }

      // Check Copilot session
      const processSession = detectSessionId();
      const recentSession = getMostRecentSessionId();
      if (processSession) {
        checks.push({ name: 'session', status: 'ok', message: `Active session: ${processSession}` });
      } else if (recentSession) {
        checks.push({ name: 'session', status: 'warn', message: `No process match, most recent: ${recentSession}` });
      } else {
        checks.push({ name: 'session', status: 'warn', message: 'No Copilot session found' });
      }

      const allOk = checks.every(c => c.status === 'ok');

      if (globalOpts.format === 'table') {
        for (const check of checks) {
          const icon = check.status === 'ok' ? '✓' : check.status === 'warn' ? '⚠' : '✗';
          process.stderr.write(`  ${icon} ${check.name}: ${check.message}\n`);
        }
        process.stderr.write(allOk ? '\nAll checks passed.\n' : '\nSome checks need attention.\n');
      }

      jsonOutput({ checks, healthy: allOk }, {}, globalOpts);
    });
}
