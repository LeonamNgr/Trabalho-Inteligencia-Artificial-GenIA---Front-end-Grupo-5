export interface UploadResponse {
  attachmentId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  message: string;
}

export interface AttachmentResponse {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}
