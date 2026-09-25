"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider, Controller, useFieldArray } from "react-hook-form";
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
import { MembershipRepository } from "@/features/membership/domain/repository/membership_repository";
import { Plus, Trash2 } from "lucide-react";

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
  categoryId: string;
  category?: string;
  coverImage?: string | null;
  image?: string | null;
  galleryImages: { value: string }[];
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
  maximumAttendees?: number | string | null;
  maxAttendees?: number | string | null;
  eligibility: EventEligibility;
  requiredMembershipIds: string[];
  price: number | string;
  currency: EventCurrency;
  organizerName: string;
  contactEmail: string;
  contactPhone?: string | null;
  status: EventStatus;
}

function normalizeFormat(val?: string | null): EventFormat {
  const lower = (val || "").toLowerCase();
  if (lower === "virtual") return "Virtual";
  if (lower === "hybrid") return "Hybrid";
  return "Physical";
}

function normalizeEligibility(val?: string | null): EventEligibility {
  const lower = (val || "").toLowerCase();
  if (lower.includes("specific")) return "Specific Membership Type";
  if (lower.includes("member")) return "Members Only";
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

function toDateInputValue(val?: string | null): string {
  if (!val) return "";
  if (val.includes("T")) return val.split("T")[0];
  return val;
}

function toIsoDate(val?: string | null): string | null {
  if (!val) return null;
  if (val.includes("T")) return val;
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toISOString();
  } catch {
    return val;
  }
}

