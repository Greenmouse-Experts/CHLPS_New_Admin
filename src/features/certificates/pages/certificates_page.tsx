"use client";

import { useEffect, useState } from "react";
import { DashboardLayout, StatCard } from "@/components";
import { Button, Column, ConfirmModal, DataTable, Modal, StatusBadge, TableAction, TextField, Select, useToast } from "@/components/ui";
import { MedalStar, Calendar } from "iconsax-react";
import CertificatesRepository from "../domain/repository/certificates_repository";
import { Certificate, CertStats, CertTemplate } from "../domain/data/response/certificates_response";
import { formatDate } from "@/utils/helper/formate_date";

export default function CertificatesPage() {
  const { toast } = useToast();
  const repo = new CertificatesRepository();
  const [items, setItems] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<CertStats>({});
  const [templates, setTemplates] = useState<CertTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Certificate | null>(null);
  const [form, setForm] = useState({ certificateNumber: "", certificateUrl: "", templateId: "" });
  const [confirm, setConfirm] = useState<{ id: string; type: "revoke" | "delete" } | null>(null);

  const load = async () => {
    setLoading(true);
    const [list, st, tmpl] = await Promise.all([repo.list(), repo.stats(), repo.listTemplates()]);
    if (list.success && list.data) setItems(list.data);
    if (st.success && st.data) setStats(st.data);
    if (tmpl.success && tmpl.data) setTemplates(tmpl.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const columns: Column<Certificate>[] = [
    { key: "certificateNumber", title: "Number" },
    { key: "student", title: "Student", render: (_, r) => r.student ? `${r.student.firstName} ${r.student.lastName}` : "—" },
    { key: "course", title: "Course", render: (_, r) => r.course?.title || "—" },
    { key: "issuedAt", title: "Issued", render: (v) => formatDate(v, "DD MMM YYYY") },
    { key: "isRevoked", title: "Status", render: (v) => <StatusBadge status={v ? "revoked" : "active"} /> },
  ];
  const actions: TableAction<Certificate>[] = [
    { label: "View", hidden: (r) => !r.certificateUrl, onClick: (r) => window.open(r.certificateUrl, "_blank") },
    { label: "Edit", onClick: (r) => {
      setEdit(r);
      setForm({
        certificateNumber: r.certificateNumber ?? "",
        certificateUrl: r.certificateUrl ?? "",
        templateId: r.templateId || r.template?.id || "",
      });
    } },
    { label: "Revoke", hidden: (r) => !!r.isRevoked, onClick: (r) => setConfirm({ id: r.id, type: "revoke" }) },
    { label: "Delete", variant: "danger", onClick: (r) => setConfirm({ id: r.id, type: "delete" }) },
  ];

  return (
    <DashboardLayout title="Certificates">
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Certificates" value={stats.totalCertificates ?? 0} icon={<MedalStar size={20} color="#717171" />} />
        <StatCard title="This Month" value={stats.certificatesThisMonth ?? 0} icon={<Calendar size={20} color="#717171" />} />
        <StatCard title="This Year" value={stats.certificatesThisYear ?? 0} icon={<Calendar size={20} color="#717171" />} />
      </div>
      {!!stats.perCourse?.length && (
        <div className="bg-white rounded-xl border border-[#E7E9EB] p-5 mb-6">
          <h3 className="font-semibold mb-3">Certificates per course</h3>
          <div className="divide-y divide-[#F1F1F1]">
            {stats.perCourse.map((row) => (
              <div key={row.courseTitle} className="flex justify-between py-2 text-sm">
                <span>{row.courseTitle}</span>
                <span className="font-medium">{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="bg-white rounded-md border border-[#F0F0F0]">
        <DataTable className="border-none" columns={columns} data={items} keyField="id" loading={loading} actions={actions} emptyText="No certificates" />
      </div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit Certificate" size="md">
        <div className="space-y-4">
          <TextField label="Certificate number" value={form.certificateNumber} onChange={(e) => setForm({ ...form, certificateNumber: e.target.value })} />
          <TextField label="Certificate URL" value={form.certificateUrl} onChange={(e) => setForm({ ...form, certificateUrl: e.target.value })} />
          <Select label="Template" value={form.templateId} onChange={(v) => setForm({ ...form, templateId: v })}
            options={templates.map((t) => ({ label: t.name, value: t.id }))} />
          <Button fullWidth onClick={async () => {
            if (!edit) return;
            const res = await repo.update(edit.id, form);
            if (res.success) { toast(res.message, "success"); setEdit(null); load(); }
            else toast(res.message, "danger");
          }}>Save</Button>
        </div>
      </Modal>
      <ConfirmModal open={!!confirm} onClose={() => setConfirm(null)} title="Confirm" description="Apply this action?"
        variant="danger"
        onConfirm={async () => {
          if (!confirm) return;
          if (confirm.type === "revoke") await repo.revoke(confirm.id);
          else await repo.remove(confirm.id);
          setConfirm(null); load();
        }} />
    </DashboardLayout>
  );
}
