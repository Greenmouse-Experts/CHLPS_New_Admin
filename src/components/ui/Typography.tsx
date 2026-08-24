import React, { JSX } from "react";
import { cn } from "@/lib/tokens";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  muted?: boolean;
  truncate?: boolean;
}

const headingSizeMap = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
};

const weightMap = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const defaultSizeByLevel: Record<HeadingLevel, HeadingProps["size"]> = {
  1: "4xl",
  2: "3xl",
  3: "2xl",
  4: "xl",
  5: "lg",
  6: "md",
};

function Heading({
  level = 2,
  size,
  weight = "semibold",
  muted = false,
  truncate = false,
  className,
  children,
  ...props
}: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const resolvedSize = size ?? defaultSizeByLevel[level] ?? "md";

  return (
    <Tag
      className={cn(
        headingSizeMap[resolvedSize],
        weightMap[weight],
        muted ? "text-[#717171]" : "text-black",
        truncate && "truncate",
        className,
      )}
      {...(props as any)}
    >
      {children}
    </Tag>
  );
}

// ─── Text ─────────────────────────────────────────────────────────────────────

type TextSize = "2xs" | "xs" | "sm" | "md" | "base" | "lg";
type TextColor =
  | "default"
  | "muted"
  | "success"
  | "danger"
  | "warning"
  | "white";

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: "p" | "span" | "div" | "label" | "small" | "strong" | "em";
  size?: TextSize;
  color?: TextColor;
  weight?: "normal" | "medium" | "semibold" | "bold";
  truncate?: boolean;
  lineClamp?: 1 | 2 | 3;
}

const textSizeMap: Record<TextSize, string> = {
  "2xs": "text-2xs",
  xs: "text-xs",
  sm: "text-sm",
  md: "text-md",
  base: "text-base",
  lg: "text-lg",
};

const textColorMap: Record<TextColor, string> = {
  default: "text-black",
  muted: "text-[#717171]",
  success: "text-[#166534]",
  danger: "text-[#991B1B]",
  warning: "text-[#854D0E]",
  white: "text-white",
};

const lineClampMap = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
};

function Text({
  as: Tag = "p",
  size = "base",
  color = "default",
  weight = "normal",
  truncate = false,
  lineClamp,
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Tag
      className={cn(
        textSizeMap[size],
        textColorMap[color],
        weightMap[weight],
        truncate && "truncate",
        lineClamp && lineClampMap[lineClamp],
        className,
      )}
      {...(props as any)}
    >
      {children}
    </Tag>
  );
}

// ─── Label ────────────────────────────────────────────────────────────────────

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  size?: "xs" | "sm" | "md";
}

function Label({
  required,
  size = "sm",
  className,
  children,
  ...props
}: LabelProps) {
  const sizeClass = { xs: "text-xs", sm: "text-sm", md: "text-base" }[size];
  return (
    <label
      className={cn("font-medium text-black", sizeClass, className)}
      {...props}
    >
      {children}
      {required && (
        <span className="text-[#E84D52] ml-0.5" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

// ─── Caption ─────────────────────────────────────────────────────────────────

interface CaptionProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: TextColor;
}

function Caption({
  color = "muted",
  className,
  children,
  ...props
}: CaptionProps) {
  return (
    <span className={cn("text-xs", textColorMap[color], className)} {...props}>
      {children}
    </span>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div>
        <h2 className="text-lg font-semibold text-black">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-[#717171]">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

interface DividerProps {
  label?: string;
  className?: string;
}

function Divider({ label, className }: DividerProps) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex-1 h-px bg-[#E7E9EB]" />
        <span className="text-xs text-[#717171] whitespace-nowrap">
          {label}
        </span>
        <div className="flex-1 h-px bg-[#E7E9EB]" />
      </div>
    );
  }
  return <hr className={cn("border-t border-[#E7E9EB]", className)} />;
}

export { Heading, Text, Label, Caption, SectionHeader, Divider };
export type { HeadingProps, TextProps, LabelProps };