function getFormDefaults(item?: EventItem | null): FormValues {
  const catId =
    item?.categoryId ||
    (typeof item?.category === "object" && item.category !== null
      ? (item.category as { id?: string }).id || ""
      : typeof item?.category === "string"
        ? item.category
        : "");

  const galleryImages = (item?.images || []).map((img) => ({ value: img }));
  const initialCover = item?.coverImage || item?.image || null;

  return {
    name: item?.name ?? "",
    description: item?.description ?? "",
    categoryId: catId,
    category: typeof item?.category === "string" ? item.category : "",
    coverImage: initialCover,
    image: initialCover,
    galleryImages,
    startDate: toDateInputValue(item?.startDate),
    startTime: item?.startTime ?? "",
    endDate: toDateInputValue(item?.endDate),
    endTime: item?.endTime ?? "",
    format: normalizeFormat(item?.format),
    meetingLink: item?.meetingLink ?? "",
    location: item?.location ?? "",
    registrationRequired: item?.registrationRequired ?? true,
    registrationOpens: toDateInputValue(item?.registrationOpens),
    registrationCloses: toDateInputValue(item?.registrationCloses),
    maximumAttendees:
      item?.maximumAttendees != null
        ? item.maximumAttendees
        : item?.maxAttendees != null
          ? item.maxAttendees
          : "",
    maxAttendees:
      item?.maximumAttendees != null
        ? item.maximumAttendees
        : item?.maxAttendees != null
          ? item.maxAttendees
          : "",
    eligibility: normalizeEligibility(item?.eligibility),
    requiredMembershipIds: item?.requiredMembershipIds ?? [],
    price: item?.price != null ? item.price : 0,
    currency: item?.currency ?? "CAD",
    organizerName: item?.organizerName ?? "",
    contactEmail: item?.contactEmail ?? "",
    contactPhone: item?.contactPhone ?? "",
    status: normalizeStatus(item?.status),
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
  const [membershipOptions, setMembershipOptions] = useState<
    { id: string; name: string }[]
  >([]);

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
  const watchCoverImage = watch("coverImage");
  const watchEligibility = watch("eligibility");
  const watchRequiredMembershipIds = watch("requiredMembershipIds") || [];

  const {
    fields: galleryFields,
    append: appendGallery,
    remove: removeGallery,
  } = useFieldArray({
    control,
    name: "galleryImages",
  });

  const fmtLower = (currentFormat || "").toLowerCase();
  const needsLink = fmtLower === "virtual" || fmtLower === "hybrid";
  const needsLocation = fmtLower === "physical" || fmtLower === "hybrid";

  useEffect(() => {
    if (open) {
      reset(getFormDefaults(event));
      // Load available membership plans for eligibility mapping
      new MembershipRepository().list().then((res) => {
        if (res.success && res.data) {
          setMembershipOptions(
            res.data.items
              .filter((m) => Boolean(m.id))
              .map((m) => ({ id: m.id as string, name: m.name })),
          );
        }
      });
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

    if (!data.categoryId) {
      setError("categoryId", {
        type: "manual",
        message: "Event category is required",
      });
      return;
    }

    const cover = data.coverImage || data.image;
    if (!cover) {
      setError("coverImage", {
        type: "manual",
        message: "Cover image is required",
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
      data.maximumAttendees !== "" && data.maximumAttendees != null
        ? Number(data.maximumAttendees)
        : data.maxAttendees !== "" && data.maxAttendees != null
          ? Number(data.maxAttendees)
          : null;

    const galleryImages = (data.galleryImages || [])
      .map((item) => item.value.trim())
      .filter(Boolean);

    const payload: EventPayload = {
      name: data.name.trim(),
      description: data.description.trim(),
      categoryId: data.categoryId,
      category: data.categoryId,
      coverImage: cover,
      image: cover,
      images: galleryImages,
      startDate: data.startDate,
      startTime: data.startTime,
      endDate: data.endDate,
      endTime: data.endTime,
      format: data.format,
      meetingLink: data.meetingLink?.trim() || null,
      location: data.location?.trim() || null,
      registrationRequired: Boolean(data.registrationRequired),
      registrationOpens: data.registrationRequired
        ? toIsoDate(data.registrationOpens)
        : null,
      registrationCloses: data.registrationRequired
        ? toIsoDate(data.registrationCloses)
        : null,
      maximumAttendees: attendeesNum,
      maxAttendees: attendeesNum,
      eligibility: data.eligibility,
      requiredMembershipIds:
        data.eligibility === "Specific Membership Type"
          ? data.requiredMembershipIds || []
          : [],
      price: priceNum,
      currency: data.currency,
      organizerName: data.organizerName.trim(),
      contactEmail: data.contactEmail.trim(),
      contactPhone: data.contactPhone?.trim() || null,
      status: data.status,
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
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
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
                  if (val) {
                    setValue("categoryId", val, { shouldDirty: true });
                    clearErrors("categoryId");
                  }
                }}
                render={(item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                )}
              />
              {errors.categoryId && (
                <FieldError>{String(errors.categoryId.message)}</FieldError>
              )}
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

            {/* Cover Image */}
            <div className="sm:col-span-2">
              <ImageUpload
                label="Event Cover Image / Poster"
                value={watchCoverImage || null}
                onChange={(img) => {
                  setValue("coverImage", img, { shouldDirty: true, shouldValidate: true });
                  setValue("image", img, { shouldDirty: true });
                  if (img) clearErrors("coverImage");
                }}
                helperText="Upload event cover banner or promotional poster."
              />
              {errors.coverImage && (
                <FieldError>{String(errors.coverImage.message)}</FieldError>
              )}
            </div>

            {/* Additional Gallery Images */}
            <div className="sm:col-span-2 space-y-3 bg-base-200/30 p-4 rounded-xl border border-base-300">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-base-content/80">
                    Event Gallery Images
                  </label>
                  <p className="text-xs text-secondary">
                    Optional photos, venue shots, or speaker highlights for this event.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendGallery({ value: "" })}
                  leftIcon={<Plus size={14} />}
                >
                  Add Image
                </Button>
              </div>

              {galleryFields.map((field, idx) => (
                <div
                  key={field.id}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-base-300"
                >
                  <div className="flex-1">
                    <ImageUpload
                      value={watch(`galleryImages.${idx}.value`)}
                      onChange={(url) =>
                        setValue(`galleryImages.${idx}.value`, url || "", {
                          shouldDirty: true,
                        })
                      }
                      helperText={`Gallery image #${idx + 1}`}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-error hover:bg-error/10 mt-1"
                    onClick={() => removeGallery(idx)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
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

            {/* Specific Membership Selection */}
            {watchEligibility === "Specific Membership Type" && (
              <div className="sm:col-span-2 space-y-2 p-3.5 bg-base-200/40 rounded-xl border border-base-300">
                <label className="block text-xs font-semibold text-base-content/80">
                  Allowed Membership Plans
                </label>
                <p className="text-xs text-secondary">
                  Check which membership tiers have access to register for this event.
                </p>
                {membershipOptions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {membershipOptions.map((m) => {
                      const isChecked = watchRequiredMembershipIds.includes(m.id);
                      return (
                        <label
                          key={m.id}
                          className="flex items-center gap-2.5 p-2.5 rounded-lg border border-base-300 bg-white hover:bg-base-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm checkbox-primary"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setValue("requiredMembershipIds", [
                                  ...watchRequiredMembershipIds,
                                  m.id,
                                ], { shouldDirty: true });
                              } else {
                                setValue(
                                  "requiredMembershipIds",
                                  watchRequiredMembershipIds.filter(
                                    (id) => id !== m.id,
                                  ),
                                  { shouldDirty: true },
                                );
                              }
                            }}
                          />
                          <span className="text-xs font-medium text-base-content">
                            {m.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-secondary italic py-2">
                    Loading available membership tiers...
                  </p>
                )}
              </div>
            )}

            {needsLink && (
              <div className="sm:col-span-2">
                <SimpleInput
                  label="Meeting link"
                  type="url"
                  required
                  placeholder="https://meet.example.com/abc"
                  {...register("meetingLink")}
                />
              </div>
            )}

            {needsLocation && (
              <div className="sm:col-span-2">
                <SimpleInput
                  label="Location"
                  required
                  placeholder="123 Main St, Windsor"
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
                placeholder="100"
                {...register("maximumAttendees")}
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
                placeholder="0"
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
