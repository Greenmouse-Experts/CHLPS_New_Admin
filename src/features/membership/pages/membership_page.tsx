"use client";

import { useState } from "react";
import { DashboardLayout, StatCard } from "@/components";
import {
  Button,
  Column,
  ConfirmModal,
  DataTable,
  Divider,
  StatusBadge,
  TableAction,
} from "@/components/ui";
import { AddCircle, Calendar, People, SearchNormal1, Wallet3 } from "iconsax-react";
import { useMemberships } from "../domain/data/hooks/membership_hook";
import {
  Membership,
  MEMBERSHIP_CATEGORIES,
  MEMBERSHIP_DURATIONS,
  labelOf,
} from "../domain/data/response/membership_response";
import { MembershipModal } from "../components/membership_modal";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";

export default function MembershipPage() {
  const {
    memberships,
    total,
    page,
    pageSize,
    isLoading,
    isSaving,
    search,
    stats,
    handleSearch,
    handlePageChange,
    createMembership,
    updateMembership,
    removeMembership,
  } = useMemberships();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Membership | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const columns: Column<Membership>[] = [
    {
      key: "name",
      title: "Membership",
      width: 280,
      className: "min-w-[280px] w-[280px] max-w-[280px] whitespace-normal",
      render: (_, row) => (
        <div className="flex items-start gap-3 w-[280px]">
          {row.image ? (
            <img
              src={row.image}
              alt=""
              className="w-10 h-10 rounded-lg object-cover border border-[#E7E9EB] shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-[#F7F7F7] shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-black">{row.name}</p>
            <p className="text-xs text-[#717171] whitespace-normal break-words">
              {row.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      title: "Category",
      className: "whitespace-nowrap",
      render: (v) => labelOf(MEMBERSHIP_CATEGORIES, v),
    },
    {
      key: "price",
      title: "Price",
      className: "whitespace-nowrap",
      render: (v, row) => formatCurrency(Number(v) || 0, { currency: row.currency }),
    },
    {
      key: "duration",
      title: "Duration",
      className: "whitespace-nowrap",
      render: (v) => labelOf(MEMBERSHIP_DURATIONS, v),
    },
    {
      key: "membersCount",
      title: "Members",
      className: "whitespace-nowrap",
    },
    {
      key: "registrationStartDate",
      title: "Opens",
      className: "whitespace-nowrap",
      render: (v) => formatDate(v, "DD MMM YYYY"),
    },
    {
      key: "status",
      title: "Status",
      className: "whitespace-nowrap",
      render: (v) => <StatusBadge status={v} />,
    },
  ];

  const actions: TableAction<Membership>[] = [
    {
      label: "Edit",
      onClick: (row) => {
        setEditing(row);
        setModalOpen(true);
      },
    },
    {
      label: "Delete",
      variant: "danger",
      onClick: (row) => setDeleteId(row.id),
    },
  ];

  return (
    <DashboardLayout title="Membership">
      <div className="space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Members"
            value={stats.totalMembers}
            loading={isLoading}
            icon={<People size={20} color="#717171" />}
          />
          <StatCard
            title="Total this month"
            value={stats.totalThisMonth}
            loading={isLoading}
            icon={<Calendar size={20} color="#717171" />}
          />
          <StatCard
            title="Amount Paid"
            value={formatCurrency(stats.amountPaid, { currency: "NGN", decimals: 0 })}
            loading={isLoading}
            icon={<Wallet3 size={20} color="#717171" />}
          />
        </div>

        <div className="space-y-3 bg-white rounded-md border border-[#F0F0F0] pt-4 pb-2">
          <div className="flex flex-wrap items-center justify-between px-4 gap-3">
            <div className="flex items-center gap-2 border border-[#E7E9EB] rounded-lg px-3 h-9 bg-white w-52">
              <SearchNormal1 size={13} color="#717171" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search memberships"
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
          <DataTable
            className="border-none rounded-none"
            columns={columns}
            data={memberships}
            keyField="id"
            loading={isLoading}
            actions={actions}
            title="Memberships"
            emptyText="No memberships found"
            pagination={{
              page,
              pageSize,
              total,
              onChange: handlePageChange,
            }}
          />
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
          editing
            ? updateMembership(editing.id, payload)
            : createMembership(payload)
        }
      />

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete membership"
        description="This will remove the membership plan from the list."
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
