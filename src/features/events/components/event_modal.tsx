"use client";

import { useEffect } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import {
  Modal,
  Button,
  Toggle,
  PhoneField,
  FieldError,
  DatePicker,
  ImageUpload,
} from "@/components/ui";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import LocalSelect from "@/components/inputs/LocalSelect";
import SimpleSelect from "@/components/inputs/SimpleSelect";
import { ApiUrls } from "@/lib/network/api_url";
import {
  EventItem,
  EventPayload,
  EventFormat,
  EventEligibility,
  EventCurrency,
  EventStatus,
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

interface FormValues {
  name: string;
  description: string;
  categoryId?: string;
  category?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  format: EventFormat;
  meetingLink?: string | null;
  location?: string | null;
  registrationRequired: boolean;
  registrationOpens?: string | null;
  registrationCloses?: string | null;
  maxAttendees?: number | string | null;
  eligibility: EventEligibility;
  price: number | string;
  currency: EventCurrency;
  organizerName: string;
  contactEmail: string;
  contactPhone?: string | null;
  status: EventStatus;
  image?: string | null;
}

function normalizeFormat(val?: string | null): EventFormat {
  const lower = (val || "").toLowerCase();
  if (lower === "virtual") return "Virtual";
  if (lower === "hybrid") return "Hybrid";
  return "Physical";
}

function normalizeEligibility(val?: string | null): EventEligibility {
  const lower = (val || "").toLowerCase();
  if (lower.includes("member")) return "Members Only";
  if (lower.includes("specific")) return "Specific Membership Type";
  if (lower.includes("invitation")) return "Invitation Only";
  return "Everyone";
}

function normalizeStatus(val?: string | null): EventStatus {
  const lower = (val || "").toLowerCase();
  if (lower === "published") return "Published";
  if (lower === "cancelled") return "Cancelled";
  if (lower === "completed") return "Completed";
  return "Draft";
}

function getFormDefaults(item?: EventItem | null): FormValues {
  const catId =
    item?.categoryId ||
    (typeof item?.category === "object" && item.category !== null
      ? (item.category as any).id
      : typeof item?.category === "string"
        ? item.category
        : "");

  return {
    name: item?.name ?? "",
    description: item?.description ?? "",
    categoryId: catId,
    category: typeof item?.category === "string" ? item.category : "",
    startDate: item?.startDate ?? "",
    startTime: item?.startTime ?? "",
    endDate: item?.endDate ?? "",
    endTime: item?.endTime ?? "",
    format: normalizeFormat(item?.format),
    meetingLink: item?.meetingLink ?? "",
    location: item?.location ?? "",
    registrationRequired: item?.registrationRequired ?? true,
    registrationOpens: item?.registrationOpens ?? null,
    registrationCloses: item?.registrationCloses ?? null,
    maxAttendees:
      item?.maxAttendees != null
        ? item.maxAttendees
        : item?.maximumAttendees != null
          ? item.maximumAttendees
          : "",
    eligibility: normalizeEligibility(item?.eligibility),
    price: item?.price != null ? item.price : 0,
    currency: item?.currency ?? "CAD",
    organizerName: item?.organizerName ?? "",
    contactEmail: item?.contactEmail ?? "",
    contactPhone: item?.contactPhone ?? "",
    status: normalizeStatus(item?.status),
    image: item?.image ?? null,
  };
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function EventModal({
  open,
  event,
  isSubmitting,
  onClose,
  onSubmit,
}: Props) {
  const isEdit = !!event;

  const methods = useForm<FormValues>({
    defaultValues: getFormDefaults(event),
    mode: "onBlur",
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = methods;

  const currentFormat = watch("format");
  const registrationRequired = watch("registrationRequired");
  const watchStartDate = watch("startDate");
  const watchRegistrationOpens = watch("registrationOpens");
  const watchRegistrationCloses = watch("registrationCloses");
  const watchImage = watch("image");

  const fmtLower = (currentFormat || "").toLowerCase();
  const needsLink = fmtLower === "virtual" || fmtLower === "hybrid";
  const needsLocation = fmtLower === "physical" || fmtLower === "hybrid";

  useEffect(() => {
    if (open) {
      reset(getFormDefaults(event));
    }
  }, [open, event, reset]);

  const onFormSubmit = async (data: FormValues) => {
    // Validate datetime sequence
    const start = new Date(`${data.startDate}T${data.startTime}`);
    const end = new Date(`${data.endDate}T${data.endTime}`);
    if (end < start) {
      setError("endDate", {
        type: "manual",
        message: "End date and time must be after the start date and time",
      });
      return;
    }

    if (needsLink) {
      const link = (data.meetingLink || "").trim();
      if (!link) {
        setError("meetingLink", {
          type: "manual",
          message: "Meeting link is required for virtual and hybrid events",
        });
        return;
      }
      if (!isValidUrl(link)) {
        setError("meetingLink", {
          type: "manual",
          message: "Enter a valid meeting URL (e.g. https://...)",
        });
        return;
      }
    }

    if (needsLocation && !(data.location || "").trim()) {
      setError("location", {
        type: "manual",
        message: "Location is required for physical and hybrid events",
      });
      return;
    }

    if (registrationRequired) {
      if (!data.registrationOpens) {
        setError("registrationOpens", {
          type: "manual",
          message: "Registration opening date is required",
        });
        return;
      }
      if (!data.registrationCloses) {
        setError("registrationCloses", {
          type: "manual",
          message: "Registration closing date is required",
        });
        return;
      }
      if (data.registrationCloses < data.registrationOpens) {
        setError("registrationCloses", {
          type: "manual",
          message: "Registration must close after it opens",
        });
        return;
      }
    }

    const priceNum = Number(data.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("price", {
        type: "manual",
        message: "Event price cannot be negative",
      });
      return;
    }

    const attendeesNum =
      data.maxAttendees !== "" && data.maxAttendees != null
        ? Number(data.maxAttendees)
        : null;

    const payload: EventPayload = {
      name: data.name.trim(),
      description: data.description.trim(),
      category: data.categoryId || data.category || "conference",
      categoryId: data.categoryId || undefined,
      startDate: data.startDate,
      startTime: data.startTime,
      endDate: data.endDate,
      endTime: data.endTime,
      format: data.format,
      meetingLink: needsLink ? data.meetingLink?.trim() || null : null,
      location: needsLocation ? data.location?.trim() || null : null,
      registrationRequired: Boolean(data.registrationRequired),
      registrationOpens: data.registrationRequired
        ? data.registrationOpens || null
        : null,
      registrationCloses: data.registrationRequired
        ? data.registrationCloses || null
        : null,
      maxAttendees: attendeesNum,
      maximumAttendees: attendeesNum,
      eligibility: data.eligibility,
      price: priceNum,
      currency: data.currency,
      organizerName: data.organizerName.trim(),
      contactEmail: data.contactEmail.trim(),
      contactPhone: data.contactPhone?.trim() || null,
      status: data.status,
      image: data.image || null,
    };

    const ok = await onSubmit(payload);
    if (ok) onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Event" : "Create Event"}
      size="full"
      scrollable
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <SimpleInput
                label="Event name"
                required
                placeholder="Name of the event"
                {...register("name", {
                  required: "Event name is required",
                })}
              />
            </div>

            <div className="sm:col-span-2">
              <SimpleTextArea
                label="Event description"
                required
                placeholder="Details about the event"
                rows={3}
                {...register("description", {
                  required: "Event description is required",
                })}
              />
            </div>

            <div>
              <SimpleSelect<{ id: string; name: string }>
                route={ApiUrls.eventCategories}
                name="categoryId"
                label="Event category"
                placeholder="Select category"
                autoSelectFirst={true}
                onChange={(val) => {
                  if (val) clearErrors("categoryId");
                }}
                render={(item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                )}
              />
            </div>

            <div>
              <LocalSelect label="Event status" {...register("status")}>
                {EVENT_STATUSES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </LocalSelect>
            </div>

            {/* Cloudinary Image Upload */}
            <div className="sm:col-span-2">
              <ImageUpload
                label="Event Image / Banner"
                value={watchImage || null}
                onChange={(img) =>
                  setValue("image", img, { shouldDirty: true })
                }
                folder="chlps_events"
                helperText="Upload event promotional banner or poster to Cloudinary."
              />
            </div>

            <div>
              <Controller
                control={control}
                name="startDate"
                rules={{ required: "Start date is required" }}
                render={({ field }) => (
                  <DatePicker
                    label="Start date"
                    required
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.startDate && (
                <FieldError>{String(errors.startDate.message)}</FieldError>
              )}
            </div>

            <div>
              <SimpleInput
                label="Start time"
                type="time"
                required
                {...register("startTime", {
                  required: "Start time is required",
                })}
              />
            </div>

            <div>
              <Controller
                control={control}
                name="endDate"
                rules={{ required: "End date is required" }}
                render={({ field }) => (
                  <DatePicker
                    label="End date"
                    required
                    value={field.value}
                    min={watchStartDate || null}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.endDate && (
                <FieldError>{String(errors.endDate.message)}</FieldError>
              )}
            </div>

            <div>
              <SimpleInput
                label="End time"
                type="time"
                required
                {...register("endTime", {
                  required: "End time is required",
                })}
              />
            </div>

            <div>
              <LocalSelect label="Event format" {...register("format")}>
                {EVENT_FORMATS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <LocalSelect
                label="Target eligibility"
                {...register("eligibility")}
              >
                {EVENT_ELIGIBILITY.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </LocalSelect>
            </div>

            {needsLink && (
              <div className="sm:col-span-2">
                <SimpleInput
                  label="Meeting link"
                  type="url"
                  required
                  placeholder="https://meet.example.com/..."
                  {...register("meetingLink")}
                />
              </div>
            )}

            {needsLocation && (
              <div className="sm:col-span-2">
                <SimpleInput
                  label="Location"
                  required
                  placeholder="Venue / address"
                  {...register("location")}
                />
              </div>
            )}

            <div className="flex items-center pt-6">
              <Toggle
                checked={registrationRequired}
                onChange={(checked) => {
                  setValue("registrationRequired", checked, {
                    shouldDirty: true,
                  });
                  if (!checked) {
                    setValue("registrationOpens", null);
                    setValue("registrationCloses", null);
                  }
                }}
                label="Registration required"
                hint={registrationRequired ? "Yes" : "No"}
              />
            </div>

            <div>
              <SimpleInput
                label="Maximum attendees"
                type="number"
                min={0}
                placeholder="Optional"
                {...register("maxAttendees")}
              />
            </div>

            {registrationRequired && (
              <>
                <div>
                  <Controller
                    control={control}
                    name="registrationOpens"
                    render={({ field }) => (
                      <DatePicker
                        label="Registration opens"
                        required
                        value={field.value}
                        max={watchRegistrationCloses || null}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.registrationOpens && (
                    <FieldError>
                      {String(errors.registrationOpens.message)}
                    </FieldError>
                  )}
                </div>

                <div>
                  <Controller
                    control={control}
                    name="registrationCloses"
                    render={({ field }) => (
                      <DatePicker
                        label="Registration closes"
                        required
                        value={field.value}
                        min={watchRegistrationOpens || null}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.registrationCloses && (
                    <FieldError>
                      {String(errors.registrationCloses.message)}
                    </FieldError>
                  )}
                </div>
              </>
            )}

            <div>
              <SimpleInput
                label="Event price"
                type="number"
                min={0}
                required
                placeholder="Enter 0 for a free event"
                {...register("price", {
                  required: "Event price is required",
                })}
              />
            </div>

            <div>
              <LocalSelect label="Currency" {...register("currency")}>
                {EVENT_CURRENCIES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <SimpleInput
                label="Organizer name"
                required
                placeholder="e.g. CHLPS Institute"
                {...register("organizerName", {
                  required: "Organizer name is required",
                })}
              />
            </div>

            <div>
              <SimpleInput
                label="Contact email"
                type="email"
                required
                placeholder="contact@chlps.ca"
                {...register("contactEmail", {
                  required: "Contact email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid contact email address",
                  },
                })}
              />
            </div>

            <div className="sm:col-span-2">
              <Controller
                control={control}
                name="contactPhone"
                render={({ field }) => (
                  <PhoneField
                    label="Contact phone"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button loading={isSubmitting} type="submit">
              {isEdit ? "Save changes" : "Create event"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}

export default EventModal;
