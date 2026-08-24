"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/tokens";
import { Button } from "./Button";
import { Checkbox } from "./FormControls";

export interface Column<T = any> {
  key: string;
  title: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: "left" | "center" | "right";
  className?: string;
}

export interface TableAction<T = any> {
  label: string;
  onClick: (row: T) => void;
  variant?: "default" | "danger";
  icon?: React.ReactNode;
  hidden?: (row: T) => boolean;
}

export interface DataTableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  loading?: boolean;
  selectable?: boolean;
  selectedKeys?: (string | number)[];
  onSelectionChange?: (keys: (string | number)[]) => void;
  actions?: TableAction<T>[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onChange: (page: number) => void;
  };
  onFilter?: () => void;
  onExport?: () => void;
  title?: string;
  subtitle?: string;
  emptyText?: string;
  className?: string;
}

function EmptyState({ text }: { text: string }) {
  return (
    <tr>
      <td colSpan={100} className="py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F1F1F1] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 1v16M1 9h16"
                stroke="#717171"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity=".4"
              />
            </svg>
          </div>
          <p className="text-sm text-[#717171]">{text}</p>
        </div>
      </td>
    </tr>
  );
}

function LoadingRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-[#F1F1F1]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-4 rounded skeleton"
            style={{ width: `${60 + Math.random() * 40}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const pages = useMemo(() => {
    const arr: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        arr.push(i);
      } else if (arr[arr.length - 1] !== "...") {
        arr.push("...");
      }
    }
    return arr;
  }, [page, totalPages]);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#E7E9EB]">
      <span className="text-xs text-[#717171]">
        {Math.min((page - 1) * pageSize + 1, total)}–
        {Math.min(page * pageSize, total)} of {total}
      </span>

      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="w-7 h-7 rounded-md flex items-center justify-center text-[#717171] hover:bg-[#F7F7F7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path
              d="M6 1L1 6l5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`e-${i}`}
              className="w-7 h-7 flex items-center justify-center text-xs text-[#717171]"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center text-xs font-medium transition-colors",
                page === p
                  ? "bg-primary text-white"
                  : "text-[#717171] hover:bg-[#F7F7F7]",
              )}
            >
              {p}
            </button>
          ),
        )}

        <button
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="w-7 h-7 rounded-md flex items-center justify-center text-[#717171] hover:bg-[#F7F7F7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path
              d="M1 1l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Three-dot Action Menu ────────────────────────────────────────────────────

function ActionMenu<T>({
  row,
  actions,
}: {
  row: T;
  actions: TableAction<T>[];
}) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 rounded-md flex items-center justify-center text-[#717171] hover:bg-[#F1F1F1] transition-colors"
      >
        <svg width="14" height="4" viewBox="0 0 14 4" fill="none">
          <circle cx="2" cy="2" r="1.5" fill="currentColor" />
          <circle cx="7" cy="2" r="1.5" fill="currentColor" />
          <circle cx="12" cy="2" r="1.5" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 bg-white border border-[#E7E9EB] rounded-lg shadow-lg overflow-hidden animate-fadeIn">
          {actions.map((action) => {
              if (action.hidden?.(row)) return null;
              return (
            <button
              key={action.label}
              onClick={() => {
                action.onClick(row);
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm flex items-center gap-2",
                "hover:bg-[#F7F7F7] transition-colors",
                action.variant === "danger" ? "text-[#E84D52]" : "text-black",
              )}
            >
              {action.icon && <span>{action.icon}</span>}
              {action.label}
            </button>
              );
            })}
        </div>
      )}
    </div>
  );
}

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField = "id",
  loading = false,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  actions,
  pagination,
  onFilter,
  onExport,
  title,
  subtitle,
  emptyText = "No data found",
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const allKeys = data.map((row) => row[keyField]);
  const allSelected =
    allKeys.length > 0 && allKeys.every((k) => selectedKeys.includes(k));
  const someSelected = selectedKeys.length > 0 && !allSelected;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleAll = () => {
    if (allSelected) onSelectionChange?.([]);
    else onSelectionChange?.(allKeys);
  };

  const toggleRow = (key: string | number) => {
    if (selectedKeys.includes(key)) {
      onSelectionChange?.(selectedKeys.filter((k) => k !== key));
    } else {
      onSelectionChange?.([...selectedKeys, key]);
    }
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-[#E7E9EB] overflow-hidden",
        className,
      )}
    >
      {(title || onFilter || onExport) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E7E9EB]">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-black uppercase tracking-wide">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#717171] mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={onFilter}
                leftIcon={
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M1 3h12M3 7h8M5 11h4"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                }
              >
                Filter
              </Button>
            )}
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                leftIcon={
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M7 1v8M4 6l3 3 3-3M2 11h10"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              >
                Export
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-[#E7E9EB] bg-[#FAFAFA]">
              {selectable && (
                <th className="w-10 pl-4 pr-2 py-3">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                    size="sm"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold text-[#717171] whitespace-nowrap",
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                        ? "text-right"
                        : "text-left",
                    col.sortable &&
                      "cursor-pointer hover:text-black select-none",
                    col.className,
                  )}
                  style={{ width: col.width }}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.title}
                    {col.sortable && (
                      <span
                        className={cn(
                          "transition-colors",
                          sortKey === col.key ? "text-black" : "text-[#E7E9EB]",
                        )}
                      >
                        {sortKey === col.key && sortDir === "desc" ? "↓" : "↑"}
                      </span>
                    )}
                  </span>
                </th>
              ))}
              {actions && <th className="w-12 px-4 py-3" />}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <LoadingRow
                  key={i}
                  cols={
                    columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)
                  }
                />
              ))
            ) : data.length === 0 ? (
              <EmptyState text={emptyText} />
            ) : (
              data.map((row, index) => {
                const key = row[keyField];
                const isSelected = selectedKeys.includes(key);

                return (
                  <tr
                    key={key ?? index}
                    className={cn(
                      "border-b border-[#F7F7F7] last:border-0",
                      "hover:bg-[#FAFAFA] transition-colors",
                      isSelected && "bg-[#F7F7F7]",
                    )}
                  >
                    {selectable && (
                      <td className="w-10 pl-4 pr-2 py-3">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleRow(key)}
                          size="sm"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-3 text-sm text-black",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right",
                          col.className,
                        )}
                      >
                        {col.render
                          ? col.render(row[col.key], row, index)
                          : row[col.key]}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-3 py-3 text-right">
                        <ActionMenu row={row} actions={actions} />
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && <Pagination {...pagination} />}
    </div>
  );
}

export { DataTable, Pagination };
