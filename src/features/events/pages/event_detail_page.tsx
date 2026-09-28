"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout, StatCard } from "@/components";
import {
  Button,
  ConfirmModal,
  Divider,
  StatusBadge,
  Tabs,
  useToast,
} from "@/components/ui";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import PageLoader from "@/components/PageLoader";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  ExternalLink,
  Eye,
  Globe,
  Link as LinkIcon,
  Mail,
  MapPin,
  Phone,
  QrCode,
  Search,
  Tag,
  Ticket,
  Trash2,
  User,
  Users,
  Wallet,
} from "lucide-react";
import EventsRepository from "../domain/repository/events_repository";
import {
  EventItem,
  EventPayload,
  EventRegistrationItem,
  EventStatus,
  EVENT_CATEGORIES,
  EVENT_ELIGIBILITY,
  EVENT_FORMATS,
  labelOf,
} from "../domain/data/response/events_response";
import { EventModal } from "../components/event_modal";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";

export default function EventDetailPage({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const repo = useMemo(() => new EventsRepository(), []);

  const [event, setEvent] = useState<EventItem | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [searchReg, setSearchReg] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  const loadEvent = useCallback(async () => {
    setLoading(true);
    setIsError(false);
    setErrorMsg(null);
    try {
      const res = await repo.getOne(eventId);
      if (res.success && res.data) {
        setEvent(res.data);
      } else {
        setIsError(true);
        setErrorMsg(res.message || "Failed to load event details");
      }
    } catch {
      setIsError(true);
      setErrorMsg("Failed to load event details");
    } finally {
      setLoading(false);
    }
  }, [eventId, repo]);

  const loadRegistrations = useCallback(async () => {
    setRegLoading(true);
    try {
      const res = await repo.listRegistrations(eventId);
      if (res.success && res.data) {
        setRegistrations(res.data.items || []);
      }
    } catch {
      // Soft failure for registrations
    } finally {
      setRegLoading(false);
    }
  }, [eventId, repo]);

  useEffect(() => {
    loadEvent();
    loadRegistrations();
  }, [loadEvent, loadRegistrations]);

  const isPublished = (event?.status || "").toLowerCase() === "published";

  const handleTogglePublish = async () => {
    if (!event) return;
    setActionBusy(true);
    const nextStatus: EventStatus = isPublished ? "Draft" : "Published";
    try {
      const res = await repo.updateStatus(event.id, nextStatus);
      if (res.success) {
        toast(
          nextStatus === "Published" ? "Event published live" : "Event unpublished",
          "success",
        );
        setEvent((prev) => (prev ? { ...prev, status: nextStatus } : null));
      } else {
        toast(res.message, "danger");
      }
    } finally {
      setActionBusy(false);
    }
  };

  const handleUpdate = async (payload: Partial<EventPayload>) => {
    if (!event) return false;
    setActionBusy(true);
    try {
      const res = await repo.update(event.id, payload);
      if (res.success) {
        toast("Event updated successfully", "success");
        setEditModalOpen(false);
        loadEvent();
        return true;
      } else {
        toast(res.message, "danger");
        return false;
      }
    } finally {
      setActionBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    setActionBusy(true);
    try {
      const res = await repo.remove(event.id);
      if (res.success) {
        toast("Event deleted successfully", "success");
        router.push("/events");
      } else {
        toast(res.message, "danger");
      }
    } finally {
      setActionBusy(false);
      setDeleteOpen(false);
    }
  };

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    if (!searchReg.trim()) return registrations;
    const q = searchReg.toLowerCase();
    return registrations.filter((r) => {
      const name = `${r.user?.firstName ?? ""} ${r.user?.lastName ?? ""}`.trim();
      return (
        name.toLowerCase().includes(q) ||
        (r.user?.email || "").toLowerCase().includes(q) ||
        (r.registrationId || "").toLowerCase().includes(q) ||
        (r.verificationCode || "").toLowerCase().includes(q) ||
        (r.status || "").toLowerCase().includes(q) ||
        (r.attendanceStatus || "").toLowerCase().includes(q)
      );
    });
  }, [registrations, searchReg]);



  const regColumns: columnType<EventRegistrationItem>[] = [
    {
      key: "user",
      label: "Attendee",
      render: (_, row) => {
        const u = row.user;
        const name = `${u?.firstName ?? ""} ${u?.lastName ?? ""}`.trim() || "Guest";
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            {u?.picture ? (
              <img
                src={u.picture}
                alt=""
                className="w-9 h-9 rounded-full object-cover border border-[#E7E9EB] shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                {(u?.firstName?.[0] || name[0] || "U").toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-base-content leading-tight">
                {name}
              </p>
              <p className="text-xs text-base-content/60 truncate">{u?.email}</p>
              {u?.phone && (
                <p className="text-[11px] text-base-content/40">{u.phone}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "registrationId",
      label: "Ticket / Reg ID",
      render: (v, row) => (
        <div>
          <span className="font-mono text-xs font-semibold text-base-content">
            {v || "—"}
          </span>
          {row.verificationCode && (
            <p className="text-[11px] font-mono text-secondary mt-0.5">
              Code: {row.verificationCode}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "attendanceStatus",
      label: "Attendance",
      render: (v) => {
        const isChecked = v === "checked_in";
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
              isChecked
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-base-200 text-base-content/70"
            }`}
          >
            {isChecked ? "Checked In" : "Not Checked In"}
          </span>
        );
      },
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (v, row) => (
        <div>
          <StatusBadge status={v || row.status || "pending"} />
          {row.transaction?.amount !== undefined && (
            <p className="text-xs font-medium text-base-content mt-1">
              {formatCurrency(Number(row.transaction.amount) || 0, {
                currency: event?.currency || "CAD",
              })}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "createdDate",
      label: "Registered On",
      render: (v) => (
        <span className="text-xs text-base-content/70 whitespace-nowrap">
          {v ? formatDate(v, "DD MMM YYYY, hh:mm A") : "—"}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout title={event?.name ? `${event.name}` : "Event Details"}>
      <div className="space-y-6">
        {/* Navigation & Actions Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/events")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-secondary hover:text-base-content transition-colors cursor-pointer w-fit"
          >
            <ArrowLeft size={16} /> Back to Events
          </button>

          {event && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditModalOpen(true)}
                leftIcon={<Edit size={14} />}
              >
                Edit Event
              </Button>
              <Button
                variant={isPublished ? "outline" : "primary"}
                size="sm"
                loading={actionBusy}
                onClick={handleTogglePublish}
              >
                {isPublished ? "Unpublish Event" : "Publish Event"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-error hover:bg-error/10"
                onClick={() => setDeleteOpen(true)}
                leftIcon={<Trash2 size={14} />}
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        <PageLoader
          query={{
            data: event,
            isLoading: loading,
            isError,
            error: errorMsg,
            refetch: loadEvent,
          }}
        >
          {event && (
            <div className="space-y-6">
              {/* Event Hero Card */}
              <div className="bg-white rounded-2xl border border-[#E7E9EB] overflow-hidden shadow-xs">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* Event Cover Image */}
                  <div className="lg:col-span-4 relative bg-base-200 min-h-[220px] max-h-[300px] overflow-hidden border-b lg:border-b-0 lg:border-r border-[#E7E9EB]">
                    {event.coverImage || event.image ? (
                      <img
                        src={event.coverImage || event.image || ""}
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-base-content/30 min-h-[200px]">
                        <Calendar size={48} />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                      <StatusBadge status={event.status} />
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/95 text-base-content shadow-xs backdrop-blur-xs">
                        {labelOf(EVENT_FORMATS, event.format)}
                      </span>
                    </div>
                  </div>

                  {/* Event Info */}
                  <div className="lg:col-span-8 p-6 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
                        <Tag size={13} />
                        {typeof event.category === "object" &&
                        event.category !== null &&
                        "name" in event.category
                          ? (event.category as { name: string }).name
                          : labelOf(
                              EVENT_CATEGORIES,
                              typeof event.category === "string"
                                ? event.category
                                : undefined,
                            )}
                      </div>
                      <h1 className="text-xl sm:text-2xl font-bold text-base-content tracking-tight">
                        {event.name}
                      </h1>
                      <p className="text-xs sm:text-sm text-base-content/70 mt-2 line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    {/* Schedule & Location Quick Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#E7E9EB]">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <Calendar size={15} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-base-content">
                            {formatDate(event.startDate, "DD MMM YYYY")}
                            {event.endDate && event.endDate !== event.startDate && (
                              <> — {formatDate(event.endDate, "DD MMM YYYY")}</>
                            )}
                          </p>
                          <p className="text-xs text-base-content/60 flex items-center gap-1 mt-0.5">
                            <Clock size={12} /> {event.startTime} to {event.endTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                          {event.format?.toLowerCase() === "virtual" ? (
                            <Globe size={15} />
                          ) : (
                            <MapPin size={15} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-base-content truncate">
                            {event.location ||
                              (event.format?.toLowerCase() === "virtual"
                                ? "Virtual Online Event"
                                : "Venue TBA")}
                          </p>
                          {event.meetingLink && (
                            <a
                              href={event.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary underline truncate flex items-center gap-1 mt-0.5 hover:text-primary-hover"
                            >
                              <LinkIcon size={11} /> {event.meetingLink}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  title="Registered Attendees"
                  value={event.attendeesCount ?? registrations.length ?? 0}
                  loading={loading}
                  icon={<Users size={20} color="#717171" />}
                />
                <StatCard
                  title="Admission Fee"
                  value={
                    Number(event.price) === 0
                      ? "Free"
                      : formatCurrency(Number(event.price) || 0, {
                          currency: event.currency,
                        })
                  }
                  loading={loading}
                  icon={<Wallet size={20} color="#717171" />}
                />
                <StatCard
                  title="Capacity"
                  value={
                    event.maximumAttendees ?? event.maxAttendees
                      ? `${event.maximumAttendees ?? event.maxAttendees} seats`
                      : "Unlimited"
                  }
                  loading={loading}
                  icon={<Ticket size={20} color="#717171" />}
                />
              </div>

              {/* Tabs Container */}
              <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-xs space-y-6">
                <Tabs
                  tabs={[
                    { key: "overview", label: "Overview & Schedule" },
                    {
                      key: "registrations",
                      label: `Attendees (${registrations.length})`,
                    },
                    { key: "gallery", label: `Gallery (${event.images?.length || 0})` },
                  ]}
                  activeKey={activeTab}
                  onChange={setActiveTab}
                />

                {/* Tab 1: Overview */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Full Description */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">
                        Full Description
                      </h3>
                      <p className="text-sm text-base-content leading-relaxed whitespace-pre-line bg-base-100/50 p-4 rounded-xl border border-[#E7E9EB]">
                        {event.description}
                      </p>
                    </div>

                    {/* Event Specifications Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-base-100/60 border border-[#E7E9EB] space-y-1">
                        <span className="text-xs text-base-content/60 font-medium">
                          Audience & Eligibility
                        </span>
                        <p className="text-sm font-semibold text-base-content capitalize">
                          {labelOf(EVENT_ELIGIBILITY, event.eligibility)}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-base-100/60 border border-[#E7E9EB] space-y-1">
                        <span className="text-xs text-base-content/60 font-medium">
                          Registration Window
                        </span>
                        <p className="text-sm font-semibold text-base-content">
                          {event.registrationOpens
                            ? formatDate(event.registrationOpens, "DD MMM YYYY")
                            : "Immediate"}{" "}
                          —{" "}
                          {event.registrationCloses
                            ? formatDate(event.registrationCloses, "DD MMM YYYY")
                            : "Event start"}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-base-100/60 border border-[#E7E9EB] space-y-1">
                        <span className="text-xs text-base-content/60 font-medium">
                          Registration Required
                        </span>
                        <p className="text-sm font-semibold text-base-content">
                          {event.registrationRequired ? "Yes (Required)" : "No (Walk-in)"}
                        </p>
                      </div>
                    </div>

                    {/* Organizer & Contact Card */}
                    <div className="p-5 rounded-xl border border-[#E7E9EB] bg-base-100/40 space-y-3">
                      <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">
                        Organizer Contact Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2.5 text-xs text-base-content font-medium">
                          <User size={15} className="text-secondary shrink-0" />
                          <span className="truncate">
                            {event.organizerName || "CHLPS Institute"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-base-content font-medium">
                          <Mail size={15} className="text-secondary shrink-0" />
                          <a
                            href={`mailto:${event.contactEmail}`}
                            className="truncate text-primary hover:underline"
                          >
                            {event.contactEmail || "contact@chlps.ca"}
                          </a>
                        </div>
                        {event.contactPhone && (
                          <div className="flex items-center gap-2.5 text-xs text-base-content font-medium">
                            <Phone size={15} className="text-secondary shrink-0" />
                            <a
                              href={`tel:${event.contactPhone}`}
                              className="truncate hover:underline"
                            >
                              {event.contactPhone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Attendees & Registrations */}
                {activeTab === "registrations" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 border border-[#E7E9EB] rounded-lg px-3 h-9 bg-white w-72 focus-within:border-primary transition-colors">
                        <Search size={14} className="text-secondary" />
                        <input
                          type="text"
                          value={searchReg}
                          onChange={(e) => setSearchReg(e.target.value)}
                          placeholder="Search attendee, ticket ID, email..."
                          className="flex-1 text-xs outline-none bg-transparent placeholder-secondary/50"
                        />
                      </div>
                      <div className="text-xs text-base-content/60">
                        Total <b>{filteredRegistrations.length}</b> attendee(s)
                      </div>
                    </div>

                    <Divider />

                    <CustomTable
                      ring={false}
                      columns={regColumns}
                      data={filteredRegistrations}
                      totalCount={filteredRegistrations.length}
                    />
                  </div>
                )}

                {/* Tab 3: Gallery */}
                {activeTab === "gallery" && (
                  <div className="space-y-4">
                    {event.images && event.images.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {event.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="group relative aspect-video rounded-xl overflow-hidden border border-[#E7E9EB] bg-base-200 shadow-2xs"
                          >
                            <img
                              src={img}
                              alt={`Event image ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <a
                              href={img}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                            >
                              <ExternalLink size={20} />
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-secondary border border-dashed border-[#E7E9EB] rounded-xl">
                        <Calendar size={28} className="mx-auto mb-2 opacity-40" />
                        <p className="text-xs">No gallery images uploaded for this event.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </PageLoader>
      </div>

      {/* Edit Event Modal */}
      <EventModal
        open={editModalOpen}
        event={event}
        isSubmitting={actionBusy}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleUpdate}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Event"
        description="Are you sure you want to permanently delete this event? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
}
