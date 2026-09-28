"use client";

import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Link2,
  RemoveFormatting,
  Undo2,
  Redo2,
  FileCode,
  Eye,
  Edit3,
} from "lucide-react";
import { cn } from "@/lib/tokens";

interface RichTextFieldProps {
  label?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

function isHtmlEmpty(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").trim() === "";
}

interface SurfaceHandle {
  setHtml: (html: string) => void;
  getHtml: () => string;
  focus: () => void;
}

const EditorSurface = memo(
  forwardRef<
    SurfaceHandle,
    {
      minHeight: string;
      placeholder?: string;
      onChange: (html: string) => void;
    }
  >(function EditorSurface({ minHeight, onChange }, ref) {
    "use no memo";
    const elRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      setHtml: (html: string) => {
        if (elRef.current && elRef.current.innerHTML !== html) {
          elRef.current.innerHTML = html || "";
        }
      },
      getHtml: () => elRef.current?.innerHTML ?? "",
      focus: () => elRef.current?.focus(),
    }));

    return (
      <div
        ref={elRef}
        contentEditable
        role="textbox"
        aria-multiline="true"
        tabIndex={0}
        suppressContentEditableWarning
        className="relative z-[1] px-4 py-3.5 text-sm text-base-content leading-relaxed outline-none cursor-text whitespace-pre-wrap break-words prose max-w-none focus:outline-none"
        style={{ minHeight }}
        onInput={() => onChange(elRef.current?.innerHTML ?? "")}
        onBlur={() => onChange(elRef.current?.innerHTML ?? "")}
      />
    );
  }),
  () => true,
);

