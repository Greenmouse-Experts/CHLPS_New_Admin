"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { cn } from "@/lib/tokens";

const InitializedMDXEditor = dynamic(() => import("./InitializedMDXEditor"), {
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
});

const INLINE_TAGS = "b|strong|i|em|u|s|strike|del|sup|sub|code|span|a";

/**
 * MDXEditor parses its input as MDX, where inline HTML whose opening tag is
 * followed by a line break (e.g. `<b>\ntext</b>`) is invalid and makes the
 * import throw — leaving the editor blank. Joining such tags with their content
 * keeps the HTML intact (so bold/underline/sup/sub still render) while making
 * the markdown valid.
 */
function toEditorMarkdown(input?: string | null): string {
  if (!input) return "";
  return input
    .replace(/\r\n/g, "\n")
    .replace(
      new RegExp(`(<(?:${INLINE_TAGS})\\b[^>]*>)[ \\t]*\\n[ \\t]*`, "gi"),
      "$1",
    )
    .replace(
      new RegExp(`[ \\t]*\\n[ \\t]*(</(?:${INLINE_TAGS})\\s*>)`, "gi"),
      "$1",
    )
    .trim();
}

/** Last-resort fallback: strip all tags so the value is guaranteed-valid MDX. */
function stripHtml(input: string): string {
  return input
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
}

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
  "use no memo";

  const editorRef = useRef<MDXEditorMethods | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  // Markdown currently reflected in the editor (pushed by us or emitted by it),
  // so editor edits are not echoed back and the caret is never clobbered.
  const lastSyncedRef = useRef<string | null>(null);
  const fallbackAppliedRef = useRef(false);

  const editorMarkdown = useMemo(() => toEditorMarkdown(value), [value]);

  const setInstance = useCallback((instance: MDXEditorMethods | null) => {
    editorRef.current = instance;
    setEditorReady(Boolean(instance));
  }, []);

  useEffect(() => {
    const instance = editorRef.current;
    if (!editorReady || !instance) return;
    if (lastSyncedRef.current === editorMarkdown) return;

    lastSyncedRef.current = editorMarkdown;
    try {
      if (instance.getMarkdown().trim() === editorMarkdown) return;
      instance.setMarkdown(editorMarkdown);
    } catch (e) {
      console.error("Failed to sync markdown:", e);
    }
  }, [editorReady, editorMarkdown]);

  const handleChange = useCallback(
    (newMarkdown: string) => {
      lastSyncedRef.current = newMarkdown;
      onChange(newMarkdown);
    },
    [onChange],
  );

  // If MDXEditor still cannot parse the value (e.g. an unclosed tag), retry
  // once with every tag stripped so the content is at least visible/editable.
  const handleError = useCallback(() => {
    const instance = editorRef.current;
    if (!instance || fallbackAppliedRef.current) return;
    fallbackAppliedRef.current = true;

    const plain = stripHtml(toEditorMarkdown(value));
    lastSyncedRef.current = plain;
    try {
      instance.setMarkdown(plain);
    } catch (e) {
      console.error("MDX markdown fallback failed:", e);
    }
  }, [value]);

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
          error &&
            "border-error focus-within:border-error focus-within:ring-error/10",
        )}
      >
        <div style={{ minHeight }} className="flex flex-col">
          <InitializedMDXEditor
            editorRef={setInstance}
            markdown={editorMarkdown}
            onChange={handleChange}
            onError={handleError}
            placeholder={placeholder}
            contentEditableClassName="prose prose-sm sm:prose-base max-w-none px-4 py-3.5 focus:outline-none text-base-content leading-relaxed min-h-[300px]"
            className="chlps-mdx-editor"
          />
        </div>
      </div>

      {error && <p className="text-xs text-error mt-0.5">{error}</p>}
    </div>
  );
}

export default MDXEditorField;
