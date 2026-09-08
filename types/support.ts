/**
 * CHLPS Admin Portal - Support & Contact Inquiries Types
 * Endpoints: /api/v1/contact-me/*
 */

import { BaseEntity, PaginationQueryDto } from "./common";

export interface ContactMessage extends BaseEntity {
  firstName: string;
  lastName: string;
  name?: string; // Fallback concatenation
  email: string;
  phone?: string;
  message: string;
  interestedIn?: string;
  isRead: boolean;
  readAt?: string | null;
}

export interface SupportQueryDto extends PaginationQueryDto {
  isRead?: boolean;
}
