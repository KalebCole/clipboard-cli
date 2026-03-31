/**
 * Clipboard write operations.
 * Plain text via PowerShell Set-Clipboard, CF_HTML via set-clipboard.ps1 bridge.
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { ClipboardError } from './errors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = path.resolve(__dirname, '..', '..', 'scripts', 'set-clipboard.ps1');

/** Copy plain text to clipboard. */
export function copyPlainText(text: string): void {
  try {
    execSync('powershell -NoProfile -Command "Set-Clipboard -Value $input"', {
      input: text,
      encoding: 'utf-8',
      timeout: 5000,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('ENOENT')) {
      throw new ClipboardError('PowerShell not found. Ensure powershell is on PATH.');
    }
    if (message.includes('ETIMEDOUT') || message.includes('timed out')) {
      throw new ClipboardError('Clipboard write timed out after 5 seconds.');
    }
    throw new ClipboardError(`Failed to copy plain text to clipboard: ${message}`);
  }
}

/** Copy HTML as CF_HTML (rich text) to clipboard with plain text fallback. */
export function copyCfHtml(html: string, plainText: string): void {
  try {
    // Pass both HTML and plainText via stdin using a delimiter to avoid command injection.
    // The PS1 script reads HTML from stdin; we pass plainText as a Base64-encoded param
    // to avoid any shell metacharacter issues.
    const b64PlainText = Buffer.from(plainText, 'utf-8').toString('base64');
    execSync(
      `powershell -NoProfile -File "${SCRIPT_PATH}" -PlainTextBase64 "${b64PlainText}"`,
      {
        input: html,
        encoding: 'utf-8',
        timeout: 10000,
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('ENOENT')) {
      throw new ClipboardError('PowerShell not found. Ensure powershell is on PATH.');
    }
    if (message.includes('ETIMEDOUT') || message.includes('timed out')) {
      throw new ClipboardError('Clipboard write timed out after 10 seconds.');
    }
    throw new ClipboardError(`Failed to copy CF_HTML to clipboard: ${message}`);
  }
}

/** Copy formatter output to clipboard (auto-selects plain text vs CF_HTML). */
export function copyToClipboard(result: { html?: string; plainText: string }): { formats: string[] } {
  if (result.html) {
    copyCfHtml(result.html, result.plainText);
    return { formats: ['HTML Format', 'UnicodeText'] };
  } else {
    copyPlainText(result.plainText);
    return { formats: ['UnicodeText'] };
  }
}
