"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  FileCode,
  Minus,
  Link2,
  Unlink,
  Undo2,
  Redo2,
  RemoveFormatting,
} from "lucide-react";
import { cn } from "@/lib/tokens";

export interface WysiwygEditorProps {
  label?: string;
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
  className?: string;
}

export function WysiwygEditor({
  label,
  value,
  onChange,
  placeholder = "Write comprehensive course details, formatting with headings, bullets, code, links...",
  minHeight = "360px",
  disabled = false,
  className,
}: WysiwygEditorProps) {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-5 my-2 space-y-1",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-5 my-2 space-y-1",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-primary/60 pl-4 py-1 italic my-2 text-base-content/80",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: "bg-base-200 text-base-content font-mono text-xs p-3 rounded-lg my-2 overflow-x-auto",
          },
        },
        horizontalRule: {
          HTMLAttributes: {
            class: "border-base-300 my-4",
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline font-medium hover:opacity-80 transition-opacity",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-base-content/40 before:float-left before:pointer-events-none before:h-0",
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none px-4 py-3.5 text-base-content leading-relaxed outline-none",
          "prose-headings:font-bold prose-headings:text-base-content prose-headings:tracking-tight",
          "prose-h1:text-xl prose-h1:my-3",
          "prose-h2:text-lg prose-h2:my-2.5",
          "prose-h3:text-base prose-h3:my-2",
          "prose-p:my-2 prose-p:leading-relaxed",
          "prose-code:bg-base-200 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono",
          "prose-strong:font-bold prose-strong:text-base-content",
        ),
        style: `min-height: ${minHeight};`,
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (ed.isEmpty) {
        onChange("");
      } else {
        onChange(ed.getHTML());
      }
    },
  });

  // Synchronize external value changes (e.g. on initial data load or reset)
  useEffect(() => {
    if (!editor) return;

    const currentHtml = editor.getHTML();
    const isCurrentEmpty = editor.isEmpty;
    const isNewEmpty = !value || value.trim() === "" || value === "<p></p>";

    if (isCurrentEmpty && isNewEmpty) return;

    if (value !== currentHtml) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  // Update editable state if disabled prop changes
  useEffect(() => {
    if (editor && editor.isEditable === disabled) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  const handleOpenLinkModal = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setLinkModalOpen(true);
  };

  const handleApplyLink = () => {
    if (!editor) return;
    const trimmed = linkUrl.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const url =
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("mailto:") ||
        trimmed.startsWith("tel:")
          ? trimmed
          : `https://${trimmed}`;
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
    setLinkModalOpen(false);
    setLinkUrl("");
  };

  if (!editor) {
    return (
      <div
        className={cn(
          "w-full rounded-xl border border-base-300 bg-base-100/50 p-4 animate-pulse flex items-center justify-center text-xs text-base-content/50",
          className,
        )}
        style={{ minHeight }}
      >
        Loading editor...
      </div>
    );
  }

  const isLinkActive = editor.isActive("link");

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="text-xs font-semibold text-base-content block">
          {label}
        </label>
      )}

      <div className="rounded-xl border border-base-300 bg-base-100 overflow-hidden shadow-xs focus-within:border-primary transition-colors">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-base-200/60 border-b border-base-300/80">
          {/* Headings */}
          <button
            type="button"
            title="Heading 1"
            disabled={disabled}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={cn(
              "p-1.5 rounded-lg text-base-content/80 hover:bg-base-300/70 transition-colors cursor-pointer",
              editor.isActive("heading", { level: 1 }) &&
                "bg-primary text-primary-content font-bold hover:bg-primary",
            )}
          >
            <Heading1 size={15} />
          </button>
          <button
            type="button"
            title="Heading 2"
            disabled={disabled}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={cn(
              "p-1.5 rounded-lg text-base-content/80 hover:bg-base-300/70 transition-colors cursor-pointer",
              editor.isActive("heading", { level: 2 }) &&
                "bg-primary text-primary-content font-bold hover:bg-primary",
            )}
          >
            <Heading2 size={15} />
          </button>
          <button
            type="button"
            title="Heading 3"
            disabled={disabled}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={cn(
              "p-1.5 rounded-lg text-base-content/80 hover:bg-base-300/70 transition-colors cursor-pointer",
              editor.isActive("heading", { level: 3 }) &&
                "bg-primary text-primary-content font-bold hover:bg-primary",
            )}
          >
            <Heading3 size={15} />
          </button>

          <div className="w-[1px] h-4 bg-base-300 mx-0.5" />

          {/* Text Style */}
          <button
            type="button"
            title="Bold (Ctrl+B)"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "p-1.5 rounded-lg text-base-content/80 hover:bg-base-300/70 transition-colors cursor-pointer",
              editor.isActive("bold") &&
                "bg-primary text-primary-content font-bold hover:bg-primary",
            )}
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            title="Italic (Ctrl+I)"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "p-1.5 rounded-lg text-base-content/80 hover:bg-base-300/70 transition-colors cursor-pointer",
              editor.isActive("italic") &&
                "bg-primary text-primary-content font-bold hover:bg-primary",
            )}
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            title="Underline (Ctrl+U)"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(
              "p-1.5 rounded-lg text-base-content/80 hover:bg-base-300/70 transition-colors cursor-pointer",
              editor.isActive("underline") &&
                "bg-primary text-primary-content font-bold hover:bg-primary",
            )}
          >
            <UnderlineIcon size={15} />
          </button>
          <button
            type="button"
            title="Strikethrough"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn(
              "p-1.5 rounded-lg text-base-content/80 hover:bg-base-300/70 transition-colors cursor-pointer",
              editor.isActive("strike") &&
                "bg-primary text-primary-content font-bold hover:bg-primary",
            )}
          >
            <Strikethrough size={15} />
          </button>
          <button
            type="button"
            title="Inline Code"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn(
              "p-1.5 rounded-lg text-base-content/80 hover:bg-base-300/70 transition-colors cursor-pointer",
              editor.isActive("code") &&
                "bg-primary text-primary-content font-bold hover:bg-primary",
            )}
          >
            <Code size={15} />
          </button>

          <div className="w-[1px] h-4 bg-base-300 mx-0.5" />

          {/* Lists & Quotes */}
          <button
            type="button"
            title="Bullet List"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "p-1.5 rounded-lg text-base-content/80 hover:bg-base-300/70 transition-colors cursor-pointer",
              editor.isActive("bulletList") &&
                "bg-primary text-primary-content font-bold hover:bg-primary",
            )}
          >
            <List size={15} />
          </button>
          <button
            type="button"
            title="Numbered List"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "p-1.5 rounded-lg text-base-content/80 hover:bg-base-300/70 transition-colors cursor-pointer",
              editor.isActive("orderedList") &&
                "bg-primary text-primary-content font-bold hover:bg-primary",
            )}
          >
            <ListOrdered size={15} />
          </button>
          <button
            type="button"
            title="Blockquote"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(
              "p-1.5 rounded-lg text-base-content/80 hover:bg-base-300/70 transition-colors cursor-pointer",
              editor.isActive("blockquote") &&
                "bg-primary text-primary-content font-bold hover:bg-primary",
            )}
          >
            <Quote size={15} />
          </button>
          <button
            type="button"
            title="Code Block"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={cn(
              "p-1.5 rounded-lg text-base-content/80 hover:bg-base-300/70 transition-colors cursor-pointer",
              editor.isActive("codeBlock") &&
                "bg-primary text-primary-content font-bold hover:bg-primary",
            )}
          >
            <FileCode size={15} />
          </button>
          <button
            type="button"
            title="Horizontal Divider"
            disabled={disabled}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded-lg text-base-content/80 hover:bg-base-300/70 transition-colors cursor-pointer"
          >
            <Minus size={15} />
          </button>

          <div className="w-[1px] h-4 bg-base-300 mx-0.5" />

          {/* Links */}
          <button
            type="button"
            title={isLinkActive ? "Edit Link" : "Insert Link"}
            disabled={disabled}
            onClick={handleOpenLinkModal}
            className={cn(
              "p-1.5 rounded-lg text-base-content/80 hover:bg-base-300/70 transition-colors cursor-pointer",
              isLinkActive &&
                "bg-primary text-primary-content font-bold hover:bg-primary",
            )}
          >
            <Link2 size={15} />
          </button>
          {isLinkActive && (
            <button
              type="button"
              title="Remove Link"
              disabled={disabled}
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="p-1.5 rounded-lg text-error hover:bg-error/10 transition-colors cursor-pointer"
            >
              <Unlink size={15} />
            </button>
          )}

          <div className="w-[1px] h-4 bg-base-300 mx-0.5" />

          {/* Clear & History */}
          <button
            type="button"
            title="Clear Formatting"
            disabled={disabled}
            onClick={() =>
              editor.chain().focus().clearNodes().unsetAllMarks().run()
            }
            className="p-1.5 rounded-lg text-base-content/70 hover:bg-base-300/70 transition-colors cursor-pointer"
          >
            <RemoveFormatting size={15} />
          </button>
          <button
            type="button"
            title="Undo (Ctrl+Z)"
            disabled={disabled || !editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
            className="p-1.5 rounded-lg text-base-content/70 hover:bg-base-300/70 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <Undo2 size={15} />
          </button>
          <button
            type="button"
            title="Redo (Ctrl+Y)"
            disabled={disabled || !editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
            className="p-1.5 rounded-lg text-base-content/70 hover:bg-base-300/70 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <Redo2 size={15} />
          </button>
        </div>

        {/* Link Modal / Popover */}
        {linkModalOpen && (
          <div className="p-3 bg-base-200/90 border-b border-base-300 flex items-center gap-2 text-xs">
            <span className="font-semibold text-base-content">URL:</span>
            <input
              type="url"
              value={linkUrl}
              autoFocus
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-base-300 bg-base-100 text-base-content focus:outline-none focus:border-primary"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApplyLink();
                } else if (e.key === "Escape") {
                  setLinkModalOpen(false);
                }
              }}
            />
            <button
              type="button"
              onClick={handleApplyLink}
              className="px-2.5 py-1 bg-primary text-primary-content rounded-lg font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setLinkModalOpen(false)}
              className="px-2.5 py-1 bg-base-300 text-base-content rounded-lg hover:bg-base-300/80 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Editable content surface */}
        <div className="cursor-text" onClick={() => editor.commands.focus()}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

export default WysiwygEditor;
