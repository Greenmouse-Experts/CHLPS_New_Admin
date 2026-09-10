"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components";
import {
  Button,
  ConfirmModal,
  Divider,
  Modal,
  Select,
  StatusBadge,
  Tabs,
  TextField,
  useToast,
} from "@/components/ui";
import PageLoader from "@/components/PageLoader";
import { RootState } from "@/lib/store/store";
import CoursesRepository from "../domain/repository/courses_repository";
import ProgramsRepository from "@/features/programs/domain/repository/programs_repository";
import { Program } from "@/features/programs/domain/data/response/programs_response";
import UploadRepository from "@/features/uploads/domain/repository/upload_repository";
import {
  Course,
  CourseContent,
  CourseReview,
  CourseSubContent,
  CreateCoursePayload,
} from "../domain/data/response/courses_response";
import {
  EditCourseModal,
  EditCourseModalHandle,
} from "../components/edit_course_modal";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";
import { getAvatarColor } from "@/utils/avatar.colors";
import {
  AddCircle,
  ArrowDown2,
  ArrowLeft2,
  Book1,
  Calendar,
  Call,
  DocumentText,
  Edit2,
  Eye,
  Global,
  LampCharge,
  MessageQuestion,
  NoteText,
  Sms,
  Star1,
  Teacher,
  TickCircle,
  Trash,
  VideoPlay,
  Wallet3,
} from "iconsax-react";

