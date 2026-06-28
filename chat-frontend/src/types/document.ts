export type DocumentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Document {
  id: number;
  fileName: string;
  sourceType: string;
  fileSize: number | null;
  status: DocumentStatus;
  totalChunks: number;
  createdAt: string;
}

export interface DocumentListResponse {
  documents: Document[];
}

export interface DocumentIngestResponse {
  documentId: number;
  fileName: string;
  status: DocumentStatus;
  chunks: number;
  processingTime: number;
  message: string;
}

export interface DocumentChunk {
  chunkId: number;
  documentId: number;
  fileName: string;
  chunkIndex: number;
  content: string;
  similarityScore: number | null;
}

export interface DocumentSearchRequest {
  query: string;
  topK: number;
}

export interface DocumentSearchResponse {
  results: DocumentChunk[];
}

export interface DocumentIngestUrlRequest {
  url: string;
}
