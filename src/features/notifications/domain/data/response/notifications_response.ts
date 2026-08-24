import { ApiResponse } from "@/lib/network/entity/api_response";

export interface AppNotification {
  id: string;
  title?: string;
  body?: string;
  read?: boolean;
  createdDate?: string;
}

export type NotificationsApiResponse = ApiResponse<{ items: AppNotification[]; count: number }>;
