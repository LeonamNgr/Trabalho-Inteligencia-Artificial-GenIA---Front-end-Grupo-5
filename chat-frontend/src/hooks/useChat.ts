// Hook de gerenciamento do chat e envio de mensagens
import { useState } from 'react';
import type { Message } from '../types/message';
import type { UploadResponse } from '../types/upload';

export function useChat() {
  const [messages] = useState<Message[]>([]);
  const [isStreaming] = useState(false);
  const [error] = useState<string | null>(null);
  const [activeAttachment] = useState<UploadResponse | null>(null);

  const sendMessage = (_content: string) => {};
  const cancelStream = () => {};
  const clearAttachment = () => {};

  return { messages, isStreaming, error, activeAttachment, sendMessage, cancelStream, clearAttachment };
}
