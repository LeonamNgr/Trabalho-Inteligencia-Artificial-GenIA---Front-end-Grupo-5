import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useUpload } from './useUpload';
import { SessionContext } from '../contexts/SessionContext';

const mockUploadFile = vi.fn();

vi.mock('../services/uploadService', () => ({
  uploadFile: (...args: unknown[]) => mockUploadFile(...args),
}));

vi.mock('../utils/withRetry', () => ({
  withRetry: <T,>(fn: () => Promise<T>) => fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

function createWrapper() {
  const sessionValue = { sessionId: 'test-session', isLoading: false, error: null, initialize: vi.fn(), destroy: vi.fn() };

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <SessionContext.Provider value={sessionValue}>
        {children}
      </SessionContext.Provider>
    );
  };
}

function createFile(overrides: Partial<File> = {}): File {
  return { name: 'test.txt', type: 'text/plain', size: 1024, ...overrides } as File;
}

describe('useUpload', () => {
  it('starts with default state', () => {
    const { result } = renderHook(() => useUpload(), { wrapper: createWrapper() });

    expect(result.current.isUploading).toBe(false);
    expect(result.current.uploadedFile).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBe(0);
  });

  it('uploads file successfully', async () => {
    mockUploadFile.mockResolvedValue({ attachmentId: 1, fileName: 'test.txt', fileType: 'text/plain', fileSize: 1024, uploadedAt: new Date().toISOString(), message: 'Upload realizado com sucesso.' });

    const { result } = renderHook(() => useUpload(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.uploadFile(createFile());
    });

    expect(mockUploadFile).toHaveBeenCalled();
    expect(result.current.uploadedFile?.attachmentId).toBe(1);
    expect(result.current.uploadedFile?.fileName).toBe('test.txt');
  });

  it('rejects invalid file type', async () => {
    const { result } = renderHook(() => useUpload(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.uploadFile(createFile({ type: 'application/zip', name: 'test.zip' }));
    });

    expect(result.current.error).not.toBeNull();
  });

  it('rejects oversized file', async () => {
    const { result } = renderHook(() => useUpload(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.uploadFile(createFile({ size: 51 * 1024 * 1024 }));
    });

    expect(result.current.error).not.toBeNull();
  });

  it('sets error on upload failure', async () => {
    mockUploadFile.mockRejectedValue(new Error('Upload falhou'));

    const { result } = renderHook(() => useUpload(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.uploadFile(createFile());
    });

    expect(result.current.error).toBe('Upload falhou');
  });

  it('resets state on reset call', async () => {
    mockUploadFile.mockResolvedValue({ attachmentId: 1, fileName: 'test.txt', fileType: 'text/plain', fileSize: 1024, uploadedAt: new Date().toISOString(), message: 'Upload realizado com sucesso.' });

    const { result } = renderHook(() => useUpload(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.uploadFile(createFile());
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.isUploading).toBe(false);
    expect(result.current.uploadedFile).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBe(0);
  });
});
