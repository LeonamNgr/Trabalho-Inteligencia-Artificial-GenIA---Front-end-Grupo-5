import { useState, useCallback, useRef } from 'react';
import type { UploadResponse } from '../types/upload';
import { uploadFile as uploadFileService } from '../services/uploadService';
import { useSession } from '../contexts/SessionContext';
import { isAllowedFileType, isWithinFileSizeLimit, isAllowedExtension } from '../utils/validators';

interface UseUploadReturn {
  progress: number;
  isUploading: boolean;
  uploadedFile: UploadResponse | null;
  error: string | null;
<<<<<<< HEAD
  uploadFile: (file: File) => Promise<void>;
  retry: () => Promise<void>;
=======
  uploadFileAction: (file: File) => Promise<void>;
>>>>>>> 0b8352bef8b09b622c1ae18c5073914fcbfb9833
  reset: () => void;
}

export function useUpload(): UseUploadReturn {
  const { sessionId } = useSession();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
<<<<<<< HEAD
  const lastFileRef = useRef<File | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!sessionId) return;

      if (!isAllowedFileType(file.type) || !isAllowedExtension(file.name)) {
=======

  const uploadFileAction = useCallback(
    async (file: File) => {
      if (!sessionId) return;

      if (!isAllowedFileType(file.type) && !isAllowedExtension(file.name)) {
>>>>>>> 0b8352bef8b09b622c1ae18c5073914fcbfb9833
        setError('Apenas arquivos .txt e .pdf são aceitos.');
        return;
      }

      if (!isWithinFileSizeLimit(file.size)) {
        setError('O arquivo excede o limite de 10 MB.');
        return;
      }

      setError(null);
      setUploadedFile(null);
      setIsUploading(true);
      setProgress(0);
<<<<<<< HEAD
      lastFileRef.current = file;

      try {
        const response = await uploadFileService(file, sessionId, setProgress);
=======

      try {
        const response = await uploadFile(file, sessionId, setProgress);
>>>>>>> 0b8352bef8b09b622c1ae18c5073914fcbfb9833
        setUploadedFile(response);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro no upload';
        setError(message);
      } finally {
        setIsUploading(false);
      }
    },
    [sessionId],
  );

<<<<<<< HEAD
  const retry = useCallback(async () => {
    if (lastFileRef.current) {
      await uploadFile(lastFileRef.current);
    }
  }, [uploadFile]);

=======
>>>>>>> 0b8352bef8b09b622c1ae18c5073914fcbfb9833
  const reset = useCallback(() => {
    setProgress(0);
    setIsUploading(false);
    setUploadedFile(null);
    setError(null);
<<<<<<< HEAD
    lastFileRef.current = null;
  }, []);

  return { progress, isUploading, uploadedFile, error, uploadFile, retry, reset };
=======
  }, []);

  return { progress, isUploading, uploadedFile, error, uploadFileAction, reset };
>>>>>>> 0b8352bef8b09b622c1ae18c5073914fcbfb9833
}
