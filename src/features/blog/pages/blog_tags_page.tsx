"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components";
import { Button, Column, ConfirmModal, DataTable, Modal, StatusBadge, TextField, TableAction, useToast } from "@/components/ui";
import { AddCircle } from "iconsax-react";
import BlogRepository from "../domain/repository/blog_repository";
import { BlogTag } from "../domain/data/response/blog_response";
import { formatDate } from "@/utils/helper/formate_date";

export default function BlogTagsPage() {
  const { toast } = useToast();
  const repo = new BlogRepository();
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [tag, setTag] = useState("");
  const [confirm, setConfirm] = useState<{ id: string; type: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await repo.listTags();
    if (res.success && res.data) setTags(res.data);
    else toast(res.message, "danger");
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const columns: Column<BlogTag>[] = [
    { key: "tag", title: "Tag" },
    { key: "createdDate", title: "Created", render: (v) => formatDate(v, "DD MMM YYYY") },
    { key: "isPublished", title: "Status", render: (v) => <StatusBadge status={v ? "published" : "unpublished"} /> },
  ];
  const actions: TableAction<BlogTag>[] = [
    { label: "Publish", hidden: (r) => !!r.isPublished, onClick: (r) => setConfirm({ id: r.id, type: "publish" }) },
    { label: "Retract", hidden: (r) => !r.isPublished, onClick: (r) => setConfirm({ id: r.id, type: "unpublish" }) },
    { label: "Delete", variant: "danger", onClick: (r) => setConfirm({ id: r.id, type: "delete" }) },
  ];

  return (
    <DashboardLayout title="Blog Tags">
      <div className="bg-white rounded-md border border-[#F0F0F0] pt-4">
        <div className="flex justify-between px-4 pb-3">
          <h2 className="font-semibold">Tags</h2>
          <Button leftIcon={<AddCircle size={14} color="currentColor" />} onClick={() => setOpen(true)}>Add Tag</Button>
        </div>
        <DataTable className="border-none" columns={columns} data={tags} keyField="id" loading={loading} actions={actions} emptyText="No tags" />
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Tag" size="sm">
        <TextField label="Tag" value={tag} onChange={(e) => setTag(e.target.value)} />
        <Button className="mt-4" fullWidth onClick={async () => {
          const res = await repo.createTag(tag);
          if (res.success) { toast(res.message, "success"); setOpen(false); setTag(""); load(); }
          else toast(res.message, "danger");
        }}>Save</Button>
      </Modal>
      <ConfirmModal open={!!confirm} onClose={() => setConfirm(null)} title="Confirm" description="Apply this action?"
        variant={confirm?.type === "delete" ? "danger" : "primary"}
        onConfirm={async () => {
          if (!confirm) return;
          if (confirm.type === "delete") await repo.deleteTag(confirm.id);
          else await repo.updateTag(confirm.id, { isPublished: confirm.type === "publish" });
          setConfirm(null); load();
        }} />
    </DashboardLayout>
  );
}
