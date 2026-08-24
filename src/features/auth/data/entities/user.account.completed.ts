import { ApiResponse } from "@/lib/network/entity/api_response";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  picture?: string | null;
  role: string;
}

export interface LoginRawResponse {
  accessToken?: string;
  message?: string;
  data?: AuthUser;
}

export interface LoginData {
  accessToken: string;
  user: AuthUser;
}

export type LoginAccountResponse = ApiResponse<LoginData>;

export type MessageApiResponse = ApiResponse<null>;
