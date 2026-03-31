/**
 * Copilot session detection and response extraction.
 * Detects the current Copilot CLI session and reads the last assistant response.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { NotFoundError } from './errors.js';

const COPILOT_STATE_DIR = path.join(process.env.USERPROFILE ?? process.env.HOME ?? '', '.copilot', 'session-state');

interface EventEntry {
  type: string;
  role?: string;
  content?: string;
  message?: string;
  timestamp?: string;
}

/** Detect the current Copilot session ID by walking the process tree. */
export function detectSessionId(): string | null {
  try {
    // Get parent process chain to find copilot.exe
    const psScript = `$proc = Get-Process -Id ${process.ppid} -ErrorAction SilentlyContinue; $visited = @{}; while ($proc -and -not $visited[$proc.Id]) { $visited[$proc.Id] = $true; if ($proc.ProcessName -match 'copilot') { Write-Output $proc.Id; Write-Output $proc.StartTime.ToString('o'); break }; $proc = Get-Process -Id (Get-CimInstance Win32_Process -Filter "ProcessId=$($proc.Id)" -ErrorAction SilentlyContinue).ParentProcessId -ErrorAction SilentlyContinue }`;
    const result = execSync(`powershell -NoProfile -Command "${psScript}"`, {
      encoding: 'utf-8',
      timeout: 5000,
    }).trim();

    if (!result) return null;

    const [copilotPid, startTimeStr] = result.split('\n').map(s => s.trim());
    if (!copilotPid) return null;

    const copilotStartTime = new Date(startTimeStr);

    // Match session by start time — find closest match, not first match
    if (!fs.existsSync(COPILOT_STATE_DIR)) return null;

    const sessions = fs.readdirSync(COPILOT_STATE_DIR);
    let bestMatch: string | null = null;
    let smallestDiff = 30000; // 30-second window

    for (const sessionId of sessions) {
      const sessionFile = path.join(COPILOT_STATE_DIR, sessionId, 'session.json');
      if (!fs.existsSync(sessionFile)) continue;

      try {
        const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
        const sessionStart = new Date(sessionData.start ?? sessionData.created_at ?? 0);
        const diff = Math.abs(copilotStartTime.getTime() - sessionStart.getTime());
        if (diff < smallestDiff) {
          smallestDiff = diff;
          bestMatch = sessionId;
        }
      } catch (err) {
        process.stderr.write(`[clipboard] Warning: Failed to parse session ${sessionId}: ${err}\n`);
        continue;
      }
    }

    return bestMatch;
  } catch (err) {
    // Session detection is best-effort — log but don't crash
    if (process.env.CLIPBOARD_VERBOSE) {
      process.stderr.write(`[clipboard] Session detection failed: ${err}\n`);
    }
    return null;
  }
}

/** Get the most recent session ID (fallback when process detection fails). */
export function getMostRecentSessionId(): string | null {
  if (!fs.existsSync(COPILOT_STATE_DIR)) return null;

  const sessions = fs.readdirSync(COPILOT_STATE_DIR)
    .map(name => {
      const eventsPath = path.join(COPILOT_STATE_DIR, name, 'events.jsonl');
      try {
        const stat = fs.statSync(eventsPath);
        return { name, mtime: stat.mtimeMs };
      } catch {
        return null;
      }
    })
    .filter((s): s is { name: string; mtime: number } => s !== null)
    .sort((a, b) => b.mtime - a.mtime);

  return sessions[0]?.name ?? null;
}

/** Read the last assistant response from a session's events.jsonl. */
export function readLastResponse(sessionId: string): string {
  const eventsPath = path.join(COPILOT_STATE_DIR, sessionId, 'events.jsonl');

  if (!fs.existsSync(eventsPath)) {
    throw new NotFoundError(`No events.jsonl found for session ${sessionId}`);
  }

  const lines = fs.readFileSync(eventsPath, 'utf-8')
    .split('\n')
    .filter(line => line.trim())
    .reverse();

  for (const line of lines) {
    try {
      const event: EventEntry = JSON.parse(line);
      if (event.type === 'assistant.message' || (event.type === 'message' && event.role === 'assistant')) {
        const content = event.content ?? event.message ?? '';
        if (content.trim()) return content.trim();
      }
    } catch {
      continue;
    }
  }

  throw new NotFoundError('No assistant response found in session');
}

/** Get the last Copilot response, auto-detecting the session. */
export function getLastResponse(): string {
  const sessionId = detectSessionId() ?? getMostRecentSessionId();
  if (!sessionId) {
    throw new NotFoundError('No active Copilot session found. Make sure Copilot CLI is running.');
  }
  return readLastResponse(sessionId);
}
