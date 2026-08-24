import { Membership } from "./response/membership_response";

export const SEED_MEMBERSHIPS: Membership[] = [
  {
    id: "mbr-001",
    name: "Professional Membership",
    description:
      "Full professional membership for practising specialists. Includes voting rights, journal access, and CPD credits.",
    category: "professional",
    eligibilityCriteria: [
      "Recognised professional qualification",
      "Minimum of 3 years post-qualification experience",
    ],
    price: 50000,
    currency: "NGN",
    duration: "1_year",
    autoRenewal: true,
    renewalPrice: 45000,
    renewalPeriod: "annually",
    benefits: [
      "Voting rights at the AGM",
      "Access to member-only journals",
      "Annual CPD credits",
      "Discounted conference tickets",
    ],
    requiredDocuments: ["national_id", "certificate"],
    registrationStartDate: "2026-01-01",
    registrationEndDate: "2026-12-31",
    status: "published",
    image: "/assets/images/chips-logo.png",
    membersCount: 42,
    membersThisMonth: 6,
    amountPaid: 2100000,
    createdDate: "2026-01-08T10:00:00.000Z",
  },

  {
    id: "mbr-006",
    name: "Lifetime Fellowship",
    description:
      "One-time lifetime membership for distinguished fellows of the society.",
    category: "professional",
    eligibilityCriteria: [
      "Existing professional member in good standing",
      "Nominated and approved by council",
    ],
    price: 500000,
    currency: "NGN",
    duration: "lifetime",
    autoRenewal: false,
    renewalPrice: null,
    renewalPeriod: null,
    benefits: [
      "Lifetime access to all member benefits",
      "Fellow designation",
      "Complimentary conference attendance",
    ],
    requiredDocuments: ["national_id", "passport", "certificate"],
    registrationStartDate: "2026-01-01",
    registrationEndDate: null,
    status: "published",
    image: "/assets/images/chips-logo.png",
    membersCount: 4,
    membersThisMonth: 1,
    amountPaid: 2000000,
    createdDate: "2026-01-20T16:45:00.000Z",
  },
];
