import { useState, useCallback, useRef } from 'react';
import type { Document, DocumentIngestResponse, DocumentChunk } from '../types/document';
import * as documentService from '../services/documentService';
import { DOCUMENT_UPLOAD_MAX_SIZE } from '../utils/constants';

interface UseDocumentsReturn {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  ingestFile: (file: File, sourceType?: string) => Promise<DocumentIngestResponse | null>;
  ingestUrl: (url: string) => Promise<DocumentIngestResponse | null>;
  fetchDocuments: () => Promise<void>;
  removeDocument: (id: number) => Promise<void>;
  searchResults: DocumentChunk[];
  searchDocuments: (query: string, topK?: number) => Promise<void>;
  isSearching: boolean;
  isIngesting: boolean;
}

const ALLOWED_EXTENSIONS = ['.txt', '.pdf', '.md', '.html'] as const;

function isAllowedDocumentExtension(fileName: string): boolean {
  const ext = '.' + fileName.split('.').pop()?.toLowerCase();
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}

async function pollStatus(
  id: number,
  intervalMs = 2000,
  maxAttempts = 30,
): Promise<Document> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const doc = await documentService.getDocument(id);
    if (doc.status === 'COMPLETED' || doc.status === 'FAILED') {
      return doc;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error('Tempo limite excedido ao aguardar processamento do documento.');
}

export function useDocuments(): UseDocumentsReturn {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<DocumentChunk[]>([]);
  const pollingRef = useRef<Set<number>>(new Set());

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await documentService.listDocuments();
      setDocuments(response.documents);

      for (const doc of response.documents) {
        if (doc.status === 'PROCESSING' && !pollingRef.current.has(doc.id)) {
          pollingRef.current.add(doc.id);
          pollStatus(doc.id)
            .then((updated) => {
              pollingRef.current.delete(updated.id);
              setDocuments((prev) =>
                prev.map((d) => (d.id === updated.id ? updated : d)),
              );
            })
            .catch(() => {
              pollingRef.current.delete(doc.id);
            });
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao carregar documentos';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const ingestFile = useCallback(
    async (
      file: File,
      sourceType?: string,
    ): Promise<DocumentIngestResponse | null> => {
      if (!isAllowedDocumentExtension(file.name)) {
        setError('Apenas arquivos .txt, .pdf, .md e .html são aceitos.');
        return null;
      }

      if (file.size > DOCUMENT_UPLOAD_MAX_SIZE) {
        setError('O arquivo excede o limite de 50 MB.');
        return null;
      }

      setIsIngesting(true);
      setError(null);
      try {
        const response = await documentService.ingestDocument(file, sourceType);

        const optimistic: Document = {
          id: response.documentId,
          fileName: response.fileName,
          sourceType: sourceType ?? 'pdf',
          fileSize: file.size,
          status: response.status,
          totalChunks: response.chunks,
          createdAt: new Date().toISOString(),
        };
        setDocuments((prev) => [optimistic, ...prev]);

        pollingRef.current.add(response.documentId);
        pollStatus(response.documentId)
          .then((updated) => {
            pollingRef.current.delete(updated.id);
            setDocuments((prev) =>
              prev.map((d) => (d.id === updated.id ? updated : d)),
            );
          })
          .catch(() => {
            pollingRef.current.delete(response.documentId);
          });

        return response;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erro ao ingerir documento';
        setError(message);
        return null;
      } finally {
        setIsIngesting(false);
      }
    },
    [],
  );

  const ingestUrl = useCallback(
    async (url: string): Promise<DocumentIngestResponse | null> => {
      setIsIngesting(true);
      setError(null);
      try {
        const response = await documentService.ingestUrl(url);

        const optimistic: Document = {
          id: response.documentId,
          fileName: response.fileName,
          sourceType: 'html',
          fileSize: null,
          status: response.status,
          totalChunks: response.chunks,
          createdAt: new Date().toISOString(),
        };
        setDocuments((prev) => [optimistic, ...prev]);

        pollingRef.current.add(response.documentId);
        pollStatus(response.documentId)
          .then((updated) => {
            pollingRef.current.delete(updated.id);
            setDocuments((prev) =>
              prev.map((d) => (d.id === updated.id ? updated : d)),
            );
          })
          .catch(() => {
            pollingRef.current.delete(response.documentId);
          });

        return response;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erro ao ingerir URL';
        setError(message);
        return null;
      } finally {
        setIsIngesting(false);
      }
    },
    [],
  );

  const removeDocument = useCallback(async (id: number) => {
    setError(null);
    try {
      await documentService.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao remover documento';
      setError(message);
    }
  }, []);

  const searchDocumentsAction = useCallback(
    async (query: string, topK = 5) => {
      setIsSearching(true);
      setError(null);
      try {
        const response = await documentService.searchDocuments(query, topK);
        setSearchResults(response.results);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erro ao buscar documentos';
        setError(message);
      } finally {
        setIsSearching(false);
      }
    },
    [],
  );

  return {
    documents,
    isLoading,
    error,
    ingestFile,
    ingestUrl,
    fetchDocuments,
    removeDocument,
    searchResults,
    searchDocuments: searchDocumentsAction,
    isSearching,
    isIngesting,
  };
}
