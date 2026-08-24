import { ApiResponse } from "@/lib/network/entity/api_response";

export interface AnalyticsData {
  courses?: number;
  enrollment?: number;
  instructors?: number;
  students?: number;
}

export type AnalyticsApiResponse = ApiResponse<AnalyticsData>;

export type MonthlyRevenueEntry =
  | number
  | { month?: number; revenue?: number; total?: number; amount?: number };

export interface MonthlyRevenueData {
  totals: number[];
}

export type MonthlyRevenueApiResponse = ApiResponse<MonthlyRevenueData>;
