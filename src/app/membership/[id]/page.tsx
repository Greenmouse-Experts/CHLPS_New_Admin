import MembershipDetailPage from "@/features/membership/pages/membership_detail_page";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MembershipDetailRoute({ params }: Props) {
  const { id } = await params;
  return <MembershipDetailPage membershipId={id} />;
}
