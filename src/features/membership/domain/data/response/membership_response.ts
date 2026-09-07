export type MembershipCategory =
  | "individual"
  | "student"
  | "corporate"
  | "professional"
  | "associate"
  | "other";

export type MembershipCurrency = "NGN" | "USD" | "CAD" | "EUR";

export type MembershipDuration =
  | "1_month"
  | "3_months"
  | "6_months"
  | "1_year"
  | "2_years"
  | "lifetime";

export type RenewalPeriod =
  | MembershipDuration
  | "monthly"
  | "quarterly"
  | "annually";

export type MembershipStatus = "draft" | "published" | "closed";

export type RequiredDocument =
  | "national_id"
  | "passport"
  | "drivers_licence"
  | "certificate"
  | "other";

export interface Membership {
  id: string;
  name: string;
  description: string;
  category: MembershipCategory;
  eligibilityCriteria: string[];
  price: number;
  currency: MembershipCurrency;
  duration: MembershipDuration;
  autoRenewal: boolean;
  renewalPrice: number | null;
  renewalPeriod: RenewalPeriod | null;
  benefits: string[];
  requiredDocuments: RequiredDocument[];
  registrationStartDate: string;
  registrationEndDate: string | null;
  status: MembershipStatus;
  image: string | null;
  membersCount: number;
  membersThisMonth: number;
  amountPaid: number;
  createdDate: string;
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
  status: "active" | "expired" | "pending";
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
  paymentMethod: "card" | "bank_transfer" | "wallet";
  status: "successful" | "pending" | "failed";
  date: string;
}

export type MembershipPayload = Omit<
  Membership,
  "id" | "membersCount" | "membersThisMonth" | "amountPaid" | "createdDate"
>;

export const MEMBERSHIP_CATEGORIES: {
  value: MembershipCategory;
  label: string;
}[] = [
  { value: "individual", label: "Individual" },
  { value: "student", label: "Student" },
  { value: "corporate", label: "Corporate" },
  { value: "professional", label: "Professional" },
  { value: "associate", label: "Associate" },
  { value: "other", label: "Other" },
];

export const MEMBERSHIP_CURRENCIES: {
  value: MembershipCurrency;
  label: string;
}[] = [
  { value: "NGN", label: "NGN" },
  { value: "USD", label: "USD" },
  { value: "CAD", label: "CAD" },
  { value: "EUR", label: "EUR" },
];

export const MEMBERSHIP_DURATIONS: {
  value: MembershipDuration;
  label: string;
}[] = [
  { value: "1_month", label: "1 Month" },
  { value: "3_months", label: "3 Months" },
  { value: "6_months", label: "6 Months" },
  { value: "1_year", label: "1 Year" },
  { value: "2_years", label: "2 Years" },
  { value: "lifetime", label: "Lifetime" },
];

export const RENEWAL_PERIODS: { value: RenewalPeriod; label: string }[] = [
  ...MEMBERSHIP_DURATIONS,
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
];

export const MEMBERSHIP_STATUSES: { value: MembershipStatus; label: string }[] =
  [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "closed", label: "Closed" },
  ];

export const REQUIRED_DOCUMENTS: { value: RequiredDocument; label: string }[] =
  [
    { value: "national_id", label: "National ID" },
    { value: "passport", label: "Passport" },
    { value: "drivers_licence", label: "Driver's Licence" },
    { value: "certificate", label: "Certificate" },
    { value: "other", label: "Other" },
  ];

export function labelOf<T extends string>(
  options: { value: T; label: string }[],
  value: T,
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}
