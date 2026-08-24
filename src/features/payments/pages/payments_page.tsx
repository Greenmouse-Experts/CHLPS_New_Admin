"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components";
import { Column, DataTable, Modal, StatusBadge, TableAction, Tabs, useToast } from "@/components/ui";
import PaymentsRepository from "../domain/repository/payments_repository";
import { PaymentOrder } from "../domain/data/response/payments_response";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";

const TABS = [
  { key: "confirmed", label: "Completed" },
  { key: "pending", label: "Pending" },
  { key: "cancelled", label: "Cancelled" },
];

export default function PaymentsPage() {
  const { toast } = useToast();
  const repo = new PaymentsRepository();
  const [tab, setTab] = useState("confirmed");
  const [items, setItems] = useState<PaymentOrder[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<PaymentOrder | null>(null);

  const load = async (status = tab, p = 1) => {
    setLoading(true);
    const res = await repo.list(status, p);
    if (res.success && res.data) { setItems(res.data.items); setCount(res.data.count); setPage(p); }
    else toast(res.message, "danger");
    setLoading(false);
  };

  useEffect(() => { load(tab, 1); }, [tab]);

  const columns: Column<PaymentOrder>[] = [
    { key: "trx", title: "Reference", render: (_, r) => r.trx?.reference || "—" },
    { key: "sub", title: "Subtotal", render: (_, r) => formatCurrency(r.trx?.subAmount ?? 0, { currency: "USD" }) },
    { key: "amount", title: "Amount", render: (_, r) => formatCurrency(r.trx?.amount ?? 0, { currency: "USD" }) },
    { key: "createdDate", title: "Date", render: (v, r) => formatDate(r.trx?.createdDate || v, "DD MMM YYYY") },
    {
      key: "status",
      title: "Status",
      render: (v) => (
        <StatusBadge status={v === "confirmed" ? "confirmed" : v === "cancelled" ? "cancelled" : "pending"} />
      ),
    },
    { key: "buyer", title: "Student", render: (_, r) => r.buyer ? `${r.buyer.firstName} ${r.buyer.lastName}` : "—" },
  ];

  const actions: TableAction<PaymentOrder>[] = [
    {
      label: "View Details",
      onClick: async (row) => {
        const res = await repo.detail(row.id);
        setDetail(res.success && res.data ? res.data : row);
      },
    },
  ];

  return (
    <DashboardLayout title="Payments">
      <Tabs tabs={TABS} activeKey={tab} onChange={setTab} />
      <div className="bg-white rounded-md border border-[#F0F0F0] mt-4">
        <DataTable className="border-none" columns={columns} data={items} keyField="id" loading={loading} actions={actions}
          pagination={{ page, pageSize: 10, total: count, onChange: (p) => load(tab, p) }} emptyText="No payments" />
      </div>
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Payment details" size="md">
        <div className="space-y-3">
          {(detail?.orderItems ?? []).map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              {item.course?.coverImage && (
                 
                <img src={item.course.coverImage} alt="" className="w-12 h-10 object-cover rounded" />
              )}
              <div>
                <p className="text-sm font-medium">{item.course?.title}</p>
                <p className="text-xs text-[#717171]">{formatCurrency(item.price ?? 0, { currency: "USD" })}</p>
              </div>
            </div>
          ))}
          {!(detail?.orderItems ?? []).length && <p className="text-sm text-[#717171]">No course items.</p>}
        </div>
      </Modal>
    </DashboardLayout>
  );
}
