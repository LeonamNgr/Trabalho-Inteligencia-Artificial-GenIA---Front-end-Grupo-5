import { useRef } from 'react';
import { DragDropZone } from './DragDropZone';
import { UploadProgress } from './UploadProgress';
import styles from './UploadArea.module.css';

interface UploadAreaProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
  progress: number;
}

export function UploadArea({ onUpload, isUploading, progress }: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!isUploading) {
      onUpload(file);
    }
  };

  return (
    <div className={styles.container}>
      <DragDropZone onFileDrop={handleFile} />
      {isUploading && <UploadProgress progress={progress} />}
      <button
        type="button"
        className={styles.attachButton}
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        aria-label="Anexar arquivo"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
        </svg>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          if (inputRef.current) inputRef.current.value = '';
        }}
        disabled={isUploading}
        hidden
      />
    </div>
  );
}
