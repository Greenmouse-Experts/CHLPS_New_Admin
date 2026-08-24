import AssessmentPage from "@/features/courses/pages/assessment_page";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ courseId?: string; contentId?: string }>;
}

export default async function AssessmentRoute({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  return (
    <AssessmentPage
      subId={id}
      courseId={query.courseId ?? ""}
      contentId={query.contentId ?? ""}
    />
  );
}
