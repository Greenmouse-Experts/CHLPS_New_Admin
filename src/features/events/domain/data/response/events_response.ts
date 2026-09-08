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

export type EventFormat = "physical" | "virtual" | "hybrid";

export type EventEligibility =
  | "everyone"
  | "members_only"
  | "specific_membership"
  | "invitation_only";

export type EventCurrency = "NGN" | "USD" | "GBP" | "EUR";

export type EventStatus = "draft" | "published" | "cancelled" | "completed";

export interface EventItem {
  id: string;
  name: string;
  description: string;
  category: EventCategory | string;
  categoryId?: string;
  image: string | null;
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
  maxAttendees: number | null;
  maximumAttendees?: number | null;
  eligibility: EventEligibility;
  price: number;
  currency: EventCurrency;
  organizerName: string;
  contactEmail: string;
  contactPhone: string | null;
  status: EventStatus;
  attendeesCount: number;
  attendeesThisMonth: number;
  amountPaid: number;
  createdDate: string;
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
>;

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
  { value: "physical", label: "Physical" },
  { value: "virtual", label: "Virtual" },
  { value: "hybrid", label: "Hybrid" },
];

export const EVENT_ELIGIBILITY: { value: EventEligibility; label: string }[] = [
  { value: "everyone", label: "Everyone" },
  { value: "members_only", label: "Members Only" },
  { value: "specific_membership", label: "Specific Membership Type" },
  { value: "invitation_only", label: "Invitation Only" },
];

export const EVENT_CURRENCIES: { value: EventCurrency; label: string }[] = [
  { value: "NGN", label: "NGN" },
  { value: "USD", label: "USD" },
  { value: "GBP", label: "GBP" },
  { value: "EUR", label: "EUR" },
];

export const EVENT_STATUSES: { value: EventStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

export function labelOf<T extends string>(
  options: { value: T; label: string }[],
  value: T,
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}
