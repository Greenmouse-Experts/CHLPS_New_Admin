import { ApiResponse } from "@/lib/network/entity/api_response";

export interface Faq {
  id: string;
  question: string;
  answer: string;
  isPublished?: boolean;
  createdDate?: string;
}

export type FaqsApiResponse = ApiResponse<{ items: Faq[]; count: number }>;
