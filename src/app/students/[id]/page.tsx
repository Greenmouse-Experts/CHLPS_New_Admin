import StudentDetailPage from "@/features/students/pages/student_detail_page";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailRoute({ params }: Props) {
  const { id } = await params;
  return <StudentDetailPage studentId={id} />;
}
