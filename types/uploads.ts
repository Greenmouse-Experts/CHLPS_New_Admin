/**
 * CHLPS Admin Portal - File & Media Upload Types
 * Endpoints: /api/v1/upload/*
 */

export type UploadCategory = "image" | "video" | "doc" | "audio";

export interface UploadedFile {
  url: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  publicId?: string;
}

export interface UploadResponseData {
  url: string;
  file?: UploadedFile;
}
