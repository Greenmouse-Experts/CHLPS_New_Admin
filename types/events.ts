/**
 * CHLPS Admin Portal - Events, Event Categories, Registrations & Invitations Types
 * Endpoints: /api/v1/events/*, /api/v1/event-categories/*
 */

import { BaseEntity, PaginationQueryDto } from "./common";

export type EventFormat = "physical" | "virtual" | "hybrid";
export type EventEligibility = "all" | "members_only" | "paid_only";
export type EventCurrency = "NGN" | "USD" | "GBP" | "EUR" | "CAD";
export type EventStatus = "draft" | "published" | "cancelled" | "completed";

export interface EventCategory extends BaseEntity {
  name: string;
  isPublished?: boolean;
}

export interface CreateEventCategoryDto {
  name: string;
  isPublished?: boolean;
}

export interface EventItem extends BaseEntity {
  name: string;
  slug?: string;
  description: string;
  category?: EventCategory | string;
  categoryId?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  format: EventFormat;
  registrationRequired: boolean;
  eligibility: EventEligibility;
  price: number;
  currency: EventCurrency;
  organizerName: string;
  contactEmail: string;
  contactPhone?: string | null;
  status: EventStatus;
  image?: string | null;
  meetingLink?: string | null;
  location?: string | null;
  registrationOpens?: string | null;
  registrationCloses?: string | null;
  maximumAttendees?: number | null;
  maxAttendees?: number | null; // Frontend alias compatibility
  requiredMembershipIds?: string[];
  totalRegistrations?: number;
  totalCheckedIn?: number;
}

export interface CreateEventDto {
  name: string;
  description: string;
  categoryId?: string;
  category?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  format: EventFormat;
  registrationRequired: boolean;
  eligibility: EventEligibility;
  price: number;
  currency: EventCurrency;
  organizerName: string;
  contactEmail: string;
  contactPhone?: string | null;
  status: EventStatus;
  image?: string | null;
  meetingLink?: string | null;
  location?: string | null;
  registrationOpens?: string | null;
  registrationCloses?: string | null;
  maximumAttendees?: number | null;
  requiredMembershipIds?: string[];
}

export type UpdateEventDto = Partial<CreateEventDto>;

export interface UpdateEventStatusDto {
  status: EventStatus;
}

export interface EventStatsResponse {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalRegistrations: number;
}

/* Event Registrations & Attendees */

export interface EventRegistration extends BaseEntity {
  event: EventItem | string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  registrationNumber?: string;
  status: "confirmed" | "cancelled" | "pending";
  checkedIn: boolean;
  checkedInAt?: string | null;
  amountPaid?: number;
}

export interface EventCheckInDto {
  code: string;
}

/* Event Invitations */

export interface EventInvitation extends BaseEntity {
  event: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  token: string;
  status: "pending" | "accepted" | "declined" | "expired";
  expiresAt?: string;
}

export interface EventBulkInviteDto {
  userIds: string[];
}

export interface EventsQueryDto extends PaginationQueryDto {
  name?: string;
  status?: EventStatus;
  format?: EventFormat;
  categoryId?: string;
}
