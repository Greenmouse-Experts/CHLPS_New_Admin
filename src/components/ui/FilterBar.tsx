"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Search, X } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  badgeVariant?: "default" | "success" | "warning" | "danger";
}

export interface FilterTabConfig {
  key: string;
  options: FilterOption[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export interface FilterDropdownConfig {
  key: string;
  label?: string;
  options: FilterOption[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export interface FilterBarProps {
  /** Optional status / category pills */
  statusTabs?: FilterTabConfig;
  /** Optional additional dropdown filters */
  dropdowns?: FilterDropdownConfig[];
  /** Search query state & handler */
  search?: {
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
    debounceMs?: number;
  };
  /** Additional action button or element on the right */
  rightElement?: React.ReactNode;
  /** Custom container class */
  className?: string;
  /** Loading indicator */
  isLoading?: boolean;
}

export function FilterBar({
  statusTabs,
  dropdowns,
  search,
  rightElement,
  className = "",
  isLoading = false,
}: FilterBarProps) {
  const [internalSearch, setInternalSearch] = useState(search?.value ?? "");
  const [, startTransition] = useTransition();

  // Sync internal search if outer search changes
  useEffect(() => {
    if (search && search.value !== internalSearch) {
      setInternalSearch(search.value);
    }
  }, [search?.value]);

  // Debounced search trigger
  useEffect(() => {
    if (!search) return;
    const timer = setTimeout(() => {
      if (internalSearch !== search.value) {
        startTransition(() => {
          search.onChange(internalSearch);
        });
      }
    }, search.debounceMs ?? 350);

    return () => clearTimeout(timer);
  }, [internalSearch, search]);

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
        {/* Status Pill Tabs */}
        {statusTabs && statusTabs.options.length > 0 && (
          <div className="inline-flex items-center gap-1 p-1 bg-base-200/70 rounded-lg shrink-0">
            {statusTabs.options.map((opt) => {
              const isSelected = statusTabs.selectedValue === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => statusTabs.onChange(opt.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-white text-base-content shadow-xs"
                      : "text-base-content/60 hover:text-base-content"
                  }`}
                >
                  <span>{opt.label}</span>
                  {opt.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-normal ${
                        isSelected
                          ? opt.badgeVariant === "success"
                            ? "bg-emerald-100 text-emerald-800"
                            : opt.badgeVariant === "warning"
                            ? "bg-amber-100 text-amber-800"
                            : opt.badgeVariant === "danger"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-base-200 text-base-content"
                          : "bg-base-300/60 text-base-content/60"
                      }`}
                    >
                      {opt.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Dropdowns */}
        {dropdowns &&
          dropdowns.map((dd) => (
            <div key={dd.key} className="flex items-center gap-1.5">
              {dd.label && (
                <label className="text-xs font-semibold text-base-content/70">
                  {dd.label}:
                </label>
              )}
              <select
                value={dd.selectedValue}
                onChange={(e) => dd.onChange(e.target.value)}
                className="h-9 px-3 text-xs bg-white rounded-lg border border-[#E7E9EB] text-base-content focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                {dd.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} {opt.count !== undefined ? `(${opt.count})` : ""}
                  </option>
                ))}
              </select>
            </div>
          ))}

        {/* Search Input */}
        {search && (
          <div className="relative flex items-center border border-[#E7E9EB] rounded-lg px-3 h-9 bg-white w-64 max-w-full focus-within:border-primary transition-colors">
            <Search
              size={15}
              className={`shrink-0 ${
                isLoading ? "animate-spin text-primary" : "text-secondary"
              }`}
            />
            <input
              type="text"
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              placeholder={search.placeholder || "Search..."}
              className="flex-1 text-xs outline-none focus:outline-none focus-visible:outline-none ring-0 bg-transparent placeholder-[#ADADAD] ml-2"
            />
            {internalSearch && (
              <button
                type="button"
                onClick={() => {
                  setInternalSearch("");
                  search.onChange("");
                }}
                className="text-base-content/40 hover:text-base-content transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right Element (e.g. actions, export, filters) */}
      {rightElement && (
        <div className="flex items-center gap-2 shrink-0">{rightElement}</div>
      )}
    </div>
  );
}
