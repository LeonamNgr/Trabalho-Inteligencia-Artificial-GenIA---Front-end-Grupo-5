<<<<<<< HEAD
import { useState } from 'react';
import { TextArea } from './TextArea';
import { SendButton } from './SendButton';
import { AttachmentBadge } from './AttachmentBadge';
import { UploadArea } from '../Upload/UploadArea';
import { useUpload } from '../../hooks/useUpload';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const { uploadedFile, isUploading, uploadFile } = useUpload();

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.container}>
      {uploadedFile && <AttachmentBadge fileName={uploadedFile.fileName} />}
      <UploadArea onUpload={uploadFile} isUploading={isUploading} />
      <TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Digite sua mensagem..."
        disabled={disabled || isUploading}
      />
      <SendButton onClick={handleSend} disabled={disabled || !text.trim() || isUploading} />
=======
import { useCallback } from 'react';
import type { UploadResponse } from '../../types/upload';
import { TextArea } from './TextArea';
import { SendButton } from './SendButton';
import { AttachmentBadge } from './AttachmentBadge';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onCancel: () => void;
  isStreaming: boolean;
  attachment: UploadResponse | null;
  onClearAttachment: () => void;
}

export function ChatInput({ draft, onDraftChange, onSend, onCancel, isStreaming, attachment, onClearAttachment }: ChatInputProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    },
    [onSend],
  );

  return (
    <div className={styles.chatInput}>
      {attachment && (
        <AttachmentBadge fileName={attachment.fileName} onRemove={onClearAttachment} />
      )}
      <div className={styles.row}>
        <TextArea
          value={draft}
          onChange={onDraftChange}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder="Digite sua mensagem..."
        />
        {isStreaming ? (
          <button className={styles.cancel} onClick={onCancel} type="button" aria-label="Parar geração">
            &#9632;
          </button>
        ) : (
          <SendButton disabled={draft.trim().length === 0} onClick={onSend} />
        )}
      </div>
>>>>>>> 4df804c529dd6aa90a9fe0970b1be1d05e0f43b1
    </div>
  );
}
