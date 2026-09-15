import { ApiResponse } from "@/lib/network/entity/api_response";

export type EventCategory =
  | "conference"
  | "workshop"
  | "seminar"
  | "training"
  | "webinar"
  | "networking"
  | "social"
  | "other";

export type EventFormat = "Physical" | "Virtual" | "Hybrid";

export type EventEligibility =
  | "Everyone"
  | "Members Only"
  | "Specific Membership Type"
  | "Invitation Only";

export type EventCurrency = "CAD" | "NGN" | "USD" | "GBP" | "EUR";

export type EventStatus = "Draft" | "Published" | "Cancelled" | "Completed";

export interface EventItem {
  id: string;
  name: string;
  description: string;
  category?: EventCategory | string;
  categoryId?: string;
  coverImage?: string | null;
  image?: string | null;
  images?: string[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  format: EventFormat;
  meetingLink: string | null;
  location: string | null;
  registrationRequired: boolean;
  registrationOpens: string | null;
  registrationCloses: string | null;
  maximumAttendees?: number | null;
  maxAttendees?: number | null;
  eligibility: EventEligibility;
  requiredMembershipIds?: string[];
  price: number;
  currency: EventCurrency;
  organizerName: string;
  contactEmail: string;
  contactPhone: string | null;
  status: EventStatus;
  attendeesCount?: number;
  attendeesThisMonth?: number;
  amountPaid?: number;
  createdDate?: string;
}

export interface EventStats {
  totalEvents?: number;
  totalThisMonth?: number;
  amountPaid?: number;
  upcomingEvents?: number;
  completedEvents?: number;
  totalRegistrations?: number;
}

export type EventPayload = Omit<
  EventItem,
  "id" | "attendeesCount" | "attendeesThisMonth" | "amountPaid" | "createdDate"
> & {
  categoryId: string;
  coverImage: string;
  images?: string[];
  maximumAttendees?: number | null;
  requiredMembershipIds?: string[];
};

export type EventsApiResponse = ApiResponse<{
  items: EventItem[];
  count: number;
}>;
export type EventApiResponse = ApiResponse<EventItem>;
export type EventStatsApiResponse = ApiResponse<EventStats>;

export const EVENT_CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: "conference", label: "Conference" },
  { value: "workshop", label: "Workshop" },
  { value: "seminar", label: "Seminar" },
  { value: "training", label: "Training" },
  { value: "webinar", label: "Webinar" },
  { value: "networking", label: "Networking" },
  { value: "social", label: "Social" },
  { value: "other", label: "Other" },
];

export const EVENT_FORMATS: { value: EventFormat; label: string }[] = [
  { value: "Physical", label: "Physical" },
  { value: "Virtual", label: "Virtual" },
  { value: "Hybrid", label: "Hybrid" },
];

export const EVENT_ELIGIBILITY: { value: EventEligibility; label: string }[] = [
  { value: "Everyone", label: "Everyone" },
  { value: "Members Only", label: "Members Only" },
  { value: "Specific Membership Type", label: "Specific Membership Type" },
  { value: "Invitation Only", label: "Invitation Only" },
];

export const EVENT_CURRENCIES: { value: EventCurrency; label: string }[] = [
  { value: "CAD", label: "CAD" },
  { value: "NGN", label: "NGN" },
  { value: "USD", label: "USD" },
  { value: "GBP", label: "GBP" },
  { value: "EUR", label: "EUR" },
];

export const EVENT_STATUSES: { value: EventStatus; label: string }[] = [
  { value: "Draft", label: "Draft" },
  { value: "Published", label: "Published" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Completed", label: "Completed" },
];

export function labelOf<T extends { value: string; label: string }>(
  list: T[],
  value?: string | null,
): string {
  if (!value) return "";
  return list.find((item) => item.value === value)?.label ?? value;
}
