"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/tokens";
import { FieldLabel, FieldError, FieldHint } from "@/components/ui";

export interface DatePickerProps {
  value?: string | null;
  onChange?: (iso: string) => void;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  /** Minimum selectable date, as an ISO "YYYY-MM-DD" string. */
  min?: string | null;
  /** Maximum selectable date, as an ISO "YYYY-MM-DD" string. */
  max?: string | null;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIso(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function parseIso(iso?: string | null): { year: number; month: number; day: number } | null {
  if (!iso) return null;
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
  };
}

function formatDisplay(iso: string) {
  const parsed = parseIso(iso);
  if (!parsed) return "";
  return `${parsed.day} ${MONTHS[parsed.month]} ${parsed.year}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstWeekday(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function todayIso() {
  const now = new Date();
  return toIso(now.getFullYear(), now.getMonth(), now.getDate());
}

const triggerSize = {
  sm: "h-8 text-xs px-2.5",
  md: "h-10 text-sm px-3",
  lg: "h-11 text-base px-3.5",
};

export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      label,
      hint,
      error,
      placeholder = "Select date",
      disabled = false,
      required = false,
      size = "md",
      fullWidth = true,
      className,
      min,
      max,
    },
    ref,
  ) => {
    const parsed = parseIso(value);
    const today = parseIso(todayIso())!;

    const [viewYear, setViewYear] = useState(parsed?.year ?? today.year);
    const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.month);
    const [open, setOpen] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const p = parseIso(value);
      if (p) {
        setViewYear(p.year);
        setViewMonth(p.month);
      }
    }, [value]);

    useEffect(() => {
      function handler(e: MouseEvent) {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setOpen(false);
        }
      }
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
      function handler(e: KeyboardEvent) {
        if (e.key === "Escape") setOpen(false);
      }
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }, []);

    const changeMonth = (delta: number) => {
      let newMonth = viewMonth + delta;
      let newYear = viewYear;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      setViewMonth(newMonth);
      setViewYear(newYear);
    };

    const handleSelect = (day: number) => {
      const iso = toIso(viewYear, viewMonth, day);
      if (min && iso < min) return;
      if (max && iso > max) return;
      onChange?.(iso);
      setOpen(false);
    };

    const totalDays = daysInMonth(viewYear, viewMonth);
    const leadingBlanks = firstWeekday(viewYear, viewMonth);
    const cells: (number | null)[] = [
      ...Array(leadingBlanks).fill(null),
      ...Array.from({ length: totalDays }, (_, i) => i + 1),
    ];

    const displayLabel = value ? formatDisplay(value) : null;

    const triggerId = label
      ? `date-picker-${label.toLowerCase().replace(/\s+/g, "-")}`
      : undefined;

    return (
      <div
        ref={(el) => {
          (containerRef as any).current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) (ref as any).current = el;
        }}
        className={cn("flex flex-col", fullWidth && "w-full", className)}
      >
        {label && (
          <FieldLabel htmlFor={triggerId} required={required}>
            {label}
          </FieldLabel>
        )}

        <div className="relative">
          <button
            id={triggerId}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setOpen((v) => !v)}
            aria-haspopup="dialog"
            aria-expanded={open}
            className={cn(
              "w-full flex items-center justify-between rounded-lg border bg-white",
              "text-left font-normal transition-colors duration-150",
              "focus:outline-none focus:ring-1",
              error
                ? "border-[#E84D52] focus:border-[#E84D52] focus:ring-[#E84D52]/20"
                : open
                  ? "border-black ring-1 ring-black/10"
                  : "border-[#E7E9EB] hover:border-black/30",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              triggerSize[size],
            )}
          >
            <span className={cn(!displayLabel && "text-[#717171]")}>
              {displayLabel ?? placeholder}
            </span>

            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="text-[#717171] shrink-0 ml-2"
            >
              <rect
                x="1.5"
                y="2.5"
                width="11"
                height="10"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M1.5 5.5h11M4 1v2M10 1v2"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {open && (
            <div
              role="dialog"
              aria-label="Choose a date"
              className={cn(
                "absolute top-full left-0 z-50 mt-1.5 w-64",
                "bg-white border border-[#E7E9EB] rounded-lg shadow-lg",
                "overflow-hidden animate-fadeIn",
              )}
            >
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#E7E9EB]">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-[#717171] hover:text-black hover:bg-[#F7F7F7] transition-colors"
                  aria-label="Previous month"
                >
                  <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
                    <path
                      d="M7 1L1 6.5 7 12"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <span className="text-sm font-semibold text-black tabular-nums">
                  {MONTHS[viewMonth]} {viewYear}
                </span>

                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-[#717171] hover:text-black hover:bg-[#F7F7F7] transition-colors"
                  aria-label="Next month"
                >
                  <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
                    <path
                      d="M1 1l6 5.5L1 12"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-y-1 px-2 pt-2 text-center text-[11px] font-medium text-[#717171]">
                {WEEKDAYS.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1 px-2 pb-2.5 pt-1">
                {cells.map((day, index) => {
                  if (day === null) return <span key={`blank-${index}`} />;

                  const iso = toIso(viewYear, viewMonth, day);
                  const isSelected = value === iso;
                  const isToday = todayIso() === iso;
                  const isDisabled = (min && iso < min) || (max && iso > max);

                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={!!isDisabled}
                      onClick={() => handleSelect(day)}
                      className={cn(
                        "h-7 w-7 mx-auto flex items-center justify-center rounded-full text-xs transition-colors duration-100",
                        isSelected
                          ? "bg-black text-white font-semibold"
                          : isToday
                            ? "font-semibold text-black ring-1 ring-black/20"
                            : "text-black hover:bg-[#F7F7F7]",
                        isDisabled && "opacity-30 cursor-not-allowed hover:bg-transparent",
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between px-3 py-2 border-t border-[#E7E9EB]">
                <button
                  type="button"
                  onClick={() => {
                    const iso = todayIso();
                    if ((min && iso < min) || (max && iso > max)) return;
                    onChange?.(iso);
                    setOpen(false);
                  }}
                  className="text-xs font-medium text-black hover:underline"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-xs font-medium text-[#717171] hover:text-black"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {hint && !error && <FieldHint>{hint}</FieldHint>}
        {error && <FieldError>{error}</FieldError>}
      </div>
    );
  },
);

DatePicker.displayName = "DatePicker";

export default DatePicker;
