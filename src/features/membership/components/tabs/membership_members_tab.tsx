"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Divider, StatusBadge } from "@/components/ui";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";
import {
  Ban,
  Eye,
  Search,
} from "lucide-react";
import {
  MembershipSubscriber,
} from "../../domain/data/response/membership_response";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";

export interface MembershipMembersTabProps {
  subscribers: MembershipSubscriber[];
  onCancelSub?: (item: MembershipSubscriber) => void;
}

export function MembershipMembersTab({
  subscribers = [],
  onCancelSub,
}: MembershipMembersTabProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredMembers = useMemo(() => {
    let result = subscribers;

    if (statusFilter !== "all") {
      result = result.filter(
        (sub) => String(sub.status).toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((sub) => {
        const name = (sub.name || "").toLowerCase();
        const email = (sub.email || "").toLowerCase();
        const phone = (sub.phone || "").toLowerCase();
        const memberNum = (sub.memberNumber || "").toLowerCase();

        return (
          name.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          memberNum.includes(q)
        );
      });
    }

    return result;
  }, [subscribers, statusFilter, search]);

  const stats = useMemo(() => {
    let active = 0;
    let expired = 0;
    let cancelled = 0;

    subscribers.forEach((sub) => {
      const s = String(sub.status).toLowerCase();
      if (s === "active") active++;
      else if (s === "expired") expired++;
      else if (s === "cancelled" || s === "rejected") cancelled++;
    });

    return {
      all: subscribers.length,
      active,
      expired,
      cancelled,
    };
  }, [subscribers]);

  const columns: columnType<MembershipSubscriber>[] = [
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
              {(row.name?.[0] || "M").toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p
              onClick={() => {
                if (row.id) router.push(`/students/${row.id}`);
              }}
              className="text-sm font-semibold text-base-content leading-tight hover:text-primary transition-colors cursor-pointer"
            >
              {row.name}
            </p>
            <p className="text-xs text-base-content/60 truncate">{row.email || "—"}</p>
            {row.phone && row.phone !== "—" && (
              <p className="text-[11px] text-base-content/40">{row.phone}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "memberNumber",
      label: "Member ID",
      render: (v) => (
        <span className="font-mono text-xs font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded">
          {v || "—"}
        </span>
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
          {!v ? "—" : v.startsWith("2099") ? "Lifetime" : formatDate(v, "DD MMM YYYY")}
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

  const actions: Actions<MembershipSubscriber>[] = [
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
      key: "cancel_membership",
      label: "Cancel Membership",
      render: () => (
        <span className="flex items-center gap-2 text-rose-600 font-medium">
          <Ban size={15} />
          Cancel Membership
        </span>
      ),
      disabled: (row) => row.status === "cancelled" || !row.studentMembershipId,
      action: (row) => {
        if (onCancelSub) onCancelSub(row);
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#E7E9EB] p-4 shadow-sm space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-base-200/60 rounded-lg">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              statusFilter === "all"
                ? "bg-white text-base-content shadow-xs"
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            All ({stats.all})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              statusFilter === "active"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            Active ({stats.active})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("expired")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              statusFilter === "expired"
                ? "bg-white text-amber-700 shadow-xs"
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            Expired ({stats.expired})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("cancelled")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              statusFilter === "cancelled"
                ? "bg-white text-rose-700 shadow-xs"
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            Cancelled ({stats.cancelled})
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 border border-[#E7E9EB] rounded-lg px-3 h-9 bg-white w-64 focus-within:border-primary transition-colors">
          <Search size={15} className="text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search enrolled members..."
            className="flex-1 text-xs outline-none focus:outline-none focus-visible:outline-none ring-0 bg-transparent placeholder-[#ADADAD]"
          />
        </div>
      </div>

      <Divider />

      <CustomTable
        ring={false}
        columns={columns}
        data={filteredMembers}
        actions={actions}
        totalCount={filteredMembers.length}
        onRowClick={(row) => router.push(`/students/${row.id}`)}
      />
    </div>
  );
}
