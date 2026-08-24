"use client";

import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/tokens";

interface PinFieldProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "text" | "number" | "password";
}

const sizeMap = {
  sm: "flex-1 min-w-0 max-w-[36px] aspect-square text-sm",
  md: "flex-1 min-w-0 max-w-[44px] aspect-square text-base",
  lg: "flex-1 min-w-0 max-w-[52px] aspect-square text-lg",
};

const PinField = React.forwardRef<HTMLDivElement, PinFieldProps>(
  (
    {
      length = 4,
      value = "",
      onChange,
      onComplete,
      error,
      disabled = false,
      autoFocus = false,
      size = "md",
      className,
      type = "text",
    },
    ref,
  ) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    const digits = Array.from({ length }, (_, i) => value[i] || "");

    const updateValue = useCallback(
      (newDigits: string[]) => {
        const newValue = newDigits.join("");
        onChange?.(newValue);
        if (newValue.length === length) {
          onComplete?.(newValue);
        }
      },
      [length, onChange, onComplete],
    );

    const handleChange = (index: number, char: string) => {
      const cleaned = char.replace(/\D/g, "").slice(-1);
      const newDigits = [...digits];
      newDigits[index] = cleaned;
      updateValue(newDigits);

      // Advance to next
      if (cleaned && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (
      index: number,
      e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        const newDigits = [...digits];
        if (newDigits[index]) {
          newDigits[index] = "";
          updateValue(newDigits);
        } else if (index > 0) {
          newDigits[index - 1] = "";
          updateValue(newDigits);
          inputRefs.current[index - 1]?.focus();
        }
      }

      if (e.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      if (e.key === "ArrowRight" && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, length);
      const newDigits = Array.from({ length }, (_, i) => pasted[i] || "");
      updateValue(newDigits);
      // Focus last filled or last
      const lastIndex = Math.min(pasted.length, length - 1);
      inputRefs.current[lastIndex]?.focus();
    };

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center gap-3", className)}
      >
        <div className="flex w-full items-center gap-2">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type={type === "number" ? "tel" : type}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              autoFocus={autoFocus && index === 0}
              disabled={disabled}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={cn(
                // Base
                "rounded-lg border text-center font-semibold",
                "bg-white text-black caret-black",
                "transition-all duration-150",
                "focus:outline-none",
                sizeMap[size],
                error
                  ? "border-[#E84D52] focus:border-[#E84D52] focus:ring-2 focus:ring-[#E84D52]/20"
                  : focusedIndex === index
                    ? "border-black ring-1 ring-black/10"
                    : digit
                      ? "border-black"
                      : "border-[#E7E9EB]",
                disabled && "opacity-50 cursor-not-allowed bg-[#F7F7F7]",
              )}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-[#E84D52] flex items-center gap-1">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="shrink-0"
            >
              <circle cx="6" cy="6" r="5.5" stroke="#E84D52" />
              <path
                d="M6 3.5v3M6 8h.01"
                stroke="#E84D52"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  },
);

PinField.displayName = "PinField";

export { PinField };
export type { PinFieldProps };
