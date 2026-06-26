import { describe, it, expect } from 'vitest';
import { isValidMessage, isAllowedFileType, isAllowedExtension, isWithinFileSizeLimit, isValidSessionId, getFileExtension } from './validators';

describe('isValidMessage', () => {
  it('returns error for empty message', () => {
    expect(isValidMessage('')).not.toBe(true);
  });

  it('returns error for whitespace-only message', () => {
    expect(isValidMessage('   ')).not.toBe(true);
  });

  it('returns true for valid message', () => {
    expect(isValidMessage('Olá')).toBe(true);
  });

  it('returns error for message over limit', () => {
    const long = 'a'.repeat(5001);
    expect(isValidMessage(long)).not.toBe(true);
  });
});

describe('isAllowedFileType', () => {
  it('accepts text/plain', () => {
    expect(isAllowedFileType('text/plain')).toBe(true);
  });

  it('accepts application/pdf', () => {
    expect(isAllowedFileType('application/pdf')).toBe(true);
  });

  it('rejects image/png', () => {
    expect(isAllowedFileType('image/png')).toBe(false);
  });
});

describe('isAllowedExtension', () => {
  it('accepts .txt', () => {
    expect(isAllowedExtension('file.txt')).toBe(true);
  });

  it('accepts .pdf', () => {
    expect(isAllowedExtension('file.pdf')).toBe(true);
  });

  it('rejects .exe', () => {
    expect(isAllowedExtension('file.exe')).toBe(false);
  });
});

describe('isWithinFileSizeLimit', () => {
  it('accepts small file', () => {
    expect(isWithinFileSizeLimit(1000)).toBe(true);
  });

  it('accepts file at exact limit', () => {
    expect(isWithinFileSizeLimit(10 * 1024 * 1024)).toBe(true);
  });

  it('rejects file over limit', () => {
    expect(isWithinFileSizeLimit(11 * 1024 * 1024)).toBe(false);
  });
});

describe('isValidSessionId', () => {
  it('accepts valid UUID', () => {
    expect(isValidSessionId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('rejects invalid string', () => {
    expect(isValidSessionId('not-a-uuid')).toBe(false);
  });
});

describe('getFileExtension', () => {
  it('returns extension from filename', () => {
    expect(getFileExtension('documento.pdf')).toBe('pdf');
  });

  it('returns filename for no extension', () => {
    expect(getFileExtension('file')).toBe('file');
  });
});
