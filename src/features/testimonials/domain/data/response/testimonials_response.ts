import { ApiResponse } from "@/lib/network/entity/api_response";

export interface TestimonialUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  picture?: string;
  role?: string;
}

export interface Testimonial {
  id: string;
  testimony: string;
  rating?: number;
  displayName?: string;
  photoUrl?: string;
  jobTitle?: string;
  organization?: string;
  location?: string;
  isPublished?: boolean;
  user?: TestimonialUser | null;
  createdDate?: string;
  updatedDate?: string;
}

export interface TestimonialPayload {
  testimony: string;
  rating?: number;
  displayName?: string;
  photoUrl?: string;
  jobTitle?: string;
  organization?: string;
  location?: string;
  isPublished?: boolean;
}

export type TestimonialsApiResponse = ApiResponse<{ items: Testimonial[]; count: number }>;
