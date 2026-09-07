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

export const EventDetailModal = forwardRef<ModalHandle & { setEvent: (event: EventItem | null) => void }, Props>(
  ({ onEdit, onTogglePublish }, ref) => {
    const dialogRef = useRef<ModalHandle>(null);
    const [event, setEvent] = useState<EventItem | null>(null);

    useImperativeHandle(ref, () => ({
      open: () => dialogRef.current?.open(),
      close: () => dialogRef.current?.close(),
      setEvent: (item: EventItem | null) => setEvent(item),
    }));

    if (!event) return <DialogModal ref={dialogRef} title="Event Details" />;

    const isPublished = event.status === "published";

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
                          status: isPublished ? "draft" : "published",
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
                {event.format === "virtual" ? (
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
                  <Link21 size={13} /> {event.meetingLink}
                </a>
              )}
              {!event.location && !event.meetingLink && (
                <p className="text-xs text-secondary">No venue specified</p>
              )}
            </div>
          </div>

          {/* Attendance & Eligibility */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg bg-base-100 border border-base-300 space-y-2">
              <h5 className="text-xs font-semibold text-secondary uppercase flex items-center gap-1.5">
                <Profile2User size={15} /> Attendees & Registration
              </h5>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary text-xs">Registered:</span>
                <span className="font-semibold text-base-content">
                  {event.attendeesCount}{" "}
                  {event.maxAttendees ? `/ ${event.maxAttendees}` : "attendees"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary text-xs">Eligibility:</span>
                <span className="font-medium text-base-content text-xs capitalize">
                  {labelOf(EVENT_ELIGIBILITY, event.eligibility)}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-base-100 border border-base-300 space-y-2">
              <h5 className="text-xs font-semibold text-secondary uppercase flex items-center gap-1.5">
                <User size={15} /> Organizer Contact
              </h5>
              <p className="text-sm font-medium text-base-content">
                {event.organizerName}
              </p>
              <p className="text-xs text-secondary flex items-center gap-1">
                <Sms size={13} /> {event.contactEmail}
              </p>
              {event.contactPhone && (
                <p className="text-xs text-secondary flex items-center gap-1">
                  <Call size={13} /> {event.contactPhone}
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogModal>
    );
  },
);

EventDetailModal.displayName = "EventDetailModal";
