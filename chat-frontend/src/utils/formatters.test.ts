import { describe, it, expect } from 'vitest';
import { formatTime, formatDate, formatFileSize, formatFileType, formatRelativeTime } from './formatters';

describe('formatTime', () => {
  it('formats time correctly', () => {
    const result = formatTime('2026-06-25T14:30:00Z');
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it('handles different times', () => {
    const result = formatTime('2026-06-25T08:05:00Z');
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe('formatDate', () => {
  it('formats date in Brazilian format', () => {
    const result = formatDate('2026-06-25T14:30:00Z');
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });
});

describe('formatFileSize', () => {
  it('returns 0 B for zero bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('formats KB', () => {
    const result = formatFileSize(2048);
    expect(result).toContain('KB');
  });

  it('formats MB', () => {
    const result = formatFileSize(5_242_880);
    expect(result).toContain('MB');
  });
});

describe('formatFileType', () => {
  it('returns TXT for text/plain', () => {
    expect(formatFileType('text/plain')).toBe('TXT');
  });

  it('returns PDF for application/pdf', () => {
    expect(formatFileType('application/pdf')).toBe('PDF');
  });

  it('returns original type for unknown', () => {
    expect(formatFileType('image/png')).toBe('image/png');
  });
});

describe('formatRelativeTime', () => {
  it('returns Agora for recent timestamps', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe('Agora');
  });

  it('returns minutes for recent past', () => {
    const past = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(past)).toBe('5 min');
  });

  it('returns hours for older timestamps', () => {
    const past = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(past)).toBe('3h');
  });
});
