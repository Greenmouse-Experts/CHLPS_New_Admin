/**
 * CHLPS Admin Portal - Testimonials Types
 * Endpoints: /api/v1/testimonials/*
 */

import { BaseEntity, PaginationQueryDto } from "./common";

export interface TestimonialItem extends BaseEntity {
  name: string;
  role?: string;
  avatar?: string;
  testimony: string;
  rating?: number;
  isPublished: boolean;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    picture?: string;
  };
}

export interface CreateTestimonialDto {
  testimony: string;
  rating?: number;
  name?: string;
  role?: string;
  avatar?: string;
}

export interface UpdateTestimonialAvailabilityDto {
  isPublished: boolean;
}

export interface TestimonialsQueryDto extends PaginationQueryDto {
  isPublished?: boolean;
}
