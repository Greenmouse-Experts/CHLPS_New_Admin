"use client";

import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/tokens";

interface RichTextFieldProps {
  label?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
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
    { minHeight: string; placeholder?: string; onChange: (html: string) => void }
  >(function EditorSurface({ minHeight, onChange }, ref) {
    "use no memo";
    const elRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      setHtml: (html: string) => {
        if (elRef.current) elRef.current.innerHTML = html || "";
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
        className="relative z-[1] px-3 py-2 text-sm text-black outline-none cursor-text whitespace-pre-wrap break-words [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
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
  placeholder = "Write…",
  minHeight = "160px",
}: RichTextFieldProps) {
  "use no memo";
  const surfaceRef = useRef<SurfaceHandle>(null);
  const lastEmitted = useRef(value);
  const [empty, setEmpty] = useState(() => isHtmlEmpty(value));

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

  const run = (command: string) => {
    surfaceRef.current?.focus();
    document.execCommand(command, false);
    emit(surfaceRef.current?.getHtml() ?? "");
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-black mb-1.5">
          {label}
        </label>
      )}
      <div className="border border-[#E7E9EB] rounded-lg overflow-hidden bg-white">
        <div className="flex gap-1 p-2 border-b border-[#E7E9EB] bg-[#F7F7F7]">
          {[
            { cmd: "bold", label: "B", className: "font-bold" },
            { cmd: "italic", label: "I", className: "italic" },
            { cmd: "underline", label: "U", className: "underline" },
            { cmd: "insertUnorderedList", label: "• List", className: "" },
          ].map((btn) => (
            <button
              key={btn.cmd}
              type="button"
              className={cn(
                "px-2 h-7 text-xs rounded border border-[#E7E9EB] bg-white hover:bg-[#F1F1F1]",
                btn.className,
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                run(btn.cmd);
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <div
          className="relative"
          onClick={() => surfaceRef.current?.focus()}
        >
          {empty && (
            <p className="absolute left-3 top-2 text-sm text-[#717171] pointer-events-none select-none">
              {placeholder}
            </p>
          )}
          <EditorSurface
            ref={surfaceRef}
            minHeight={minHeight}
            onChange={emit}
          />
        </div>
      </div>
    </div>
  );
}
