import { useRef } from 'react';
import styles from './DragDropZone.module.css';

interface FileSelectorProps {
  onFileSelected: (file: File) => void;
}

export function FileSelector({ onFileSelected }: FileSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
      e.target.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.pdf"
        onChange={handleChange}
        style={{ display: 'none' }}
        aria-label="Selecionar arquivo"
        id="file-input"
      />
      <label htmlFor="file-input" className={styles.zone} role="button" tabIndex={0}>
        Clique para selecionar arquivo
      </label>
    </>
  );
}
