"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components";
import { StatusBadge, Tabs, Column, DataTable } from "@/components/ui";
import StudentsRepository from "../domain/repository/students_repository";
import {
  Student,
  StudentCertificate,
  StudentOrder,
} from "../domain/data/response/students_response";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";
import { useToast } from "@/components/ui";

export default function StudentDetailPage({ studentId }: { studentId: string }) {
  const { toast } = useToast();
  const repo = new StudentsRepository();
  const [tab, setTab] = useState("details");
  const [student, setStudent] = useState<Student | null>(null);
  const [orders, setOrders] = useState<StudentOrder[]>([]);
  const [certs, setCerts] = useState<StudentCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [s, o, c] = await Promise.all([
          repo.getStudent(studentId),
          repo.getStudentOrders(studentId),
          repo.getStudentCertificates(studentId),
        ]);
        if (s.success) setStudent(s.data);
        else toast(s.message, "danger");
        if (o.success && o.data) setOrders(o.data);
        if (c.success && c.data) setCerts(c.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId]);

  const orderColumns: Column<StudentOrder>[] = [
    { key: "number", title: "Order", render: (v) => v || "—" },
    {
      key: "trx",
      title: "Amount",
      render: (_, row) => formatCurrency(row.trx?.amount ?? 0, { currency: "USD" }),
    },
    {
      key: "status",
      title: "Status",
      render: (v) => (
        <StatusBadge
          status={
            v === "confirmed" ? "confirmed" : v === "cancelled" ? "cancelled" : "pending"
          }
        />
      ),
    },
    {
      key: "createdDate",
      title: "Date",
      render: (v) => formatDate(v, "DD MMM YYYY"),
    },
  ];

  const certColumns: Column<StudentCertificate>[] = [
    { key: "certificateNumber", title: "Number" },
    { key: "course", title: "Course", render: (_, row) => row.course?.title || "—" },
    {
      key: "issuedAt",
      title: "Issued",
      render: (v) => formatDate(v, "DD MMM YYYY"),
    },
    {
      key: "isRevoked",
      title: "Status",
      render: (v) => <StatusBadge status={v ? "revoked" : "active"} />,
    },
  ];

  return (
    <DashboardLayout title="Member Details">
      {loading ? (
        <div className="h-40 rounded-xl skeleton" />
      ) : !student ? (
        <p className="text-sm text-[#717171]">Member not found.</p>
      ) : (
        <div className="space-y-5">
          <Tabs
            tabs={[
              { key: "details", label: "Details" },
              { key: "orders", label: "Orders" },
              { key: "certificates", label: "Certificates" },
            ]}
            activeKey={tab}
            onChange={setTab}
          />

          {tab === "details" && (
            <div className="bg-white rounded-xl border border-[#E7E9EB] p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xl font-semibold overflow-hidden">
                  {student.picture ? (
                     
                    <img src={student.picture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    student.firstName?.[0]
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    {student.firstName} {student.lastName}
                  </h2>
                  <StatusBadge status={student.isActive ? "active" : "inactive"} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#717171]">Email</p>
                  <p className="font-medium">{student.email}</p>
                </div>
                <div>
                  <p className="text-[#717171]">Phone</p>
                  <p className="font-medium">{student.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-[#717171]">Address</p>
                  <p className="font-medium">{student.address || "—"}</p>
                </div>
                <div>
                  <p className="text-[#717171]">Joined</p>
                  <p className="font-medium">{formatDate(student.createdDate, "DD MMMM YYYY")}</p>
                </div>
              </div>
            </div>
          )}

          {tab === "orders" && (
            <DataTable columns={orderColumns} data={orders} keyField="id" emptyText="No orders" />
          )}
          {tab === "certificates" && (
            <DataTable columns={certColumns} data={certs} keyField="id" emptyText="No certificates" />
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
