"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/tokens";

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "danger";
  disabled?: boolean;
  separator?: false;
}

interface DropdownSeparator {
  separator: true;
}

type DropdownOption = DropdownItem | DropdownSeparator;

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownOption[];
  align?: "left" | "right";
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Dropdown({
  trigger,
  items,
  align = "right",
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className={cn("relative inline-block", className)} ref={ref}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 min-w-40 bg-white border border-[#E7E9EB] rounded-lg shadow-lg",
            "animate-fade-in-up overflow-hidden",
            align === "right" ? "right-0" : "left-0",
          )}
          role="menu"
        >
          <div className="py-1">
            {items.map((item, i) => {
              if ("separator" in item && item.separator) {
                return <div key={i} className="my-1 h-px bg-[#E7E9EB]" />;
              }

              const opt = item as DropdownItem;

              const baseClass = cn(
                "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left",
                "transition-colors duration-100",
                opt.variant === "danger"
                  ? "text-[#E84D52] hover:bg-[#FDF0F0]"
                  : "text-black hover:bg-[#F7F7F7]",
                opt.disabled &&
                  "opacity-40 cursor-not-allowed pointer-events-none",
              );

              if (opt.href) {
                return (
                  <a
                    key={i}
                    href={opt.href}
                    className={baseClass}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                  >
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    {opt.label}
                  </a>
                );
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={opt.disabled}
                  className={baseClass}
                  role="menuitem"
                  onClick={() => {
                    opt.onClick?.();
                    setOpen(false);
                  }}
                >
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
