import ApiService from "@/lib/network/api";
import { ApiUrls } from "@/lib/network/api_url";
import { fail, ok } from "@/lib/network/entity/api_response";
import { unwrapEntity } from "@/lib/tokens";
import {
  AnalyticsApiResponse,
  AnalyticsData,
  MonthlyRevenueApiResponse,
  MonthlyRevenueEntry,
} from "../data/response/dashboard_response";

function buildMonthlyTotals(payload: unknown): number[] {
  const totals = new Array(12).fill(0);
  const entries = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && "data" in payload
      ? (payload as { data: MonthlyRevenueEntry[] }).data
      : null;

  if (!Array.isArray(entries)) return totals;

  entries.forEach((entry, index) => {
    if (typeof entry === "number") {
      totals[index] = entry;
      return;
    }
    const month = entry?.month ?? index + 1;
    const value = entry?.revenue ?? entry?.total ?? entry?.amount ?? 0;
    if (month >= 1 && month <= 12) totals[month - 1] = value;
  });

  return totals;
}

class DashboardRepository {
  private _api = new ApiService();

  public async getAnalytics(): Promise<AnalyticsApiResponse> {
    const res = await this._api.getData<AnalyticsData>(ApiUrls.adminAnalytics);
    if (res.success && res.data) {
      return ok(unwrapEntity<AnalyticsData>(res.data) ?? res.data, "Analytics loaded");
    }
    return fail(res.message || "Failed to load analytics");
  }

  public async getMonthlyRevenue(
    year: number,
  ): Promise<MonthlyRevenueApiResponse> {
    const res = await this._api.getData<unknown>(ApiUrls.monthlyRevenue, {
      year,
    });
    if (res.success) {
      return ok({ totals: buildMonthlyTotals(res.data) });
    }
    return fail(res.message || "Failed to load revenue");
  }
}

export default DashboardRepository;
