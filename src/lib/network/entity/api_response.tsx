export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T | null;
}

export function ok<T>(data: T, message = "OK"): ApiResponse<T> {
  return { success: true, status: 200, message, data };
}

export function fail<T = null>(message: string, status = 400): ApiResponse<T> {
  return { success: false, status, message, data: null as T };
}