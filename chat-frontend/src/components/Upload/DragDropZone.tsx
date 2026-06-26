import { useState, useCallback, type DragEvent } from 'react';
import styles from './DragDropZone.module.css';

interface DragDropZoneProps {
  onFileDrop: (file: File) => void;
}

export function DragDropZone({ onFileDrop }: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setIsInvalid(false);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setIsInvalid(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setIsInvalid(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        if (ext === '.txt' || ext === '.pdf') {
          onFileDrop(file);
        } else {
          setIsInvalid(true);
        }
      }
    },
    [onFileDrop],
  );

  const classNames = [
    styles.zone,
    isDragging ? styles.dragging : '',
    isInvalid ? styles.invalid : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isInvalid ? 'Formato de arquivo inválido. Aceitamos apenas .txt e .pdf.' : 'Arraste arquivos aqui'}
    </div>
  );
}
