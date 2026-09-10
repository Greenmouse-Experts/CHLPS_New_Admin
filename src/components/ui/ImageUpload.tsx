"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/tokens";
import { useImageUpload } from "@/hooks/useImageUpload";
import { GalleryAdd } from "iconsax-react";
import { Trash2 } from "lucide-react";

export interface ImageUploadProps {
  label?: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  maxSizeMB?: number;
  folder?: string;
  className?: string;
}

export function ImageUpload({
  label,
  value,
  onChange,
  error,
  helperText,
  required,
  disabled,
  maxSizeMB = 5,
  folder = "chlps_admin",
  className,
}: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { uploadImage, isUploading, error: uploadError } = useImageUpload({
    maxSizeMB,
    folder,
    onSuccess: (url) => onChange(url),
  });

  const displayError = error || uploadError;

  const handleFileSelect = async (file: File) => {
    if (disabled || isUploading) return;
    const uploaded = await uploadImage(file);
    if (uploaded) {
      onChange(uploaded);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className={cn("flex flex-col w-full space-y-1.5", className)}>
      {label && (
        <label className="block text-xs font-semibold text-base-content">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled && !isUploading) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden outline-none bg-base-100",
          dragOver && "border-primary bg-primary/5",
          displayError
            ? "border-error/80 bg-error/5"
            : "border-base-300 hover:border-primary/50",
          (disabled || isUploading) && "pointer-events-none opacity-70",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled || isUploading}
        />

        {value ? (
          /* Preview state */
          <div className="flex items-center gap-3.5 p-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-base-300 bg-base-200 shrink-0">
              <img
                src={value}
                alt="Uploaded preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-base-content">
                Image uploaded
              </p>
              <p className="mt-0.5 text-2xs text-secondary truncate font-mono">
                {value}
              </p>
              <button
                type="button"
                className="mt-1 text-2xs font-semibold text-primary hover:underline inline-block"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                Change image
              </button>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg text-secondary hover:text-error hover:bg-error/10 transition-colors"
              title="Remove image"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          /* Empty / Uploading state */
          <div className="flex flex-col items-center justify-center gap-2 py-6 px-4 text-center">
            {isUploading ? (
              <>
                <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <p className="text-xs font-medium text-base-content">
                  Uploading image to Cloudinary...
                </p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <GalleryAdd size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-base-content">
                    Click to upload or drag and drop
                  </p>
                  <p className="mt-0.5 text-2xs text-secondary">
                    PNG, JPG, WEBP · up to {maxSizeMB} MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {displayError ? (
        <p className="text-2xs text-error font-medium">{displayError}</p>
      ) : helperText ? (
        <p className="text-2xs text-secondary">{helperText}</p>
      ) : null}
    </div>
  );
}

export default ImageUpload;
