"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  useForm,
  useFieldArray,
  FormProvider,
  Controller,
} from "react-hook-form";
import { DashboardLayout } from "@/components";
import { Button, Divider, Toggle, useToast } from "@/components/ui";
import { ImageUpload } from "@/components/ui/ImageUpload";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import LocalSelect from "@/components/inputs/LocalSelect";
import { RichTextField } from "@/components/ui/RichTextField";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  HelpCircle,
  ListOrdered,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { RootState } from "@/lib/store/store";
import CoursesRepository from "../domain/repository/courses_repository";
import ProgramsRepository from "@/features/programs/domain/repository/programs_repository";
import { Program } from "@/features/programs/domain/data/response/programs_response";
import {
  Course,
  CourseOutcome,
  CreateCoursePayload,
} from "../domain/data/response/courses_response";

interface CourseFormValues {
  title: string;
  shortDesc: string;
  fullDesc: string;
  price: string | number;
  discount: string | number;
  program: string;
  coverImage?: string | null;
  isPublished: boolean;

  outcomes: { description: string; order: number }[];
  certificationBenefits: { value: string }[];
  entryRequirements: { value: string }[];
  applicationQuestions: { question: string }[];
}

const TABS = [
  { key: "general", label: "General & Details" },
  { key: "outcomes", label: "Learning Outcomes" },
  { key: "certification", label: "Benefits & Requirements" },
  { key: "questions", label: "Application Questions" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function getCourseFormDefaults(c?: Course | null): CourseFormValues {
  return {
    title: c?.title ?? "",
    shortDesc: c?.shortDesc ?? "",
    fullDesc: c?.fullDesc ?? "",
    price: c?.price !== undefined ? String(c.price) : "",
    discount: c?.discount !== undefined ? String(c.discount) : "0",
    program: c?.program?.id ?? "",
    coverImage: c?.coverImage ?? null,
    isPublished: Boolean(c?.isPublished),

    outcomes: c?.courseOutcomes?.length
      ? c.courseOutcomes.map((o, idx) => ({
          description: o.description || "",
          order: o.order ?? idx + 1,
        }))
      : [{ description: "", order: 1 }],

    certificationBenefits: c?.certificationBenefits?.length
      ? c.certificationBenefits.map((b: unknown) => ({
          value: typeof b === "string" ? b : (b as { value?: string })?.value || "",
        }))
      : [{ value: "" }],

    entryRequirements: c?.entryRequirements?.length
      ? c.entryRequirements.map((r: unknown) => ({
          value: typeof r === "string" ? r : (r as { value?: string })?.value || "",
        }))
      : [{ value: "" }],

    applicationQuestions: c?.applicationQuestions?.length
      ? c.applicationQuestions.map((q: unknown) => ({
          question:
            typeof q === "string"
              ? q
              : (q as { question?: string })?.question || "",
        }))
      : [],
  };
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
      {children}
      {required && <span className="text-error ml-1">*</span>}
    </label>
  );
}

function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="text-xs text-error mt-1">{children}</p>;
}

