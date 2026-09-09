"use client";

import { useCallback, useState } from "react";
import UploadRepository from "@/features/uploads/domain/repository/upload_repository";

export interface UseImageUploadOptions {
  maxSizeMB?: number;
  folder?: string;
  onSuccess?: (url: string) => void;
  onError?: (err: string) => void;
}

export function useImageUpload(options?: UseImageUploadOptions) {
  const maxSizeMB = options?.maxSizeMB ?? 5;
  const folder = options?.folder ?? "chlps_admin";

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

      // Strategy 1: Cloudinary direct unsigned upload if configured
      const cloudName =
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "chlps";
      const uploadPreset =
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
        process.env.NEXT_PUBLIC_CLOUDINARY ||
        process.env.NEXT_CLOUDINARY;

      if (cloudName && uploadPreset) {
        try {
          const body = new FormData();
          body.append("file", file);
          body.append("upload_preset", uploadPreset);
          if (folder) body.append("folder", folder);

          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: "POST", body },
          );

          if (res.ok) {
            const data = await res.json();
            if (data.secure_url) {
              setUploadedUrl(data.secure_url);
              options?.onSuccess?.(data.secure_url);
              setIsUploading(false);
              return data.secure_url;
            }
          }
        } catch {
          // Proceed to fallback
        }
      }

      // Strategy 2: Server-side Next.js route using Cloudinary Node SDK
      try {
        const apiBody = new FormData();
        apiBody.append("file", file);
        apiBody.append("folder", folder);

        const serverRes = await fetch("/api/upload/cloudinary", {
          method: "POST",
          body: apiBody,
        });

        if (serverRes.ok) {
          const data = await serverRes.json();
          if (data.success && data.url) {
            setUploadedUrl(data.url);
            options?.onSuccess?.(data.url);
            setIsUploading(false);
            return data.url;
          }
        }
      } catch {
        // Proceed to backend fallback
      }

      // Strategy 3: Backend upload repository fallback
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
    [folder, maxSizeMB, options],
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

export const useCloudinaryUpload = useImageUpload;
export default useImageUpload;
