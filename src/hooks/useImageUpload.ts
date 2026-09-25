"use client";

import { useCallback, useState } from "react";
import UploadRepository from "@/features/uploads/domain/repository/upload_repository";

export interface UseImageUploadOptions {
  maxSizeMB?: number;
  onSuccess?: (url: string) => void;
  onError?: (err: string) => void;
}

export function useImageUpload(options?: UseImageUploadOptions) {
  const maxSizeMB = options?.maxSizeMB ?? 5;
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      if (!file) return null;

      if (!file.type.startsWith("image/")) {
        const err = "Please select a valid image file (PNG, JPG, WEBP, etc.)";
        setError(err);
        options?.onError?.(err);
        return null;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        const err = `Image size must be less than ${maxSizeMB} MB`;
        setError(err);
        options?.onError?.(err);
        return null;
      }

      setIsUploading(true);
      setError(null);

      try {
        const uploads = new UploadRepository();
        const res = await uploads.upload("image", file);
        if (res.success && res.url) {
          setUploadedUrl(res.url);
          options?.onSuccess?.(res.url);
          setIsUploading(false);
          return res.url;
        }
        const errMsg = res.message || "Image upload failed";
        setError(errMsg);
        options?.onError?.(errMsg);
      } catch (e: unknown) {
        const errMsg =
          e instanceof Error ? e.message : "Image upload failed";
        setError(errMsg);
        options?.onError?.(errMsg);
      } finally {
        setIsUploading(false);
      }

      return null;
    },
    [maxSizeMB, options],
  );

  const reset = useCallback(() => {
    setIsUploading(false);
    setError(null);
    setUploadedUrl(null);
  }, []);

  return {
    uploadImage,
    isUploading,
    error,
    uploadedUrl,
    reset,
  };
}

export default useImageUpload;
