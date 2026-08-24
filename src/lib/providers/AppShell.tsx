"use client";

import { usePathname } from "next/navigation";
import ProtectedRoute from "./ProtectedRoute";
import { PageTitleProvider } from "./page_title";
import { DashboardShell } from "@/components/layout/DashboardLayout";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/auth/")) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute>
      <PageTitleProvider>
        <DashboardShell>{children}</DashboardShell>
      </PageTitleProvider>
    </ProtectedRoute>
  );
}
