"use client";

import { useParams } from "next/navigation";
import MembershipDetailPage from "@/features/membership/pages/membership_detail_page";

export default function MembershipDetailRoute() {
  const params = useParams();
  const id = Array.isArray(params?.id)
    ? params.id[0]
    : ((params?.id as string) ?? "");
  return <MembershipDetailPage membershipId={id} />;
}
