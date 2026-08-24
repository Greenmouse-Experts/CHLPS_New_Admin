"use client";
import { cn } from "@/lib/tokens";

interface ShimmerProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

export function Shimmer({ className, rounded = "md" }: ShimmerProps) {
  const roundedMap = {
    sm: "rounded",
    md: "rounded-lg",
    lg: "rounded-xl",
    full: "rounded-full",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[#F1F1F1]",
        roundedMap[rounded],
        className,
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/70 to-transparent" />
    </div>
  );
}

export function TotalUsersCardShimmer() {
  return (
    <div className="bg-white rounded-lg border border-[#E7E9EB] overflow-hidden flex flex-col flex-1 min-w-0">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <Shimmer className="h-3.5 w-24" />
        <Shimmer className="h-9 w-32" rounded="lg" />
      </div>

      <div className="px-3 pt-2" style={{ minHeight: 100, maxHeight: 120 }}>
        <div className="relative h-27.5 w-full overflow-hidden rounded-md">
          <div className="absolute inset-0 flex flex-col justify-between py-3 pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Shimmer className="h-2.5 w-5 shrink-0" rounded="sm" />
                <div className="flex-1 h-px bg-[#F1F1F1]" />
              </div>
            ))}
          </div>

          <svg
            className="absolute inset-0 w-full h-full opacity-30"
            preserveAspectRatio="none"
            viewBox="0 0 400 110"
          >
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E7E9EB" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#E7E9EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path
              d="M0 80 C50 70, 80 40, 130 50 S200 30, 250 45 S320 60, 400 30 L400 110 L0 110 Z"
              fill="url(#sg)"
            />
            <path
              d="M0 80 C50 70, 80 40, 130 50 S200 30, 250 45 S320 60, 400 30"
              fill="none"
              stroke="#E7E9EB"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      <div className="px-5 pb-4 pt-2 flex items-end justify-between">
        <Shimmer className="h-8 w-28" />
        <Shimmer className="h-4 w-10" rounded="sm" />
      </div>
    </div>
  );
}

export function StatCardShimmer() {
  return (
    <div className="flex-1 min-w-0 p-5 bg-white rounded-2xl border border-[#F0F0F0]">
      <div className="flex items-start justify-between">
        <Shimmer className="h-3 w-24" rounded="sm" />
        <Shimmer className="h-4.5 w-4.5" rounded="full" />
      </div>
      <Shimmer className="h-7 w-16 mt-4" rounded="sm" />
    </div>
  );
}

export function CardShimmer({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg border border-[#E7E9EB] p-5 space-y-3 w-full">
      <Shimmer className="h-4 w-32" />
      {[...Array(rows)].map((_, i) => (
        <Shimmer key={i} className="h-3.5 w-full" rounded="sm" />
      ))}
    </div>
  );
}

export function TableRowShimmer({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-[#E7E9EB]">
      {[...Array(cols)].map((_, i) => (
        <Shimmer
          key={i}
          className={cn("h-3.5", i === 0 ? "w-32" : "flex-1")}
          rounded="sm"
        />
      ))}
    </div>
  );
}

export function GiftcardsTableShimmer({ rows = 8 }: { rows?: number }) {
  return (
    <div className="w-full">
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3.5 border-b border-[#F0F0F0]"
        >
          {/* checkbox */}
          <Shimmer className="h-4 w-4 shrink-0" rounded="sm" />
          {/* avatar + name */}
          <div className="flex items-center gap-3 w-52 shrink-0">
            <Shimmer className="h-8 w-8 shrink-0" rounded="lg" />
            <Shimmer className="h-3.5 flex-1" rounded="sm" />
          </div>
          {/* type badges */}
          <div className="flex items-center gap-2 flex-1">
            <Shimmer className="h-5 w-14" rounded="sm" />
            <Shimmer className="h-5 w-16" rounded="sm" />
          </div>
          {/* status */}
          <Shimmer className="h-3.5 w-16" rounded="sm" />
          {/* action menu */}
          <Shimmer className="h-5 w-5 shrink-0" rounded="sm" />
        </div>
      ))}
    </div>
  );
}

export function CurrenciesTableShimmer({ rows = 10 }: { rows?: number }) {
  return (
    <div className="w-full">
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3.5 border-b border-[#F0F0F0]"
        >
          {/* checkbox */}
          <Shimmer className="h-4 w-4 shrink-0" rounded="sm" />
          {/* avatar + name */}
          <div className="flex items-center gap-3 flex-1">
            <Shimmer className="h-8 w-8 shrink-0" rounded="full" />
            <Shimmer className="h-3.5 w-28" rounded="sm" />
          </div>
          {/* symbol */}
          <Shimmer className="h-3.5 w-12" rounded="sm" />
          {/* date */}
          <Shimmer className="h-3.5 w-32" rounded="sm" />
          {/* action */}
          <Shimmer className="h-5 w-5 shrink-0" rounded="sm" />
        </div>
      ))}
    </div>
  );
}

export function UsersTableShimmer({ rows = 10 }: { rows?: number }) {
  return (
    <div className="w-full">
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3.5 border-b border-[#F0F0F0]"
        >
          <Shimmer className="h-4 w-4 shrink-0" rounded="sm" />
          <div className="flex items-center gap-3 w-44 shrink-0">
            <Shimmer className="h-8 w-8 shrink-0" rounded="full" />
            <Shimmer className="h-3.5 flex-1" rounded="sm" />
          </div>
          <Shimmer className="h-3.5 flex-1" rounded="sm" />
          <Shimmer className="h-3.5 w-24 shrink-0" rounded="sm" />
          <Shimmer className="h-5 w-12 shrink-0" rounded="sm" />
          <Shimmer className="h-5 w-16 shrink-0" rounded="sm" />
          <Shimmer className="h-3.5 w-24 shrink-0" rounded="sm" />
          <Shimmer className="h-5 w-5 shrink-0" rounded="sm" />
        </div>
      ))}
    </div>
  );
}

export function AdsGridShimmer({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <Shimmer className="h-3 w-20" rounded="sm" />
            <Shimmer className="h-4 w-4" rounded="sm" />
          </div>
          <div className="mx-3 mb-3 rounded-xl overflow-hidden">
            <Shimmer className="w-full aspect-video" rounded="lg" />
          </div>
          <div className="px-4 pb-4 space-y-2">
            <Shimmer className="h-3.5 w-3/4" rounded="sm" />
            <Shimmer className="h-3 w-1/2" rounded="sm" />
            <div className="flex gap-2 pt-1">
              <Shimmer className="h-5 w-14" rounded="sm" />
              <Shimmer className="h-5 w-14" rounded="sm" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminsTableShimmer({ rows = 10 }: { rows?: number }) {
  return (
    <div className="w-full">
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3.5 border-b border-[#F0F0F0]"
        >
          <Shimmer className="h-4 w-4 shrink-0" rounded="sm" />
          <div className="flex items-center gap-3 w-44 shrink-0">
            <Shimmer className="h-8 w-8 shrink-0" rounded="full" />
            <Shimmer className="h-3.5 flex-1" rounded="sm" />
          </div>
          <Shimmer className="h-3.5 flex-1" rounded="sm" />
          <Shimmer className="h-3.5 w-28 shrink-0" rounded="sm" />
          <Shimmer className="h-5 w-20 shrink-0" rounded="sm" />
          <Shimmer className="h-5 w-16 shrink-0" rounded="sm" />
          <Shimmer className="h-5 w-5 shrink-0" rounded="sm" />
        </div>
      ))}
    </div>
  );
}

