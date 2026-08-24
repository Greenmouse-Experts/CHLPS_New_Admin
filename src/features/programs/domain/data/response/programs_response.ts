import { ApiResponse } from "@/lib/network/entity/api_response";

export interface Program {
  id: string;
  title: string;
  coverImage?: string | null;
  isPublished?: boolean;
  createdDate?: string;
}

export type ProgramsApiResponse = ApiResponse<Program[]>;

export interface CreateProgramPayload {
  title: string;
  coverImage?: string | null;
}

export interface UpdateProgramPayload {
  title?: string;
  coverImage?: string | null;
  isPublished?: boolean;
}
