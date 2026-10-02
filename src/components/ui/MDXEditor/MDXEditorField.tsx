"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { cn } from "@/lib/tokens";

const InitializedMDXEditor = dynamic(
  () => import("./InitializedMDXEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col animate-pulse bg-white rounded-xl border border-[#E7E9EB] min-h-[360px]">
        <div className="h-10 border-b border-[#E7E9EB] bg-base-200/50 flex items-center px-4 gap-2">
          <div className="h-4 w-16 bg-base-300 rounded" />
          <div className="h-4 w-8 bg-base-300 rounded" />
          <div className="h-4 w-8 bg-base-300 rounded" />
          <div className="h-4 w-20 bg-base-300 rounded" />
        </div>
        <div className="p-4 space-y-2">
          <div className="h-4 w-3/4 bg-base-200 rounded" />
          <div className="h-4 w-1/2 bg-base-200 rounded" />
          <div className="h-4 w-5/6 bg-base-200 rounded" />
        </div>
      </div>
    ),
  },
);

export interface MDXEditorFieldProps {
  label?: string;
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  error?: string;
  required?: boolean;
}

export function MDXEditorField({
  label,
  value,
  onChange,
  placeholder = "Write course content in markdown...",
  minHeight = "360px",
  className,
  error,
  required,
}: MDXEditorFieldProps) {
  const editorRef = useRef<MDXEditorMethods>(null);
  const lastValueRef = useRef<string>(value || "");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // When value changes from the outside (e.g. initial async load of course data),
  // sync it into the MDXEditor if different from internal state
  useEffect(() => {
    if (editorRef.current && value !== lastValueRef.current) {
      lastValueRef.current = value || "";
      editorRef.current.setMarkdown(value || "");
    }
  }, [value]);

  const handleChange = (newMarkdown: string) => {
    lastValueRef.current = newMarkdown;
    onChange(newMarkdown);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-semibold text-base-content flex items-center gap-1">
          {label}
          {required && <span className="text-error">*</span>}
        </label>
      )}

      <div
        className={cn(
          "w-full rounded-xl border border-[#E7E9EB] bg-white transition-all overflow-hidden",
          "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 shadow-xs",
          error && "border-error focus-within:border-error focus-within:ring-error/10",
        )}
      >
        {mounted ? (
          <div style={{ minHeight }} className="flex flex-col">
            <InitializedMDXEditor
              editorRef={editorRef}
              markdown={value || ""}
              onChange={handleChange}
              placeholder={placeholder}
              contentEditableClassName="prose prose-sm sm:prose-base max-w-none px-4 py-3.5 focus:outline-none text-base-content leading-relaxed min-h-[300px]"
              className="chlps-mdx-editor"
            />
          </div>
        ) : (
          <div
            className="flex items-center justify-center text-xs text-base-content/40 bg-base-100/50"
            style={{ minHeight }}
          >
            Loading editor...
          </div>
        )}
      </div>

      {error && <p className="text-xs text-error mt-0.5">{error}</p>}
    </div>
  );
}

export default MDXEditorField;
