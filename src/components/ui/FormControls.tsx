"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/tokens";
import { FieldLabel, FieldError, FieldHint } from "./TextField";

interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> {
  label?: React.ReactNode;
  hint?: string;
  error?: string;
  size?: "sm" | "md" | "lg";
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { label, hint, error, size = "md", indeterminate, className, id, ...props },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const checkboxId =
      id ||
      (typeof label === "string"
        ? label.toLowerCase().replace(/\s+/g, "-")
        : undefined);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate ?? false;
      }
    }, [indeterminate]);

    const sizeStyles = {
      sm: { box: "w-3.5 h-3.5 rounded", label: "text-xs", gap: "gap-1.5" },
      md: { box: "w-4 h-4 rounded", label: "text-sm", gap: "gap-2" },
      lg: { box: "w-5 h-5 rounded-md", label: "text-base", gap: "gap-2.5" },
    }[size];

    return (
      <div className="flex flex-col gap-1">
        <label
          className={cn(
            "flex items-center cursor-pointer group",
            sizeStyles.gap,
          )}
        >
          <div className="relative shrink-0">
            <input
              ref={(el) => {
                (inputRef as any).current = el;
                if (typeof ref === "function") ref(el);
                else if (ref) (ref as any).current = el;
              }}
              id={checkboxId}
              type="checkbox"
              className="sr-only peer"
              {...props}
            />
            <div
              className={cn(
                "flex items-center justify-center border-2 transition-all duration-150",
                sizeStyles.box,
                error
                  ? "border-[#E84D52] peer-checked:bg-[#E84D52] peer-checked:border-[#E84D52]"
                  : "border-[#E7E9EB] peer-checked:bg-black peer-checked:border-black",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-black peer-focus-visible:ring-offset-1",
                "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
                props.checked || indeterminate
                  ? error
                    ? "bg-[#E84D52] border-[#E84D52]"
                    : "bg-black border-black"
                  : "bg-white",
                className,
              )}
            >
              {(props.checked || (props as any).defaultChecked) &&
                !indeterminate && (
                  <svg
                    viewBox="0 0 10 8"
                    fill="none"
                    className="w-[55%] text-white"
                  >
                    <path
                      d="M1 4l3 3 5-6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              {indeterminate && (
                <div className="w-[55%] h-[1.5px] bg-white rounded-full" />
              )}
            </div>
          </div>

          {label && (
            <span
              className={cn(
                "font-medium text-black group-hover:text-black/80",
                sizeStyles.label,
              )}
            >
              {label}
            </span>
          )}
        </label>

        {hint && !error && <FieldHint>{hint}</FieldHint>}
        {error && <FieldError>{error}</FieldError>}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

interface RadioOption {
  label: string;
  value: string;
  hint?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  label?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  hint?: string;
  name: string;
  orientation?: "vertical" | "horizontal";
  size?: "sm" | "md" | "lg";
}

function RadioGroup({
  label,
  options,
  value,
  onChange,
  error,
  hint,
  name,
  orientation = "vertical",
  size = "md",
}: RadioGroupProps) {
  const sizeStyles = {
    sm: { circle: "w-3.5 h-3.5", inner: "w-1.5 h-1.5", label: "text-xs" },
    md: { circle: "w-4 h-4", inner: "w-2 h-2", label: "text-sm" },
    lg: { circle: "w-5 h-5", inner: "w-2.5 h-2.5", label: "text-base" },
  }[size];

  return (
    <div className="flex flex-col gap-2">
      {label && <FieldLabel>{label}</FieldLabel>}

      <div
        className={cn(
          "flex gap-3",
          orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
        )}
      >
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex items-start gap-2 cursor-pointer group",
                option.disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={checked}
                  disabled={option.disabled}
                  onChange={() => onChange?.(option.value)}
                  className="sr-only"
                />
                <div
                  className={cn(
                    "rounded-full border-2 flex items-center justify-center transition-all",
                    sizeStyles.circle,
                    checked
                      ? "border-black bg-black"
                      : "border-[#E7E9EB] bg-white group-hover:border-black/40",
                  )}
                >
                  {checked && (
                    <div
                      className={cn("rounded-full bg-white", sizeStyles.inner)}
                    />
                  )}
                </div>
              </div>

              <div>
                <span
                  className={cn("font-medium text-black", sizeStyles.label)}
                >
                  {option.label}
                </span>
                {option.hint && (
                  <p className="text-xs text-[#717171] mt-0.5">{option.hint}</p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {hint && !error && <FieldHint>{hint}</FieldHint>}
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}


interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  id?: string;
  className?: string;
}

function Select({
  label,
  hint,
  error,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled,
  required,
  size = "md",
  fullWidth = true,
  id,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  const selectedOption = options.find((o) => o.value === value);

  const sizeStyles = {
    sm: "h-8 text-xs px-2.5",
    md: "h-10 text-sm px-3",
    lg: "h-11 text-base px-3.5",
  }[size];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={cn("flex flex-col", fullWidth && "w-full", className)}>
      {label && (
        <FieldLabel htmlFor={selectId} required={required}>
          {label}
        </FieldLabel>
      )}

      <div className="relative" ref={ref}>
        <button
          id={selectId}
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "w-full flex items-center justify-between rounded-lg border bg-white",
            "text-left transition-colors duration-150",
            "focus:outline-none focus:ring-1",
            error
              ? "border-[#E84D52] focus:border-[#E84D52] focus:ring-[#E84D52]/30"
              : "border-[#E7E9EB] focus:border-black focus:ring-black/10",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            sizeStyles,
          )}
        >
          <span className={cn(!selectedOption && "text-[#717171]")}>
            {selectedOption?.label ?? placeholder}
          </span>
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            className={cn(
              "text-[#717171] transition-transform shrink-0 ml-2",
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
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-[#E7E9EB] rounded-lg shadow-lg overflow-hidden animate-fadeIn">
            <ul className="py-1 max-h-56 overflow-y-auto">
              {options.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    disabled={option.disabled}
                    onClick={() => {
                      onChange?.(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm",
                      "hover:bg-[#F7F7F7] transition-colors",
                      option.value === value && "font-medium bg-[#F7F7F7]",
                      option.disabled && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {hint && !error && <FieldHint>{hint}</FieldHint>}
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}


interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  hint?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}

function Toggle({
  checked = false,
  onChange,
  label,
  hint,
  disabled,
  size = "md",
  className,
}: ToggleProps) {
  const sizeStyles = {
    sm: { track: "w-8 h-4", thumb: "w-3 h-3", translate: "translate-x-4" },
    md: { track: "w-10 h-5", thumb: "w-3.5 h-3.5", translate: "translate-x-5" },
  }[size];

  return (
    <label
      className={cn(
        "flex items-start gap-2.5 cursor-pointer group",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative shrink-0 rounded-full transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-1",
          sizeStyles.track,
          checked ? "bg-black" : "bg-[#E7E9EB]",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 rounded-full bg-white shadow-sm transition-transform duration-200",
            sizeStyles.thumb,
            checked && sizeStyles.translate,
          )}
        />
      </button>

      {(label || hint) && (
        <div>
          {label && (
            <span className="text-sm font-medium text-black">{label}</span>
          )}
          {hint && <p className="text-xs text-[#717171] mt-0.5">{hint}</p>}
        </div>
      )}
    </label>
  );
}

export { Checkbox, RadioGroup, Select, Toggle };
export type { CheckboxProps, RadioGroupProps, SelectProps, ToggleProps };
