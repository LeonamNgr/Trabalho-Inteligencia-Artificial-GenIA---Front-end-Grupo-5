<<<<<<< HEAD
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
=======
import { forwardRef } from 'react';
import styles from './FileSelector.module.css';

interface FileSelectorProps {
  onSelect: (file: File) => void;
}

export const FileSelector = forwardRef<HTMLInputElement, FileSelectorProps>(
  ({ onSelect }, ref) => (
    <input
      ref={ref}
      type="file"
      accept=".txt,.pdf"
      className={styles.hidden}
      tabIndex={-1}
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) onSelect(file);
        e.target.value = '';
      }}
    />
  )
);
>>>>>>> 4df804c529dd6aa90a9fe0970b1be1d05e0f43b1
