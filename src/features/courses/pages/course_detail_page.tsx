"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components";
import { Button, ConfirmModal, Modal, TextField, Select, useToast } from "@/components/ui";
import { RootState } from "@/lib/store/store";
import CoursesRepository from "../domain/repository/courses_repository";
import UploadRepository from "@/features/uploads/domain/repository/upload_repository";
import {
  Course,
  CourseContent,
  CourseReview,
  CourseSubContent,
} from "../domain/data/response/courses_response";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";
import { AddCircle, ArrowDown2 } from "iconsax-react";

export default function CourseDetailPage({ courseId }: { courseId: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const role = useSelector((s: RootState) => s.user.userRole);
  const isAdmin = role === "admin";
  const repo = new CoursesRepository();
  const uploads = new UploadRepository();

  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [reviews, setReviews] = useState<{ avg?: number; items: CourseReview[] }>({ items: [] });
  const [subs, setSubs] = useState<Record<string, CourseSubContent[]>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sectionTitle, setSectionTitle] = useState("");
  const [addSection, setAddSection] = useState(false);
  const [subForm, setSubForm] = useState<{ contentId: string } | null>(null);
  const [subTitle, setSubTitle] = useState("");
  const [mediaType, setMediaType] = useState("video");
  const [duration, setDuration] = useState("0");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [c, content, r] = await Promise.all([
      repo.getOne(courseId, isAdmin),
      repo.listContent(courseId),
      repo.getReviews(courseId),
    ]);
    if (c.success) setCourse(c.data);
    else toast(c.message, "danger");
    if (content.success && content.data) setContents(content.data.items);
    if (r.success && r.data) setReviews({ avg: r.data.avgRating, items: r.data.results ?? [] });
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [courseId]);

  const toggleSection = async (id: string) => {
    if (openId === id) {
      setOpenId(null);
      return;
    }
    setOpenId(id);
    if (!subs[id]) {
      const res = await repo.listSubContent(id);
      if (res.success && res.data) setSubs((s) => ({ ...s, [id]: res.data! }));
    }
  };

  return (
    <DashboardLayout title="Course Details">
      {loading || !course ? (
        <div className="h-48 rounded-xl skeleton" />
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E7E9EB] p-6">
            <p className="text-xs text-[#717171]">{formatDate(course.createdDate, "DD MMMM YYYY")}</p>
            <p className="text-sm text-[#717171]">{course.program?.title}</p>
            <h1 className="text-2xl font-bold mt-1">{course.title}</h1>
            <p className="text-sm text-[#717171] mt-2">{course.fullDesc}</p>
            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              <div>
                <p className="text-xs text-[#717171]">Instructor</p>
                <p className="font-medium">
                  {course.instructor ? `${course.instructor.firstName} ${course.instructor.lastName}` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#717171]">Price</p>
                <p className="font-medium">{formatCurrency(course.price ?? 0, { currency: "USD" })}</p>
              </div>
              <div>
                <p className="text-xs text-[#717171]">Reviews</p>
                <p className="font-medium">
                  {reviews.avg ?? 0} avg · {reviews.items.length} review(s)
                </p>
              </div>
            </div>
          </div>

          {reviews.items.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 space-y-3">
              <h3 className="font-semibold">Reviews</h3>
              {reviews.items.map((rev) => (
                <div key={rev.id} className="flex items-start justify-between gap-3 border-b border-[#F1F1F1] pb-3">
                  <div>
                    <p className="text-sm font-medium">
                      {rev.user?.firstName} {rev.user?.lastName} · {rev.rating}/5
                    </p>
                    <p className="text-sm text-[#717171]">{rev.comment}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await repo.muteReview(rev.id, !rev.muted);
                      load();
                    }}
                  >
                    {rev.muted ? "Unmute" : "Mute"}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white rounded-xl border border-[#E7E9EB] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Course Content</h3>
              <Button size="sm" leftIcon={<AddCircle size={14} color="currentColor" />} onClick={() => setAddSection(true)}>
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {contents.map((section) => (
                <div key={section.id} className="border border-[#E7E9EB] rounded-lg">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    onClick={() => toggleSection(section.id)}
                  >
                    <span className="font-medium">{section.title}</span>
                    <ArrowDown2 size={14} color="currentColor" />
                  </button>
                  {openId === section.id && (
                    <div className="px-4 pb-4 space-y-2">
                      {(subs[section.id] ?? []).map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between text-sm py-2 border-t border-[#F1F1F1]">
                          <div>
                            <p className="font-medium">{lesson.title}</p>
                            <p className="text-[#717171] capitalize">{lesson.mediaType}</p>
                          </div>
                          <div className="flex gap-2">
                            {lesson.mediaType === "assessment" && (
                              <Button size="sm" variant="outline" onClick={() => router.push(`/assessment/${lesson.id}?courseId=${courseId}&contentId=${section.id}`)}>
                                Questions
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => setDeleteId(lesson.id)}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => { setSubForm({ contentId: section.id }); setMediaType("video"); }}>
                          Add lesson
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            setBusy(true);
                            await repo.createSubContent({
                              title: "Assessment",
                              course: courseId,
                              courseContent: section.id,
                              duration: 0,
                              media: null,
                              previewUrl: null,
                              mediaType: "assessment",
                            });
                            const res = await repo.listSubContent(section.id);
                            if (res.success && res.data) setSubs((s) => ({ ...s, [section.id]: res.data! }));
                            setBusy(false);
                          }}
                        >
                          Add assessment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {contents.length === 0 && <p className="text-sm text-[#717171] py-8 text-center">No course content available</p>}
            </div>
          </div>
        </div>
      )}

      <Modal open={addSection} onClose={() => setAddSection(false)} title="Add Course Content" size="sm">
        <TextField label="Title" value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} />
        <Button
          className="mt-4"
          fullWidth
          loading={busy}
          onClick={async () => {
            setBusy(true);
            const res = await repo.createContent({ title: sectionTitle, course: courseId });
            setBusy(false);
            if (res.success) {
              toast(res.message, "success");
              setAddSection(false);
              setSectionTitle("");
              load();
            } else toast(res.message, "danger");
          }}
        >
          Submit
        </Button>
      </Modal>

      <Modal open={!!subForm} onClose={() => setSubForm(null)} title="Add Lesson" size="md">
        <div className="space-y-4">
          <TextField label="Title" value={subTitle} onChange={(e) => setSubTitle(e.target.value)} />
          <TextField label="Duration (mins)" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
          <Select
            label="Media type"
            value={mediaType}
            onChange={setMediaType}
            options={[
              { label: "Video", value: "video" },
              { label: "Image", value: "image" },
              { label: "Document", value: "document" },
              { label: "Audio", value: "audio" },
            ]}
          />
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <Button
            fullWidth
            loading={busy}
            onClick={async () => {
              if (!subForm || !file) return;
              setBusy(true);
              const kind = mediaType === "document" ? "document" : (mediaType as "video" | "image" | "audio");
              const up = await uploads.upload(kind, file);
              if (!up.success || !up.url) {
                toast(up.message, "danger");
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
                toast(res.message, "success");
                const list = await repo.listSubContent(subForm.contentId);
                if (list.success && list.data) setSubs((s) => ({ ...s, [subForm.contentId]: list.data! }));
                setSubForm(null);
                setSubTitle("");
                setFile(null);
              } else toast(res.message, "danger");
            }}
          >
            Submit
          </Button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete lesson"
        description="This lesson will be removed."
        variant="danger"
        onConfirm={async () => {
          if (!deleteId) return;
          await repo.deleteSubContent(deleteId);
          setDeleteId(null);
          if (openId) {
            const list = await repo.listSubContent(openId);
            if (list.success && list.data) setSubs((s) => ({ ...s, [openId]: list.data! }));
          }
        }}
      />
    </DashboardLayout>
  );
}
