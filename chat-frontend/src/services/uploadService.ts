import type { UploadResponse } from '../types/upload';
import { API_BASE_URL, TIMEOUTS } from '../utils/constants';
import { HttpError } from './api';

export async function uploadFile(
  file: File,
  sessionId: string,
  onProgress?: (percent: number) => void,
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sessionId', sessionId);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        try {
          const body = JSON.parse(xhr.responseText);
          reject(new HttpError(xhr.status, body));
        } catch {
          reject(new HttpError(xhr.status, {
            status: xhr.status,
            error: xhr.statusText,
            message: 'Erro no upload',
            timestamp: new Date().toISOString(),
            path: '/api/upload',
          }));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Erro de rede'));
    xhr.ontimeout = () => reject(new Error('Tempo limite excedido'));
    xhr.timeout = TIMEOUTS.UPLOAD;
    xhr.open('POST', `${API_BASE_URL}/api/upload`);
    xhr.send(formData);
  });
}
