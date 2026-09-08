"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  TextField,
  Select,
  Toggle,
  Checkbox,
  FieldLabel,
  FieldError,
  DatePicker,
} from "@/components/ui";
import {
  Membership,
  MembershipPayload,
  MembershipCategory,
  MembershipCurrency,
  MembershipDuration,
  MembershipStatus,
  RenewalPeriod,
  RequiredDocument,
  MEMBERSHIP_CATEGORIES,
  MEMBERSHIP_CURRENCIES,
  MEMBERSHIP_DURATIONS,
  MEMBERSHIP_STATUSES,
  RENEWAL_PERIODS,
  REQUIRED_DOCUMENTS,
} from "../domain/data/response/membership_response";

interface Props {
  open: boolean;
  membership?: Membership | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: MembershipPayload) => Promise<boolean>;
}

function todayIso(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function getEmpty(): MembershipPayload {
  return {
    name: "",
    description: "",
    category: "student",
    eligibilityCriteria: [""],
    price: 0,
    currency: "NGN",
    duration: "1_year",
    autoRenewal: false,
    renewalPrice: null,
    renewalPeriod: null,
    benefits: [""],
    requiredDocuments: [],
    registrationStartDate: todayIso(),
    registrationEndDate: null,
    status: "draft",
    image: null,
  };
}

function toPayload(item: Membership): MembershipPayload {
  return {
    name: item.name,
    description: item.description,
    category: item.category,
    eligibilityCriteria: item.eligibilityCriteria.length
      ? item.eligibilityCriteria
      : [""],
    price: item.price,
    currency: item.currency,
    duration: item.duration,
    autoRenewal: item.autoRenewal,
    renewalPrice: item.renewalPrice,
    renewalPeriod: item.renewalPeriod,
    benefits: item.benefits.length ? item.benefits : [""],
    requiredDocuments: item.requiredDocuments,
    registrationStartDate: item.registrationStartDate,
    registrationEndDate: item.registrationEndDate,
    status: item.status,
    image: item.image,
  };
}

function ArrayField({
  label,
  required,
  values,
  placeholder,
  onChange,
}: {
  label: string;
  required?: boolean;
  values: string[];
  placeholder?: string;
  onChange: (values: string[]) => void;
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            <TextField
              value={value}
              placeholder={placeholder}
              onChange={(e) =>
                onChange(
                  values.map((v, i) => (i === index ? e.target.value : v)),
                )
              }
            />
            {values.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(values.filter((_, i) => i !== index))}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange([...values, ""])}
        >
          Add
        </Button>
      </div>
    </div>
  );
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
      <FieldLabel>Membership image</FieldLabel>
      {value ? (
        <div className="flex items-center gap-3 mb-2">
          <img
            src={value}
            alt="Membership"
            className="w-20 h-14 rounded-lg object-cover border border-[#E7E9EB]"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
          >
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
      <p className="mt-1 text-xs text-[#717171]">Optional banner or icon.</p>
    </div>
  );
}

export function MembershipModal({
  open,
  membership,
  isSubmitting,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<MembershipPayload>(getEmpty);
  const [error, setError] = useState("");
  const isEdit = !!membership;
  const isLifetime = form.duration === "lifetime";
  const showRenewal = form.autoRenewal && !isLifetime;

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(membership ? toPayload(membership) : getEmpty());
  }, [open, membership]);

  function set<K extends keyof MembershipPayload>(
    key: K,
    value: MembershipPayload[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    const eligibility = form.eligibilityCriteria
      .map((v) => v.trim())
      .filter(Boolean);
    const benefits = form.benefits.map((v) => v.trim()).filter(Boolean);

    if (!form.name.trim()) return setError("Membership name is required");
    if (!form.description.trim())
      return setError("Membership description is required");
    if (!eligibility.length)
      return setError("Add at least one eligibility criterion");
    if (!form.price || form.price <= 0)
      return setError("Membership price is required");
    if (!benefits.length) return setError("Add at least one benefit");
    if (!form.registrationStartDate)
      return setError("Registration start date is required");
    if (
      form.registrationEndDate &&
      form.registrationEndDate < form.registrationStartDate
    ) {
      return setError("Registration end date must be after the start date");
    }

    const autoRenewal = isLifetime ? false : form.autoRenewal;
    if (autoRenewal && (form.renewalPrice == null || form.renewalPrice <= 0)) {
      return setError("Renewal price is required when auto-renewal is enabled");
    }
    if (autoRenewal && !form.renewalPeriod) {
      return setError(
        "Renewal period is required when auto-renewal is enabled",
      );
    }

    const ok = await onSubmit({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      eligibilityCriteria: eligibility,
      benefits,
      autoRenewal,
      renewalPrice: autoRenewal ? form.renewalPrice : null,
      renewalPeriod: autoRenewal ? form.renewalPeriod : null,
      registrationEndDate: form.registrationEndDate || null,
      image: form.image || null,
    });
    if (ok) onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Membership" : "Create Membership"}
      size="full"
      scrollable
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <TextField
            label="Membership name"
            required
            placeholder="e.g. Professional Membership"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <FieldLabel required>Membership description</FieldLabel>
          <textarea
            className="flipex-input-base min-h-24"
            placeholder="Description of membership"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <Select
          label="Membership category / type"
          required
          value={form.category}
          onChange={(v) => set("category", v as MembershipCategory)}
          options={MEMBERSHIP_CATEGORIES.map((o) => ({
            label: o.label,
            value: o.value,
          }))}
        />
        <Select
          label="Membership status"
          required
          value={form.status}
          onChange={(v) => set("status", v as MembershipStatus)}
          options={MEMBERSHIP_STATUSES.map((o) => ({
            label: o.label,
            value: o.value,
          }))}
        />

        <div className="sm:col-span-2">
          <ArrayField
            label="Eligibility criteria"
            required
            placeholder="Who can apply"
            values={form.eligibilityCriteria}
            onChange={(eligibilityCriteria) =>
              set("eligibilityCriteria", eligibilityCriteria)
            }
          />
        </div>

        <TextField
          label="Membership price"
          type="number"
          min={0}
          required
          placeholder="e.g. 50000"
          value={form.price ? String(form.price) : ""}
          onChange={(e) => set("price", Number(e.target.value) || 0)}
        />
        <Select
          label="Currency"
          required
          value={form.currency}
          onChange={(v) => set("currency", v as MembershipCurrency)}
          options={MEMBERSHIP_CURRENCIES.map((o) => ({
            label: o.label,
            value: o.value,
          }))}
        />

        <Select
          label="Membership duration"
          required
          value={form.duration}
          onChange={(v) => {
            const duration = v as MembershipDuration;
            setForm((prev) => ({
              ...prev,
              duration,
              autoRenewal: duration === "lifetime" ? false : prev.autoRenewal,
              renewalPrice: duration === "lifetime" ? null : prev.renewalPrice,
              renewalPeriod:
                duration === "lifetime" ? null : prev.renewalPeriod,
            }));
          }}
          options={MEMBERSHIP_DURATIONS.map((o) => ({
            label: o.label,
            value: o.value,
          }))}
        />

        <div className="flex items-center">
          <Toggle
            checked={form.autoRenewal && !isLifetime}
            disabled={isLifetime}
            onChange={(checked) =>
              setForm((prev) => ({
                ...prev,
                autoRenewal: checked,
                renewalPrice: checked
                  ? (prev.renewalPrice ?? prev.price)
                  : null,
                renewalPeriod: checked
                  ? (prev.renewalPeriod ?? "annually")
                  : null,
              }))
            }
            label="Auto-renewal"
            hint={
              isLifetime
                ? "Not available for lifetime memberships"
                : form.autoRenewal
                  ? "Enabled"
                  : "Disabled"
            }
          />
        </div>

        {showRenewal && (
          <>
            <TextField
              label="Renewal price"
              type="number"
              min={0}
              required
              value={form.renewalPrice != null ? String(form.renewalPrice) : ""}
              onChange={(e) => set("renewalPrice", Number(e.target.value) || 0)}
            />
            <Select
              label="Renewal period"
              required
              value={form.renewalPeriod ?? ""}
              onChange={(v) => set("renewalPeriod", v as RenewalPeriod)}
              options={RENEWAL_PERIODS.map((o) => ({
                label: o.label,
                value: o.value,
              }))}
            />
          </>
        )}

        <div className="sm:col-span-2">
          <ArrayField
            label="Benefits"
            required
            placeholder="Benefit members receive"
            values={form.benefits}
            onChange={(benefits) => set("benefits", benefits)}
          />
        </div>

        <div className="sm:col-span-2">
          <FieldLabel>Required documents</FieldLabel>
          <div className="grid sm:grid-cols-2 gap-2 rounded-lg border border-[#E7E9EB] p-3">
            {REQUIRED_DOCUMENTS.map((doc) => {
              const checked = form.requiredDocuments.includes(doc.value);
              return (
                <Checkbox
                  key={doc.value}
                  label={doc.label}
                  checked={checked}
                  onChange={() =>
                    set(
                      "requiredDocuments",
                      checked
                        ? form.requiredDocuments.filter((d) => d !== doc.value)
                        : [...form.requiredDocuments, doc.value],
                    )
                  }
                />
              );
            })}
          </div>
        </div>

        <DatePicker
          label="Registration start date"
          required
          hint="When membership registration opens"
          value={form.registrationStartDate}
          onChange={(iso) => set("registrationStartDate", iso)}
        />
        <DatePicker
          label="Registration end date"
          hint="When membership expires (optional)"
          value={form.registrationEndDate}
          min={form.registrationStartDate || null}
          onChange={(iso) => set("registrationEndDate", iso)}
        />

        <div className="sm:col-span-2">
          <LocalImageField
            value={form.image}
            onChange={(image) => set("image", image)}
          />
        </div>
      </div>

      {error && <FieldError>{error}</FieldError>}

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button loading={isSubmitting} onClick={handleSubmit}>
          {isEdit ? "Save changes" : "Create membership"}
        </Button>
      </div>
    </Modal>
  );
}
