import { ApiResponse } from "@/lib/network/entity/api_response";

export interface ContactMessage {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  interestedIn?: string;
  message?: string;
  isRead?: boolean;
  createdDate?: string;
  createdAt?: string;
}

export type MessagesApiResponse = ApiResponse<ContactMessage[]>;
