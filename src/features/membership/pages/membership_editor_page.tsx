"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components";
import {
  Button,
  Toggle,
  Checkbox,
  FieldLabel,
  FieldError,
  ImageUpload,
  Tabs,
  useToast,
  StatusBadge,
} from "@/components/ui";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import LocalSelect from "@/components/inputs/LocalSelect";
import SimpleSelect from "@/components/inputs/SimpleSelect";
import PageLoader from "@/components/PageLoader";
import { ApiUrls } from "@/lib/network/api_url";
import {
  Membership,
  MembershipPayload,
  MembershipCurrency,
  MembershipStatus,
  MEMBERSHIP_CURRENCIES,
  MEMBERSHIP_STATUSES,
} from "../domain/data/response/membership_response";
import MembershipRepository from "../domain/repository/membership_repository";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import {
  ArrowLeft,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  Info,
  Milestone,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";

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
  careerPathways: { value: string }[];
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

const TABS = [
  { key: "general", label: "General & Pricing" },
  { key: "criteria", label: "Criteria & Benefits" },
  { key: "career", label: "Career & Help" },
  { key: "why_join", label: "Why Join & Questions" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

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

    careerPathways:
      (membership?.careerPathways?.length ? membership.careerPathways : []).map(
        (v: unknown) => ({
          value: typeof v === "string" ? v : (v as { value?: string })?.value || "",
        }),
      ),

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

export default function MembershipEditorPage({
  membershipId,
}: {
  membershipId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const repo = useMemo(() => new MembershipRepository(), []);
  const isEdit = Boolean(membershipId);

  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const methods = useForm<FormValues>({
    defaultValues: getFormDefaults(null),
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
    fields: pathwayFields,
    append: appendPathway,
    remove: removePathway,
  } = useFieldArray({
    control,
    name: "careerPathways",
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

  const loadMembership = useCallback(async () => {
    if (!membershipId) return;
    setLoadingInitial(true);
    setIsError(false);
    setErrorMsg(null);
    try {
      const res = await repo.getOne(membershipId);
      if (res.success && res.data) {
        setMembership(res.data);
        reset(getFormDefaults(res.data));
      } else {
        setIsError(true);
        setErrorMsg(res.message || "Failed to load membership");
      }
    } catch (err: unknown) {
      setIsError(true);
      setErrorMsg(
        err instanceof Error ? err.message : "Error fetching membership",
      );
    } finally {
      setLoadingInitial(false);
    }
  }, [membershipId, repo, reset]);

  useEffect(() => {
    if (membershipId) {
      loadMembership();
    }
  }, [membershipId, loadMembership]);

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

    const careerPathways = (values.careerPathways || [])
      .map((c) => c.value.trim())
      .filter(Boolean);

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
      careerPathways,
      jobOpportunities,
      howMembershipHelps,
      whyJoinNow,
      applicationQuestions,
    };

    setIsSaving(true);
    try {
      if (isEdit && membershipId) {
        const res = await repo.update(membershipId, payload);
        if (res.success) {
          toast("Membership updated successfully", "success");
          router.push(`/membership/${membershipId}`);
        } else {
          toast(res.message, "danger");
        }
      } else {
        const res = await repo.create(payload);
        if (res.success) {
          toast("Membership created successfully", "success");
          router.push("/membership");
        } else {
          toast(res.message, "danger");
        }
      }
    } catch {
      toast("Failed to save membership plan", "danger");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextTab = () => {
    const currentIndex = TABS.findIndex((t) => t.key === activeTab);
    if (currentIndex < TABS.length - 1) {
      setActiveTab(TABS[currentIndex + 1].key);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevTab = () => {
    const currentIndex = TABS.findIndex((t) => t.key === activeTab);
    if (currentIndex > 0) {
      setActiveTab(TABS[currentIndex - 1].key);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <DashboardLayout
      title={isEdit ? "Edit Membership Plan" : "Create Membership Plan"}
    >
      <PageLoader
        query={{
          data: isEdit ? membership : true,
          isLoading: loadingInitial,
          isError,
          error: errorMsg,
          refetch: loadMembership,
        }}
      >
        <div className="space-y-6 max-w-5xl mx-auto pb-16">
          {/* Top Navigation & Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-xl border border-[#E7E9EB] p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  isEdit && membershipId
                    ? router.push(`/membership/${membershipId}`)
                    : router.push("/membership")
                }
                className="w-9 h-9 rounded-lg border border-[#E7E9EB] hover:bg-base-200 flex items-center justify-center text-base-content/70 transition-colors cursor-pointer"
                title="Go back"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-base-content">
                    {isEdit
                      ? `Edit: ${membership?.name || "Membership Plan"}`
                      : "Create Membership Plan"}
                  </h1>
                  {isEdit && membership?.status && (
                    <StatusBadge status={membership.status} />
                  )}
                </div>
                <p className="text-xs text-base-content/60 mt-0.5">
                  Configure pricing, eligibility, perks, career roles, and application requirements.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  isEdit && membershipId
                    ? router.push(`/membership/${membershipId}`)
                    : router.push("/membership")
                }
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="membership-editor-form"
                loading={isSaving}
                onClick={handleSubmit(onFormSubmit)}
              >
                {isEdit ? "Save Changes" : "Create Membership Plan"}
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-xl border border-[#E7E9EB] p-3 shadow-sm">
            <Tabs
              tabs={TABS.map((t) => ({ key: t.key, label: t.label }))}
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as TabKey)}
              variant="pill"
            />
          </div>

          {/* Main Form Body */}
          <FormProvider {...methods}>
            <form
              id="membership-editor-form"
              onSubmit={handleSubmit(onFormSubmit)}
              className="space-y-6"
            >
              {/* TAB 1: General & Pricing */}
              <div
                className={activeTab === "general" ? "space-y-6" : "hidden"}
              >
                <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-base-content">
                      Basic Information
                    </h2>
                    <p className="text-xs text-base-content/60">
                      General identifier and descriptive copy for this membership tier.
                    </p>
                  </div>

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
                        placeholder="Describe what this membership offers, who it is designed for..."
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
                        label="Sub-tag / Category (Optional)"
                        placeholder="e.g. Individual, Corporate"
                        {...register("category")}
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing & Duration Card */}
                <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-base-content">
                      Pricing & Billing Cycle
                    </h2>
                    <p className="text-xs text-base-content/60">
                      Set enrolment rate, currency, duration, and optional renewal terms.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <SimpleInput
                        label="Price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        required
                        {...register("price", {
                          required: "Price is required",
                          min: {
                            value: 0,
                            message: "Price cannot be negative",
                          },
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
                      <div className="sm:col-span-2 md:col-span-4 pt-1">
                        <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#E7E9EB] bg-base-200/30">
                          <div>
                            <p className="text-sm font-semibold text-base-content">
                              Recurring Auto-Renewal
                            </p>
                            <p className="text-xs text-base-content/60">
                              Enable automatic recurring billing for enrolled members when expired.
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
                        <div className="sm:col-span-2">
                          <SimpleInput
                            label="Renewal Price"
                            type="number"
                            step="0.01"
                            placeholder="Same as base price if empty"
                            {...register("renewalPrice", {
                              min: {
                                value: 0,
                                message: "Renewal price cannot be negative",
                              },
                            })}
                          />
                        </div>

                        <div className="sm:col-span-2">
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
                  </div>
                </div>

                {/* Media Card */}
                <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-base-content">
                      Media Banner
                    </h2>
                    <p className="text-xs text-base-content/60">
                      Upload banner or badge image for this membership tier to Cloudinary.
                    </p>
                  </div>
                  <ImageUpload
                    value={watchImage || null}
                    onChange={(url) =>
                      setValue("image", url, { shouldDirty: true })
                    }
                    folder="chlps_memberships"
                    helperText="Upload banner or icon image for this membership tier to Cloudinary."
                  />
                </div>
              </div>

              {/* TAB 2: Criteria & Benefits */}
              <div
                className={activeTab === "criteria" ? "space-y-6" : "hidden"}
              >
                {/* Eligibility Criteria */}
                <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <FieldLabel required>Eligibility Criteria</FieldLabel>
                      <p className="text-xs text-base-content/60">
                        Requirements applicants must meet to qualify for this tier.
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
                      leftIcon={<Plus size={14} />}
                    >
                      Add criterion
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {eligibilityFields.map((field, idx) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <div className="flex-1">
                          <SimpleInput
                            placeholder={`Criterion #${idx + 1} (e.g. Must hold a professional certificate)`}
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
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {errors.eligibilityCriteria && (
                    <FieldError>{errors.eligibilityCriteria.message}</FieldError>
                  )}
                </div>

                {/* Member Benefits */}
                <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={20} className="text-primary" />
                      <div>
                        <FieldLabel required>Benefits & Privileges</FieldLabel>
                        <p className="text-xs text-base-content/60">
                          What enrolled members receive (resources, discounts, community access).
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        appendBenefit({ value: "" });
                        clearErrors("benefits");
                      }}
                      leftIcon={<Plus size={14} />}
                    >
                      Add benefit
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {benefitFields.map((field, idx) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <div className="flex-1">
                          <SimpleInput
                            placeholder={`Benefit #${idx + 1} (e.g. Access to research archives)`}
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
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {errors.benefits && (
                    <FieldError>{errors.benefits.message}</FieldError>
                  )}
                </div>

                {/* Required Documents Checklist */}
                <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText size={20} className="text-primary" />
                    <div>
                      <FieldLabel>Required Documents for Applicants</FieldLabel>
                      <p className="text-xs text-base-content/60">
                        Select all verification files applicants must submit before approval.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {REQUIRED_DOCUMENTS_LIST.map((doc) => {
                      const checked = watchRequiredDocs.includes(doc);
                      return (
                        <div
                          key={doc}
                          className="p-3 rounded-lg border border-[#E7E9EB] bg-base-100"
                        >
                          <Checkbox
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
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* TAB 3: Career & Help */}
              <div className={activeTab === "career" ? "space-y-6" : "hidden"}>
                {/* Career Pathways */}
                <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Milestone size={20} className="text-primary" />
                      <div>
                        <h2 className="text-base font-bold text-base-content">
                          Career Pathways & Progression
                        </h2>
                        <p className="text-xs text-base-content/60">
                          Certificates, credentials, or advanced qualifications members can progress to.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => appendPathway({ value: "" })}
                      leftIcon={<Plus size={14} />}
                    >
                      Add Pathway
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {pathwayFields.map((field, idx) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <SimpleInput
                            placeholder={`e.g. Progression to Basic Professional Certificate in Loss Prevention`}
                            {...register(`careerPathways.${idx}.value`)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-error hover:bg-error/10"
                          onClick={() => removePathway(idx)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {pathwayFields.length === 0 && (
                    <p className="text-xs text-secondary italic py-3 text-center bg-base-200/20 rounded-lg">
                      No career pathways added. Click &quot;Add Pathway&quot; to outline professional advancement steps.
                    </p>
                  )}
                </div>
                {/* Job Opportunities */}
                <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase size={20} className="text-primary" />
                      <div>
                        <h2 className="text-base font-bold text-base-content">
                          Job & Career Opportunities
                        </h2>
                        <p className="text-xs text-base-content/60">
                          Specific job roles, placements, or industry titles accessible through this membership.
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
                      leftIcon={<Plus size={14} />}
                    >
                      Add Opportunity
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {jobFields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="p-4 rounded-xl border border-[#E7E9EB] bg-base-200/20 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-base-content/80 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            Opportunity #{idx + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            className="text-error hover:bg-error/10"
                            onClick={() => removeJob(idx)}
                          >
                            <Trash2 size={14} /> Remove
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
                              {...register(
                                `jobOpportunities.${idx}.description`,
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {jobFields.length === 0 && (
                      <p className="text-xs text-secondary italic py-3 text-center bg-base-200/20 rounded-lg">
                        No career opportunities added. Click &quot;Add Opportunity&quot; to include roles.
                      </p>
                    )}
                  </div>
                </div>

                {/* How Membership Helps */}
                <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={20} className="text-primary" />
                      <div>
                        <h2 className="text-base font-bold text-base-content">
                          How Membership Helps
                        </h2>
                        <p className="text-xs text-base-content/60">
                          Highlight tangible ways this tier accelerates career progression and knowledge.
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
                      leftIcon={<Plus size={14} />}
                    >
                      Add Help Item
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {howHelpsFields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="p-4 rounded-xl border border-[#E7E9EB] bg-base-200/20 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-base-content/80 flex items-center gap-1.5">
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
                            <Trash2 size={14} /> Remove
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <SimpleInput
                              label="Title"
                              placeholder="e.g. Legal Mentorship Network"
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
                      <p className="text-xs text-secondary italic py-3 text-center bg-base-200/20 rounded-lg">
                        No support items added. Click &quot;Add Help Item&quot; to showcase support highlights.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* TAB 4: Why Join & Questions */}
              <div
                className={activeTab === "why_join" ? "space-y-6" : "hidden"}
              >
                {/* Why Join Now Section */}
                <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-2">
                    <Info size={20} className="text-primary" />
                    <div>
                      <h2 className="text-base font-bold text-base-content">
                        &quot;Why Join Now?&quot; Call to Action
                      </h2>
                      <p className="text-xs text-base-content/60">
                        Compelling motivational copy, bullet points, and quick information cards.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <SimpleInput
                      label="Section Heading"
                      placeholder="e.g. Why should I join now?"
                      {...register("whyJoinNow.heading")}
                    />

                    <SimpleTextArea
                      label="Section Description"
                      placeholder="Starting early provides a strong foundation...\n\nIt also helps you understand..."
                      rows={3}
                      {...register("whyJoinNow.description")}
                    />
                  </div>

                  {/* Highlights */}
                  <div className="space-y-3 pt-3 border-t border-base-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-base-content">
                          Bullet Highlights
                        </p>
                        <p className="text-xs text-base-content/60">
                          Short bullet point statements displayed with checkmarks.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => appendHighlight({ value: "" })}
                        leftIcon={<Plus size={12} />}
                      >
                        Add highlight
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {highlightFields.map((field, idx) => (
                        <div key={field.id} className="flex items-center gap-2">
                          <div className="flex-1">
                            <SimpleInput
                              placeholder={`Highlight #${idx + 1} (e.g. Start early, Build knowledge)`}
                              {...register(
                                `whyJoinNow.highlights.${idx}.value`,
                              )}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            className="text-error hover:bg-error/10"
                            onClick={() => removeHighlight(idx)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {highlightFields.length === 0 && (
                      <p className="text-xs text-secondary italic">
                        No highlights added yet.
                      </p>
                    )}
                  </div>

                  {/* Info Cards */}
                  <div className="space-y-3 pt-3 border-t border-base-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-base-content">
                          Information Cards
                        </p>
                        <p className="text-xs text-base-content/60">
                          Important highlights like application fees, turnaround time, or entry periods.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() =>
                          appendInfoCard({ title: "", description: "" })
                        }
                        leftIcon={<Plus size={12} />}
                      >
                        Add Info Card
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {infoCardFields.map((field, idx) => (
                        <div
                          key={field.id}
                          className="p-3.5 rounded-xl border border-[#E7E9EB] bg-base-200/20 space-y-2"
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
                              <Trash2 size={14} /> Remove
                            </Button>
                          </div>
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
                      ))}
                    </div>

                    {infoCardFields.length === 0 && (
                      <p className="text-xs text-secondary italic">
                        No info cards added yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Application Questions Section */}
                <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HelpCircle size={20} className="text-primary" />
                      <div>
                        <h2 className="text-base font-bold text-base-content">
                          Application Questions
                        </h2>
                        <p className="text-xs text-base-content/60">
                          Screening questions applicants must answer during registration.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => appendQuestion({ question: "" })}
                      leftIcon={<Plus size={14} />}
                    >
                      Add Question
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {questionFields.map((field, idx) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <div className="flex-1">
                          <SimpleInput
                            placeholder={`Question #${idx + 1} (e.g. Do you hold a National ID?)`}
                            {...register(
                              `applicationQuestions.${idx}.question`,
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          className="text-error hover:bg-error/10"
                          onClick={() => removeQuestion(idx)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {questionFields.length === 0 && (
                    <p className="text-xs text-secondary italic py-2">
                      No custom questions added. Click &quot;Add Question&quot; to define screening prompts.
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Step Navigation Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E7E9EB]">
                <div>
                  {activeTab !== "general" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handlePrevTab}
                      leftIcon={<ChevronLeft size={16} />}
                    >
                      Previous Tab
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {activeTab !== "why_join" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleNextTab}
                      rightIcon={<ChevronRight size={16} />}
                    >
                      Next Tab
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      loading={isSaving}
                      onClick={handleSubmit(onFormSubmit)}
                    >
                      {isEdit ? "Save Changes" : "Create Membership Plan"}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </PageLoader>
    </DashboardLayout>
  );
}
