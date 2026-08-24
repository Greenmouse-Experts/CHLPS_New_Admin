import { ApiResponse } from "@/lib/network/entity/api_response";

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  picture?: string | null;
  createdDate?: string;
  isActive?: boolean;
  isSuspended?: boolean;
  role?: string;
  address?: string | null;
  linkedinUrl?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  bio?: string | null;
}

export type PeopleApiResponse = ApiResponse<Person[]>;
export type PersonApiResponse = ApiResponse<Person>;

export interface CreateAdminPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  confirmPassword: string;
}
