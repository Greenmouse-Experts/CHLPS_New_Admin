"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Divider, FilterBar, FilterOption, StatusBadge } from "@/components/ui";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";
import { Ban, Eye } from "lucide-react";
import { MembershipSubscriber } from "../../domain/data/response/membership_response";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";

export interface MembershipMembersTabProps {
  subscribers: MembershipSubscriber[];
  totalCount?: number;
  isLoading?: boolean;
  onFilterChange?: (params: { status?: string; search?: string }) => void;
  onCancelSub?: (item: MembershipSubscriber) => void;
}

export function MembershipMembersTab({
  subscribers = [],
  totalCount,
  isLoading = false,
  onFilterChange,
  onCancelSub,
}: MembershipMembersTabProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    onFilterChange?.({
      status: newStatus !== "all" ? newStatus : undefined,
      search: search.trim() || undefined,
    });
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    onFilterChange?.({
      status: statusFilter !== "all" ? statusFilter : undefined,
      search: newSearch.trim() || undefined,
    });
  };

  // Client-side fallback / safety filtering if onFilterChange is not provided
  const displayedMembers = useMemo(() => {
    if (onFilterChange) {
      // If we delegate to parent/backend, we still do client-side search refinement
      if (!search.trim()) return subscribers;
      const q = search.toLowerCase();
      return subscribers.filter((sub) => {
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
  }, [subscribers, onFilterChange, statusFilter, search]);

  const filterOptions: FilterOption[] = useMemo(() => {
    let active = 0;
    let expired = 0;
    let cancelled = 0;

    subscribers.forEach((sub) => {
      const s = String(sub.status).toLowerCase();
      if (s === "active") active++;
      else if (s === "expired") expired++;
      else if (s === "cancelled" || s === "rejected") cancelled++;
    });

    return [
      { value: "all", label: "All", count: totalCount ?? subscribers.length },
      { value: "active", label: "Active", count: active, badgeVariant: "success" },
      { value: "expired", label: "Expired", count: expired, badgeVariant: "warning" },
      { value: "cancelled", label: "Cancelled", count: cancelled, badgeVariant: "danger" },
    ];
  }, [subscribers, totalCount]);

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
      {/* Reusable Dynamic Filter Bar */}
      <FilterBar
        statusTabs={{
          key: "status",
          options: filterOptions,
          selectedValue: statusFilter,
          onChange: handleStatusChange,
        }}
        search={{
          value: search,
          placeholder: "Search enrolled members...",
          onChange: handleSearchChange,
        }}
        isLoading={isLoading}
      />

      <Divider />

      <CustomTable
        ring={false}
        columns={columns}
        data={displayedMembers}
        actions={actions}
        totalCount={displayedMembers.length}
        onRowClick={(row) => router.push(`/students/${row.id}`)}
      />
    </div>
  );
}
