"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components";
import { Button, Column, ConfirmModal, DataTable, StatusBadge, TableAction, useToast } from "@/components/ui";
import { AddCircle } from "iconsax-react";
import BlogRepository from "../domain/repository/blog_repository";
import { BlogPost } from "../domain/data/response/blog_response";
import { formatDate } from "@/utils/helper/formate_date";

export default function BlogPostsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const repo = new BlogRepository();
  const [items, setItems] = useState<BlogPost[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{ id: string; type: string } | null>(null);

  const load = async (p = 1) => {
    setLoading(true);
    const res = await repo.listPosts(p);
    if (res.success && res.data) { setItems(res.data.items); setCount(res.data.count); setPage(p); }
    else toast(res.message, "danger");
    setLoading(false);
  };
  useEffect(() => { load(1); }, []);

  const columns: Column<BlogPost>[] = [
    { key: "title", title: "Title" },
    { key: "user", title: "Author", render: (_, r) => r.user ? `${r.user.firstName} ${r.user.lastName}` : "—" },
    { key: "createdDate", title: "Date", render: (v) => formatDate(v, "DD MMM YYYY") },
    { key: "isPublished", title: "Status", render: (v) => <StatusBadge status={v ? "published" : "unpublished"} /> },
  ];
  const actions: TableAction<BlogPost>[] = [
    { label: "Edit", onClick: (r) => router.push(`/blog/edit/${r.id}`) },
    { label: "Publish", hidden: (r) => !!r.isPublished, onClick: (r) => setConfirm({ id: r.id, type: "publish" }) },
    { label: "Retract", hidden: (r) => !r.isPublished, onClick: (r) => setConfirm({ id: r.id, type: "unpublish" }) },
    { label: "Delete", variant: "danger", onClick: (r) => setConfirm({ id: r.id, type: "delete" }) },
  ];

  return (
    <DashboardLayout title="Blog Posts">
      <div className="bg-white rounded-md border border-[#F0F0F0] pt-4">
        <div className="flex justify-between px-4 pb-3">
          <h2 className="font-semibold">Posts</h2>
          <Button leftIcon={<AddCircle size={14} color="currentColor" />} onClick={() => router.push("/blog/add")}>Add Post</Button>
        </div>
        <DataTable className="border-none" columns={columns} data={items} keyField="id" loading={loading} actions={actions}
          pagination={{ page, pageSize: 10, total: count, onChange: load }} emptyText="No posts" />
      </div>
      <ConfirmModal open={!!confirm} onClose={() => setConfirm(null)} title="Confirm" description="Apply this action?"
        variant={confirm?.type === "delete" ? "danger" : "primary"}
        onConfirm={async () => {
          if (!confirm) return;
          if (confirm.type === "delete") await repo.deletePost(confirm.id);
          else await repo.updatePost(confirm.id, { isPublished: confirm.type === "publish" });
          setConfirm(null); load(page);
        }} />
    </DashboardLayout>
  );
}
