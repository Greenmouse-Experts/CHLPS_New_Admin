"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const usePagination = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;

  const setPagination = useCallback(
    (newPage: number, newPageSize?: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(newPage));
      params.set("pageSize", String(newPageSize ?? pageSize));
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams, pageSize],
  );

  return {
    page,
    pageSize,
    setPagination,
  };
};
