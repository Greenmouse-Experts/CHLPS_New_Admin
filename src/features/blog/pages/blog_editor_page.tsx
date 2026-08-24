"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components";
import { Button, RichTextField, TextField, Select, useToast } from "@/components/ui";
import BlogRepository from "../domain/repository/blog_repository";
import UploadRepository from "@/features/uploads/domain/repository/upload_repository";
import { BlogTag } from "../domain/data/response/blog_response";

export default function BlogEditorPage({ postId }: { postId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const repo = new BlogRepository();
  const uploads = new UploadRepository();
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState("false");
  const [file, setFile] = useState<File | null>(null);
  const [existingCover, setExistingCover] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    repo.listTags().then((res) => {
      if (res.success && res.data) setTags(res.data.filter((t) => t.isPublished !== false));
    });
    if (postId) {
      repo.getPost(postId).then((res) => {
        if (res.success && res.data) {
          const p = res.data;
          setTitle(p.title);
          setBrief(p.brief ?? "");
          setDescription(p.description ?? "");
          setPublished(p.isPublished ? "true" : "false");
          setExistingCover(p.coverImage ?? "");
          setSelected((p.tags ?? []).map((t) => t.id));
        }
      });
    }
  }, [postId]);

  return (
    <DashboardLayout title={postId ? "Edit Post" : "Create Post"}>
      <form
        className="bg-white rounded-xl border border-[#E7E9EB] p-6 space-y-4 w-full"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          let cover = existingCover;
          if (file) {
            const up = await uploads.upload("image", file);
            if (!up.success || !up.url) { toast(up.message, "danger"); setBusy(false); return; }
            cover = up.url;
          }
          const payload = {
            title, brief, description, coverImage: cover,
            isPublished: published === "true",
            tags: selected.map((id) => ({ id })),
          };
          const res = postId ? await repo.updatePost(postId, payload) : await repo.createPost(payload);
          setBusy(false);
          if (res.success) { toast(res.message, "success"); router.push("/blog"); }
          else toast(res.message, "danger");
        }}
      >
        <TextField label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextField label="Brief" value={brief} onChange={(e) => setBrief(e.target.value)} />
        <RichTextField label="Description" value={description} onChange={setDescription} minHeight="360px" placeholder="Write the post body…" />
        <Select label="Published" value={published} onChange={setPublished}
          options={[{ label: "Draft", value: "false" }, { label: "Published", value: "true" }]} />
        <div>
          <p className="text-sm font-medium mb-1.5">Tags</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setSelected((s) => s.includes(t.id) ? s.filter((x) => x !== t.id) : [...s, t.id])}
                className={`px-3 py-1 rounded-full text-xs border ${selected.includes(t.id) ? "bg-black text-white" : "border-[#E7E9EB]"}`}
              >
                {t.tag}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium mb-1.5">Cover image</p>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <Button type="submit" loading={busy}>{postId ? "Update" : "Create"} post</Button>
      </form>
    </DashboardLayout>
  );
}
