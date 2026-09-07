import axios from "axios";
import { toast } from "sonner";
import { getUserFromDB } from "@/lib/storage/user_db";

export interface Pagination {
  hasMore: boolean;
  limit: number;
  nextCursor: string | null;
  total: number;
}

export interface ApiResponse<T = any> {
  message: string;
  data: T;
  statusCode: number;
  path: string;
  pagination: Pagination;
}

export interface ApiResponseV2<T = any> {
  message?: string;
  data: { data: T; pagination: Pagination } & { [key: string]: any };
  status: number;
  path: string;
}

export const new_url = process.env.NEXT_PUBLIC_BASE_URL ?? "";

const simpleApiClient = axios.create({
  baseURL: new_url,
  withCredentials: true,
});

simpleApiClient.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const users = await getUserFromDB();
    const token = users[0]?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

simpleApiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      toast.info("Session expired. Please log in again.", {
        duration: 1500,
      });
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  },
);

export default simpleApiClient;
