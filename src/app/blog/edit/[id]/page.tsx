import BlogEditorPage from "@/features/blog/pages/blog_editor_page";

interface Props { params: Promise<{ id: string }>; }

export default async function EditBlog({ params }: Props) {
  const { id } = await params;
  return <BlogEditorPage postId={id} />;
}
