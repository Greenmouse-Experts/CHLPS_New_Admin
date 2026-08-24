"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/tokens";

const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

interface CloudinaryUploadProps {
  /** Currently stored image URL (shown as preview). */
  value?: string;
  /** Called with the secure Cloudinary URL after a successful upload, or "" when cleared. */
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
}

export function CloudinaryUpload({
  value,
  onChange,
  label,
  required,
  error,
  touched,
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fieldError =
    uploadError || (error && (touched === undefined ? true : touched) ? error : null);

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be less than 5 MB");
      return;
    }
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setUploadError(
        "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
      );
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      const body = new FormData();
      body.append("file", file);
      body.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body },
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Upload failed");
      }
      onChange(json.secure_url as string);
    } catch (e: unknown) {
      setUploadError(
        e instanceof Error ? e.message : "Failed to upload image",
      );
    } finally {
      setUploading(false);
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = ""; // allow re-selecting same file
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function clearImage(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
    setUploadError(null);
  }

  const hasError = !!fieldError;

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="block text-sm font-medium text-black mb-1.5">
          {label}
          {required && <span className="text-[#E84D52] ml-0.5">*</span>}
        </label>
      )}

      <div
        role="button"
        tabIndex={0}
        aria-label="Upload image"
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "rounded-lg border-2 border-dashed transition-colors cursor-pointer outline-none",
          dragOver && !hasError && "border-black bg-[#F7F7F7]",
          hasError
            ? "border-[#E84D52]"
            : "border-[#E7E9EB] hover:border-[#C0C0C0]",
          uploading && "pointer-events-none opacity-70",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInput}
          disabled={uploading}
        />

        {value ? (
          /* ── Preview state ── */
          <div className="flex items-center gap-3 p-3">
            <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-[#E7E9EB] bg-[#F7F7F7]">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-black">Image uploaded</p>
              <p className="mt-0.5 text-[10px] text-[#717171] break-all line-clamp-2">
                {value}
              </p>
            </div>
            <button
              type="button"
              onClick={clearImage}
              className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-[#717171] hover:text-[#E84D52] hover:bg-[#FDF0F0] transition-colors"
              aria-label="Remove image"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M1 1l10 10M11 1L1 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        ) : (
          /* ── Empty / uploading state ── */
          <div className="flex flex-col items-center justify-center gap-2 py-7 px-4 text-center">
            {uploading ? (
              <>
                <div className="w-8 h-8 rounded-full border-2 border-[#E7E9EB] border-t-black animate-spin" />
                <p className="text-xs text-[#717171]">Uploading…</p>
              </>
            ) : (
              <>
                <div className="w-9 h-9 rounded-full bg-[#F7F7F7] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 11V2M4 5.5L8 2l4 3.5"
                      stroke="#717171"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 13h12"
                      stroke="#717171"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-black">
                    Click or drag &amp; drop to upload
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#717171]">
                    PNG, JPG, WEBP · max 5 MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {hasError && (
        <p className="mt-1 text-xs text-[#E84D52] flex items-center gap-1">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className="shrink-0"
          >
            <circle cx="6" cy="6" r="5.5" stroke="#E84D52" />
            <path
              d="M6 3.5v3M6 8h.01"
              stroke="#E84D52"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          {fieldError}
        </p>
      )}
    </div>
  );
}
