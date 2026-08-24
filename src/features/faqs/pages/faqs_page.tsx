"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components";
import { Button, Column, ConfirmModal, DataTable, Modal, StatusBadge, TextField, TableAction, useToast } from "@/components/ui";
import { AddCircle } from "iconsax-react";
import FaqsRepository from "../domain/repository/faqs_repository";
import { Faq } from "../domain/data/response/faqs_response";
import { formatDate } from "@/utils/helper/formate_date";

export default function FaqsPage() {
  const { toast } = useToast();
  const repo = new FaqsRepository();
  const [items, setItems] = useState<Faq[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Faq | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [confirm, setConfirm] = useState<{ id: string; type: "delete" | "publish" | "unpublish" } | null>(null);

  const load = async (p = 1) => {
    setLoading(true);
    const res = await repo.list(p);
    if (res.success && res.data) {
      setItems(res.data.items);
      setCount(res.data.count);
      setPage(p);
    } else toast(res.message, "danger");
    setLoading(false);
  };

  useEffect(() => { load(1); }, []);

  const columns: Column<Faq>[] = [
    { key: "question", title: "Question" },
    { key: "createdDate", title: "Created", render: (v) => formatDate(v, "DD MMM YYYY") },
    { key: "isPublished", title: "Status", render: (v) => <StatusBadge status={v ? "published" : "unpublished"} /> },
  ];

  const actions: TableAction<Faq>[] = [
    { label: "Edit", onClick: (row) => { setEdit(row); setQuestion(row.question); setAnswer(row.answer); } },
    { label: "Publish", hidden: (row) => !!row.isPublished, onClick: (row) => setConfirm({ id: row.id, type: "publish" }) },
    { label: "Retract", hidden: (row) => !row.isPublished, onClick: (row) => setConfirm({ id: row.id, type: "unpublish" }) },
    { label: "Delete", variant: "danger", onClick: (row) => setConfirm({ id: row.id, type: "delete" }) },
  ];

  return (
    <DashboardLayout title="FAQs">
      <div className="bg-white rounded-md border border-[#F0F0F0] pt-4">
        <div className="flex justify-between px-4 pb-3">
          <h2 className="font-semibold">All FAQs</h2>
          <Button leftIcon={<AddCircle size={14} color="currentColor" />} onClick={() => { setEdit(null); setQuestion(""); setAnswer(""); setOpen(true); }}>
            Add FAQ
          </Button>
        </div>
        <DataTable className="border-none" columns={columns} data={items} keyField="id" loading={loading} actions={actions}
          pagination={{ page, pageSize: 10, total: count, onChange: load }} emptyText="No FAQs" />
      </div>
      <Modal open={open || !!edit} onClose={() => { setOpen(false); setEdit(null); }} title={edit ? "Edit FAQ" : "Add FAQ"} size="md">
        <div className="space-y-4">
          <TextField label="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />
          <div>
            <label className="block text-sm font-medium mb-1.5">Answer</label>
            <textarea className="flipex-input-base min-h-24" value={answer} onChange={(e) => setAnswer(e.target.value)} />
          </div>
          <Button fullWidth onClick={async () => {
            const res = edit ? await repo.update(edit.id, { question, answer }) : await repo.create({ question, answer });
            if (res.success) { toast(res.message, "success"); setOpen(false); setEdit(null); load(page); }
            else toast(res.message, "danger");
          }}>Save</Button>
        </div>
      </Modal>
      <ConfirmModal open={!!confirm} onClose={() => setConfirm(null)} title="Confirm" description="Apply this action?"
        variant={confirm?.type === "delete" ? "danger" : "primary"}
        onConfirm={async () => {
          if (!confirm) return;
          if (confirm.type === "delete") await repo.remove(confirm.id);
          else await repo.publish(confirm.id, confirm.type === "publish");
          setConfirm(null);
          load(page);
        }} />
    </DashboardLayout>
  );
}
