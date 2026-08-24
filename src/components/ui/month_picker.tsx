"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/tokens";
import { FieldLabel, FieldError, FieldHint } from "@/components/ui";

export type MonthPickerFormat =
  | "YYYY-MM"
  | "MM/YYYY"
  | "MMMM YYYY"
  | "MMM YYYY"
  | "MM-YYYY"
  | "YYYY/MM";

export interface MonthPickerValue {
  month: number;
  year: number;
  formatted: string;
  iso: string;
}

export interface MonthPickerProps {
  value?: string;
  onChange?: (value: MonthPickerValue) => void;
  format?: MonthPickerFormat;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
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

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatValue(
  month: number,
  year: number,
  fmt: MonthPickerFormat,
): string {
  const mm = pad(month + 1);
  const yyyy = String(year);
  const mmmm = MONTHS[month];
  const mmm = MONTHS_SHORT[month];

  switch (fmt) {
    case "YYYY-MM":
      return `${yyyy}-${mm}`;
    case "MM/YYYY":
      return `${mm}/${yyyy}`;
    case "MMMM YYYY":
      return `${mmmm} ${yyyy}`;
    case "MMM YYYY":
      return `${mmm} ${yyyy}`;
    case "MM-YYYY":
      return `${mm}-${yyyy}`;
    case "YYYY/MM":
      return `${yyyy}/${mm}`;
    default:
      return `${mmmm} ${yyyy}`;
  }
}

function parseIso(iso: string): { month: number; year: number } | null {
  const match = iso.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) - 1 };
}

const triggerSize = {
  sm: "h-8 text-xs px-2.5",
  md: "h-10 text-sm px-3",
  lg: "h-11 text-base px-3.5",
};

export const MonthPicker = React.forwardRef<HTMLDivElement, MonthPickerProps>(
  (
    {
      value,
      onChange,
      format = "MMMM YYYY",
      label,
      hint,
      error,
      placeholder = "Select Month",
      disabled = false,
      required = false,
      size = "md",
      fullWidth = true,
      className,
    },
    ref,
  ) => {
    const parsed = value ? parseIso(value) : null;

    const now = new Date();
    const [year, setYear] = useState(parsed?.year ?? now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number | null>(
      parsed?.month ?? null,
    );
    const [open, setOpen] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (value) {
        const p = parseIso(value);
        if (p) {
          setSelectedMonth(p.month);
          setYear(p.year);
        }
      } else {
        setSelectedMonth(null);
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

    const handleSelect = (monthIndex: number) => {
      setSelectedMonth(monthIndex);
      setOpen(false);

      const iso = `${year}-${pad(monthIndex + 1)}`;
      const formatted = formatValue(monthIndex, year, format);
      onChange?.({ month: monthIndex, year, formatted, iso });
    };

    const handleYearChange = (delta: number) => {
      const newYear = year + delta;
      setYear(newYear);

      if (selectedMonth !== null) {
        const iso = `${newYear}-${pad(selectedMonth + 1)}`;
        const formatted = formatValue(selectedMonth, newYear, format);
        onChange?.({ month: selectedMonth, year: newYear, formatted, iso });
      }
    };

    const displayLabel =
      selectedMonth !== null ? formatValue(selectedMonth, year, format) : null;

    const triggerId = label
      ? `month-picker-${label.toLowerCase().replace(/\s+/g, "-")}`
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
            aria-haspopup="listbox"
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
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              className={cn(
                "text-[#717171] transition-transform duration-200 shrink-0 ml-2",
                open && "rotate-180",
              )}
            >
              <path
                d="M1 1l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {open && (
            <div
              role="listbox"
              aria-label="Select a month"
              className={cn(
                "absolute top-full left-0 right-0 z-50 mt-1.5",
                "bg-white border border-[#E7E9EB] rounded-lg shadow-lg",
                "overflow-hidden animate-fadeIn",
              )}
            >
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#E7E9EB]">
                <button
                  type="button"
                  onClick={() => handleYearChange(-1)}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-[#717171] hover:text-black hover:bg-[#F7F7F7] transition-colors"
                  aria-label="Previous year"
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
                  {year}
                </span>

                <button
                  type="button"
                  onClick={() => handleYearChange(1)}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-[#717171] hover:text-black hover:bg-[#F7F7F7] transition-colors"
                  aria-label="Next year"
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

              <ul className="py-1 max-h-56 overflow-y-auto">
                {MONTHS.map((month, index) => {
                  const isSelected = selectedMonth === index;
                  return (
                    <li key={month}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(index)}
                        className={cn(
                          "w-full text-left px-4 py-2 text-sm transition-colors duration-100",
                          isSelected
                            ? "font-semibold text-black bg-[#F1F1F1]"
                            : "text-black hover:bg-[#F7F7F7]",
                        )}
                      >
                        {month}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {hint && !error && <FieldHint>{hint}</FieldHint>}
        {error && <FieldError>{error}</FieldError>}
      </div>
    );
  },
);

MonthPicker.displayName = "MonthPicker";

export default MonthPicker;
