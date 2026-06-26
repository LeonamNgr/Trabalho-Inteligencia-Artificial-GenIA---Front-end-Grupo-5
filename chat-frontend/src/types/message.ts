import type { UploadResponse } from './upload';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  attachment?: UploadResponse;
}
