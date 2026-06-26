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
    </div>
  );
}
