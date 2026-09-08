"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import DialogModal, { ModalHandle } from "@/components/DialogModal";
import { StatusBadge } from "@/components/ui";
import {
  EventItem,
  EVENT_CATEGORIES,
  EVENT_FORMATS,
  EVENT_ELIGIBILITY,
  labelOf,
} from "../domain/data/response/events_response";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";
import {
  Calendar,
  Clock,
  Location,
  Link21,
  Profile2User,
  Ticket,
  User,
  Sms,
  Call,
} from "iconsax-react";

interface Props {
  onEdit?: (event: EventItem) => void;
  onTogglePublish?: (id: string) => void;
}

export const EventDetailModal = forwardRef<
  ModalHandle & { setEvent: (event: EventItem | null) => void },
  Props
>(({ onEdit, onTogglePublish }, ref) => {
  const dialogRef = useRef<ModalHandle>(null);
  const [event, setEvent] = useState<EventItem | null>(null);

  useImperativeHandle(ref, () => ({
    open: () => dialogRef.current?.open(),
    close: () => dialogRef.current?.close(),
    setEvent: (item: EventItem | null) => setEvent(item),
  }));

  if (!event) return <DialogModal ref={dialogRef} title="Event Details" />;

  const isPublished = (event.status || "").toLowerCase() === "published";

  return (
    <DialogModal
      ref={dialogRef}
      title={event.name}
      actions={
        <>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => dialogRef.current?.close()}
          >
            Close
          </button>
          {onTogglePublish && (
            <button
              type="button"
              className={`btn btn-sm ${
                isPublished
                  ? "btn-outline btn-warning"
                  : "btn-outline btn-success"
              }`}
              onClick={() => {
                onTogglePublish(event.id);
                setEvent((prev) =>
                  prev
                    ? {
                        ...prev,
                        status: isPublished ? "Draft" : "Published",
                      }
                    : null,
                );
              }}
            >
              {isPublished ? "Unpublish Event" : "Publish Event"}
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => {
                dialogRef.current?.close();
                onEdit(event);
              }}
            >
              Edit Event
            </button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        {/* Header Image & Summary */}
        {event.image && (
          <div className="w-full h-48 rounded-xl overflow-hidden border border-base-300">
            <img
              src={event.image}
              alt={event.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-base-300">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={event.status} />
            <span className="badge badge-outline text-xs capitalize">
              {labelOf(EVENT_CATEGORIES, event.category)}
            </span>
            <span className="badge badge-outline text-xs capitalize">
              {labelOf(EVENT_FORMATS, event.format)}
            </span>
          </div>
          <span className="text-base font-bold text-base-content">
            {Number(event.price) === 0
              ? "Free Admission"
              : formatCurrency(Number(event.price), {
                  currency: event.currency,
                })}
          </span>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-secondary mb-1.5">
            Description
          </h4>
          <p className="text-sm text-base-content leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Schedule & Location Details */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg bg-base-100 border border-base-300 space-y-2">
            <h5 className="text-xs font-semibold text-secondary uppercase flex items-center gap-1.5">
              <Calendar size={15} /> Schedule
            </h5>
            <p className="text-sm font-medium text-base-content">
              {formatDate(event.startDate, "DD MMM YYYY")} —{" "}
              {formatDate(event.endDate, "DD MMM YYYY")}
            </p>
            <p className="text-xs text-secondary flex items-center gap-1">
              <Clock size={13} /> {event.startTime} to {event.endTime}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-base-100 border border-base-300 space-y-2">
            <h5 className="text-xs font-semibold text-secondary uppercase flex items-center gap-1.5">
              {(event.format || "").toLowerCase() === "virtual" ? (
                <Link21 size={15} />
              ) : (
                <Location size={15} />
              )}{" "}
              Venue & Access
            </h5>
            {event.location && (
              <p className="text-sm text-base-content break-words">
                {event.location}
              </p>
            )}
            {event.meetingLink && (
              <a
                href={event.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary underline break-all flex items-center gap-1"
              >
                <Link21 size={12} /> {event.meetingLink}
              </a>
            )}
          </div>
        </div>

        {/* Registration & Eligibility */}
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-base-100 border border-base-300">
            <span className="text-xs text-secondary block mb-1">
              Eligibility
            </span>
            <p className="text-xs font-medium text-base-content capitalize">
              {labelOf(EVENT_ELIGIBILITY, event.eligibility)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-base-100 border border-base-300">
            <span className="text-xs text-secondary block mb-1">
              Max Capacity
            </span>
            <p className="text-xs font-medium text-base-content flex items-center gap-1">
              <Profile2User size={13} />{" "}
              {event.maxAttendees
                ? `${event.maxAttendees} attendees`
                : "Unlimited"}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-base-100 border border-base-300">
            <span className="text-xs text-secondary block mb-1">
              Total Registrations
            </span>
            <p className="text-xs font-medium text-base-content flex items-center gap-1">
              <Ticket size={13} /> {event.attendeesCount ?? 0}
            </p>
          </div>
        </div>

        {/* Organizer Details */}
        <div className="p-3.5 rounded-lg bg-base-100 border border-base-300 space-y-2">
          <h5 className="text-xs font-semibold text-secondary uppercase">
            Organizer Information
          </h5>
          <div className="grid sm:grid-cols-3 gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-base-content">
              <User size={14} className="text-secondary" />{" "}
              {event.organizerName}
            </span>
            <span className="flex items-center gap-1.5 text-base-content">
              <Sms size={14} className="text-secondary" /> {event.contactEmail}
            </span>
            {event.contactPhone && (
              <span className="flex items-center gap-1.5 text-base-content">
                <Call size={14} className="text-secondary" />{" "}
                {event.contactPhone}
              </span>
            )}
          </div>
        </div>
      </div>
    </DialogModal>
  );
});

EventDetailModal.displayName = "EventDetailModal";
