/**
 * CHLPS Admin Portal - Memberships, Membership Types & Subscriptions Types
 * Endpoints: /api/v1/memberships/*, /api/v1/membership-types/*, /api/v1/student-memberships/*
 */

import { BaseEntity, PaginationQueryDto } from "./common";

export type MembershipCurrency = "NGN" | "USD" | "CAD" | "EUR" | "GBP";

export type MembershipDuration =
  | "Monthly"
  | "Quarterly"
  | "Bi-Annually"
  | "Annually"
  | "1 Year"
  | "2 Years"
  | "Lifetime";

export type RenewalPeriod =
  | "Monthly"
  | "Quarterly"
  | "Bi-Annually"
  | "Annually"
  | "1 Year";

export type MembershipStatus = "draft" | "published" | "closed" | "active" | "inactive";

export interface MembershipType extends BaseEntity {
  name: string;
  isPublished?: boolean;
}

export interface CreateMembershipTypeDto {
  name: string;
  isPublished?: boolean;
}

export interface JobOpportunityItem {
  id?: string;
  title: string;
  description: string;
  iconUrl?: string;
}

export interface HelpItem {
  id?: string;
  title: string;
  description: string;
  iconUrl?: string;
}

export interface WhyJoinNowCard {
  id?: string;
  title: string;
  description: string;
}

export interface WhyJoinNowSection {
  heading?: string;
  description?: string;
  highlights?: string[];
  infoCards?: WhyJoinNowCard[];
}

export interface Membership extends BaseEntity {
  name: string;
  slug?: string;
  description: string;
  type: string | MembershipType | { id: string; name: string };
  eligibilityCriteria: string[];
  price: number;
  currency: MembershipCurrency;
  duration: MembershipDuration;
  autoRenewal: boolean;
  renewalPrice?: number;
  renewalPeriod?: RenewalPeriod;
  benefits: string[];
  status: MembershipStatus;
  image?: string;
  requiredDocuments?: string[];
  jobOpportunities?: JobOpportunityItem[];
  howMembershipHelps?: HelpItem[];
  whyJoinNow?: WhyJoinNowSection;
  subscribersCount?: number;
  activeSubscribersCount?: number;
}

export interface CreateMembershipDto {
  name: string;
  description: string;
  type: string | { id?: string; name?: string };
  eligibilityCriteria: string[];
  price: number;
  currency: MembershipCurrency;
  duration: MembershipDuration;
  autoRenewal: boolean;
  renewalPrice?: number;
  renewalPeriod?: RenewalPeriod;
  benefits: string[];
  status?: MembershipStatus;
  image?: string;
  requiredDocuments?: string[];
  jobOpportunities?: JobOpportunityItem[];
  howMembershipHelps?: HelpItem[];
  whyJoinNow?: WhyJoinNowSection;
}

export type UpdateMembershipDto = Partial<CreateMembershipDto>;

export interface UpdateMembershipStatusDto {
  status: MembershipStatus;
}

export interface BulkUpdateMembershipStatusDto {
  ids: string[];
  status: MembershipStatus;
}

/* Sub-item Payloads */

export interface JobOpportunityDto {
  title: string;
  description: string;
  iconUrl?: string;
}

export interface HelpItemDto {
  title: string;
  description: string;
  iconUrl?: string;
}

export interface WhyJoinHighlightDto {
  value: string;
}

export interface WhyJoinCardDto {
  title: string;
  description: string;
}

/* Enums & Stats */

export interface MembershipEnumsResponse {
  currencies: string[];
  durations: string[];
  renewalPeriods: string[];
  statuses: string[];
  documents: string[];
}

export interface MembershipStatsResponse {
  totalMemberships: number;
  publishedMemberships: number;
  draftMemberships: number;
  totalSubscribers: number;
  activeSubscribers: number;
  revenue: number;
}

/* Student Memberships */

export interface StudentMembership extends BaseEntity {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  membership: Membership;
  startDate: string;
  expiryDate: string;
  status: "active" | "expired" | "cancelled" | "pending";
  autoRenewal: boolean;
  documents?: {
    name: string;
    url: string;
    verified?: boolean;
  }[];
}

export interface StudentMembershipStats {
  totalActive: number;
  totalExpired: number;
  totalCancelled: number;
  upcomingRenewals: number;
}

export interface MembershipsQueryDto extends PaginationQueryDto {
  name?: string;
  status?: MembershipStatus;
  currency?: MembershipCurrency;
  requiredDocument?: string;
}
