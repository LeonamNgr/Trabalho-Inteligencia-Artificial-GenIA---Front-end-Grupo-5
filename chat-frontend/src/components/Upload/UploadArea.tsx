import { useState, useRef, useCallback, type DragEvent } from 'react';
import { useUpload } from '../../hooks/useUpload';
import { DragDropZone } from './DragDropZone';
import { FileSelector } from './FileSelector';
import { UploadProgress } from './UploadProgress';
import styles from './UploadArea.module.css';

export function UploadArea() {
  const { progress, isUploading, uploadedFile, error, uploadFile, reset } = useUpload();
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setCurrentFileName(file.name);
      uploadFile(file);
    }
  }, [uploadFile]);

  const handleFileSelect = useCallback((file: File) => {
    setCurrentFileName(file.name);
    uploadFile(file);
  }, [uploadFile]);

  const handleReset = useCallback(() => {
    setCurrentFileName('');
    reset();
  }, [reset]);

  const showProgress = isUploading || uploadedFile || error;
  const fileName = uploadedFile?.fileName ?? currentFileName;

  return (
    <div
      className={styles.uploadArea}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {showProgress ? (
        <UploadProgress
          progress={progress}
          fileName={fileName}
          error={error}
          isComplete={!!uploadedFile}
          onReset={handleReset}
        />
      ) : (
        <DragDropZone
          isDragOver={isDragOver}
          onClick={() => fileInputRef.current?.click()}
        />
      )}
      <FileSelector ref={fileInputRef} onSelect={handleFileSelect} />
    </div>
  );
}
