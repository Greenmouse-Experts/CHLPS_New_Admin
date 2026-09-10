"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import DialogModal, { ModalHandle } from "@/components/DialogModal";
import {
  Button,
  Toggle,
  Checkbox,
  FieldLabel,
  FieldError,
  ImageUpload,
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

export interface Props {
  open?: boolean;
  membership?: Membership | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: MembershipPayload) => Promise<boolean>;
}

export type { ModalHandle };

interface FormValues {
  name: string;
  description: string;
  type: string;
  category?: string;
  eligibilityCriteria: { value: string }[];
  price: string | number;
  currency: MembershipCurrency;
  duration: string;
  autoRenewal: boolean;
  renewalPrice?: string | number;
  renewalPeriod?: string;
  benefits: { value: string }[];
  requiredDocuments: string[];
  image?: string | null;
  status: MembershipStatus;
}

const COMMON_DURATIONS = [
  { value: "1 Month", label: "1 Month" },
  { value: "3 Months", label: "3 Months" },
  { value: "6 Months", label: "6 Months" },
  { value: "1 Year", label: "1 Year" },
  { value: "2 Years", label: "2 Years" },
  { value: "Lifetime", label: "Lifetime" },
];

const COMMON_RENEWAL_PERIODS = [
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "Bi-annually", label: "Bi-annually" },
  { value: "Annually", label: "Annually" },
];

const REQUIRED_DOCUMENTS_LIST = [
  "Government ID / Passport",
  "Proof of Address",
  "Professional License / Certificate",
  "Curriculum Vitae (CV)",
  "Recommendation Letter",
];

function getFormDefaults(membership?: Membership | null): FormValues {
  const typeId =
    typeof membership?.type === "string"
      ? membership.type
      : (membership?.type?.id ??
        (membership as unknown as { typeId?: string })?.typeId ??
        "");

  return {
    name: membership?.name ?? "",
    description: membership?.description ?? "",
    type: typeId,
    category: membership?.category ?? "",
    eligibilityCriteria: (membership?.eligibilityCriteria?.length
      ? membership.eligibilityCriteria
      : [""]
    ).map((v) => ({ value: v })),
    price: membership?.price !== undefined ? String(membership.price) : "",
    currency: membership?.currency ?? "CAD",
    duration: membership?.duration ?? "1 Year",
    autoRenewal: Boolean(membership?.autoRenewal),
    renewalPrice:
      membership?.renewalPrice !== undefined &&
      membership?.renewalPrice !== null
        ? String(membership.renewalPrice)
        : "",
    renewalPeriod: membership?.renewalPeriod ?? "Annually",
    benefits: (membership?.benefits?.length ? membership.benefits : [""]).map(
      (v) => ({ value: v }),
    ),
    requiredDocuments: membership?.requiredDocuments ?? [],
    image: membership?.image ?? null,
    status: membership?.status ?? "draft",
  };
}

