import { describe, it, expect } from 'vitest';
import { ClipboardError, ValidationError, NotFoundError } from '../src/lib/errors.js';

describe('Error classes', () => {
  it('ClipboardError has correct exit code and type', () => {
    const err = new ClipboardError('write failed');
    expect(err.exitCode).toBe(1);
    expect(err.type).toBe('clipboard_error');
    expect(err.message).toBe('write failed');
  });

  it('ValidationError has correct exit code and type', () => {
    const err = new ValidationError('bad input');
    expect(err.exitCode).toBe(3);
    expect(err.type).toBe('validation_error');
  });

  it('NotFoundError has correct exit code and type', () => {
    const err = new NotFoundError('no session');
    expect(err.exitCode).toBe(4);
    expect(err.type).toBe('not_found');
  });

  it('toJSON returns structured error', () => {
    const err = new ClipboardError('oops', { detail: 'info' });
    const json = err.toJSON();
    expect(json).toEqual({
      code: 1,
      type: 'clipboard_error',
      message: 'oops',
      details: { detail: 'info' },
    });
  });

  it('toJSON omits details when null', () => {
    const err = new ValidationError('bad');
    const json = err.toJSON();
    expect(json).not.toHaveProperty('details');
  });
});
