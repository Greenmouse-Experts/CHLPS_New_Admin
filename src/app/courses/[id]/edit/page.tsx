"use client";

import { useParams } from "next/navigation";
import CourseEditorPage from "@/features/courses/pages/course_editor_page";

export default function CourseIdEditRoute() {
  const params = useParams();
  const id = Array.isArray(params?.id)
    ? params.id[0]
    : ((params?.id as string) ?? "");
  return <CourseEditorPage courseId={id} />;
}
