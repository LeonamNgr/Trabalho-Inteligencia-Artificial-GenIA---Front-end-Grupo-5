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
  uploadFile: (file: File) => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
}

export function useUpload(): UseUploadReturn {
  const { sessionId } = useSession();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastFileRef = useRef<File | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!sessionId) return;

      if (!isAllowedFileType(file.type) && !isAllowedExtension(file.name)) {
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
      lastFileRef.current = file;

      try {
        const response = await uploadFileService(file, sessionId, setProgress);
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

  const retry = useCallback(async () => {
    if (lastFileRef.current) {
      await uploadFile(lastFileRef.current);
    }
  }, [uploadFile]);

  const reset = useCallback(() => {
    setProgress(0);
    setIsUploading(false);
    setUploadedFile(null);
    setError(null);
    lastFileRef.current = null;
  }, []);

  return { progress, isUploading, uploadedFile, error, uploadFile, retry, reset };
}
