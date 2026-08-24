import CourseDetailPage from "@/features/courses/pages/course_detail_page";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailRoute({ params }: Props) {
  const { id } = await params;
  return <CourseDetailPage courseId={id} />;
}
