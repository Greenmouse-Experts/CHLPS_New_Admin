"use client";

import React, { useState } from "react";
import { cn } from "@/lib/tokens";

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeKey?: string;
  onChange?: (key: string) => void;
  variant?: "line" | "pill";
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
}

const sizeMap = {
  sm: "text-xs gap-1 h-8 px-3",
  md: "text-sm gap-1.5 h-9 px-4",
  lg: "text-base gap-2 h-10 px-5",
};

export function Tabs({
  tabs,
  activeKey,
  onChange,
  variant = "line",
  size = "md",
  className,
}: TabsProps) {
  const [internal, setInternal] = useState(tabs[0]?.key ?? "");
  const current = activeKey ?? internal;

  const handleChange = (key: string) => {
    setInternal(key);
    onChange?.(key);
  };

  if (variant === "pill") {
    return (
      <div className={cn("flex items-center gap-1 bg-[#F1F1F1] rounded-lg p-1", className)}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            disabled={tab.disabled}
            onClick={() => !tab.disabled && handleChange(tab.key)}
            className={cn(
              "flex items-center rounded-md font-medium transition-all duration-150",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              sizeMap[size],
              current === tab.key
                ? "bg-white text-black shadow-sm"
                : "text-[#717171] hover:text-black"
            )}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && (
              <span className={cn(
                "ml-1 rounded-full text-2xs px-1.5 font-semibold",
                current === tab.key ? "bg-black text-white" : "bg-[#E7E9EB] text-[#717171]"
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

 
  return (
    <div className={cn("flex items-center border-b border-[#E7E9EB]", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          disabled={tab.disabled}
          onClick={() => !tab.disabled && handleChange(tab.key)}
          className={cn(
            "relative flex items-center font-medium transition-colors duration-150",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            sizeMap[size],
            current === tab.key
              ? "text-black"
              : "text-[#717171] hover:text-black"
          )}
        >
          {tab.icon && <span>{tab.icon}</span>}
          {tab.label}
          {tab.badge !== undefined && (
            <span className="ml-1.5 rounded-full text-2xs px-1.5 bg-black text-white font-semibold">
              {tab.badge}
            </span>
          )}
          {/* Active underline */}
          {current === tab.key && (
            <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-black rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  );
}


interface TabPanelProps {
  tabKey: string;
  activeKey: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ tabKey, activeKey, children, className }: TabPanelProps) {
  if (tabKey !== activeKey) return null;
  return <div className={className}>{children}</div>;
}
