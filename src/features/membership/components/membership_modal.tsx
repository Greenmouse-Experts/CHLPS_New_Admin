"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import DialogModal, { ModalHandle } from "@/components/DialogModal";
import {
  Button,
  Toggle,
  Checkbox,
  FieldLabel,
  FieldError,
  ImageUpload,
  Tabs,
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
import {
  AddCircle,
  Briefcase,
  DocumentText,
  InfoCircle,
  LampCharge,
  MessageQuestion,
  Trash,
} from "iconsax-react";

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

  // Career & Value Highlights
  jobOpportunities: {
    iconUrl?: string;
    title: string;
    description: string;
  }[];
  howMembershipHelps: {
    iconUrl?: string;
    title: string;
    description: string;
  }[];

  // Why Join Now & Questions
  whyJoinNow: {
    heading: string;
    description: string;
    highlights: { value: string }[];
    infoCards: {
      title: string;
      description: string;
    }[];
  };
  applicationQuestions: {
    question: string;
  }[];
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

type ModalTabKey = "general" | "criteria" | "career" | "why_join";

function getFormDefaults(membership?: Membership | null): FormValues {
  const typeId =
    typeof membership?.type === "string"
      ? membership.type
      : (membership?.type?.id ??
        (membership as unknown as { typeId?: string })?.typeId ??
        "");

  let highlightsArray: { value: string }[] = [];
  if (Array.isArray(membership?.whyJoinNow?.highlights)) {
    highlightsArray = membership.whyJoinNow.highlights.map((h: unknown) => {
      if (typeof h === "string") return { value: h };
      const obj = h as { value?: string };
      return { value: obj?.value || "" };
    });
  }

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

    jobOpportunities:
      membership?.jobOpportunities?.map((item) => ({
        iconUrl: item.iconUrl || "",
        title: item.title || "",
        description: item.description || "",
      })) ?? [],

    howMembershipHelps:
      membership?.howMembershipHelps?.map((item) => ({
        iconUrl: item.iconUrl || "",
        title: item.title || "",
        description: item.description || "",
      })) ?? [],

    whyJoinNow: {
      heading: membership?.whyJoinNow?.heading ?? "",
      description: membership?.whyJoinNow?.description ?? "",
      highlights: highlightsArray,
      infoCards:
        membership?.whyJoinNow?.infoCards?.map((card) => ({
          title: card.title || "",
          description: card.description || "",
        })) ?? [],
    },

    applicationQuestions:
      membership?.applicationQuestions?.map((q: unknown) => {
        if (typeof q === "string") return { question: q };
        const obj = q as { question?: string };
        return { question: obj?.question || "" };
      }) ?? [],
  };
}

