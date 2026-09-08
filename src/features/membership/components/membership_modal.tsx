"use client";

import { useEffect } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import {
  Modal,
  Button,
  Toggle,
  Checkbox,
  FieldLabel,
  FieldError,
} from "@/components/ui";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import LocalSelect from "@/components/inputs/LocalSelect";
import SimpleSelect from "@/components/inputs/SimpleSelect";
import { ApiUrls } from "@/lib/network/api_url";
import {
  Membership,
  MembershipPayload,
  MembershipCurrency,
  MembershipStatus,
  MEMBERSHIP_CURRENCIES,
  MEMBERSHIP_STATUSES,
} from "../domain/data/response/membership_response";

interface Props {
  open: boolean;
  membership?: Membership | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: MembershipPayload) => Promise<boolean>;
}

interface FormValues {
  name: string;
  description: string;
  type: string;
  category?: string;
  eligibilityCriteria: { value: string }[];
  price: number | string;
  currency: MembershipCurrency;
  duration: string;
  autoRenewal: boolean;
  renewalPrice?: number | string | null;
  renewalPeriod?: string | null;
  benefits: { value: string }[];
  requiredDocuments: string[];
  image?: string | null;
  status: MembershipStatus;
}

const COMMON_DURATIONS = [
  { value: "1 Year", label: "1 Year" },
  { value: "2 Years", label: "2 Years" },
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "Annually", label: "Annually" },
  { value: "Lifetime", label: "Lifetime" },
];

const COMMON_RENEWAL_PERIODS = [
  { value: "Annually", label: "Annually" },
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "1 Year", label: "1 Year" },
];

const REQUIRED_DOCUMENTS_LIST = [
  "National ID",
  "Passport",
  "Driver's Licence",
  "Certificate",
  "Other",
] as const;

function getFormDefaults(item?: Membership | null): FormValues {
  const typeId =
    typeof item?.type === "object" && item?.type !== null
      ? item.type.id
      : typeof item?.type === "string"
        ? item.type
        : "";

  return {
    name: item?.name ?? "",
    description: item?.description ?? "",
    type: typeId,
    category: typeId,
    eligibilityCriteria:
      item?.eligibilityCriteria && item.eligibilityCriteria.length > 0
        ? item.eligibilityCriteria.map((val) => ({ value: val }))
        : [{ value: "" }],
    price: item?.price != null ? item.price : "",
    currency: (item?.currency as MembershipCurrency) || "CAD",
    duration: item?.duration || "1 Year",
    autoRenewal: Boolean(item?.autoRenewal),
    renewalPrice: item?.renewalPrice != null ? item.renewalPrice : "",
    renewalPeriod: item?.renewalPeriod || "Annually",
    benefits:
      item?.benefits && item.benefits.length > 0
        ? item.benefits.map((val) => ({ value: val }))
        : [{ value: "" }],
    requiredDocuments: (item?.requiredDocuments as string[]) || [],
    image: item?.image || null,
    status: (item?.status as MembershipStatus) || "draft",
  };
}

