import { ApiResponse } from "@/lib/network/entity/api_response";

export type MembershipCurrency = "NGN" | "USD" | "CAD" | "EUR" | "GBP" | string;

export type MembershipStatus = "draft" | "published" | "closed" | string;

export interface JobOpportunityItem {
  id?: string;
  title: string;
  iconUrl?: string;
  description: string;
}

export interface HelpItem {
  id?: string;
  title: string;
  iconUrl?: string;
  description: string;
}

export interface WhyJoinNowInfoCard {
  id?: string;
  title: string;
  description: string;
}

export interface WhyJoinNowHighlight {
  id?: string;
  value: string;
}

export interface WhyJoinNowSection {
  heading?: string;
  description?: string;
  infoCards?: WhyJoinNowInfoCard[];
  highlights?: WhyJoinNowHighlight[];
}

export interface MembershipTypeRef {
  id: string;
  name: string;
  slug?: string;
}

export interface MembershipTypeItem {
  id: string;
  name: string;
  slug?: string;
  isPublished?: boolean;
  createdDate?: string;
  updatedDate?: string;
}

export interface CreateMembershipTypePayload {
  name: string;
  isPublished?: boolean;
}

export interface Membership {
  id?: string;
  name: string;
  slug?: string;
  description: string;
  type?: MembershipTypeRef | string | null;
  typeId?: string;
  category?: string;
  eligibilityCriteria: string[];
  price: number;
  currency: MembershipCurrency;
  duration: string;
  autoRenewal: boolean;
  renewalPrice?: number | null;
  renewalPeriod?: string | null;
  benefits: string[];
  requiredDocuments: string[];
  jobOpportunities?: JobOpportunityItem[];
  howMembershipHelps?: HelpItem[];
  whyJoinNow?: WhyJoinNowSection;
  registrationStartDate?: string;
  registrationEndDate?: string | null;
  status: MembershipStatus;
  image?: string | null;
  membersCount?: number;
  membersThisMonth?: number;
  amountPaid?: number;
  createdDate?: string;
}

export interface MembershipSubscriber {
  id: string;
  membershipId: string;
  memberNumber: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  joinedDate: string;
  expiryDate: string;
  status: "active" | "expired" | "pending" | string;
  amountPaid: number;
  currency: MembershipCurrency;
}

export interface MembershipTransaction {
  id: string;
  membershipId: string;
  reference: string;
  memberName: string;
  memberEmail: string;
  amount: number;
  currency: MembershipCurrency;
  paymentMethod: "card" | "bank_transfer" | "wallet" | string;
  status: "successful" | "pending" | "failed" | string;
  date: string;
}

export interface MembershipStats {
  totalMembers?: number;
  totalMemberships?: number;
  totalThisMonth?: number;
  amountPaid?: number;
  activeSubscribers?: number;
}

export type MembershipPayload = Omit<
  Membership,
  "id" | "membersCount" | "membersThisMonth" | "amountPaid" | "createdDate"
>;

export type MembershipsApiResponse = ApiResponse<{
  items: Membership[];
  count: number;
}>;
export type MembershipApiResponse = ApiResponse<Membership>;
export type MembershipStatsApiResponse = ApiResponse<MembershipStats>;
export type MembershipTypesApiResponse = ApiResponse<{
  items: MembershipTypeItem[];
  count: number;
}>;

export const MEMBERSHIP_CURRENCIES: {
  value: MembershipCurrency;
  label: string;
}[] = [
  { value: "CAD", label: "CAD" },
  { value: "NGN", label: "NGN" },
  { value: "USD", label: "USD" },
  { value: "GBP", label: "GBP" },
  { value: "EUR", label: "EUR" },
];

export const MEMBERSHIP_STATUSES: { value: MembershipStatus; label: string }[] =
  [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "closed", label: "Closed" },
  ];

export function labelOf<T extends string>(
  options: { value: T; label: string }[],
  value: T,
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}
