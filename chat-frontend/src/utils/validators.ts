import { ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS, UPLOAD_MAX_SIZE, MAX_MESSAGE_LENGTH } from './constants';

export function isValidMessage(content: string): true | string {
  if (!content.trim()) {
    return 'A mensagem não pode estar vazia.';
  }
  if (content.length > MAX_MESSAGE_LENGTH) {
    return `A mensagem excede o limite de ${MAX_MESSAGE_LENGTH} caracteres.`;
  }
  return true;
}

export function isAllowedFileType(mimeType: string): boolean {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function isAllowedExtension(fileName: string): boolean {
  const ext = '.' + fileName.split('.').pop()?.toLowerCase();
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}

export function isWithinFileSizeLimit(size: number): boolean {
  return size <= UPLOAD_MAX_SIZE;
}

export function isValidSessionId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}
