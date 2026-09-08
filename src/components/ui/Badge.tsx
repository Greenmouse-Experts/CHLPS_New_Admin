"use client";

import React from "react";
import { cn, statusConfig, StatusVariant } from "@/lib/tokens";

interface StatusBadgeProps {
  status?: StatusVariant | string | null;
  size?: "xs" | "sm" | "md";
  showDot?: boolean;
  className?: string;
}

const StatusBadge = ({
  status,
  size = "sm",
  showDot = true,
  className,
}: StatusBadgeProps) => {
  const normalizedKey =
    typeof status === "string" ? status.toLowerCase().trim() : "";

  const config = (normalizedKey &&
    statusConfig[normalizedKey as StatusVariant]) || {
    label: status
      ? String(status)
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "Draft",
    dotColor: "#717171",
    textColor: "#374151",
    bgColor: "#F1F1F1",
  };

  const sizeStyles = {
    xs: "text-2xs px-1.5 py-0.5 gap-1",
    sm: "text-xs px-2 py-0.5 gap-1.5",
    md: "text-sm px-2.5 py-1 gap-1.5",
  };

  const dotSizes = {
    xs: "w-1 h-1",
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium whitespace-nowrap",
        sizeStyles[size],
        className,
      )}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
      }}
    >
      {showDot && (
        <span
          className={cn("rounded-full shrink-0", dotSizes[size])}
          style={{ backgroundColor: config.dotColor }}
        />
      )}
      {config.label}
    </span>
  );
};

interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: "default" | "danger" | "success" | "warning";
  size?: "xs" | "sm" | "md";
  className?: string;
}

const variantStyles = {
  default: "bg-black text-white",
  danger: "bg-[#E84D52] text-white",
  success: "bg-[#38CB89] text-white",
  warning: "bg-[#EED202] text-black",
};

const CountBadge = ({
  count,
  max = 99,
  variant = "default",
  size = "sm",
  className,
}: CountBadgeProps) => {
  const displayed = count > max ? `${max}+` : count;

  const sizeStyles = {
    xs: "text-2xs h-4 min-w-4 px-1",
    sm: "text-xs h-5 min-w-5 px-1",
    md: "text-sm h-6 min-w-6 px-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {displayed}
    </span>
  );
};

interface TagProps {
  children: React.ReactNode;
  onRemove?: () => void;
  variant?: "default" | "outline";
  size?: "sm" | "md";
  className?: string;
}

const Tag = ({
  children,
  onRemove,
  variant = "default",
  size = "sm",
  className,
}: TagProps) => {
  const base = "inline-flex items-center gap-1 rounded-md font-medium";
  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };
  const variants = {
    default: "bg-[#F1F1F1] text-black",
    outline: "bg-white text-black border border-[#E7E9EB]",
  };

  return (
    <span className={cn(base, sizes[size], variants[variant], className)}>
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-[#717171] hover:text-black transition-colors ml-0.5"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M1 1l8 8M9 1L1 9"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

interface BannerProps {
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "danger";
  icon?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const bannerConfig = {
  info: { bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
  success: { bg: "#E8F8F1", text: "#166534", border: "#BBF7D0" },
  warning: { bg: "#FEFAE0", text: "#854D0E", border: "#FDE68A" },
  danger: { bg: "#FDF0F0", text: "#991B1B", border: "#FECACA" },
};

const Banner = ({
  children,
  variant = "info",
  icon,
  onDismiss,
  className,
}: BannerProps) => {
  const cfg = bannerConfig[variant];

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm border",
        className,
      )}
      style={{
        backgroundColor: cfg.bg,
        color: cfg.text,
        borderColor: cfg.border,
      }}
    >
      {icon && <span className="shrink-0 mt-0.5">{icon}</span>}
      <span className="flex-1 font-medium">{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export { StatusBadge, CountBadge, Tag, Banner };
export type { StatusBadgeProps, CountBadgeProps, TagProps, BannerProps };
