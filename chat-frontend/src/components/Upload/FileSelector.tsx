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
