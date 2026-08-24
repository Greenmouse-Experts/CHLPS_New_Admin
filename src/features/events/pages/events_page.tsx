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
import { useEvents } from "../domain/data/hooks/events_hook";
import {
  EventItem,
  EVENT_CATEGORIES,
  EVENT_FORMATS,
  labelOf,
} from "../domain/data/response/events_response";
import { EventModal } from "../components/event_modal";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";

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
    removeEvent,
  } = useEvents();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const columns: Column<EventItem>[] = [
    {
      key: "name",
      title: "Event",
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
      render: (v) => labelOf(EVENT_CATEGORIES, v),
    },
    {
      key: "format",
      title: "Format",
      className: "whitespace-nowrap",
      render: (v) => labelOf(EVENT_FORMATS, v),
    },
    {
      key: "startDate",
      title: "Starts",
      className: "whitespace-nowrap",
      render: (v, row) => `${formatDate(v, "DD MMM YYYY")} · ${row.startTime}`,
    },
    {
      key: "price",
      title: "Price",
      className: "whitespace-nowrap",
      render: (v, row) =>
        Number(v) === 0
          ? "Free"
          : formatCurrency(Number(v) || 0, { currency: row.currency }),
    },
    {
      key: "attendeesCount",
      title: "Attendees",
      className: "whitespace-nowrap",
    },
    {
      key: "status",
      title: "Status",
      className: "whitespace-nowrap",
      render: (v) => <StatusBadge status={v} />,
    },
  ];

  const actions: TableAction<EventItem>[] = [
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
                placeholder="Search events"
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
              Create event
            </Button>
          </div>
          <Divider />
          <DataTable
            className="border-none rounded-none"
            columns={columns}
            data={events}
            keyField="id"
            loading={isLoading}
            actions={actions}
            title="Events"
            emptyText="No events found"
            pagination={{
              page,
              pageSize,
              total,
              onChange: handlePageChange,
            }}
          />
        </div>
      </div>

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