export default function CourseEditorPage({
  courseId,
}: {
  courseId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const role = useSelector((s: RootState) => s.user.userRole);
  const isAdmin = role === "admin";

  const repo = useMemo(() => new CoursesRepository(), []);
  const programsRepo = useMemo(() => new ProgramsRepository(), []);

  const isEdit = Boolean(courseId);

  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [course, setCourse] = useState<Course | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const methods = useForm<CourseFormValues>({
    defaultValues: getCourseFormDefaults(null),
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

  const watchCoverImage = watch("coverImage");
  const watchIsPublished = watch("isPublished");

  // Field Arrays
  const {
    fields: outcomeFields,
    append: appendOutcome,
    remove: removeOutcome,
  } = useFieldArray({
    control,
    name: "outcomes",
  });

  const {
    fields: benefitFields,
    append: appendBenefit,
    remove: removeBenefit,
  } = useFieldArray({
    control,
    name: "certificationBenefits",
  });

  const {
    fields: requirementFields,
    append: appendRequirement,
    remove: removeRequirement,
  } = useFieldArray({
    control,
    name: "entryRequirements",
  });

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: "applicationQuestions",
  });

  // Load programs list
  useEffect(() => {
    programsRepo.list(isAdmin).then((res) => {
      if (res.success && res.data) {
        setPrograms(res.data);
      }
    });
  }, [isAdmin, programsRepo]);

  // Load course details in edit mode
  const loadCourse = useCallback(async () => {
    if (!courseId) return;
    setLoadingInitial(true);
    setIsError(false);
    setErrorMsg(null);
    try {
      const res = await repo.getOne(courseId, isAdmin);
      if (res.success && res.data) {
        setCourse(res.data);
        reset(getCourseFormDefaults(res.data));
      } else {
        setIsError(true);
        setErrorMsg(res.message || "Failed to load course details");
      }
    } catch (err: unknown) {
      setIsError(true);
      setErrorMsg(
        err instanceof Error ? err.message : "Error fetching course",
      );
    } finally {
      setLoadingInitial(false);
    }
  }, [courseId, isAdmin, repo, reset]);

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId, loadCourse]);

  const onFormSubmit = async (values: CourseFormValues) => {
    if (!values.title.trim()) {
      setActiveTab("general");
      setError("title", { message: "Course title is required" });
      return;
    }

    if (!values.program) {
      setActiveTab("general");
      setError("program", { message: "Please select an associated program" });
      return;
    }

    if (!values.coverImage) {
      setActiveTab("general");
      setError("coverImage", { message: "Cover image is required" });
      toast("Please upload a cover image for the course", "danger");
      return;
    }

    const priceNum = Number(values.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setActiveTab("general");
      setError("price", { message: "Valid price is required" });
      return;
    }

    const discountNum = Number(values.discount) || 0;

    const outcomes: CourseOutcome[] = (values.outcomes || [])
      .map((o, idx) => ({
        description: o.description.trim(),
        order: idx + 1,
      }))
      .filter((o) => o.description.length > 0);

    const certificationBenefits = (values.certificationBenefits || [])
      .map((b) => b.value.trim())
      .filter(Boolean);

    const entryRequirements = (values.entryRequirements || [])
      .map((r) => r.value.trim())
      .filter(Boolean);

    const applicationQuestions = (values.applicationQuestions || [])
      .map((q) => ({
        question: q.question.trim(),
      }))
      .filter((q) => q.question.length > 0);

    const payload: CreateCoursePayload = {
      title: values.title.trim(),
      shortDesc: values.shortDesc.trim(),
      fullDesc: values.fullDesc.trim(),
      price: priceNum,
      discount: discountNum,
      program: values.program,
      coverImage: values.coverImage,
      previewUrl: null,
      isPublished: values.isPublished,
      outcomes,
      certificationBenefits,
      entryRequirements,
      applicationQuestions,
    };

    setIsSaving(true);
    try {
      if (isEdit && courseId) {
        const res = await repo.update(courseId, payload, isAdmin);
        if (res.success) {
          toast("Course updated successfully", "success");
          router.push(`/courses/${courseId}`);
        } else {
          toast(res.message || "Failed to update course", "danger");
        }
      } else {
        const res = await repo.create(payload);
        if (res.success) {
          toast("Course created successfully", "success");
          router.push("/courses");
        } else {
          toast(res.message || "Failed to create course", "danger");
        }
      }
    } catch {
      toast("Failed to save course. Please try again.", "danger");
    } finally {
      setIsSaving(false);
    }
  };

  const currentTabIndex = TABS.findIndex((t) => t.key === activeTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === TABS.length - 1;

  if (loadingInitial) {
    return (
      <DashboardLayout title={isEdit ? "Edit Course" : "Create Course"}>
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-10 bg-base-200 rounded-lg animate-pulse w-1/3" />
          <div className="h-64 bg-base-200 rounded-xl animate-pulse" />
          <div className="h-96 bg-base-200 rounded-xl animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title="Error">
        <div className="max-w-xl mx-auto py-12 text-center space-y-4">
          <div className="p-4 rounded-xl bg-error/10 text-error border border-error/20 inline-block">
            {errorMsg || "Unable to load course"}
          </div>
          <div>
            <Button
              variant="outline"
              leftIcon={<ArrowLeft size={14} />}
              onClick={() => router.push("/courses")}
            >
              Back to Courses
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={isEdit ? "Edit Course" : "Create Course"}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 pb-20">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-[#E7E9EB] shadow-xs">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<ArrowLeft size={14} />}
                onClick={() =>
                  router.push(isEdit && courseId ? `/courses/${courseId}` : "/courses")
                }
              >
                Back
              </Button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-base-content leading-tight">
                  {isEdit
                    ? `Edit: ${course?.title || "Course"}`
                    : "Create New Course"}
                </h1>
                <p className="text-xs text-base-content/60">
                  {isEdit
                    ? "Update course curriculum, outcomes, pricing, and certification details."
                    : "Fill in the required information to publish a new course."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  router.push(isEdit && courseId ? `/courses/${courseId}` : "/courses")
                }
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                variant="primary"
                loading={isSaving}
                leftIcon={<Save size={14} />}
              >
                {isEdit ? "Save Changes" : "Create Course"}
              </Button>
            </div>
          </div>

          {/* Form Tabs Navigation */}
          <div className="flex border-b border-[#E7E9EB] bg-white rounded-xl px-2 pt-2 shadow-xs overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const hasTabError =
                (tab.key === "general" &&
                  (errors.title ||
                    errors.program ||
                    errors.price ||
                    errors.coverImage)) ||
                (tab.key === "outcomes" && errors.outcomes);

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-4 py-3 text-xs sm:text-sm font-semibold transition-colors shrink-0 flex items-center gap-2 ${
                    isActive
                      ? "text-primary border-b-2 border-primary"
                      : "text-base-content/60 hover:text-base-content"
                  }`}
                >
                  {tab.label}
                  {hasTabError && (
                    <span className="w-2 h-2 rounded-full bg-error" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Containers */}
          <div>
            {/* TAB 1: General & Details */}
            <div className={activeTab === "general" ? "space-y-6" : "hidden"}>
              <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-base-content flex items-center gap-2">
                    <BookOpen size={18} className="text-primary" />
                    Course Information
                  </h2>
                  <p className="text-xs text-base-content/60">
                    Basic identification, program category, and descriptions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <SimpleInput
                      label="Course Title"
                      placeholder="e.g. Introduction to Programming"
                      required
                      {...register("title", {
                        required: "Course title is required",
                        minLength: {
                          value: 3,
                          message: "Title must be at least 3 characters",
                        },
                      })}
                    />
                    {errors.title && (
                      <FieldError>{errors.title.message}</FieldError>
                    )}
                  </div>

                  <div>
                    <LocalSelect
                      label="Associated Program"
                      required
                      {...register("program", {
                        required: "Please select an associated program",
                      })}
                    >
                      <option value="">Select a program...</option>
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </LocalSelect>
                    {errors.program && (
                      <FieldError>{errors.program.message}</FieldError>
                    )}
                  </div>

                  <div>
                    <FieldLabel>Publication Status</FieldLabel>
                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E7E9EB] bg-base-200/20">
                      <span className="text-xs font-semibold text-base-content">
                        {watchIsPublished ? (
                          <span className="text-emerald-600 flex items-center gap-1.5">
                            <CheckCircle2 size={14} /> Published
                          </span>
                        ) : (
                          <span className="text-amber-600">Draft / Unpublished</span>
                        )}
                      </span>
                      <Toggle
                        checked={watchIsPublished}
                        onChange={(checked: boolean) =>
                          setValue("isPublished", checked, { shouldDirty: true })
                        }
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <SimpleTextArea
                      label="Short Description"
                      placeholder="Brief overview summarizing the course content..."
                      rows={2}
                      required
                      {...register("shortDesc", {
                        required: "Short description is required",
                      })}
                    />
                    {errors.shortDesc && (
                      <FieldError>{errors.shortDesc.message}</FieldError>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <FieldLabel required>Full Detailed Description</FieldLabel>
                    <Controller
                      name="fullDesc"
                      control={control}
                      rules={{ required: "Full description is required" }}
                      render={({ field }) => (
                        <RichTextField
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Comprehensive course overview covering modules, expectations, and goals..."
                        />
                      )}
                    />
                    {errors.fullDesc && (
                      <FieldError>{errors.fullDesc.message}</FieldError>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing Card */}
              <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-5">
                <div>
                  <h2 className="text-base font-bold text-base-content">
                    Pricing & Discounts
                  </h2>
                  <p className="text-xs text-base-content/60">
                    Set course enrolment fee and promotional discount.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <SimpleInput
                      label="Price (USD / Base)"
                      type="number"
                      step="0.01"
                      placeholder="5000"
                      required
                      {...register("price", {
                        required: "Price is required",
                        min: {
                          value: 0,
                          message: "Price cannot be negative",
                        },
                      })}
                    />
                    {errors.price && (
                      <FieldError>{errors.price.message}</FieldError>
                    )}
                  </div>

                  <div>
                    <SimpleInput
                      label="Discount Amount / Percentage"
                      type="number"
                      step="0.01"
                      placeholder="10"
                      {...register("discount", {
                        min: {
                          value: 0,
                          message: "Discount cannot be negative",
                        },
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Cover Image Upload Card */}
              <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
                <div>
                  <FieldLabel required>Cover Image</FieldLabel>
                  <p className="text-xs text-base-content/60">
                    Upload a high-resolution banner for this course.
                  </p>
                </div>

                <ImageUpload
                  value={watchCoverImage || null}
                  onChange={(url) =>
                    setValue("coverImage", url, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  folder="chlps_courses"
                  helperText="Recommended: 1200x630 or 16:9 ratio image. Max 5MB."
                />
                {errors.coverImage && (
                  <FieldError>{errors.coverImage.message}</FieldError>
                )}
              </div>
            </div>

            {/* TAB 2: Learning Outcomes */}
            <div className={activeTab === "outcomes" ? "space-y-6" : "hidden"}>
              <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListOrdered size={20} className="text-primary" />
                    <div>
                      <FieldLabel required>What You Will Learn / Course Outcomes</FieldLabel>
                      <p className="text-xs text-base-content/60">
                        Key competencies and practical skills students acquire from this course.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      appendOutcome({
                        description: "",
                        order: outcomeFields.length + 1,
                      })
                    }
                    leftIcon={<Plus size={14} />}
                  >
                    Add Outcome
                  </Button>
                </div>

                <div className="space-y-3">
                  {outcomeFields.map((field, idx) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <SimpleInput
                          placeholder={`Outcome #${idx + 1} (e.g. Build REST APIs with Node.js)`}
                          {...register(`outcomes.${idx}.description`, {
                            required:
                              idx === 0
                                ? "At least one learning outcome is required"
                                : false,
                          })}
                        />
                      </div>
                      {outcomeFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-error hover:bg-error/10"
                          onClick={() => removeOutcome(idx)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {errors.outcomes && (
                  <FieldError>{errors.outcomes.message}</FieldError>
                )}
              </div>
            </div>

            {/* TAB 3: Benefits & Requirements */}
            <div
              className={activeTab === "certification" ? "space-y-6" : "hidden"}
            >
              {/* Certification Benefits */}
              <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award size={20} className="text-primary" />
                    <div>
                      <h2 className="text-base font-bold text-base-content">
                        Certification Benefits
                      </h2>
                      <p className="text-xs text-base-content/60">
                        Credibility and career advantages gained upon earning this certificate.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => appendBenefit({ value: "" })}
                    leftIcon={<Plus size={14} />}
                  >
                    Add Benefit
                  </Button>
                </div>

                <div className="space-y-3">
                  {benefitFields.map((field, idx) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-600 text-xs flex items-center justify-center font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <SimpleInput
                          placeholder={`e.g. Establishes professional credibility in the loss prevention field`}
                          {...register(`certificationBenefits.${idx}.value`)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-error hover:bg-error/10"
                        onClick={() => removeBenefit(idx)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>

                {benefitFields.length === 0 && (
                  <p className="text-xs text-secondary italic py-3 text-center bg-base-200/20 rounded-lg">
                    No certification benefits added. Click &quot;Add Benefit&quot; to highlight career advantages.
                  </p>
                )}
              </div>

              {/* Entry Requirements */}
              <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={20} className="text-primary" />
                    <div>
                      <h2 className="text-base font-bold text-base-content">
                        Entry Requirements & Prerequisites
                      </h2>
                      <p className="text-xs text-base-content/60">
                        Academic background, experience, or prior credentials required to enrol.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => appendRequirement({ value: "" })}
                    leftIcon={<Plus size={14} />}
                  >
                    Add Requirement
                  </Button>
                </div>

                <div className="space-y-3">
                  {requirementFields.map((field, idx) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-600 text-xs flex items-center justify-center font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <SimpleInput
                          placeholder={`e.g. Minimum of a high school diploma or equivalent`}
                          {...register(`entryRequirements.${idx}.value`)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-error hover:bg-error/10"
                        onClick={() => removeRequirement(idx)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>

                {requirementFields.length === 0 && (
                  <p className="text-xs text-secondary italic py-3 text-center bg-base-200/20 rounded-lg">
                    No entry requirements specified. Click &quot;Add Requirement&quot; to outline criteria.
                  </p>
                )}
              </div>
            </div>

            {/* TAB 4: Application Questions */}
            <div className={activeTab === "questions" ? "space-y-6" : "hidden"}>
              <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle size={20} className="text-primary" />
                    <div>
                      <h2 className="text-base font-bold text-base-content">
                        Application & Screening Questions
                      </h2>
                      <p className="text-xs text-base-content/60">
                        Questions applicants must answer during course checkout or enrolment.
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

                <div className="space-y-3">
                  {questionFields.map((field, idx) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <SimpleInput
                          placeholder={`e.g. Do you have a valid security license?`}
                          {...register(`applicationQuestions.${idx}.question`)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-error hover:bg-error/10"
                        onClick={() => removeQuestion(idx)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>

                {questionFields.length === 0 && (
                  <p className="text-xs text-secondary italic py-3 text-center bg-base-200/20 rounded-lg">
                    No application questions configured. Click &quot;Add Question&quot; to collect applicant answers.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Step Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E7E9EB] bg-white p-4 rounded-xl shadow-xs">
            <div>
              {!isFirstTab && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const prevTab = TABS[currentTabIndex - 1];
                    if (prevTab) setActiveTab(prevTab.key);
                  }}
                >
                  Previous Tab
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isLastTab ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nextTab = TABS[currentTabIndex + 1];
                    if (nextTab) setActiveTab(nextTab.key);
                  }}
                >
                  Next Tab
                </Button>
              ) : null}

              <Button
                type="submit"
                size="sm"
                variant="primary"
                loading={isSaving}
                leftIcon={<Save size={14} />}
              >
                {isEdit ? "Save Changes" : "Create Course"}
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </DashboardLayout>
  );
}
