/**
 * CHLPS Admin Portal - Events, Event Categories, Registrations & Invitations Types
 * Endpoints: /api/v1/events/*, /api/v1/event-categories/*
 */

import { BaseEntity, PaginationQueryDto } from "./common";

export type EventFormat = "Physical" | "Virtual" | "Hybrid";
export type EventEligibility =
  | "Everyone"
  | "Members Only"
  | "Specific Membership Type"
  | "Invitation Only";
export type EventCurrency = "CAD" | "NGN" | "USD" | "GBP" | "EUR";
export type EventStatus = "Draft" | "Published" | "Cancelled" | "Completed";

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
}

export interface CreateEventDto {
  name: string;
  description: string;
  categoryId: string;
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
  status?: EventStatus;
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

export interface EventFilterQueryDto extends PaginationQueryDto {
  categoryId?: string;
  format?: EventFormat;
  status?: EventStatus;
  eligibility?: EventEligibility;
}

export interface EventStats {
  totalEvents: number;
  totalThisMonth: number;
  amountPaid: number;
  upcomingEvents: number;
  completedEvents: number;
  totalRegistrations: number;
}

export interface EventRegistration extends BaseEntity {
  eventId: string;
  event?: EventItem;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: "pending" | "confirmed" | "cancelled" | "checked_in";
  ticketCode?: string;
  checkedInAt?: string | null;
  paymentReference?: string | null;
  amountPaid?: number;
}

export interface EventInvitation extends BaseEntity {
  eventId: string;
  event?: EventItem;
  email: string;
  status: "pending" | "accepted" | "declined" | "expired";
  token: string;
  invitedBy?: string;
}

export interface SendEventInvitationDto {
  email: string;
}
