import { ApiResponse } from "@/lib/network/entity/api_response";

export interface Program {
  id: string;
  title: string;
  description?: string;
  coverImage?: string | null;
  isPublished?: boolean;
  createdDate?: string;
  updatedDate?: string;
}

export type ProgramsApiResponse = ApiResponse<Program[]>;

export interface CreateProgramPayload {
  title: string;
  description?: string;
  coverImage?: string | null;
  isPublished?: boolean;
}

export interface UpdateProgramPayload {
  title?: string;
  description?: string;
  coverImage?: string | null;
  isPublished?: boolean;
}
