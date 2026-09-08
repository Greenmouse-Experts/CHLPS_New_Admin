"use client";

import { useParams } from "next/navigation";
import BlogEditorPage from "@/features/blog/pages/blog_editor_page";

export default function EditBlog() {
  const params = useParams();
  const id = Array.isArray(params?.id)
    ? params.id[0]
    : ((params?.id as string) ?? "");
  return <BlogEditorPage postId={id} />;
}
