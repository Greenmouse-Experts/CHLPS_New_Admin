/**
 * CHLPS Admin Portal - Admin & Sub-Admin Notifications Types
 * Endpoints: /api/v1/notifications/*
 */

import { BaseEntity, PaginationQueryDto } from "./common";

export type NotificationAudience = "admin" | "subadmin" | "instructor" | "student";

export interface NotificationItem extends BaseEntity {
  title: string;
  message: string;
  type?: string;
  audience: NotificationAudience;
  isRead: boolean;
  readAt?: string | null;
  link?: string | null;
  metadata?: Record<string, unknown>;
}

export interface NotificationsQueryDto extends PaginationQueryDto {
  isRead?: boolean;
}