export function RichTextField({
  label,
  value,
  onChange,
  placeholder = "Write comprehensive course details, formatting with headings, bullets, code, links...",
  minHeight = "360px",
  className,
}: RichTextFieldProps) {
  "use no memo";
  const surfaceRef = useRef<SurfaceHandle>(null);
  const lastEmitted = useRef(value);
  const [empty, setEmpty] = useState(() => isHtmlEmpty(value));
  const [viewMode, setViewMode] = useState<"rich" | "html" | "preview">("rich");

  useEffect(() => {
    surfaceRef.current?.setHtml(value || "");
    lastEmitted.current = value;
    setEmpty(isHtmlEmpty(value));
  }, []);

  useEffect(() => {
    if (value === lastEmitted.current) return;
    surfaceRef.current?.setHtml(value || "");
    lastEmitted.current = value;
    setEmpty(isHtmlEmpty(value));
  }, [value]);

  const emit = (html: string) => {
    lastEmitted.current = html;
    setEmpty(isHtmlEmpty(html));
    onChange(html);
  };

  const run = (command: string, arg?: string) => {
    surfaceRef.current?.focus();
    document.execCommand(command, false, arg);
    emit(surfaceRef.current?.getHtml() ?? "");
  };

  const handleLink = () => {
    const url = window.prompt("Enter link URL:", "https://");
    if (url) {
      run("createLink", url);
    }
  };

  const handleHeading = (tag: "h2" | "h3" | "h4" | "p") => {
    run("formatBlock", tag);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-base-content mb-1.5">
          {label}
        </label>
      )}

      <div className="border border-[#E7E9EB] rounded-xl overflow-hidden bg-white shadow-xs focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all">
        {/* Toolbar Header */}
        <div className="flex flex-wrap items-center justify-between gap-1 p-2 border-b border-[#E7E9EB] bg-[#FAFBFB]">
          <div className="flex flex-wrap items-center gap-1">
            {/* Formatting Actions */}
            <div className="flex items-center gap-0.5 pr-1 border-r border-[#E7E9EB]">
              <button
                type="button"
                title="Bold (Ctrl+B)"
                disabled={viewMode !== "rich"}
                className="p-1.5 rounded-md hover:bg-black/5 disabled:opacity-40 text-base-content transition"
                onMouseDown={(e) => {
                  e.preventDefault();
                  run("bold");
                }}
              >
                <Bold size={15} />
              </button>
              <button
                type="button"
                title="Italic (Ctrl+I)"
                disabled={viewMode !== "rich"}
                className="p-1.5 rounded-md hover:bg-black/5 disabled:opacity-40 text-base-content transition"
                onMouseDown={(e) => {
                  e.preventDefault();
                  run("italic");
                }}
              >
                <Italic size={15} />
              </button>
              <button
                type="button"
                title="Underline (Ctrl+U)"
                disabled={viewMode !== "rich"}
                className="p-1.5 rounded-md hover:bg-black/5 disabled:opacity-40 text-base-content transition"
                onMouseDown={(e) => {
                  e.preventDefault();
                  run("underline");
                }}
              >
                <Underline size={15} />
              </button>
              <button
                type="button"
                title="Strikethrough"
                disabled={viewMode !== "rich"}
                className="p-1.5 rounded-md hover:bg-black/5 disabled:opacity-40 text-base-content transition"
                onMouseDown={(e) => {
                  e.preventDefault();
                  run("strikeThrough");
                }}
              >
                <Strikethrough size={15} />
              </button>
            </div>

            {/* Headings */}
            <div className="flex items-center gap-0.5 px-1 border-r border-[#E7E9EB]">
              <button
                type="button"
                title="Heading 2"
                disabled={viewMode !== "rich"}
                className="p-1.5 rounded-md hover:bg-black/5 disabled:opacity-40 text-base-content transition"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleHeading("h2");
                }}
              >
                <Heading1 size={15} />
              </button>
              <button
                type="button"
                title="Heading 3"
                disabled={viewMode !== "rich"}
                className="p-1.5 rounded-md hover:bg-black/5 disabled:opacity-40 text-base-content transition"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleHeading("h3");
                }}
              >
                <Heading2 size={15} />
              </button>
              <button
                type="button"
                title="Heading 4"
                disabled={viewMode !== "rich"}
                className="p-1.5 rounded-md hover:bg-black/5 disabled:opacity-40 text-base-content transition"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleHeading("h4");
                }}
              >
                <Heading3 size={15} />
              </button>
            </div>

            {/* Lists & Quotes */}
            <div className="flex items-center gap-0.5 px-1 border-r border-[#E7E9EB]">
              <button
                type="button"
                title="Bullet List"
                disabled={viewMode !== "rich"}
                className="p-1.5 rounded-md hover:bg-black/5 disabled:opacity-40 text-base-content transition"
                onMouseDown={(e) => {
                  e.preventDefault();
                  run("insertUnorderedList");
                }}
              >
                <List size={15} />
              </button>
              <button
                type="button"
                title="Numbered List"
                disabled={viewMode !== "rich"}
                className="p-1.5 rounded-md hover:bg-black/5 disabled:opacity-40 text-base-content transition"
                onMouseDown={(e) => {
                  e.preventDefault();
                  run("insertOrderedList");
                }}
              >
                <ListOrdered size={15} />
              </button>
              <button
                type="button"
                title="Blockquote"
                disabled={viewMode !== "rich"}
                className="p-1.5 rounded-md hover:bg-black/5 disabled:opacity-40 text-base-content transition"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleHeading("p");
                  run("formatBlock", "blockquote");
                }}
              >
                <Quote size={14} />
              </button>
              <button
                type="button"
                title="Code block / inline"
                disabled={viewMode !== "rich"}
                className="p-1.5 rounded-md hover:bg-black/5 disabled:opacity-40 text-base-content transition"
                onMouseDown={(e) => {
                  e.preventDefault();
                  run("formatBlock", "pre");
                }}
              >
                <Code size={15} />
              </button>
            </div>

            {/* Link & Clear Format */}
            <div className="flex items-center gap-0.5 px-1">
              <button
                type="button"
                title="Insert Link"
                disabled={viewMode !== "rich"}
                className="p-1.5 rounded-md hover:bg-black/5 disabled:opacity-40 text-base-content transition"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleLink();
                }}
              >
                <Link2 size={15} />
              </button>
              <button
                type="button"
                title="Clear Formatting"
                disabled={viewMode !== "rich"}
                className="p-1.5 rounded-md hover:bg-black/5 disabled:opacity-40 text-base-content transition"
                onMouseDown={(e) => {
                  e.preventDefault();
                  run("removeFormat");
                }}
              >
                <RemoveFormatting size={15} />
              </button>
              <button
                type="button"
                title="Undo"
                disabled={viewMode !== "rich"}
                className="p-1.5 rounded-md hover:bg-black/5 disabled:opacity-40 text-base-content transition"
                onMouseDown={(e) => {
                  e.preventDefault();
                  run("undo");
                }}
              >
                <Undo2 size={14} />
              </button>
              <button
                type="button"
                title="Redo"
                disabled={viewMode !== "rich"}
                className="p-1.5 rounded-md hover:bg-black/5 disabled:opacity-40 text-base-content transition"
                onMouseDown={(e) => {
                  e.preventDefault();
                  run("redo");
                }}
              >
                <Redo2 size={14} />
              </button>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center rounded-lg border border-[#E7E9EB] bg-white p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("rich")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md transition font-medium",
                viewMode === "rich"
                  ? "bg-brand-primary text-white shadow-xs"
                  : "text-base-content/70 hover:text-base-content"
              )}
            >
              <Edit3 size={12} /> Rich
            </button>
            <button
              type="button"
              onClick={() => setViewMode("html")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md transition font-medium",
                viewMode === "html"
                  ? "bg-brand-primary text-white shadow-xs"
                  : "text-base-content/70 hover:text-base-content"
              )}
            >
              <FileCode size={12} /> HTML/MD
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md transition font-medium",
                viewMode === "preview"
                  ? "bg-brand-primary text-white shadow-xs"
                  : "text-base-content/70 hover:text-base-content"
              )}
            >
              <Eye size={12} /> Preview
            </button>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === "rich" && (
          <div
            className="relative"
            onClick={() => surfaceRef.current?.focus()}
          >
            {empty && (
              <p className="absolute left-4 top-3.5 text-sm text-base-content/40 pointer-events-none select-none">
                {placeholder}
              </p>
            )}
            <EditorSurface
              ref={surfaceRef}
              minHeight={minHeight}
              onChange={emit}
            />
          </div>
        )}

        {viewMode === "html" && (
          <textarea
            value={value || ""}
            onChange={(e) => emit(e.target.value)}
            style={{ minHeight }}
            placeholder="Type or paste direct HTML / Markdown markup..."
            className="w-full p-4 font-mono text-xs text-base-content/90 bg-[#FBFBFC] outline-none resize-y border-0 focus:ring-0 leading-relaxed"
          />
        )}

        {viewMode === "preview" && (
          <div
            style={{ minHeight }}
            className="p-4 prose prose-sm max-w-none bg-white text-base-content overflow-auto"
            dangerouslySetInnerHTML={{
              __html: value || "<p class='text-base-content/40 italic'>Nothing to preview yet.</p>",
            }}
          />
        )}

        {/* Status / Character Count footer */}
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-[#E7E9EB] bg-[#FDFDFD] text-[11px] text-base-content/50">
          <span>{value ? `${value.replace(/<[^>]+>/g, "").trim().split(/\s+/).filter(Boolean).length} words` : "0 words"}</span>
          <span>{viewMode === "rich" ? "Visual WYSIWYG Mode" : viewMode === "html" ? "Source Markup Mode" : "Rendered Preview"}</span>
        </div>
      </div>
    </div>
  );
}
