export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const UPLOAD_MAX_SIZE = 10 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = [
  'text/plain',
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const ALLOWED_EXTENSIONS = ['.txt', '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.doc', '.docx'] as const;

export const DOCUMENT_UPLOAD_MAX_SIZE = 50 * 1024 * 1024;

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'text/plain',
  'application/pdf',
  'text/markdown',
  'text/html',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/bmp',
  'image/tiff',
  'image/gif',
] as const;

export const ALLOWED_DOCUMENT_EXTENSIONS = ['.txt', '.pdf', '.md', '.html', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.gif'] as const;

export const MAX_MESSAGE_LENGTH = 5000;

export const TIMEOUTS = {
  MESSAGE: 60_000,
  UPLOAD: 120_000,
  HISTORY: 15_000,
  HEALTH: 5_000,
  SESSION: 10_000,
} as const;

export const HEALTH_CHECK_INTERVAL = 30_000;

export const RETRY = {
  MAX_ATTEMPTS: 3,
  BASE_DELAY: 1000,
} as const;

export const STORAGE_KEYS = {
  SESSION_ID: 'sessionId',
} as const;
