import React from "react";
import Link from "next/link";
import { cn } from "@/lib/tokens";


interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5", className)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <svg width="6" height="10" viewBox="0 0 6 10" fill="none" className="text-[#E7E9EB] shrink-0">
                <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {isLast || !item.href ? (
              <span className={cn("text-sm", isLast ? "font-medium text-black" : "text-[#717171]")}>
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="text-sm text-[#717171] hover:text-black transition-colors">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}


interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, breadcrumb, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", className)}>
      <div>
        {breadcrumb && <Breadcrumb items={breadcrumb} className="mb-1.5" />}
        <h1 className="text-2xl font-semibold text-black">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[#717171]">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
