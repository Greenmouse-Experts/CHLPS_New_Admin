"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Divider, StatusBadge } from "@/components/ui";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";
import { Ban, CheckCircle, Eye, Search, XCircle } from "lucide-react";
import { MembershipSubscriber } from "../../domain/data/response/membership_response";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";

interface MembershipMembersTabProps {
  subscribers: MembershipSubscriber[];
  onApprove: (item: MembershipSubscriber) => void;
  onDeny: (item: MembershipSubscriber) => void;
  onCancelSub: (item: MembershipSubscriber) => void;
}

export function MembershipMembersTab({
  subscribers,
  onApprove,
  onDeny,
  onCancelSub,
}: MembershipMembersTabProps) {
  const router = useRouter();
  const [memberSearch, setMemberSearch] = useState("");

  const filteredSubscribers = useMemo(() => {
    if (!memberSearch.trim()) return subscribers;
    const q = memberSearch.toLowerCase();
    return subscribers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.phone && s.phone.toLowerCase().includes(q)) ||
        s.status.toLowerCase().includes(q),
    );
  }, [subscribers, memberSearch]);

  const subscriberColumns: columnType<MembershipSubscriber>[] = [
    {
      key: "name",
      label: "Member",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          {row.avatar ? (
            <img
              src={row.avatar}
              alt=""
              className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#E7E9EB]"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
              {row.name
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "M"}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-base-content leading-tight hover:text-primary transition-colors cursor-pointer">
              {row.name}
            </p>
            <p className="text-xs text-base-content/60 truncate">{row.email}</p>
            {row.phone && (
              <p className="text-[11px] text-base-content/40">{row.phone}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "joinedDate",
      label: "Joined Date",
      render: (v) => (
        <span className="text-sm text-base-content/80 whitespace-nowrap">
          {v ? formatDate(v, "DD MMM YYYY") : "—"}
        </span>
      ),
    },
    {
      key: "expiryDate",
      label: "Expires",
      render: (v) => (
        <span className="text-sm text-base-content/80 whitespace-nowrap">
          {!v ? "—" : v?.startsWith("2099") ? "Lifetime" : formatDate(v, "DD MMM YYYY")}
        </span>
      ),
    },
    {
      key: "amountPaid",
      label: "Paid",
      render: (v, row) => (
        <span className="text-sm font-semibold text-base-content whitespace-nowrap">
          {formatCurrency(Number(v) || 0, { currency: row.currency || "CAD" })}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v) => <StatusBadge status={v} />,
    },
  ];

  const subscriberActions: Actions<MembershipSubscriber>[] = [
    {
      key: "view_member",
      label: "View Member Details",
      render: () => (
        <span className="flex items-center gap-2 text-base-content/80 font-medium">
          <Eye size={15} />
          View Member Details
        </span>
      ),
      action: (row, r) => {
        r.push(`/students/${row.id}`);
      },
    },
    {
      key: "approve_member",
      label: "Approve Membership",
      render: () => (
        <span className="flex items-center gap-2 text-emerald-600 font-medium">
          <CheckCircle size={15} />
          Approve Membership
        </span>
      ),
      disabled: (row) =>
        row.status === "active" ||
        row.applicationStatus === "approved" ||
        !row.applicationId,
      action: (row) => {
        onApprove(row);
      },
    },
    {
      key: "deny_member",
      label: "Deny Membership",
      render: () => (
        <span className="flex items-center gap-2 text-rose-600 font-medium">
          <XCircle size={15} />
          Deny Membership
        </span>
      ),
      disabled: (row) =>
        row.status === "cancelled" ||
        row.applicationStatus === "rejected" ||
        !row.applicationId,
      action: (row) => {
        onDeny(row);
      },
    },
    {
      key: "cancel_membership",
      label: "Cancel Membership",
      render: () => (
        <span className="flex items-center gap-2 text-rose-600 font-medium">
          <Ban size={15} />
          Cancel Membership
        </span>
      ),
      disabled: (row) => row.status !== "active",
      action: (row) => {
        onCancelSub(row);
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
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            placeholder="Search enrolled members..."
            className="flex-1 text-xs outline-none focus:outline-none focus-visible:outline-none ring-0 bg-transparent placeholder-[#ADADAD]"
          />
        </div>
        <p className="text-xs text-base-content/60">
          Showing <b>{filteredSubscribers.length}</b> member(s)
        </p>
      </div>

      <Divider />

      <CustomTable
        ring={false}
        columns={subscriberColumns}
        data={filteredSubscribers}
        actions={subscriberActions}
        totalCount={filteredSubscribers.length}
        onRowClick={(row) => router.push(`/students/${row.id}`)}
      />
    </div>
  );
}
