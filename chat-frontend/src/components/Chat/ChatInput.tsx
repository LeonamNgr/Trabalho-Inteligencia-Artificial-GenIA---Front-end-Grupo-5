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
    </div>
  );
}