export const MembershipModal = forwardRef<ModalHandle, Props>(
  function MembershipModal(
    { open, membership, isSubmitting, onClose, onSubmit }: Props,
    ref,
  ) {
    const dialogRef = useRef<ModalHandle>(null);
    const isEdit = Boolean(membership);

    useImperativeHandle(ref, () => ({
      open: () => dialogRef.current?.open(),
      close: () => dialogRef.current?.close(),
    }));

    useEffect(() => {
      if (open === true) {
        dialogRef.current?.open();
      } else if (open === false) {
        dialogRef.current?.close();
      }
    }, [open]);

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

    const currentDuration = watch("duration");
    const autoRenewal = watch("autoRenewal");
    const watchRequiredDocs = watch("requiredDocuments") || [];
    const watchImage = watch("image");
    const isLifetime = currentDuration === "Lifetime";
    const showRenewal = !isLifetime && autoRenewal;

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

    const onFormSubmit = async (values: FormValues) => {
      const selectedType = values.type;
      if (!selectedType) {
        setError("type", {
          type: "required",
          message: "Membership type is required",
        });
        return;
      }

      const eligibility = values.eligibilityCriteria
        .map((c) => c.value.trim())
        .filter(Boolean);
      if (eligibility.length === 0) {
        setError("eligibilityCriteria", {
          type: "required",
          message: "Add at least one eligibility criterion",
        });
        return;
      }

      const benefits = values.benefits
        .map((b) => b.value.trim())
        .filter(Boolean);
      if (benefits.length === 0) {
        setError("benefits", {
          type: "required",
          message: "Add at least one benefit",
        });
        return;
      }

      const priceNum = Number(values.price);
      if (Number.isNaN(priceNum) || priceNum < 0) {
        setError("price", {
          type: "validate",
          message: "Enter a valid price (>= 0)",
        });
        return;
      }

      let renewalNum: number | null = null;
      if (
        showRenewal &&
        values.renewalPrice !== "" &&
        values.renewalPrice !== undefined
      ) {
        renewalNum = Number(values.renewalPrice);
        if (Number.isNaN(renewalNum) || renewalNum < 0) {
          setError("renewalPrice", {
            type: "validate",
            message: "Enter a valid renewal price (>= 0)",
          });
          return;
        }
      }

      const payload: MembershipPayload = {
        name: values.name.trim(),
        description: values.description.trim(),
        type: selectedType,
        category: values.category?.trim() || undefined,
        eligibilityCriteria: eligibility,
        price: priceNum,
        currency: values.currency,
        duration: values.duration,
        autoRenewal: isLifetime ? false : values.autoRenewal,
        renewalPrice: isLifetime
          ? null
          : values.autoRenewal
            ? renewalNum
            : null,
        renewalPeriod:
          isLifetime || !values.autoRenewal ? null : values.renewalPeriod,
        benefits,
        requiredDocuments: values.requiredDocuments,
        status: values.status,
        image: values.image || null,
      };

      const ok = await onSubmit(payload);
      if (ok) {
        dialogRef.current?.close();
        onClose();
      }
    };

    return (
      <DialogModal
        ref={dialogRef}
        title={isEdit ? "Edit Membership Plan" : "Create Membership Plan"}
        onClose={onClose}
        actions={
          <>
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                dialogRef.current?.close();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              loading={isSubmitting}
              type="submit"
              form="membership-form"
              onClick={handleSubmit(onFormSubmit)}
            >
              {isEdit ? "Save changes" : "Create membership"}
            </Button>
          </>
        }
      >
        <FormProvider {...methods}>
          <form
            id="membership-form"
            onSubmit={handleSubmit(onFormSubmit)}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <SimpleInput
                  label="Membership Plan Name"
                  placeholder="e.g. Professional Associate Membership"
                  required
                  {...register("name", {
                    required: "Membership name is required",
                    minLength: {
                      value: 3,
                      message: "Must be at least 3 characters",
                    },
                  })}
                />
              </div>

              <div className="sm:col-span-2">
                <SimpleTextArea
                  label="Description"
                  placeholder="Describe what this membership offers, who it's for..."
                  rows={3}
                  required
                  {...register("description", {
                    required: "Description is required",
                  })}
                />
              </div>

              <div>
                <SimpleSelect<{ id: string; name: string }>
                  label="Membership Type / Category"
                  placeholder="Select category type"
                  route={ApiUrls.membershipTypes}
                  name="type"
                  autoSelectFirst={false}
                  onChange={(val) => {
                    if (val) clearErrors("type");
                  }}
                  render={(item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  )}
                />
                {errors.type && <FieldError>{errors.type.message}</FieldError>}
              </div>

              <div>
                <SimpleInput
                  label="Category / Sub-tag (Optional)"
                  placeholder="e.g. Individual, Corporate"
                  {...register("category")}
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <FieldLabel required>Eligibility Criteria</FieldLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      appendEligibility({ value: "" });
                      clearErrors("eligibilityCriteria");
                    }}
                  >
                    + Add criterion
                  </Button>
                </div>
                {eligibilityFields.map((field, idx) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <SimpleInput
                        placeholder={`Criterion #${idx + 1}`}
                        {...register(`eligibilityCriteria.${idx}.value`, {
                          required:
                            idx === 0
                              ? "At least one criterion is required"
                              : false,
                        })}
                      />
                    </div>
                    {eligibilityFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEligibility(idx)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                {errors.eligibilityCriteria && (
                  <FieldError>{errors.eligibilityCriteria.message}</FieldError>
                )}
              </div>

              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <FieldLabel required>Benefits</FieldLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      appendBenefit({ value: "" });
                      clearErrors("benefits");
                    }}
                  >
                    + Add benefit
                  </Button>
                </div>
                {benefitFields.map((field, idx) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <SimpleInput
                        placeholder={`Benefit #${idx + 1}`}
                        {...register(`benefits.${idx}.value`, {
                          required:
                            idx === 0
                              ? "At least one benefit is required"
                              : false,
                        })}
                      />
                    </div>
                    {benefitFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBenefit(idx)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                {errors.benefits && (
                  <FieldError>{errors.benefits.message}</FieldError>
                )}
              </div>

              <div>
                <SimpleInput
                  label="Price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
                  {...register("price", {
                    required: "Price is required",
                    min: { value: 0, message: "Price cannot be negative" },
                  })}
                />
              </div>

              <div>
                <LocalSelect
                  label="Currency"
                  required
                  {...register("currency", { required: true })}
                >
                  {MEMBERSHIP_CURRENCIES.map((curr) => (
                    <option key={curr.value} value={curr.value}>
                      {curr.label}
                    </option>
                  ))}
                </LocalSelect>
              </div>

              <div>
                <LocalSelect
                  label="Duration"
                  required
                  {...register("duration", {
                    required: "Duration is required",
                    onChange: (e) => {
                      const dur = e.target.value;
                      if (dur === "Lifetime") {
                        setValue("autoRenewal", false, { shouldDirty: true });
                      }
                    },
                  })}
                >
                  {COMMON_DURATIONS.map((dur) => (
                    <option key={dur.value} value={dur.value}>
                      {dur.label}
                    </option>
                  ))}
                </LocalSelect>
              </div>

              <div>
                <LocalSelect
                  label="Status"
                  required
                  {...register("status", { required: true })}
                >
                  {MEMBERSHIP_STATUSES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </LocalSelect>
              </div>

              {!isLifetime && (
                <div className="sm:col-span-2 pt-1">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-[#E7E9EB] bg-[#F7F7F7]/60">
                    <div>
                      <p className="text-sm font-medium text-black">
                        Auto-Renewal
                      </p>
                      <p className="text-xs text-[#717171]">
                        Enable recurring renewal billing for this membership.
                      </p>
                    </div>
                    <Toggle
                      checked={autoRenewal}
                      onChange={(checked) =>
                        setValue("autoRenewal", checked, { shouldDirty: true })
                      }
                    />
                  </div>
                </div>
              )}

              {showRenewal && (
                <>
                  <div>
                    <SimpleInput
                      label="Renewal Price"
                      type="number"
                      step="0.01"
                      placeholder="Same as base price if blank"
                      {...register("renewalPrice", {
                        min: {
                          value: 0,
                          message: "Renewal price cannot be negative",
                        },
                      })}
                    />
                  </div>

                  <div>
                    <LocalSelect
                      label="Renewal Period"
                      {...register("renewalPeriod")}
                    >
                      {COMMON_RENEWAL_PERIODS.map((period) => (
                        <option key={period.value} value={period.value}>
                          {period.label}
                        </option>
                      ))}
                    </LocalSelect>
                  </div>
                </>
              )}

              <div className="sm:col-span-2 space-y-2 pt-1">
                <FieldLabel>Required Documents for Applicants</FieldLabel>
                <p className="text-xs text-[#717171]">
                  Check all documents applicants must provide before approval.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
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

              {/* Cloudinary Image Upload */}
              <div className="sm:col-span-2">
                <ImageUpload
                  label="Membership Image / Banner"
                  value={watchImage || null}
                  onChange={(url) =>
                    setValue("image", url, { shouldDirty: true })
                  }
                  folder="chlps_memberships"
                  helperText="Upload banner or icon image for this membership tier to Cloudinary."
                />
              </div>
            </div>
          </form>
        </FormProvider>
      </DialogModal>
    );
  },
);

export default MembershipModal;
