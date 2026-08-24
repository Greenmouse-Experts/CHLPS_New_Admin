"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/tokens";

interface RichTextFieldProps {
  label?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

function exec(command: string) {
  document.execCommand(command, false);
}

export function RichTextField({
  label,
  value,
  onChange,
  placeholder = "Write…",
  minHeight = "160px",
}: RichTextFieldProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

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
                exec(btn.cmd);
                onChange(ref.current?.innerHTML ?? "");
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <div
          ref={ref}
          contentEditable
          role="textbox"
          aria-label={label ?? placeholder}
          suppressContentEditableWarning
          className="px-3 py-2 text-sm outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-[#717171]"
          style={{ minHeight }}
          data-placeholder={placeholder}
          onInput={() => onChange(ref.current?.innerHTML ?? "")}
        />
      </div>
    </div>
  );
}
