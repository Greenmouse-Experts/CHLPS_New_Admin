"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/tokens";

export interface MarkdownRendererProps {
  content?: string | null;
  children?: string | null;
  className?: string;
  fallback?: React.ReactNode;
}

export function MarkdownRenderer({
  content,
  children,
  className,
  fallback = null,
}: MarkdownRendererProps) {
  const text = content ?? children ?? "";

  if (!text || !text.trim()) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none text-base-content/90 font-normal leading-relaxed",
        "prose-headings:font-bold prose-headings:text-base-content prose-headings:tracking-tight",
        "prose-p:leading-relaxed prose-p:my-2",
        "prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline",
        "prose-strong:font-semibold prose-strong:text-base-content",
        "prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5",
        "prose-code:bg-base-200 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono",
        "prose-pre:bg-base-300 prose-pre:text-base-content prose-pre:rounded-xl",
        "prose-blockquote:border-l-primary prose-blockquote:text-base-content/70 prose-blockquote:italic",
        "prose-table:border-collapse prose-th:border prose-th:border-base-300 prose-th:p-2 prose-th:bg-base-200/50 prose-td:border prose-td:border-base-300 prose-td:p-2",
        "prose-img:rounded-xl prose-img:border prose-img:border-base-300/60",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a: ({ node: _node, href, children: linkChildren, ...props }) => {
            const isExternal =
              href?.startsWith("http://") || href?.startsWith("https://");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                {...props}
              >
                {linkChildren}
              </a>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;
