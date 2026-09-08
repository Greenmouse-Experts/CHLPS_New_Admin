"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout, StatCard } from "@/components";
import { Button, ConfirmModal, Divider, StatusBadge } from "@/components/ui";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";
import PageLoader from "@/components/PageLoader";
import {
  AddCircle,
  Calendar,
  People,
  SearchNormal1,
  Wallet3,
} from "iconsax-react";
import { useMemberships } from "../domain/data/hooks/membership_hook";
import { Membership } from "../domain/data/response/membership_response";
import { MembershipModal } from "../components/membership_modal";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";

export default function MembershipPage() {
  const router = useRouter();
  const {
    memberships,
    total,
    page,
    pageSize,
    isLoading,
    isError,
    error,
    isSaving,
    search,
    stats,
    handleSearch,
    handlePageChange,
    createMembership,
    updateMembership,
    togglePublish,
    removeMembership,
    refetch,
  } = useMemberships();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Membership | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const columns: columnType<Membership>[] = [
    {
      key: "name",
      label: "Membership",
      render: (_, row) => (
        <div className="flex items-start gap-3 min-w-[260px] max-w-[320px]">
          {row.image ? (
            <img
              src={row.image}
              alt=""
              className="w-10 h-10 rounded-lg object-cover border border-[#E7E9EB] shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-base-200 shrink-0 flex items-center justify-center font-bold text-sm text-base-content/70">
              {row.name?.[0] || "M"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-base-content leading-tight hover:underline cursor-pointer">
              {row.name}
            </p>
            <p className="text-xs text-base-content/60 line-clamp-2 mt-0.5 whitespace-normal">
              {row.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (_, row) => (
        <span className="text-sm font-medium text-base-content">
          {typeof row.type === "object" && row.type !== null
            ? row.type.name
            : (row.type ?? row.category ?? "—")}
        </span>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (v, row) => (
        <span className="text-sm font-semibold text-base-content whitespace-nowrap">
          {formatCurrency(Number(v) || 0, { currency: row.currency || "NGN" })}
        </span>
      ),
    },
    {
      key: "duration",
      label: "Duration",
      render: (v) => (
        <span className="text-sm text-base-content/80 whitespace-nowrap">
          {String(v || "—")}
        </span>
      ),
    },
    {
      key: "createdDate",
      label: "Created",
      render: (v) => (
        <span className="text-sm text-base-content/80 whitespace-nowrap">
          {v ? formatDate(v, "DD MMM YYYY") : "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v) => <StatusBadge status={v} />,
    },
  ];

  const actions: Actions<Membership>[] = [
    {
      key: "view_details",
      label: "View Details",
      action: (row, r) => {
        if (!row.id) return;
        r.push(`/membership/${row.id}`);
      },
    },
    {
      key: "toggle_publish",
      label: "Publish / Un-publish",
      render: (row) => (
        <span
          className={
            row.status === "published"
              ? "text-amber-600 font-medium"
              : "text-emerald-600 font-medium"
          }
        >
          {row.status === "published" ? "Unpublish" : "Publish"}
        </span>
      ),
      action: (row) => {
        if (!row.id) return;
        togglePublish(row.id, row.status);
      },
    },
    {
      key: "edit",
      label: "Edit",
      action: (row) => {
        setEditing(row);
        setModalOpen(true);
      },
    },
    {
      key: "delete",
      label: "Delete",
      render: () => <span className="text-error font-medium">Delete</span>,
      action: (row) => {
        setDeleteId(row.id ?? null);
      },
    },
  ];

  return (
    <DashboardLayout title="Membership">
      <div className="space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Members"
            value={stats.totalMembers ?? stats.totalMemberships ?? 0}
            loading={isLoading}
            icon={<People size={20} color="#717171" />}
          />
          <StatCard
            title="Total this month"
            value={stats.totalThisMonth ?? 0}
            loading={isLoading}
            icon={<Calendar size={20} color="#717171" />}
          />
          <StatCard
            title="Amount Paid"
            value={formatCurrency(stats.amountPaid ?? 0, {
              currency: "NGN",
              decimals: 0,
            })}
            loading={isLoading}
            icon={<Wallet3 size={20} color="#717171" />}
          />
        </div>

        <div className="space-y-3 bg-white rounded-xl border border-[#E7E9EB] p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 border border-[#E7E9EB] rounded-lg px-3 h-9 bg-white w-64 focus-within:border-primary transition-colors">
              <SearchNormal1 size={15} color="#717171" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search memberships..."
                className="flex-1 text-xs outline-none focus:outline-none focus-visible:outline-none ring-0 bg-transparent placeholder-[#ADADAD]"
              />
            </div>
            <Button
              leftIcon={<AddCircle size={14} color="currentColor" />}
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              Create membership
            </Button>
          </div>

          <Divider />

          <PageLoader
            query={{
              data: memberships,
              isLoading,
              isError,
              error,
              refetch,
            }}
          >
            <CustomTable
              ring={false}
              columns={columns}
              data={memberships}
              actions={actions}
              totalCount={total}
              onRowClick={(item) =>
                item.id && router.push(`/membership/${item.id}`)
              }
              paginationProps={{
                page,
                pageSize,
                setPagination: handlePageChange,
              }}
            />
          </PageLoader>
        </div>
      </div>

      <MembershipModal
        open={modalOpen}
        membership={editing}
        isSubmitting={isSaving}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={(payload) =>
          editing && editing.id
            ? updateMembership(editing.id, payload)
            : createMembership(payload)
        }
      />

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete membership"
        description="This will permanently remove the membership plan from the list."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          if (!deleteId) return;
          await removeMembership(deleteId);
          setDeleteId(null);
        }}
      />
    </DashboardLayout>
  );
}
