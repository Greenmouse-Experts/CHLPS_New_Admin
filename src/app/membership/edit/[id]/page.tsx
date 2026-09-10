"use client";

import { useParams } from "next/navigation";
import MembershipEditorPage from "@/features/membership/pages/membership_editor_page";

export default function EditMembershipRoute() {
  const params = useParams();
  const id = Array.isArray(params?.id)
    ? params.id[0]
    : ((params?.id as string) ?? "");
  return <MembershipEditorPage membershipId={id} />;
}
