"use client";

import React from "react";
import { cn } from "@/lib/tokens";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success";

type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    "bg-primary text-white border-transparent",
    "hover:bg-[#1c176e] active:bg-[#120d46]",
    "disabled:bg-[#717171] disabled:cursor-not-allowed",
  ].join(" "),

  secondary: [
    "bg-white text-black border-[#E7E9EB]",
    "hover:bg-[#F7F7F7] active:bg-[#F1F1F1]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),

  outline: [
    "bg-transparent text-black border-black",
    "hover:bg-[#F7F7F7] active:bg-[#F1F1F1]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),

  ghost: [
    "bg-transparent text-[#717171] border-transparent",
    "hover:bg-[#F7F7F7] hover:text-black active:bg-[#F1F1F1]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),

  danger: [
    "bg-[#E84D52] text-white border-transparent",
    "hover:bg-[#d04348] active:bg-[#b83a3e]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),

  success: [
    "bg-[#38CB89] text-white border-transparent",
    "hover:bg-[#2db577] active:bg-[#25a067]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "h-7 px-2.5 text-xs gap-1.5 rounded-md",
  sm: "h-8 px-3 text-sm gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-11 px-5 text-base gap-2 rounded-lg",
};

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width="14"
      height="14"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center cursor-pointer",
          "font-medium border",
          "transition-all duration-150 select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
          // Variant
          variantStyles[variant],
          // Size
          sizeStyles[size],
          // Full width
          fullWidth && "w-full",
          // Custom
          className,
        )}
        {...props}
      >
        {loading ? (
          <Spinner />
        ) : leftIcon ? (
          <span className="flex items-center shrink-0">{leftIcon}</span>
        ) : null}

        {children && (
          <span className={cn(loading && "ml-1.5")}>{children}</span>
        )}

        {!loading && rightIcon && (
          <span className="flex items-center shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