export default function CourseDetailPage({ courseId }: { courseId: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const role = useSelector((s: RootState) => s.user.userRole);
  const isAdmin = role === "admin";
  const repo = useMemo(() => new CoursesRepository(), []);
  const uploads = useMemo(() => new UploadRepository(), []);
  const programsRepo = useMemo(() => new ProgramsRepository(), []);
  const [programs, setPrograms] = useState<Program[]>([]);
  const editModalRef = useRef<EditCourseModalHandle>(null);

  useEffect(() => {
    programsRepo.list(isAdmin).then((res) => {
      if (res.success && res.data) setPrograms(res.data);
    });
  }, [isAdmin, programsRepo]);

  const handleUpdateCourse = async (
    id: string,
    payload: Partial<CreateCoursePayload>,
    file?: File | null,
  ) => {
    try {
      setActionBusy(true);
      let coverImage = payload.coverImage;
      if (file) {
        const up = await uploads.upload("image", file);
        if (!up.success || !up.url) {
          toast(up.message || "Failed to upload cover image", "danger");
          return false;
        }
        coverImage = up.url;
      }
      const res = await repo.update(
        id,
        {
          ...payload,
          ...(coverImage ? { coverImage } : {}),
        },
        isAdmin,
      );
      if (res.success) {
        toast(res.message || "Course updated successfully", "success");
        load();
        return true;
      }
      toast(res.message || "Failed to update course", "danger");
      return false;
    } finally {
      setActionBusy(false);
    }
  };

  const [activeTab, setActiveTab] = useState("overview");
  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [reviews, setReviews] = useState<{
    avg?: number;
    items: CourseReview[];
  }>({
    items: [],
  });
  const [subs, setSubs] = useState<Record<string, CourseSubContent[]>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // Actions & status toggling state
  const [actionBusy, setActionBusy] = useState(false);
  const [deleteCourseOpen, setDeleteCourseOpen] = useState(false);
  const [deleteContentId, setDeleteContentId] = useState<string | null>(null);
  const [deleteSubId, setDeleteSubId] = useState<string | null>(null);

  // Add module/section modal state
  const [addSection, setAddSection] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");

  // Add lesson/subContent modal state
  const [subForm, setSubForm] = useState<{ contentId: string } | null>(null);
  const [subTitle, setSubTitle] = useState("");
  const [mediaType, setMediaType] = useState("video");
  const [duration, setDuration] = useState("0");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setIsError(false);
    setError(null);
    try {
      const [c, contentRes, r] = await Promise.all([
        repo.getOne(courseId, isAdmin),
        repo.listContent(courseId),
        repo.getReviews(courseId),
      ]);

      if (c.success && c.data) {
        setCourse(c.data);
        // If contents come directly on the course payload or from content list
        if (contentRes.success && contentRes.data?.items?.length) {
          setContents(contentRes.data.items);
        } else if (c.data.contents?.length) {
          setContents(c.data.contents);
        } else {
          setContents([]);
        }
      } else {
        setIsError(true);
        setError(c.message || "Failed to load course details");
        toast(c.message || "Failed to load course details", "danger");
      }

      if (r.success && r.data) {
        setReviews({
          avg: r.data.avgRating,
          items: r.data.results ?? [],
        });
      }
    } catch (err) {
      setIsError(true);
      setError(err);
      toast("Failed to load course details", "danger");
    } finally {
      setLoading(false);
    }
  }, [courseId, isAdmin, repo, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSection = async (id: string) => {
    if (openId === id) {
      setOpenId(null);
      return;
    }
    setOpenId(id);
    if (!subs[id]) {
      const res = await repo.listSubContent(id);
      if (res.success && res.data) {
        setSubs((s) => ({ ...s, [id]: res.data! }));
      }
    }
  };

  const handleTogglePublish = async () => {
    if (!course) return;
    try {
      setActionBusy(true);
      const nextState = !course.isPublished;
      const res = await repo.update(
        course.id,
        { isPublished: nextState },
        isAdmin,
      );
      if (res.success) {
        toast(
          nextState ? "Course published successfully" : "Course unpublished",
          "success",
        );
        setCourse((prev) =>
          prev ? { ...prev, isPublished: nextState } : prev,
        );
      } else {
        toast(res.message || "Failed to update publish status", "danger");
      }
    } catch {
      toast("Failed to update publish status", "danger");
    } finally {
      setActionBusy(false);
    }
  };

  const handleToggleFeature = async () => {
    if (!course) return;
    try {
      setActionBusy(true);
      const nextFeatured = !course.featured;
      const res = await repo.feature(course.id, nextFeatured);
      if (res.success) {
        toast(
          nextFeatured ? "Course marked as featured" : "Course unfeatured",
          "success",
        );
        setCourse((prev) =>
          prev ? { ...prev, featured: nextFeatured } : prev,
        );
      } else {
        toast(res.message || "Failed to update feature status", "danger");
      }
    } catch {
      toast("Failed to update feature status", "danger");
    } finally {
      setActionBusy(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!course) return;
    try {
      setActionBusy(true);
      const res = await repo.remove(course.id);
      if (res.success) {
        toast("Course deleted successfully", "success");
        router.replace("/courses");
      } else {
        toast(res.message || "Failed to delete course", "danger");
      }
    } catch {
      toast("Failed to delete course", "danger");
    } finally {
      setActionBusy(false);
      setDeleteCourseOpen(false);
    }
  };

  const handleDeleteContent = async () => {
    if (!deleteContentId) return;
    try {
      setBusy(true);
      const res = await repo.deleteContent(deleteContentId);
      if (res.success) {
        toast("Module removed", "success");
        setContents((prev) =>
          prev.filter((item) => item.id !== deleteContentId),
        );
        if (openId === deleteContentId) setOpenId(null);
      } else {
        toast(res.message || "Failed to remove module", "danger");
      }
    } catch {
      toast("Failed to remove module", "danger");
    } finally {
      setBusy(false);
      setDeleteContentId(null);
    }
  };

  const instructorFullName = useMemo(() => {
    if (!course?.instructor) return "—";
    return (
      `${course.instructor.firstName ?? ""} ${course.instructor.lastName ?? ""}`.trim() ||
      "—"
    );
  }, [course?.instructor]);

  const instructorAvatarColor = useMemo(() => {
    return getAvatarColor(instructorFullName);
  }, [instructorFullName]);

  const effectivePrice = useMemo(() => {
    if (!course) return 0;
    const p = course.price ?? 0;
    const d = course.discount ?? 0;
    return Math.max(0, p - d);
  }, [course]);

  const outcomesSorted = useMemo(() => {
    if (!course?.courseOutcomes) return [];
    return [...course.courseOutcomes].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
  }, [course?.courseOutcomes]);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "curriculum", label: `Curriculum (${contents.length})` },
    { key: "reviews", label: `Reviews (${reviews.items.length})` },
  ];

  return (
    <DashboardLayout title="Course Details">
      <div className="space-y-6 pb-12">
        {/* Navigation & Header Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft2 size={16} />}
              onClick={() => router.push("/courses")}
            >
              Courses
            </Button>
            <div>
              <h1 className="text-xl font-bold text-base-content">
                {course?.title || "Course Details"}
              </h1>
              {course?.slug && (
                <p className="text-xs text-secondary font-mono">
                  slug: /{course.slug}
                </p>
              )}
            </div>
          </div>

          {course && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Edit2 size={14} color="currentColor" />}
                onClick={() => editModalRef.current?.open(course)}
              >
                Edit Course
              </Button>
              <Button
                size="sm"
                variant={course.isPublished ? "outline" : "primary"}
                loading={actionBusy}
                onClick={handleTogglePublish}
              >
                {course.isPublished ? "Unpublish Course" : "Publish Course"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                loading={actionBusy}
                leftIcon={
                  <Star1
                    size={14}
                    variant={course.featured ? "Bold" : "Linear"}
                  />
                }
                onClick={handleToggleFeature}
              >
                {course.featured ? "Unfeature" : "Feature"}
              </Button>
              <Button
                size="sm"
                variant="danger"
                leftIcon={<Trash size={14} />}
                onClick={() => setDeleteCourseOpen(true)}
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        <PageLoader
          query={{
            data: course,
            isLoading: loading,
            isError,
            error,
            refetch: load,
          }}
        >
          {course && (
            <div className="space-y-6">
              {/* Hero Banner Card */}
              <div className="bg-white rounded-2xl border border-base-300 overflow-hidden shadow-xs">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* Cover Image */}
                  <div className="lg:col-span-4 relative bg-base-200 min-h-[220px] max-h-[320px] overflow-hidden border-b lg:border-b-0 lg:border-r border-base-300">
                    {course.coverImage ? (
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center text-secondary">
                        <Book1 size={48} className="opacity-40 mb-2" />
                        <span className="text-xs font-medium">
                          No cover image provided
                        </span>
                      </div>
                    )}

                    {/* Overlay Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <StatusBadge
                        status={course.isPublished ? "published" : "draft"}
                      />
                      {course.featured && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-xs">
                          <Star1 size={12} variant="Bold" />
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Course Highlights & Metadata */}
                  <div className="lg:col-span-8 p-6 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 px-2.5 py-1 rounded-md">
                          {course.program?.title || "Standalone Course"}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-secondary">
                          <Calendar size={14} />
                          <span>
                            Created{" "}
                            {formatDate(course.createdDate, "DD MMMM YYYY")}
                          </span>
                        </div>
                      </div>

                      <h2 className="text-2xl font-bold text-base-content leading-tight">
                        {course.title}
                      </h2>

                      {course.shortDesc && (
                        <div className="p-3 bg-base-200/50 rounded-xl border border-base-300/60 text-sm text-base-content/80 font-medium">
                          {course.shortDesc}
                        </div>
                      )}
                    </div>

                    {/* Quick Stats Banner */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-4 border-t border-base-200">
                      <div>
                        <p className="text-xs text-secondary font-medium">
                          Standard Price
                        </p>
                        <p className="text-lg font-bold text-base-content mt-0.5">
                          {formatCurrency(course.price ?? 0, {
                            currency: "CAD",
                          })}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-secondary font-medium">
                          Discount
                        </p>
                        <p className="text-lg font-bold text-emerald-600 mt-0.5">
                          {course.discount && course.discount > 0
                            ? `-${formatCurrency(course.discount, { currency: "CAD" })}`
                            : "None"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-secondary font-medium">
                          Effective Price
                        </p>
                        <p className="text-lg font-bold text-primary mt-0.5">
                          {formatCurrency(effectivePrice, { currency: "CAD" })}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-secondary font-medium">
                          Reviews & Rating
                        </p>
                        <p className="text-lg font-bold text-base-content mt-0.5 flex items-center gap-1">
                          <Star1
                            size={16}
                            variant="Bold"
                            className="text-amber-500"
                          />
                          <span>
                            {reviews.avg
                              ? Number(reviews.avg).toFixed(1)
                              : "0.0"}
                          </span>
                          <span className="text-xs font-normal text-secondary">
                            ({reviews.items.length})
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <Tabs
                tabs={tabs}
                activeKey={activeTab}
                onChange={setActiveTab}
                variant="line"
              />

              {/* Tab 1: Overview */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Descriptions & Learning Outcomes */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* Full Description */}
                    <div className="bg-white rounded-2xl border border-base-300 p-6 shadow-xs space-y-3">
                      <div className="flex items-center gap-2">
                        <NoteText size={18} className="text-primary" />
                        <h3 className="text-base font-bold text-base-content">
                          Course Description
                        </h3>
                      </div>
                      <Divider />
                      <div className="text-sm text-base-content leading-relaxed whitespace-pre-line">
                        {course.fullDesc ||
                          "No detailed description available."}
                      </div>
                    </div>

                    {/* Course Outcomes */}
                    <div className="bg-white rounded-2xl border border-base-300 p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <LampCharge size={18} className="text-amber-500" />
                          <h3 className="text-base font-bold text-base-content">
                            What You Will Learn / Course Outcomes
                          </h3>
                        </div>
                        <span className="text-xs bg-base-200 text-secondary px-2.5 py-0.5 rounded-full font-semibold">
                          {outcomesSorted.length} outcome(s)
                        </span>
                      </div>
                      <Divider />

                      {outcomesSorted.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                          {outcomesSorted.map((item, idx) => (
                            <div
                              key={item.id || idx}
                              className="flex items-start gap-3.5 p-3.5 rounded-xl border border-base-200 hover:border-primary/40 bg-base-100 transition-colors"
                            >
                              <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                <TickCircle size={16} variant="Bold" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-secondary uppercase">
                                    Outcome #{item.order ?? idx + 1}
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-base-content mt-0.5">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-secondary text-sm">
                          No learning outcomes recorded for this course yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Instructor Profile & Additional Info */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* Instructor Profile Card */}
                    <div className="bg-white rounded-2xl border border-base-300 p-6 shadow-xs space-y-4">
                      <div className="flex items-center gap-2">
                        <Teacher size={18} className="text-primary" />
                        <h3 className="text-base font-bold text-base-content">
                          Instructor Profile
                        </h3>
                      </div>
                      <Divider />

                      {course.instructor ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3.5">
                            {course.instructor.picture ? (
                              <img
                                src={course.instructor.picture}
                                alt={instructorFullName}
                                className="w-14 h-14 rounded-full object-cover border-2 border-base-300 shrink-0"
                              />
                            ) : (
                              <div
                                className="w-14 h-14 rounded-full flex items-center justify-center text-base font-bold shrink-0 shadow-xs"
                                style={{
                                  backgroundColor: instructorAvatarColor.bg,
                                  color: instructorAvatarColor.text,
                                }}
                              >
                                {instructorFullName[0]?.toUpperCase() ?? "I"}
                              </div>
                            )}
                            <div className="overflow-hidden">
                              <h4 className="font-bold text-base text-base-content truncate">
                                {instructorFullName}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-medium text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">
                                  {course.instructor.role || "Instructor"}
                                </span>
                                {course.instructor.isActive !== undefined && (
                                  <StatusBadge
                                    status={
                                      course.instructor.isActive
                                        ? "active"
                                        : "inactive"
                                    }
                                    size="xs"
                                  />
                                )}
                              </div>
                            </div>
                          </div>

                          {course.instructor.bio && (
                            <p className="text-xs text-secondary leading-relaxed bg-base-200/50 p-3 rounded-lg">
                              {course.instructor.bio}
                            </p>
                          )}

                          <div className="space-y-2.5 pt-2 border-t border-base-200 text-xs">
                            {course.instructor.email && (
                              <div className="flex items-center gap-2 text-base-content">
                                <Sms
                                  size={15}
                                  className="text-secondary shrink-0"
                                />
                                <span className="truncate">
                                  {course.instructor.email}
                                </span>
                              </div>
                            )}
                            {course.instructor.phone && (
                              <div className="flex items-center gap-2 text-base-content">
                                <Call
                                  size={15}
                                  className="text-secondary shrink-0"
                                />
                                <span>{course.instructor.phone}</span>
                              </div>
                            )}
                            {course.instructor.address && (
                              <div className="flex items-center gap-2 text-base-content">
                                <Global
                                  size={15}
                                  className="text-secondary shrink-0"
                                />
                                <span className="truncate">
                                  {course.instructor.address}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Social links */}
                          {(course.instructor.linkedinUrl ||
                            course.instructor.twitterUrl ||
                            course.instructor.facebookUrl) && (
                            <div className="flex items-center gap-2 pt-2">
                              {course.instructor.linkedinUrl && (
                                <a
                                  href={course.instructor.linkedinUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-primary hover:underline"
                                >
                                  LinkedIn
                                </a>
                              )}
                              {course.instructor.twitterUrl && (
                                <a
                                  href={course.instructor.twitterUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-primary hover:underline"
                                >
                                  Twitter
                                </a>
                              )}
                              {course.instructor.facebookUrl && (
                                <a
                                  href={course.instructor.facebookUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-primary hover:underline"
                                >
                                  Facebook
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-secondary text-sm">
                          No instructor assigned to this course.
                        </div>
                      )}
                    </div>

                    {/* Course System Attributes */}
                    <div className="bg-white rounded-2xl border border-base-300 p-6 shadow-xs space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-secondary">
                        Course Information
                      </h4>
                      <div className="space-y-2.5 text-xs text-base-content">
                        <div className="flex justify-between py-1 border-b border-base-200">
                          <span className="text-secondary">Course ID</span>
                          <span className="font-mono text-2xs truncate max-w-[160px]">
                            {course.id}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-base-200">
                          <span className="text-secondary">Program</span>
                          <span className="font-medium">
                            {course.program?.title || "None"}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-base-200">
                          <span className="text-secondary">Total Modules</span>
                          <span className="font-medium">{contents.length}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-secondary">Last Updated</span>
                          <span>
                            {course.updatedDate
                              ? formatDate(course.updatedDate, "DD MMM YYYY")
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Curriculum & Content */}
              {activeTab === "curriculum" && (
                <div className="bg-white rounded-2xl border border-base-300 p-6 shadow-xs space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-base-content">
                        Course Curriculum & Modules
                      </h3>
                      <p className="text-xs text-secondary mt-0.5">
                        Manage course sections, video lessons, documents, and
                        assessments.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      leftIcon={<AddCircle size={15} color="currentColor" />}
                      onClick={() => {
                        setSectionTitle("");
                        setAddSection(true);
                      }}
                    >
                      Add Module
                    </Button>
                  </div>
                  <Divider />

                  <div className="space-y-3">
                    {contents.map((section, idx) => {
                      const sectionSubs = subs[section.id] ?? [];
                      const isExpanded = openId === section.id;
                      return (
                        <div
                          key={section.id}
                          className="border border-base-300 rounded-xl overflow-hidden transition-all bg-base-100"
                        >
                          <div className="w-full flex items-center justify-between px-5 py-3.5 bg-base-200/40 hover:bg-base-200/70 transition-colors">
                            <button
                              type="button"
                              className="flex items-center gap-3 flex-1 text-left"
                              onClick={() => toggleSection(section.id)}
                            >
                              <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <div>
                                <span className="font-semibold text-sm text-base-content">
                                  {section.title}
                                </span>
                                <span className="text-xs text-secondary ml-2">
                                  ({sectionSubs.length} item
                                  {sectionSubs.length !== 1 ? "s" : ""})
                                </span>
                              </div>
                            </button>

                            <div className="flex items-center gap-2">
                              <Button
                                size="xs"
                                variant="ghost"
                                className="text-error hover:bg-error/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteContentId(section.id);
                                }}
                              >
                                <Trash size={14} />
                              </Button>
                              <button
                                type="button"
                                className="p-1 text-secondary"
                                onClick={() => toggleSection(section.id)}
                              >
                                <ArrowDown2
                                  size={16}
                                  className={`transition-transform duration-200 ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-4 bg-white border-t border-base-200 space-y-3">
                              {sectionSubs.length > 0 ? (
                                <div className="divide-y divide-base-200">
                                  {sectionSubs.map((lesson) => (
                                    <div
                                      key={lesson.id}
                                      className="flex items-center justify-between py-2.5 px-2 hover:bg-base-100 rounded-lg transition-colors"
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-base-200 text-secondary flex items-center justify-center shrink-0">
                                          {lesson.mediaType === "video" && (
                                            <VideoPlay size={16} />
                                          )}
                                          {lesson.mediaType === "document" && (
                                            <DocumentText size={16} />
                                          )}
                                          {lesson.mediaType ===
                                            "assessment" && (
                                            <MessageQuestion size={16} />
                                          )}
                                          {lesson.mediaType !== "video" &&
                                            lesson.mediaType !== "document" &&
                                            lesson.mediaType !==
                                              "assessment" && (
                                              <NoteText size={16} />
                                            )}
                                        </div>
                                        <div className="truncate">
                                          <p className="font-medium text-sm text-base-content truncate">
                                            {lesson.title}
                                          </p>
                                          <div className="flex items-center gap-2 text-xs text-secondary mt-0.5">
                                            <span className="capitalize font-medium">
                                              {lesson.mediaType}
                                            </span>
                                            {lesson.duration ? (
                                              <span>
                                                • {lesson.duration} min(s)
                                              </span>
                                            ) : null}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0 ml-3">
                                        {lesson.mediaType === "assessment" && (
                                          <Button
                                            size="xs"
                                            variant="outline"
                                            onClick={() =>
                                              router.push(
                                                `/assessment/${lesson.id}?courseId=${courseId}&contentId=${section.id}`,
                                              )
                                            }
                                          >
                                            Manage Questions
                                          </Button>
                                        )}
                                        {lesson.media && (
                                          <Button
                                            size="xs"
                                            variant="ghost"
                                            leftIcon={<Eye size={13} />}
                                            onClick={() =>
                                              window.open(
                                                lesson.media,
                                                "_blank",
                                              )
                                            }
                                          >
                                            Preview
                                          </Button>
                                        )}
                                        <Button
                                          size="xs"
                                          variant="ghost"
                                          className="text-error hover:bg-error/10"
                                          onClick={() =>
                                            setDeleteSubId(lesson.id)
                                          }
                                        >
                                          <Trash size={14} />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-secondary text-center py-4">
                                  No lessons added to this module yet.
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-base-200">
                                <Button
                                  size="xs"
                                  variant="outline"
                                  leftIcon={<AddCircle size={14} />}
                                  onClick={() => {
                                    setSubForm({ contentId: section.id });
                                    setMediaType("video");
                                    setSubTitle("");
                                    setDuration("0");
                                    setFile(null);
                                  }}
                                >
                                  Add Lesson
                                </Button>
                                <Button
                                  size="xs"
                                  variant="outline"
                                  loading={busy}
                                  leftIcon={<MessageQuestion size={14} />}
                                  onClick={async () => {
                                    setBusy(true);
                                    const res = await repo.createSubContent({
                                      title: "Assessment",
                                      course: courseId,
                                      courseContent: section.id,
                                      duration: 0,
                                      media: null,
                                      previewUrl: null,
                                      mediaType: "assessment",
                                    });
                                    if (res.success) {
                                      toast("Assessment created", "success");
                                      const updatedList =
                                        await repo.listSubContent(section.id);
                                      if (
                                        updatedList.success &&
                                        updatedList.data
                                      ) {
                                        setSubs((s) => ({
                                          ...s,
                                          [section.id]: updatedList.data!,
                                        }));
                                      }
                                    } else {
                                      toast(
                                        res.message ||
                                          "Failed to add assessment",
                                        "danger",
                                      );
                                    }
                                    setBusy(false);
                                  }}
                                >
                                  Add Assessment
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {contents.length === 0 && (
                      <div className="text-center py-12 text-secondary space-y-3">
                        <Book1 size={36} className="mx-auto opacity-40" />
                        <p className="text-sm font-medium">
                          No course modules created yet.
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAddSection(true)}
                        >
                          Create First Module
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Reviews */}
              {activeTab === "reviews" && (
                <div className="bg-white rounded-2xl border border-base-300 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-base-content">
                        Student Reviews
                      </h3>
                      <p className="text-xs text-secondary mt-0.5">
                        Average rating:{" "}
                        {reviews.avg ? Number(reviews.avg).toFixed(1) : "0.0"} /
                        5.0 across {reviews.items.length} reviews.
                      </p>
                    </div>
                  </div>
                  <Divider />

                  {reviews.items.length > 0 ? (
                    <div className="space-y-3 divide-y divide-base-200">
                      {reviews.items.map((rev) => (
                        <div
                          key={rev.id}
                          className="pt-3 first:pt-0 flex items-start justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-base-content">
                                {rev.user?.firstName ?? "Anonymous"}{" "}
                                {rev.user?.lastName ?? ""}
                              </span>
                              <div className="flex items-center text-amber-500 gap-0.5 text-xs font-semibold">
                                <Star1 size={13} variant="Bold" />
                                <span>{rev.rating}/5</span>
                              </div>
                              {rev.muted && (
                                <span className="text-2xs bg-base-200 text-secondary px-2 py-0.5 rounded font-medium">
                                  Muted
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-secondary leading-relaxed">
                              {rev.comment}
                            </p>
                          </div>

                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={async () => {
                              const res = await repo.muteReview(
                                rev.id,
                                !rev.muted,
                              );
                              if (res.success) {
                                toast(
                                  rev.muted ? "Review unmuted" : "Review muted",
                                  "success",
                                );
                                load();
                              } else {
                                toast(
                                  res.message || "Failed to update review",
                                  "danger",
                                );
                              }
                            }}
                          >
                            {rev.muted ? "Unmute" : "Mute"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-secondary text-sm">
                      No reviews submitted for this course yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </PageLoader>
      </div>

      {/* Add Module Modal */}
      <Modal
        open={addSection}
        onClose={() => setAddSection(false)}
        title="Add Course Module"
        size="sm"
      >
        <div className="space-y-4">
          <TextField
            label="Module Title"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            placeholder="e.g. Introduction & Environment Setup"
          />
          <Button
            fullWidth
            loading={busy}
            onClick={async () => {
              if (!sectionTitle.trim()) {
                toast("Please enter a module title", "warning");
                return;
              }
              setBusy(true);
              const res = await repo.createContent({
                title: sectionTitle,
                course: courseId,
              });
              setBusy(false);
              if (res.success) {
                toast("Module added successfully", "success");
                setAddSection(false);
                setSectionTitle("");
                load();
              } else {
                toast(res.message, "danger");
              }
            }}
          >
            Create Module
          </Button>
        </div>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal
        open={!!subForm}
        onClose={() => setSubForm(null)}
        title="Add Lesson"
        size="md"
      >
        <div className="space-y-4">
          <TextField
            label="Lesson Title"
            value={subTitle}
            onChange={(e) => setSubTitle(e.target.value)}
            placeholder="e.g. Setting up Cypress and WebDriver"
          />
          <TextField
            label="Estimated Duration (minutes)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          <Select
            label="Media Type"
            value={mediaType}
            onChange={setMediaType}
            options={[
              { label: "Video", value: "video" },
              { label: "Document", value: "document" },
              { label: "Image", value: "image" },
              { label: "Audio", value: "audio" },
            ]}
          />
          <div>
            <label className="block text-xs font-semibold text-base-content mb-1.5">
              Upload Lesson Media
            </label>
            <input
              type="file"
              className="text-sm text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <Button
            fullWidth
            loading={busy}
            onClick={async () => {
              if (!subForm || !file) {
                toast("Please select a file to upload", "warning");
                return;
              }
              if (!subTitle.trim()) {
                toast("Please provide a lesson title", "warning");
                return;
              }
              setBusy(true);
              const kind =
                mediaType === "document"
                  ? "document"
                  : (mediaType as "video" | "image" | "audio");
              const up = await uploads.upload(kind, file);
              if (!up.success || !up.url) {
                toast(up.message || "Failed to upload file", "danger");
                setBusy(false);
                return;
              }
              const res = await repo.createSubContent({
                title: subTitle,
                course: courseId,
                courseContent: subForm.contentId,
                duration: Number(duration) || 0,
                media: up.url,
                previewUrl: null,
                mediaType,
              });
              setBusy(false);
              if (res.success) {
                toast(res.message || "Lesson added", "success");
                const list = await repo.listSubContent(subForm.contentId);
                if (list.success && list.data) {
                  setSubs((s) => ({ ...s, [subForm.contentId]: list.data! }));
                }
                setSubForm(null);
                setSubTitle("");
                setFile(null);
              } else {
                toast(res.message, "danger");
              }
            }}
          >
            Upload and Save Lesson
          </Button>
        </div>
      </Modal>

      {/* Delete Course Confirm Modal */}
      <ConfirmModal
        open={deleteCourseOpen}
        onClose={() => setDeleteCourseOpen(false)}
        title="Delete Course"
        description="Are you sure you want to permanently delete this course? This action cannot be undone."
        variant="danger"
        onConfirm={handleDeleteCourse}
      />

      {/* Delete Module Confirm Modal */}
      <ConfirmModal
        open={!!deleteContentId}
        onClose={() => setDeleteContentId(null)}
        title="Delete Module"
        description="Are you sure you want to delete this module? All associated lessons will be removed."
        variant="danger"
        onConfirm={handleDeleteContent}
      />

      {/* Delete Lesson Confirm Modal */}
      <ConfirmModal
        open={!!deleteSubId}
        onClose={() => setDeleteSubId(null)}
        title="Delete Lesson"
        description="Are you sure you want to delete this lesson? This action cannot be undone."
        variant="danger"
        onConfirm={async () => {
          if (!deleteSubId) return;
          await repo.deleteSubContent(deleteSubId);
          setDeleteSubId(null);
          if (openId) {
            const list = await repo.listSubContent(openId);
            if (list.success && list.data) {
              setSubs((s) => ({ ...s, [openId]: list.data! }));
            }
          }
        }}
      />

      <EditCourseModal
        ref={editModalRef}
        programs={programs}
        isSubmitting={actionBusy}
        course={course}
        onSubmit={handleUpdateCourse}
      />
    </DashboardLayout>
  );
}
