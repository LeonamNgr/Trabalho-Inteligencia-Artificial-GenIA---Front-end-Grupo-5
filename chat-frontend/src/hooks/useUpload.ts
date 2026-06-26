import { useState, useCallback } from 'react';
import type { UploadResponse } from '../types/upload';
import { uploadFile } from '../services/uploadService';
import { useSession } from '../contexts/SessionContext';
import { isAllowedFileType, isWithinFileSizeLimit, isAllowedExtension } from '../utils/validators';

interface UseUploadReturn {
  progress: number;
  isUploading: boolean;
  uploadedFile: UploadResponse | null;
  error: string | null;
  uploadFileAction: (file: File) => Promise<void>;
  reset: () => void;
}

export function useUpload(): UseUploadReturn {
  const { sessionId } = useSession();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFileAction = useCallback(
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

      try {
        const response = await uploadFile(file, sessionId, setProgress);
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

  const reset = useCallback(() => {
    setProgress(0);
    setIsUploading(false);
    setUploadedFile(null);
    setError(null);
  }, []);

  return { progress, isUploading, uploadedFile, error, uploadFileAction, reset };
}
