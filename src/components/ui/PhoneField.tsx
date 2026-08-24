"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/tokens";
import { FieldLabel, FieldError, FieldHint } from "./TextField";

interface Country {
  code: string;
  dial: string;
  name: string;
  flag: string;
}

interface PhoneFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  countryCode?: string;
  onCountryChange?: (country: Country) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  id?: string;
  className?: string;
}

export const COUNTRIES: Country[] = [
  { code: "NG", dial: "+234", name: "Nigeria", flag: "🇳🇬" },
  { code: "GH", dial: "+233", name: "Ghana", flag: "🇬🇭" },
  { code: "KE", dial: "+254", name: "Kenya", flag: "🇰🇪" },
  { code: "ZA", dial: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "US", dial: "+1", name: "United States", flag: "🇺🇸" },
  { code: "GB", dial: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", dial: "+1", name: "Canada", flag: "🇨🇦" },
  { code: "AU", dial: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "DE", dial: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "FR", dial: "+33", name: "France", flag: "🇫🇷" },
  { code: "IN", dial: "+91", name: "India", flag: "🇮🇳" },
  { code: "CN", dial: "+86", name: "China", flag: "🇨🇳" },
  { code: "BR", dial: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "JP", dial: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "AE", dial: "+971", name: "UAE", flag: "🇦🇪" },
];

const sizeMap = {
  sm: { trigger: "h-8 text-xs", input: "h-8 text-xs" },
  md: { trigger: "h-10 text-sm", input: "h-10 text-sm" },
  lg: { trigger: "h-11 text-base", input: "h-11 text-base" },
};

const PhoneField = React.forwardRef<HTMLInputElement, PhoneFieldProps>(
  (
    {
      label,
      hint,
      error,
      value = "",
      onChange,
      countryCode = "NG",
      onCountryChange,
      disabled = false,
      required = false,
      placeholder = "Enter phone number",
      size = "md",
      fullWidth = true,
      id,
      className,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : "phone");
    const sizes = sizeMap[size];

    const selectedCountry =
      COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

    const filtered = COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.dial.includes(search),
    );

    // Close on outside click
    useEffect(() => {
      function handler(e: MouseEvent) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node)
        ) {
          setOpen(false);
        }
      }
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);

    const hasError = !!error;

    return (
      <div className={cn("flex flex-col", fullWidth && "w-full", className)}>
        {label && (
          <FieldLabel htmlFor={inputId} required={required}>
            {label}
          </FieldLabel>
        )}

        <div
          className={cn(
            "flex rounded-lg border bg-white overflow-hidden",
            "transition-colors duration-150",
            hasError
              ? "border-[#E84D52] focus-within:border-[#E84D52] focus-within:ring-1 focus-within:ring-[#E84D52]/30"
              : "border-[#E7E9EB] focus-within:border-black focus-within:ring-1 focus-within:ring-black/10",
            disabled && "opacity-50 cursor-not-allowed bg-[#F7F7F7]",
          )}
        >
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setOpen((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 px-3 border-r border-[#E7E9EB]",
                "text-black font-medium shrink-0",
                "hover:bg-[#F7F7F7] transition-colors",
                "focus:outline-none",
                sizes.trigger,
              )}
            >
              <span className="text-base">{selectedCountry.flag}</span>
              <span className="text-sm">{selectedCountry.dial}</span>
              <svg
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                className={cn(
                  "text-[#717171] transition-transform",
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
              <div className="absolute top-full left-0 z-50 mt-1 w-60 bg-white border border-[#E7E9EB] rounded-lg shadow-lg overflow-hidden animate-fadeIn">
                <div className="p-2 border-b border-[#E7E9EB]">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search country..."
                    className="w-full h-8 px-2.5 text-sm rounded-md border border-[#E7E9EB] bg-[#F7F7F7] focus:outline-none focus:border-black placeholder:text-[#717171]"
                    autoFocus
                  />
                </div>

                <ul className="max-h-48 overflow-y-auto py-1">
                  {filtered.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-[#717171]">
                      No results
                    </li>
                  ) : (
                    filtered.map((country) => (
                      <li key={country.code}>
                        <button
                          type="button"
                          onClick={() => {
                            onCountryChange?.(country);
                            setOpen(false);
                            setSearch("");
                          }}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left",
                            "hover:bg-[#F7F7F7] transition-colors",
                            country.code === selectedCountry.code &&
                              "bg-[#F7F7F7] font-medium",
                          )}
                        >
                          <span className="text-base">{country.flag}</span>
                          <span className="flex-1 truncate">
                            {country.name}
                          </span>
                          <span className="text-[#717171] text-xs">
                            {country.dial}
                          </span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>

          <input
            ref={ref}
            id={inputId}
            type="tel"
            inputMode="numeric"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={cn(
              "flex-1 px-3 bg-transparent",
              "text-black placeholder:text-[#717171]",
              "focus:outline-none",
              "disabled:cursor-not-allowed",
              sizes.input,
            )}
          />
        </div>

        {hint && !error && <FieldHint>{hint}</FieldHint>}
        {error && <FieldError>{error}</FieldError>}
      </div>
    );
  },
);

PhoneField.displayName = "PhoneField";

export { PhoneField };
export type { PhoneFieldProps };
