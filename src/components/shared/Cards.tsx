import React from "react";
import { cn } from "@/lib/tokens";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

function StatCard({
  title,
  value,
  change,
  icon,
  action,
  className,
  loading,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-[#E7E9EB] p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[#717171] uppercase tracking-wide truncate">
            {title}
          </p>

          {loading ? (
            <div className="mt-2 h-8 w-32 rounded skeleton" />
          ) : (
            <p className="mt-1.5 text-3xl font-bold text-black leading-none tracking-tight">
              {value}
            </p>
          )}

          {change && !loading && (
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-semibold",
                  change.direction === "up" && "text-[#38CB89]",
                  change.direction === "down" && "text-[#E84D52]",
                  change.direction === "neutral" && "text-[#717171]",
                )}
              >
                {change.direction === "up" && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M5 8V2M2 5l3-3 3 3"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {change.direction === "down" && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M5 2v6M2 5l3 3 3-3"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {change.value}
              </span>
            </div>
          )}
        </div>

        {(icon || action) && (
          <div className="shrink-0 flex flex-col items-end gap-2">
            {icon && (
              <div className="w-9 h-9 rounded-lg bg-[#F7F7F7] flex items-center justify-center text-[#717171]">
                {icon}
              </div>
            )}
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  value: number;
  color?: string;
  showPercent?: boolean;
}

function ProgressBar({
  label,
  value,
  color = "#000000",
  showPercent = true,
}: ProgressBarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-sm text-black truncate shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#F1F1F1] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }}
        />
      </div>
      {showPercent && (
        <span className="w-8 text-xs text-[#717171] text-right shrink-0">
          {value}%
        </span>
      )}
    </div>
  );
}

interface TrafficItem {
  label: string;
  value: number;
  total?: number;
  color?: string;
}

interface TrafficListProps {
  title: string;
  items: TrafficItem[];
  className?: string;
}

const TRAFFIC_COLORS = ["#000000", "#E84D52", "#38CB89", "#EED202", "#717171"];

function TrafficList({ title, items, className }: TrafficListProps) {
  const max = Math.max(...items.map((i) => i.value));

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-[#E7E9EB] p-5",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-black mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <ProgressBar
            key={item.label}
            label={item.label}
            value={Math.round((item.value / max) * 100)}
            color={item.color ?? TRAFFIC_COLORS[i % TRAFFIC_COLORS.length]}
          />
        ))}
      </div>
    </div>
  );
}

interface AvatarProps {
  name?: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const avatarSizes = {
  xs: "w-6 h-6 text-2xs",
  sm: "w-7 h-7 text-xs",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
  xl: "w-12 h-12 text-base",
};

function Avatar({ name = "", src, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover shrink-0",
          avatarSizes[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-black text-white font-semibold flex items-center justify-center shrink-0",
        avatarSizes[size],
        className,
      )}
    >
      {initials || "?"}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  illustration?: React.ReactNode;
  className?: string;
}

function EmptyState({
  title,
  description,
  action,
  illustration,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className,
      )}
    >
      {illustration && <div className="mb-5">{illustration}</div>}
      <h3 className="text-base font-semibold text-black">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-[#717171] max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

function Card({ padding = "md", className, children, ...props }: CardProps) {
  const paddingMap = { none: "", sm: "p-4", md: "p-5", lg: "p-6" };
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-[#E7E9EB]",
        paddingMap[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { StatCard, ProgressBar, TrafficList, Avatar, EmptyState, Card };
export type { StatCardProps, TrafficListProps, AvatarProps };
