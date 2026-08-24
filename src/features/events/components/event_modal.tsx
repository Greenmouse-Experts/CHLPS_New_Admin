"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  TextField,
  Select,
  Toggle,
  PhoneField,
  FieldLabel,
  FieldError,
} from "@/components/ui";
import {
  EventItem,
  EventPayload,
  EventCategory,
  EventFormat,
  EventEligibility,
  EventCurrency,
  EventStatus,
  EVENT_CATEGORIES,
  EVENT_FORMATS,
  EVENT_ELIGIBILITY,
  EVENT_CURRENCIES,
  EVENT_STATUSES,
} from "../domain/data/response/events_response";

interface Props {
  open: boolean;
  event?: EventItem | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: EventPayload) => Promise<boolean>;
}

const EMPTY: EventPayload = {
  name: "",
  description: "",
  category: "conference",
  image: null,
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  format: "physical",
  meetingLink: null,
  location: null,
  registrationRequired: true,
  registrationOpens: null,
  registrationCloses: null,
  maxAttendees: null,
  eligibility: "everyone",
  price: 0,
  currency: "NGN",
  organizerName: "",
  contactEmail: "",
  contactPhone: null,
  status: "draft",
};

function toPayload(item: EventItem): EventPayload {
  return {
    name: item.name,
    description: item.description,
    category: item.category,
    image: item.image,
    startDate: item.startDate,
    startTime: item.startTime,
    endDate: item.endDate,
    endTime: item.endTime,
    format: item.format,
    meetingLink: item.meetingLink,
    location: item.location,
    registrationRequired: item.registrationRequired,
    registrationOpens: item.registrationOpens,
    registrationCloses: item.registrationCloses,
    maxAttendees: item.maxAttendees,
    eligibility: item.eligibility,
    price: item.price,
    currency: item.currency,
    organizerName: item.organizerName,
    contactEmail: item.contactEmail,
    contactPhone: item.contactPhone,
    status: item.status,
  };
}

