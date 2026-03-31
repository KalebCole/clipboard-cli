import { EXIT } from './output.js';

export class ClipboardCliError extends Error {
  exitCode: number;
  type: string;
  details: unknown;

  constructor(message: string, exitCode: number, type: string, details?: unknown) {
    super(message);
    this.exitCode = exitCode;
    this.type = type;
    this.details = details ?? null;
  }

  toJSON() {
    return {
      code: this.exitCode,
      type: this.type,
      message: this.message,
      ...(this.details ? { details: this.details } : {}),
    };
  }
}

export class ClipboardError extends ClipboardCliError {
  constructor(message: string, details?: unknown) {
    super(message, EXIT.CLIPBOARD_ERROR, 'clipboard_error', details);
  }
}

export class ValidationError extends ClipboardCliError {
  constructor(message: string, details?: unknown) {
    super(message, EXIT.VALIDATION_ERROR, 'validation_error', details);
  }
}

export class NotFoundError extends ClipboardCliError {
  constructor(message: string, details?: unknown) {
    super(message, EXIT.NOT_FOUND, 'not_found', details);
  }
}
