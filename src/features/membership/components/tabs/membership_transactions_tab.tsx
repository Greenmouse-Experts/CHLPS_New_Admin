"use client";

import { useMemo, useState } from "react";
import { Divider, StatusBadge } from "@/components/ui";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";
import { Ban, CheckCircle, Eye, Search, XCircle } from "lucide-react";
import { MembershipTransaction } from "../../domain/data/response/membership_response";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";

interface MembershipTransactionsTabProps {
  transactions: MembershipTransaction[];
  onApprove: (item: MembershipTransaction) => void;
  onDeny: (item: MembershipTransaction) => void;
  onCancelOrder: (item: MembershipTransaction) => void;
}

export function MembershipTransactionsTab({
  transactions,
  onApprove,
  onDeny,
  onCancelOrder,
}: MembershipTransactionsTabProps) {
  const [trxSearch, setTrxSearch] = useState("");

  const filteredTransactions = useMemo(() => {
    if (!trxSearch.trim()) return transactions;
    const q = trxSearch.toLowerCase();
    return transactions.filter(
      (t) =>
        t.memberName.toLowerCase().includes(q) ||
        t.memberEmail.toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q) ||
        t.paymentMethod.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q),
    );
  }, [transactions, trxSearch]);

  const transactionColumns: columnType<MembershipTransaction>[] = [
    {
      key: "reference",
      label: "Reference",
      render: (v) => (
        <span className="font-mono text-xs font-semibold text-primary">
          {v}
        </span>
      ),
    },
    {
      key: "memberName",
      label: "Member",
      render: (_, row) => (
        <div>
          <p className="text-sm font-semibold text-base-content">
            {row.memberName}
          </p>
          <p className="text-xs text-base-content/60">{row.memberEmail}</p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (v, row) => (
        <span className="text-sm font-semibold text-base-content whitespace-nowrap">
          {formatCurrency(Number(v) || 0, { currency: row.currency || "CAD" })}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      label: "Method",
      render: (v) => (
        <span className="text-xs font-medium uppercase text-base-content/80 bg-base-200 px-2 py-0.5 rounded">
          {String(v).replace("_", " ")}
        </span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (v) => (
        <span className="text-sm text-base-content/80 whitespace-nowrap">
          {v ? formatDate(v, "DD MMM YYYY, hh:mm A") : "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Payment Status",
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: "applicationStatus",
      label: "Membership Status",
      render: (_, row) => {
        const appStatus =
          row.applicationStatus ||
          (row.status === "confirmed" ? "approved" : "pending");

        if (appStatus === "approved" || appStatus === "active") {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle size={12} className="text-emerald-600" />
              Approved
            </span>
          );
        }

        if (appStatus === "rejected" || appStatus === "cancelled") {
          return (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
              title={row.rejectReason || undefined}
            >
              <XCircle size={12} className="text-rose-600" />
              Denied
            </span>
          );
        }

        return (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Pending
            </span>
            {row.applicationId && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(row);
                  }}
                  className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeny(row);
                  }}
                  className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                >
                  Deny
                </button>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const transactionActions: Actions<MembershipTransaction>[] = [
    {
      key: "view_user",
      label: "View Member Details",
      render: () => (
        <span className="flex items-center gap-2 text-base-content/80 font-medium">
          <Eye size={15} />
          View Member Details
        </span>
      ),
      disabled: (row) => !(row.userId || row.studentId),
      action: (row, r) => {
        const sid = row.userId || row.studentId;
        if (sid) r.push(`/students/${sid}`);
      },
    },
    {
      key: "approve_application",
      label: "Approve Membership",
      render: () => (
        <span className="flex items-center gap-2 text-emerald-600 font-medium">
          <CheckCircle size={15} />
          Approve Membership
        </span>
      ),
      disabled: (row) =>
        row.applicationStatus === "approved" || !row.applicationId,
      action: (row) => {
        onApprove(row);
      },
    },
    {
      key: "deny_application",
      label: "Deny Membership",
      render: () => (
        <span className="flex items-center gap-2 text-rose-600 font-medium">
          <XCircle size={15} />
          Deny Membership
        </span>
      ),
      disabled: (row) =>
        row.applicationStatus === "rejected" || !row.applicationId,
      action: (row) => {
        onDeny(row);
      },
    },
    {
      key: "cancel_order",
      label: "Cancel Order",
      render: () => (
        <span className="flex items-center gap-2 text-rose-600 font-medium">
          <Ban size={15} />
          Cancel Order
        </span>
      ),
      disabled: (row) => row.status !== "pending",
      action: (row) => {
        onCancelOrder(row);
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#E7E9EB] p-4 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 border border-[#E7E9EB] rounded-lg px-3 h-9 bg-white w-64 focus-within:border-primary transition-colors">
          <Search size={15} className="text-secondary" />
          <input
            type="text"
            value={trxSearch}
            onChange={(e) => setTrxSearch(e.target.value)}
            placeholder="Search transactions..."
            className="flex-1 text-xs outline-none focus:outline-none focus-visible:outline-none ring-0 bg-transparent placeholder-[#ADADAD]"
          />
        </div>
        <p className="text-xs text-base-content/60">
          Showing <b>{filteredTransactions.length}</b> transaction(s)
        </p>
      </div>

      <Divider />

      <CustomTable
        ring={false}
        columns={transactionColumns}
        data={filteredTransactions}
        actions={transactionActions}
        totalCount={filteredTransactions.length}
      />
    </div>
  );
}