export const MembershipModal = forwardRef<ModalHandle, Props>(
  function MembershipModal(
    { open, membership, isSubmitting, onClose, onSubmit }: Props,
    ref,
  ) {
    const dialogRef = useRef<ModalHandle>(null);
    const isEdit = Boolean(membership);
    const [activeTab, setActiveTab] = useState<ModalTabKey>("general");

    useImperativeHandle(ref, () => ({
      open: () => {
        setActiveTab("general");
        dialogRef.current?.open();
      },
      close: () => dialogRef.current?.close(),
    }));

    useEffect(() => {
      if (open === true) {
        setActiveTab("general");
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

    // Field Arrays
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

    const {
      fields: jobFields,
      append: appendJob,
      remove: removeJob,
    } = useFieldArray({
      control,
      name: "jobOpportunities",
    });

    const {
      fields: howHelpsFields,
      append: appendHowHelps,
      remove: removeHowHelps,
    } = useFieldArray({
      control,
      name: "howMembershipHelps",
    });

    const {
      fields: highlightFields,
      append: appendHighlight,
      remove: removeHighlight,
    } = useFieldArray({
      control,
      name: "whyJoinNow.highlights",
    });

    const {
      fields: infoCardFields,
      append: appendInfoCard,
      remove: removeInfoCard,
    } = useFieldArray({
      control,
      name: "whyJoinNow.infoCards",
    });

    const {
      fields: questionFields,
      append: appendQuestion,
      remove: removeQuestion,
    } = useFieldArray({
      control,
      name: "applicationQuestions",
    });

    useEffect(() => {
      if (open) {
        setActiveTab("general");
        reset(getFormDefaults(membership));
      }
    }, [open, membership, reset]);

    const onFormSubmit = async (values: FormValues) => {
      const selectedType = values.type;
      if (!selectedType) {
        setActiveTab("general");
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
        setActiveTab("criteria");
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
        setActiveTab("criteria");
        setError("benefits", {
          type: "required",
          message: "Add at least one benefit",
        });
        return;
      }

      const priceNum = Number(values.price);
      if (Number.isNaN(priceNum) || priceNum < 0) {
        setActiveTab("general");
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
          setActiveTab("general");
          setError("renewalPrice", {
            type: "validate",
            message: "Enter a valid renewal price (>= 0)",
          });
          return;
        }
      }

      // Filter and sanitize new fields
      const jobOpportunities = (values.jobOpportunities || [])
        .map((j) => ({
          iconUrl: j.iconUrl?.trim() || undefined,
          title: j.title.trim(),
          description: j.description.trim(),
        }))
        .filter((j) => j.title.length > 0 || j.description.length > 0);

      const howMembershipHelps = (values.howMembershipHelps || [])
        .map((h) => ({
          iconUrl: h.iconUrl?.trim() || undefined,
          title: h.title.trim(),
          description: h.description.trim(),
        }))
        .filter((h) => h.title.length > 0 || h.description.length > 0);

      const whyJoinHighlights = (values.whyJoinNow?.highlights || [])
        .map((h) => h.value.trim())
        .filter(Boolean);

      const whyJoinInfoCards = (values.whyJoinNow?.infoCards || [])
        .map((c) => ({
          title: c.title.trim(),
          description: c.description.trim(),
        }))
        .filter((c) => c.title.length > 0 || c.description.length > 0);

      const whyJoinHeading = values.whyJoinNow?.heading?.trim() || "";
      const whyJoinDesc = values.whyJoinNow?.description?.trim() || "";

      const whyJoinNow =
        whyJoinHeading ||
        whyJoinDesc ||
        whyJoinHighlights.length > 0 ||
        whyJoinInfoCards.length > 0
          ? {
              heading: whyJoinHeading,
              description: whyJoinDesc,
              highlights: whyJoinHighlights,
              infoCards: whyJoinInfoCards,
            }
          : undefined;

      const applicationQuestions = (values.applicationQuestions || [])
        .map((q) => ({
          question: q.question.trim(),
        }))
        .filter((q) => q.question.length > 0);

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
        ...(values.requiredDocuments?.length
          ? { requiredDocuments: values.requiredDocuments }
          : {}),
        status: values.status,
        image: values.image || null,
        jobOpportunities,
        howMembershipHelps,
        whyJoinNow,
        applicationQuestions,
      };

      const ok = await onSubmit(payload);
      if (ok) {
        dialogRef.current?.close();
        onClose();
      }
    };

    const tabs = [
      { key: "general", label: "General & Pricing" },
      { key: "criteria", label: "Criteria & Benefits" },
      { key: "career", label: "Career & Help" },
      { key: "why_join", label: "Why Join & Questions" },
    ];

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
        <div className="space-y-4">
          <Tabs
            tabs={tabs}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as ModalTabKey)}
            variant="pill"
          />

          <FormProvider {...methods}>
            <form
              id="membership-form"
              onSubmit={handleSubmit(onFormSubmit)}
              className="space-y-5"
            >
              {/* TAB 1: General & Pricing */}
              <div className={activeTab === "general" ? "space-y-4" : "hidden"}>
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
                    {errors.type && (
                      <FieldError>{errors.type.message}</FieldError>
                    )}
                  </div>

                  <div>
                    <SimpleInput
                      label="Category / Sub-tag (Optional)"
                      placeholder="e.g. Individual, Corporate"
                      {...register("category")}
                    />
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
                            setValue("autoRenewal", false, {
                              shouldDirty: true,
                            });
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
                            Enable recurring renewal billing for this
                            membership.
                          </p>
                        </div>
                        <Toggle
                          checked={autoRenewal}
                          onChange={(checked) =>
                            setValue("autoRenewal", checked, {
                              shouldDirty: true,
                            })
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
              </div>

              {/* TAB 2: Criteria & Benefits */}
              <div
                className={activeTab === "criteria" ? "space-y-5" : "hidden"}
              >
                {/* Eligibility Criteria */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <FieldLabel required>Eligibility Criteria</FieldLabel>
                      <p className="text-xs text-[#717171]">
                        Requirements applicants must meet to qualify.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        appendEligibility({ value: "" });
                        clearErrors("eligibilityCriteria");
                      }}
                      leftIcon={<AddCircle size={14} />}
                    >
                      Add criterion
                    </Button>
                  </div>
                  {eligibilityFields.map((field, idx) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <SimpleInput
                          placeholder={`Criterion #${idx + 1} (e.g. At least 3 years experience)`}
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
                          className="text-error hover:bg-error/10"
                          onClick={() => removeEligibility(idx)}
                        >
                          <Trash size={14} />
                        </Button>
                      )}
                    </div>
                  ))}
                  {errors.eligibilityCriteria && (
                    <FieldError>
                      {errors.eligibilityCriteria.message}
                    </FieldError>
                  )}
                </div>

                {/* Benefits */}
                <div className="space-y-2 pt-2 border-t border-base-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <FieldLabel required>Benefits & Privileges</FieldLabel>
                      <p className="text-xs text-[#717171]">
                        What members get upon enrolling in this plan.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        appendBenefit({ value: "" });
                        clearErrors("benefits");
                      }}
                      leftIcon={<AddCircle size={14} />}
                    >
                      Add benefit
                    </Button>
                  </div>
                  {benefitFields.map((field, idx) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <SimpleInput
                          placeholder={`Benefit #${idx + 1} (e.g. Access to resources)`}
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
                          className="text-error hover:bg-error/10"
                          onClick={() => removeBenefit(idx)}
                        >
                          <Trash size={14} />
                        </Button>
                      )}
                    </div>
                  ))}
                  {errors.benefits && (
                    <FieldError>{errors.benefits.message}</FieldError>
                  )}
                </div>

                {/* Required Documents */}
                <div className="space-y-2 pt-2 border-t border-base-200">
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
              </div>

              {/* TAB 3: Career & Help */}
              <div className={activeTab === "career" ? "space-y-6" : "hidden"}>
                {/* Job Opportunities */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase size={18} className="text-primary" />
                      <div>
                        <FieldLabel>Job Opportunities</FieldLabel>
                        <p className="text-xs text-[#717171]">
                          Career paths or job roles accessible through this
                          membership.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        appendJob({ title: "", description: "", iconUrl: "" })
                      }
                      leftIcon={<AddCircle size={14} />}
                    >
                      Add Opportunity
                    </Button>
                  </div>

                  {jobFields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="p-4 rounded-xl border border-base-200 bg-base-50/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-base-content/70 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          Job Opportunity #{idx + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          className="text-error hover:bg-error/10"
                          onClick={() => removeJob(idx)}
                        >
                          <Trash size={14} /> Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <SimpleInput
                            label="Role Title"
                            placeholder="e.g. Legal Associate Roles"
                            {...register(`jobOpportunities.${idx}.title`)}
                          />
                        </div>
                        <div>
                          <SimpleInput
                            label="Icon URL (Optional)"
                            placeholder="e.g. https://cdn.example.com/icons/job.svg"
                            {...register(`jobOpportunities.${idx}.iconUrl`)}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <SimpleTextArea
                            label="Description"
                            placeholder="Access to entry-level legal associate opportunities..."
                            rows={2}
                            {...register(`jobOpportunities.${idx}.description`)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {jobFields.length === 0 && (
                    <p className="text-xs text-secondary italic py-2">
                      No job opportunities added yet. Click &quot;Add
                      Opportunity&quot; to define roles.
                    </p>
                  )}
                </div>

                {/* How Membership Helps */}
                <div className="space-y-3 pt-3 border-t border-base-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LampCharge size={18} className="text-primary" />
                      <div>
                        <FieldLabel>How Membership Helps</FieldLabel>
                        <p className="text-xs text-[#717171]">
                          Key ways this membership equips and supports the
                          member.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        appendHowHelps({
                          title: "",
                          description: "",
                          iconUrl: "",
                        })
                      }
                      leftIcon={<AddCircle size={14} />}
                    >
                      Add Help Item
                    </Button>
                  </div>

                  {howHelpsFields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="p-4 rounded-xl border border-base-200 bg-base-50/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-base-content/70 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          Support Item #{idx + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          className="text-error hover:bg-error/10"
                          onClick={() => removeHowHelps(idx)}
                        >
                          <Trash size={14} /> Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <SimpleInput
                            label="Title"
                            placeholder="e.g. Networking & Mentorship"
                            {...register(`howMembershipHelps.${idx}.title`)}
                          />
                        </div>
                        <div>
                          <SimpleInput
                            label="Icon URL (Optional)"
                            placeholder="e.g. https://cdn.example.com/icons/help.svg"
                            {...register(`howMembershipHelps.${idx}.iconUrl`)}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <SimpleTextArea
                            label="Description"
                            placeholder="Describe how this feature assists the applicant..."
                            rows={2}
                            {...register(
                              `howMembershipHelps.${idx}.description`,
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {howHelpsFields.length === 0 && (
                    <p className="text-xs text-secondary italic py-2">
                      No support items added yet. Click &quot;Add Help
                      Item&quot; to add value highlights.
                    </p>
                  )}
                </div>
              </div>

              {/* TAB 4: Why Join & Questions */}
              <div
                className={activeTab === "why_join" ? "space-y-6" : "hidden"}
              >
                {/* Why Join Now Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <InfoCircle size={18} className="text-primary" />
                    <div>
                      <FieldLabel>&quot;Why Join Now?&quot; Section</FieldLabel>
                      <p className="text-xs text-[#717171]">
                        Motivational section encouraging prospective members to
                        enroll immediately.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <SimpleInput
                      label="Section Heading"
                      placeholder="e.g. Why should I join now?"
                      {...register("whyJoinNow.heading")}
                    />

                    <SimpleTextArea
                      label="Section Description"
                      placeholder="Starting early provides a strong foundation..."
                      rows={3}
                      {...register("whyJoinNow.description")}
                    />
                  </div>

                  {/* Highlights list */}
                  <div className="space-y-2 pt-2 border-t border-base-200">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-base-content">
                        Quick Highlights (Bullet Points)
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => appendHighlight({ value: "" })}
                        leftIcon={<AddCircle size={12} />}
                      >
                        Add highlight
                      </Button>
                    </div>

                    {highlightFields.map((field, idx) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <div className="flex-1">
                          <SimpleInput
                            placeholder={`e.g. Start early, Build knowledge (#${idx + 1})`}
                            {...register(`whyJoinNow.highlights.${idx}.value`)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          className="text-error hover:bg-error/10"
                          onClick={() => removeHighlight(idx)}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    ))}

                    {highlightFields.length === 0 && (
                      <p className="text-xs text-secondary italic">
                        No highlights added yet.
                      </p>
                    )}
                  </div>

                  {/* Info Cards */}
                  <div className="space-y-2.5 pt-2 border-t border-base-200">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-base-content">
                        Information Cards (e.g. Application Fees, Timing)
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() =>
                          appendInfoCard({ title: "", description: "" })
                        }
                        leftIcon={<AddCircle size={12} />}
                      >
                        Add Info Card
                      </Button>
                    </div>

                    {infoCardFields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="p-3 rounded-xl border border-base-200 bg-base-50/40 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-base-content/70">
                            Info Card #{idx + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            className="text-error hover:bg-error/10"
                            onClick={() => removeInfoCard(idx)}
                          >
                            <Trash size={14} /> Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <SimpleInput
                            label="Title"
                            placeholder="e.g. Application fee"
                            {...register(`whyJoinNow.infoCards.${idx}.title`)}
                          />
                          <SimpleInput
                            label="Description"
                            placeholder="e.g. One off application fee: £148"
                            {...register(
                              `whyJoinNow.infoCards.${idx}.description`,
                            )}
                          />
                        </div>
                      </div>
                    ))}

                    {infoCardFields.length === 0 && (
                      <p className="text-xs text-secondary italic">
                        No info cards added yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Application Questions Section */}
                <div className="space-y-3 pt-3 border-t border-base-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageQuestion size={18} className="text-primary" />
                      <div>
                        <FieldLabel>Application Questions</FieldLabel>
                        <p className="text-xs text-[#717171]">
                          Questions applicants must answer when submitting their
                          application.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => appendQuestion({ question: "" })}
                      leftIcon={<AddCircle size={14} />}
                    >
                      Add Question
                    </Button>
                  </div>

                  {questionFields.map((field, idx) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <SimpleInput
                          placeholder={`Question #${idx + 1} (e.g. Do you hold a National ID?)`}
                          {...register(`applicationQuestions.${idx}.question`)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="text-error hover:bg-error/10"
                        onClick={() => removeQuestion(idx)}
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  ))}

                  {questionFields.length === 0 && (
                    <p className="text-xs text-secondary italic">
                      No custom questions added. Click &quot;Add Question&quot;
                      to prompt applicants.
                    </p>
                  )}
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </DialogModal>
    );
  },
);

export default MembershipModal;
