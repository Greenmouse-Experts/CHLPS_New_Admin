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
  highlights?: string[] | WhyJoinNowHighlight[];
}

export interface ApplicationQuestionItem {
  id?: string;
  question: string;
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
  requiredDocuments?: string[];
  jobOpportunities?: JobOpportunityItem[];
  howMembershipHelps?: HelpItem[];
  whyJoinNow?: WhyJoinNowSection;
  applicationQuestions?: ApplicationQuestionItem[];
  careerPathways?: string[];
  registrationStartDate?: string;
  registrationEndDate?: string | null;
  status: MembershipStatus;
  image?: string | null;
  banner?: string | null;
  bannerText?: string;
  membersCount?: number;
  membersThisMonth?: number;
  amountPaid?: number;
  createdDate?: string;
}

export interface MembershipApplicationAnswer {
  questionId: string;
  answer: boolean | string;
}

export interface MembershipApplicationItem {
  id: string;
  orderId?: string;
  answers?: MembershipApplicationAnswer[];
  status: "pending" | "approved" | "rejected" | string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  rejectReason?: string | null;
  createdDate?: string;
  updatedDate?: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    picture?: string;
  };
  membership?: {
    id: string;
    name: string;
    price: number;
    currency: string;
    duration?: string;
    description?: string;
    applicationQuestions?: Array<{ id: string; question: string }>;
  };
  order?: {
    id?: string;
    number?: string;
    status?: string;
    reference?: string;
    amount?: number;
    currency?: string;
  };
}

export interface MembershipSubscriber {
  id: string;
  studentMembershipId?: string;
  applicationId?: string;
  applicationStatus?: "pending" | "approved" | "rejected" | string;
  membershipId: string;
  memberNumber: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  joinedDate: string;
  expiryDate: string;
  status: "active" | "expired" | "pending" | "pending_approval" | string;
  amountPaid: number;
  currency: MembershipCurrency;
  answers?: MembershipApplicationAnswer[];
}

export interface MembershipTransaction {
  id: string;
  orderId?: string;
  orderNumber?: string;
  membershipId: string;
  reference: string;
  memberName: string;
  memberEmail: string;
  amount: number;
  currency: MembershipCurrency;
  paymentMethod: "card" | "bank_transfer" | "wallet" | string;
  status: "successful" | "pending" | "failed" | string;
  date: string;
  applicationId?: string;
  applicationStatus?: "pending" | "approved" | "rejected" | string;
  rejectReason?: string | null;
  studentId?: string;
  answers?: MembershipApplicationAnswer[];
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
export type MembershipSubscribersApiResponse = ApiResponse<{
  items: MembershipSubscriber[];
  count: number;
}>;
export type MembershipTransactionsApiResponse = ApiResponse<{
  items: MembershipTransaction[];
  count: number;
}>;
export type MembershipApplicationsApiResponse = ApiResponse<{
  items: MembershipApplicationItem[];
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
