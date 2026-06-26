<<<<<<< HEAD
import { useRef } from 'react';
import styles from './UploadArea.module.css';

interface UploadAreaProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export function UploadArea({ onUpload, isUploading }: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={styles.container}>
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
        onChange={handleChange}
        disabled={isUploading}
        hidden
      />
=======
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
>>>>>>> 4df804c529dd6aa90a9fe0970b1be1d05e0f43b1
    </div>
  );
}
