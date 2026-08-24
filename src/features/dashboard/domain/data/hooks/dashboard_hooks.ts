"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui";
import DashboardRepository from "../../repository/dashboard_repository";
import { AnalyticsData } from "../response/dashboard_response";

export function useDashboard() {
  const { toast } = useToast();
  const repo = new DashboardRepository();
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({});
  const [year, setYear] = useState(new Date().getFullYear());
  const [revenue, setRevenue] = useState<number[]>(new Array(12).fill(0));
  const [chartLoading, setChartLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await repo.getAnalytics();
      if (res.success && res.data) setAnalytics(res.data);
      else toast(res.message, "danger");
    } catch {
      toast("Failed to load dashboard", "danger");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRevenue = useCallback(async (y: number) => {
    try {
      setChartLoading(true);
      const res = await repo.getMonthlyRevenue(y);
      if (res.success && res.data) setRevenue(res.data.totals);
      else toast(res.message, "danger");
    } catch {
      toast("Failed to load revenue", "danger");
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchRevenue(year);
  }, [year, fetchRevenue]);

  return {
    isLoading,
    analytics,
    year,
    setYear,
    revenue,
    chartLoading,
  };
}
