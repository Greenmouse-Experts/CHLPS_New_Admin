import { ApiResponse } from "@/lib/network/entity/api_response";

export interface Testimonial {
  id: string;
  testimony?: string;
  isPublished?: boolean;
  user?: { firstName?: string; lastName?: string; email?: string; picture?: string };
}

export type TestimonialsApiResponse = ApiResponse<{ items: Testimonial[]; count: number }>;
