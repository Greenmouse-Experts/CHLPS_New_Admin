"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components";
import { Button, Column, ConfirmModal, DataTable, Modal, StatusBadge, TableAction, TextField, useToast } from "@/components/ui";
import { AddCircle } from "iconsax-react";
import CertificatesRepository from "../domain/repository/certificates_repository";
import { CertTemplate } from "../domain/data/response/certificates_response";
import { formatDate } from "@/utils/helper/formate_date";

export default function TemplatesPage() {
  const { toast } = useToast();
  const repo = new CertificatesRepository();
  const [items, setItems] = useState<CertTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [confirm, setConfirm] = useState<{ id: string; type: "default" | "delete" } | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await repo.listTemplates();
    if (res.success && res.data) setItems(res.data);
    else toast(res.message, "danger");
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const columns: Column<CertTemplate>[] = [
    { key: "name", title: "Name" },
    { key: "createdDate", title: "Created", render: (v) => formatDate(v, "DD MMM YYYY") },
    { key: "isActive", title: "Default", render: (v) => <StatusBadge status={v ? "active" : "inactive"} /> },
  ];
  const actions: TableAction<CertTemplate>[] = [
    { label: "Set default", hidden: (r) => !!r.isActive, onClick: (r) => setConfirm({ id: r.id, type: "default" }) },
    { label: "Delete", variant: "danger", onClick: (r) => setConfirm({ id: r.id, type: "delete" }) },
  ];

  return (
    <DashboardLayout title="Certificate Templates">
      <div className="bg-white rounded-md border border-[#F0F0F0] pt-4">
        <div className="flex justify-between px-4 pb-3">
          <h2 className="font-semibold">Templates</h2>
          <Button leftIcon={<AddCircle size={14} color="currentColor" />} onClick={() => setOpen(true)}>Upload template</Button>
        </div>
        <DataTable className="border-none" columns={columns} data={items} keyField="id" loading={loading} actions={actions} emptyText="No templates" />
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Upload Template" size="sm">
        <div className="space-y-4">
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <Button fullWidth onClick={async () => {
            if (!file) return;
            const res = await repo.uploadTemplate(name, file);
            if (res.success) { toast(res.message, "success"); setOpen(false); setName(""); setFile(null); load(); }
            else toast(res.message, "danger");
          }}>Upload</Button>
        </div>
      </Modal>
      <ConfirmModal open={!!confirm} onClose={() => setConfirm(null)} title="Confirm" description="Apply this action?"
        variant={confirm?.type === "delete" ? "danger" : "primary"}
        onConfirm={async () => {
          if (!confirm) return;
          if (confirm.type === "default") await repo.setDefault(confirm.id);
          else await repo.deleteTemplate(confirm.id);
          setConfirm(null); load();
        }} />
    </DashboardLayout>
  );
}
