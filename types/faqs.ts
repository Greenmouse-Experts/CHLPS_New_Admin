/**
 * CHLPS Admin Portal - FAQs Management Types
 * Endpoints: /api/v1/faqs/*
 */

import { BaseEntity, PaginationQueryDto } from "./common";

export interface FaqItem extends BaseEntity {
  question: string;
  answer: string;
  order: number;
  isPublished: boolean;
  category?: string;
}

export interface CreateFaqDto {
  question: string;
  answer: string;
  order?: number;
}

export type UpdateFaqDto = Partial<CreateFaqDto>;

export interface PublishFaqDto {
  isPublished: boolean;
}

export interface BulkPublishFaqsDto {
  ids: string[];
  isPublished: boolean;
}

export interface FaqsQueryDto extends PaginationQueryDto {
  isPublished?: boolean;
}