export function MembershipModal({
  open,
  membership,
  isSubmitting,
  onClose,
  onSubmit,
}: Props) {
  const isEdit = !!membership;

  const methods = useForm<FormValues>({
    defaultValues: getFormDefaults(membership),
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

  const currentDuration = watch("duration") || "1 Year";
  const autoRenewal = watch("autoRenewal");
  const watchRequiredDocs = watch("requiredDocuments") || [];
  const watchImage = watch("image");
  const isLifetime = currentDuration.toLowerCase().includes("lifetime");
  const showRenewal = autoRenewal && !isLifetime;

  const {
    fields: eligibilityFields,
    append: appendEligibility,
    remove: removeEligibility,
  } = useFieldArray({
    control,
    name: "eligibilityCriteria",
  });

  const {
    fields: benefitFields,
    append: appendBenefit,
    remove: removeBenefit,
  } = useFieldArray({
    control,
    name: "benefits",
  });

  useEffect(() => {
    if (open) {
      reset(getFormDefaults(membership));
    }
  }, [open, membership, reset]);

  const onFormSubmit = async (data: FormValues) => {
    const selectedType = (data.type || "").trim();
    if (!selectedType || selectedType === "null") {
      setError("type", {
        type: "manual",
        message: "Please select a membership type",
      });
      return;
    }

    const eligibility = data.eligibilityCriteria
      .map((c) => c.value.trim())
      .filter(Boolean);

    if (eligibility.length === 0) {
      setError("eligibilityCriteria", {
        type: "manual",
        message: "Add at least one eligibility criterion",
      });
      return;
    }

    const benefits = data.benefits.map((b) => b.value.trim()).filter(Boolean);

    if (benefits.length === 0) {
      setError("benefits", {
        type: "manual",
        message: "Add at least one benefit",
      });
      return;
    }

    const priceNum = Number(data.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("price", {
        type: "manual",
        message: "Valid price greater than 0 is required",
      });
      return;
    }

    if (showRenewal) {
      const renewalNum = Number(data.renewalPrice);
      if (isNaN(renewalNum) || renewalNum <= 0) {
        setError("renewalPrice", {
          type: "manual",
          message: "Renewal price is required when auto-renewal is enabled",
        });
        return;
      }
    }

    const payload: MembershipPayload = {
      name: data.name.trim(),
      description: data.description.trim(),
      type: selectedType,
      category: selectedType,
      eligibilityCriteria: eligibility,
      price: priceNum,
      currency: data.currency,
      duration: data.duration,
      autoRenewal: isLifetime ? false : Boolean(data.autoRenewal),
      renewalPrice:
        showRenewal && data.renewalPrice != null
          ? Number(data.renewalPrice)
          : null,
      renewalPeriod: showRenewal ? data.renewalPeriod || "Annually" : null,
      benefits,
      requiredDocuments: data.requiredDocuments || [],
      status: data.status,
      image: data.image || null,
    };

    const ok = await onSubmit(payload);
    if (ok) {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Membership" : "Create Membership"}
      size="full"
      scrollable
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <SimpleInput
                label="Membership name"
                placeholder="e.g. Professional Membership"
                {...register("name", {
                  required: "Membership name is required",
                })}
              />
            </div>

            <div className="sm:col-span-2">
              <SimpleTextArea
                label="Membership description"
                placeholder="Description of membership"
                rows={3}
                {...register("description", {
                  required: "Membership description is required",
                })}
              />
            </div>

            <div>
              <SimpleSelect<{ id: string; name: string }>
                route={ApiUrls.membershipTypes}
                name="type"
                label="Membership type"
                placeholder="Select a membership type"
                autoSelectFirst={true}
                onChange={(val) => {
                  if (val) clearErrors("type");
                }}
                render={(item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                )}
              />
            </div>

            <div>
              <LocalSelect label="Membership status" {...register("status")}>
                {MEMBERSHIP_STATUSES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <div className="fieldset-label font-semibold">
                <span className="text-sm">
                  Eligibility criteria <span className="text-error">*</span>
                </span>
              </div>
              <div className="space-y-2">
                {eligibilityFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <SimpleInput
                        placeholder="e.g. Must hold a professional certificate"
                        {...register(
                          `eligibilityCriteria.${index}.value` as const,
                          {
                            required: "Criterion cannot be empty",
                          },
                        )}
                      />
                    </div>
                    {eligibilityFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-error hover:bg-error/10"
                        onClick={() => removeEligibility(index)}
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
                  onClick={() => appendEligibility({ value: "" })}
                >
                  + Add criterion
                </Button>
                {errors.eligibilityCriteria?.message && (
                  <FieldError>
                    {String(errors.eligibilityCriteria.message)}
                  </FieldError>
                )}
              </div>
            </div>

            <div>
              <SimpleInput
                label="Membership price"
                type="number"
                min={0}
                placeholder="e.g. 50000"
                {...register("price", {
                  required: "Membership price is required",
                })}
              />
            </div>

            <div>
              <LocalSelect label="Currency" {...register("currency")}>
                {MEMBERSHIP_CURRENCIES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <LocalSelect
                label="Membership duration"
                {...register("duration", {
                  onChange: (e) => {
                    const dur = e.target.value;
                    if (dur.toLowerCase().includes("lifetime")) {
                      setValue("autoRenewal", false);
                      setValue("renewalPrice", null);
                    }
                  },
                })}
              >
                {COMMON_DURATIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div className="flex items-center pt-6">
              <Toggle
                checked={autoRenewal && !isLifetime}
                disabled={isLifetime}
                onChange={(checked) => {
                  setValue("autoRenewal", checked, { shouldDirty: true });
                  if (checked && !methods.getValues("renewalPrice")) {
                    setValue("renewalPrice", methods.getValues("price"), {
                      shouldDirty: true,
                    });
                  }
                }}
                label="Auto-renewal"
                hint={
                  isLifetime
                    ? "Not available for lifetime memberships"
                    : autoRenewal
                      ? "Enabled"
                      : "Disabled"
                }
              />
            </div>

            {showRenewal && (
              <>
                <div>
                  <SimpleInput
                    label="Renewal price"
                    type="number"
                    min={0}
                    placeholder="e.g. 45000"
                    {...register("renewalPrice")}
                  />
                </div>
                <div>
                  <LocalSelect
                    label="Renewal period"
                    {...register("renewalPeriod")}
                  >
                    {COMMON_RENEWAL_PERIODS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </LocalSelect>
                </div>
              </>
            )}

            <div className="sm:col-span-2 space-y-2">
              <div className="fieldset-label font-semibold">
                <span className="text-sm">
                  Benefits <span className="text-error">*</span>
                </span>
              </div>
              <div className="space-y-2">
                {benefitFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <SimpleInput
                        placeholder="e.g. Access to resources"
                        {...register(`benefits.${index}.value` as const, {
                          required: "Benefit cannot be empty",
                        })}
                      />
                    </div>
                    {benefitFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-error hover:bg-error/10"
                        onClick={() => removeBenefit(index)}
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
                  onClick={() => appendBenefit({ value: "" })}
                >
                  + Add benefit
                </Button>
                {errors.benefits?.message && (
                  <FieldError>{String(errors.benefits.message)}</FieldError>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <FieldLabel>Required documents</FieldLabel>
              <div className="grid sm:grid-cols-2 gap-2 rounded-lg border border-[#E7E9EB] p-3">
                {REQUIRED_DOCUMENTS_LIST.map((doc) => {
                  const checked = watchRequiredDocs.includes(doc);
                  return (
                    <Checkbox
                      key={doc}
                      label={doc}
                      checked={checked}
                      onChange={() => {
                        const next = checked
                          ? watchRequiredDocs.filter((d) => d !== doc)
                          : [...watchRequiredDocs, doc];
                        setValue("requiredDocuments", next, {
                          shouldDirty: true,
                        });
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <FieldLabel>Membership image</FieldLabel>
              {watchImage ? (
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={watchImage}
                    alt="Membership"
                    className="w-20 h-14 rounded-lg object-cover border border-[#E7E9EB]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setValue("image", null, { shouldDirty: true })
                    }
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
                  reader.onload = () =>
                    setValue("image", String(reader.result), {
                      shouldDirty: true,
                    });
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }}
              />
              <p className="mt-1 text-xs text-[#717171]">
                Optional banner or icon.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button loading={isSubmitting} type="submit">
              {isEdit ? "Save changes" : "Create membership"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
