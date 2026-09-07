"use client";

import { useMemo, useRef, useState } from "react";
import { DashboardLayout, StatCard } from "@/components";
import { Button, ConfirmModal, Divider, StatusBadge } from "@/components/ui";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";
import {
  AddCircle,
  Calendar,
  People,
  SearchNormal1,
  Wallet3,
} from "iconsax-react";
import { useEvents } from "../domain/data/hooks/events_hook";
import {
  EventItem,
  EVENT_CATEGORIES,
  EVENT_FORMATS,
  labelOf,
} from "../domain/data/response/events_response";
import { EventModal } from "../components/event_modal";
import { EventDetailModal } from "../components/event_detail_modal";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";
import { ModalHandle } from "@/components/DialogModal";

type DetailModalHandle = ModalHandle & {
  setEvent: (event: EventItem | null) => void;
};

export default function EventsPage() {
  const {
    events,
    total,
    page,
    pageSize,
    isLoading,
    isSaving,
    search,
    stats,
    handleSearch,
    handlePageChange,
    createEvent,
    updateEvent,
    togglePublish,
    removeEvent,
  } = useEvents();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const detailModalRef = useRef<DetailModalHandle>(null);

  const openDetailModal = (item: EventItem) => {
    detailModalRef.current?.setEvent(item);
    detailModalRef.current?.open();
  };

  const columns: columnType<EventItem>[] = useMemo(
    () => [
      {
        key: "name",
        label: "Event",
        render: (_, row) => (
          <div className="flex items-start gap-3 min-w-[240px] max-w-[320px]">
            {row.image ? (
              <img
                src={row.image}
                alt=""
                className="w-10 h-10 rounded-lg object-cover border border-base-300 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-base-200 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-base-content line-clamp-1 hover:underline cursor-pointer">
                {row.name}
              </p>
              <p className="text-xs text-secondary line-clamp-1">
                {row.description}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "category",
        label: "Category",
        render: (v) => (
          <span className="text-sm text-base-content whitespace-nowrap">
            {labelOf(EVENT_CATEGORIES, v)}
          </span>
        ),
      },
      {
        key: "format",
        label: "Format",
        render: (v) => (
          <span className="text-sm text-base-content capitalize whitespace-nowrap">
            {labelOf(EVENT_FORMATS, v)}
          </span>
        ),
      },
      {
        key: "startDate",
        label: "Starts",
        render: (v, row) => (
          <span className="text-sm text-secondary whitespace-nowrap">
            {formatDate(v, "DD MMM YYYY")} · {row.startTime}
          </span>
        ),
      },
      {
        key: "price",
        label: "Price",
        render: (v, row) => (
          <span className="text-sm font-medium text-base-content whitespace-nowrap">
            {Number(v) === 0
              ? "Free"
              : formatCurrency(Number(v) || 0, { currency: row.currency })}
          </span>
        ),
      },
      {
        key: "attendeesCount",
        label: "Attendees",
        render: (v) => (
          <span className="text-sm text-base-content whitespace-nowrap font-medium">
            {v ?? 0}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (v) => <StatusBadge status={v} />,
      },
    ],
    [],
  );

  const actions: Actions<EventItem>[] = [
    {
      key: "view_details",
      label: "View Details",
      action: (row) => openDetailModal(row),
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
          {row.status === "published" ? "Un-publish" : "Publish"}
        </span>
      ),
      action: (row) => togglePublish(row.id),
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
      action: (row) => setDeleteId(row.id),
    },
  ];

  return (
    <DashboardLayout title="Events">
      <div className="space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            loading={isLoading}
            icon={<Calendar size={20} color="#717171" />}
          />
          <StatCard
            title="Total this month"
            value={stats.totalThisMonth}
            loading={isLoading}
            icon={<People size={20} color="#717171" />}
          />
          <StatCard
            title="Amount Paid"
            value={formatCurrency(stats.amountPaid, {
              currency: "NGN",
              decimals: 0,
            })}
            loading={isLoading}
            icon={<Wallet3 size={20} color="#717171" />}
          />
        </div>

        <div className="space-y-3 bg-white rounded-xl border border-base-300 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 border border-base-300 rounded-lg px-3 h-10 bg-white w-64 focus-within:border-primary transition-colors">
              <SearchNormal1 size={14} color="#717171" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search events..."
                className="flex-1 text-sm outline-none focus:outline-none focus-visible:outline-none ring-0 bg-transparent placeholder-secondary/50"
              />
            </div>
            <Button
              leftIcon={<AddCircle size={14} color="currentColor" />}
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              Create event
            </Button>
          </div>
          <Divider />
          {isLoading ? (
            <div className="h-48 rounded-xl skeleton" />
          ) : (
            <CustomTable
              ring={false}
              columns={columns}
              data={events}
              actions={actions}
              totalCount={total}
              onRowClick={(row) => openDetailModal(row)}
              paginationProps={{
                page,
                pageSize,
                setPagination: handlePageChange,
              }}
            />
          )}
        </div>
      </div>

      <EventDetailModal
        ref={detailModalRef}
        onEdit={(item) => {
          setEditing(item);
          setModalOpen(true);
        }}
        onTogglePublish={(id) => togglePublish(id)}
      />

      <EventModal
        open={modalOpen}
        event={editing}
        isSubmitting={isSaving}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={(payload) =>
          editing ? updateEvent(editing.id, payload) : createEvent(payload)
        }
      />

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete event"
        description="This will remove the event from the list."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          if (!deleteId) return;
          await removeEvent(deleteId);
          setDeleteId(null);
        }}
      />
    </DashboardLayout>
  );
}
