"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components";
import { Button, Column, DataTable, Modal, StatusBadge, TableAction, useToast } from "@/components/ui";
import { SearchNormal1 } from "iconsax-react";
import SupportRepository from "../domain/repository/support_repository";
import { ContactMessage } from "../domain/data/response/support_response";
import { formatDate } from "@/utils/helper/formate_date";

function displayName(item: ContactMessage) {
  if (item.name) return item.name;
  return `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim() || "—";
}

export default function SupportPage() {
  const { toast } = useToast();
  const repo = new SupportRepository();
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await repo.list();
    if (res.success && res.data) setItems(res.data);
    else toast(res.message, "danger");
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter((item) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return `${displayName(item)} ${item.email} ${item.interestedIn}`.toLowerCase().includes(q);
  });

  const columns: Column<ContactMessage>[] = [
    { key: "name", title: "Name", render: (_, r) => displayName(r) },
    { key: "email", title: "Email" },
    { key: "interestedIn", title: "Interested in", render: (v) => v || "—" },
    { key: "createdDate", title: "Date", render: (_, r) => formatDate(r.createdDate || r.createdAt, "DD MMM YYYY") },
    { key: "isRead", title: "Status", render: (v) => <StatusBadge status={v ? "read" : "unread"} /> },
  ];
  const actions: TableAction<ContactMessage>[] = [
    { label: "View", onClick: (row) => setSelected(row) },
  ];

  return (
    <DashboardLayout title="Support">
      <div className="bg-white rounded-md border border-[#F0F0F0] pt-4">
        <div className="flex items-center justify-between px-4 pb-3">
          <h2 className="font-semibold">Contact Messages</h2>
          <div className="flex items-center gap-2 border border-[#E7E9EB] rounded-lg px-3 h-9 w-64">
            <SearchNormal1 size={13} color="#717171" />
            <input className="flex-1 text-xs outline-none" placeholder="Search by name, email or interest" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <DataTable className="border-none" columns={columns} data={filtered} keyField="id" loading={loading} actions={actions} emptyText="No messages" />
      </div>
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Message" size="md">
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><p className="text-[#717171]">Name</p><p className="font-medium">{displayName(selected)}</p></div>
              <div><p className="text-[#717171]">Date</p><p className="font-medium">{formatDate(selected.createdDate || selected.createdAt, "DD MMM YYYY")}</p></div>
              <div><p className="text-[#717171]">Email</p><p className="font-medium">{selected.email}</p></div>
              <div><p className="text-[#717171]">Phone</p><p className="font-medium">{selected.phone || "—"}</p></div>
              <div className="sm:col-span-2"><p className="text-[#717171]">Interest</p><p className="font-medium">{selected.interestedIn || "—"}</p></div>
            </div>
            <p className="text-[#717171] whitespace-pre-wrap">{selected.message}</p>
            {!selected.isRead && (
              <Button onClick={async () => {
                const res = await repo.markRead(selected.id);
                if (res.success) { toast(res.message, "success"); setSelected({ ...selected, isRead: true }); load(); }
                else toast(res.message, "danger");
              }}>Mark as read</Button>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
