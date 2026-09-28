import EventDetailPage from "@/features/events/pages/event_detail_page";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventDetailRoute({ params }: Props) {
  const { id } = await params;
  return <EventDetailPage eventId={id} />;
}