function LocalImageField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  return (
    <div>
      <FieldLabel>Event image</FieldLabel>
      {value ? (
        <div className="flex items-center gap-3 mb-2">
          <img
            src={value}
            alt="Event"
            className="w-20 h-14 rounded-lg object-cover border border-[#E7E9EB]"
          />
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            Remove
          </Button>
        </div>
      ) : null}
      <input
        type="file"
        accept="image/*"
        className="text-sm text-[#717171]"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => onChange(String(reader.result));
          reader.readAsDataURL(file);
          e.target.value = "";
        }}
      />
      <p className="mt-1 text-xs text-[#717171]">Optional banner or image.</p>
    </div>
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function EventModal({ open, event, isSubmitting, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<EventPayload>(EMPTY);
  const [error, setError] = useState("");
  const isEdit = !!event;
  const needsLink = form.format === "virtual" || form.format === "hybrid";
  const needsLocation = form.format === "physical" || form.format === "hybrid";

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(event ? toPayload(event) : EMPTY);
  }, [open, event]);

  function set<K extends keyof EventPayload>(key: K, value: EventPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.name.trim()) return setError("Event name is required");
    if (!form.description.trim()) return setError("Event description is required");
    if (!form.startDate) return setError("Start date is required");
    if (!form.startTime) return setError("Start time is required");
    if (!form.endDate) return setError("End date is required");
    if (!form.endTime) return setError("End time is required");

    const start = new Date(`${form.startDate}T${form.startTime}`);
    const end = new Date(`${form.endDate}T${form.endTime}`);
    if (end < start) return setError("End date and time must be after the start");

    if (needsLink && !form.meetingLink?.trim()) {
      return setError("Meeting link is required for virtual and hybrid events");
    }
    if (form.meetingLink?.trim() && !isValidUrl(form.meetingLink.trim())) {
      return setError("Enter a valid meeting URL");
    }
    if (needsLocation && !form.location?.trim()) {
      return setError("Location is required for physical and hybrid events");
    }
    if (form.registrationRequired && !form.registrationOpens) {
      return setError("Registration opening date is required");
    }
    if (form.registrationRequired && !form.registrationCloses) {
      return setError("Registration closing date is required");
    }
    if (
      form.registrationOpens &&
      form.registrationCloses &&
      form.registrationCloses < form.registrationOpens
    ) {
      return setError("Registration must close after it opens");
    }
    if (form.price < 0) return setError("Event price cannot be negative");
    if (!form.organizerName.trim()) return setError("Organizer name is required");
    if (!form.contactEmail.trim()) return setError("Contact email is required");
    if (!isValidEmail(form.contactEmail.trim())) return setError("Enter a valid contact email");

    const ok = await onSubmit({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      meetingLink: needsLink ? form.meetingLink?.trim() || null : null,
      location: needsLocation ? form.location?.trim() || null : null,
      registrationOpens: form.registrationRequired ? form.registrationOpens : null,
      registrationCloses: form.registrationRequired ? form.registrationCloses : null,
      maxAttendees: form.maxAttendees && form.maxAttendees > 0 ? form.maxAttendees : null,
      organizerName: form.organizerName.trim(),
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone?.trim() || null,
      image: form.image || null,
    });
    if (ok) onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Event" : "Create Event"}
      size="full"
      scrollable
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <TextField
            label="Event name"
            required
            placeholder="Name of the event"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <FieldLabel required>Event description</FieldLabel>
          <textarea
            className="flipex-input-base min-h-24"
            placeholder="Details about the event"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <Select
          label="Event category"
          required
          value={form.category}
          onChange={(v) => set("category", v as EventCategory)}
          options={EVENT_CATEGORIES.map((o) => ({ label: o.label, value: o.value }))}
        />
        <Select
          label="Event status"
          required
          value={form.status}
          onChange={(v) => set("status", v as EventStatus)}
          options={EVENT_STATUSES.map((o) => ({ label: o.label, value: o.value }))}
        />

        <div className="sm:col-span-2">
          <LocalImageField value={form.image} onChange={(image) => set("image", image)} />
        </div>

        <TextField
          label="Start date"
          type="date"
          required
          value={form.startDate}
          onChange={(e) => set("startDate", e.target.value)}
        />
        <TextField
          label="Start time"
          type="time"
          required
          value={form.startTime}
          onChange={(e) => set("startTime", e.target.value)}
        />
        <TextField
          label="End date"
          type="date"
          required
          value={form.endDate}
          onChange={(e) => set("endDate", e.target.value)}
        />
        <TextField
          label="End time"
          type="time"
          required
          value={form.endTime}
          onChange={(e) => set("endTime", e.target.value)}
        />

        <Select
          label="Event format"
          required
          value={form.format}
          onChange={(v) => {
            const format = v as EventFormat;
            setForm((prev) => ({
              ...prev,
              format,
              meetingLink:
                format === "physical" ? null : prev.meetingLink,
              location: format === "virtual" ? null : prev.location,
            }));
          }}
          options={EVENT_FORMATS.map((o) => ({ label: o.label, value: o.value }))}
        />
        <Select
          label="Eligibility"
          required
          value={form.eligibility}
          onChange={(v) => set("eligibility", v as EventEligibility)}
          options={EVENT_ELIGIBILITY.map((o) => ({ label: o.label, value: o.value }))}
        />

        {needsLink && (
          <div className="sm:col-span-2">
            <TextField
              label="Meeting link"
              type="url"
              required
              placeholder="https://"
              value={form.meetingLink ?? ""}
              onChange={(e) => set("meetingLink", e.target.value)}
            />
          </div>
        )}

        {needsLocation && (
          <div className="sm:col-span-2">
            <TextField
              label="Location"
              required
              placeholder="Venue / address"
              value={form.location ?? ""}
              onChange={(e) => set("location", e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center">
          <Toggle
            checked={form.registrationRequired}
            onChange={(checked) =>
              setForm((prev) => ({
                ...prev,
                registrationRequired: checked,
                registrationOpens: checked ? prev.registrationOpens : null,
                registrationCloses: checked ? prev.registrationCloses : null,
              }))
            }
            label="Registration required"
            hint={form.registrationRequired ? "Yes" : "No"}
          />
        </div>
        <TextField
          label="Maximum attendees"
          type="number"
          min={0}
          placeholder="Optional"
          value={form.maxAttendees != null ? String(form.maxAttendees) : ""}
          onChange={(e) =>
            set("maxAttendees", e.target.value ? Number(e.target.value) : null)
          }
        />

        {form.registrationRequired && (
          <>
            <TextField
              label="Registration opens"
              type="date"
              required
              value={form.registrationOpens ?? ""}
              onChange={(e) => set("registrationOpens", e.target.value || null)}
            />
            <TextField
              label="Registration closes"
              type="date"
              required
              value={form.registrationCloses ?? ""}
              onChange={(e) => set("registrationCloses", e.target.value || null)}
            />
          </>
        )}

        <TextField
          label="Event price"
          type="number"
          min={0}
          required
          hint="Enter 0 for a free event"
          value={String(form.price)}
          onChange={(e) => set("price", Number(e.target.value) || 0)}
        />
        <Select
          label="Currency"
          required
          value={form.currency}
          onChange={(v) => set("currency", v as EventCurrency)}
          options={EVENT_CURRENCIES.map((o) => ({ label: o.label, value: o.value }))}
        />

        <TextField
          label="Organizer name"
          required
          value={form.organizerName}
          onChange={(e) => set("organizerName", e.target.value)}
        />
        <TextField
          label="Contact email"
          type="email"
          required
          value={form.contactEmail}
          onChange={(e) => set("contactEmail", e.target.value)}
        />
        <div className="sm:col-span-2">
          <PhoneField
            label="Contact phone"
            value={form.contactPhone ?? ""}
            onChange={(contactPhone) => set("contactPhone", contactPhone)}
          />
        </div>
      </div>

      {error && <FieldError>{error}</FieldError>}

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button loading={isSubmitting} onClick={handleSubmit}>
          {isEdit ? "Save changes" : "Create event"}
        </Button>
      </div>
    </Modal>
  );
}
