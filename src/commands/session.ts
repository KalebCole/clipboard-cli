import { Command } from 'commander';
import { detectSessionId, getMostRecentSessionId, readLastResponse } from '../lib/session.js';
import { jsonOutput, jsonError, EXIT } from '../lib/output.js';
import type { GlobalOptions } from '../types.js';

export function registerSessionCommand(program: Command): void {
  const session = program
    .command('session')
    .description('Detect and read Copilot CLI session data');

  session
    .command('detect')
    .description('Show the current Copilot session ID')
    .action((_opts, cmd) => {
      const globalOpts: GlobalOptions = cmd.optsWithGlobals();
      const processSession = detectSessionId();
      const recentSession = getMostRecentSessionId();

      jsonOutput({
        processSession,
        recentSession,
        activeSession: processSession ?? recentSession,
        method: processSession ? 'process_tree' : recentSession ? 'most_recent' : 'none',
      }, {}, globalOpts);
    });

  session
    .command('read')
    .description('Output the last assistant response from the current session')
    .action((_opts, cmd) => {
      const globalOpts: GlobalOptions = cmd.optsWithGlobals();
      const sessionId = detectSessionId() ?? getMostRecentSessionId();
      if (!sessionId) {
        jsonError('No active Copilot session found', EXIT.NOT_FOUND, 'not_found');
      }

      try {
        const response = readLastResponse(sessionId);
        jsonOutput({ sessionId, response }, {}, globalOpts);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        jsonError(message, EXIT.NOT_FOUND, 'not_found');
      }
    });
}
