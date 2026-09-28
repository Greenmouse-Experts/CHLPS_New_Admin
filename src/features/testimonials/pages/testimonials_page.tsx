"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  MessageSquare,
  Plus,
  Search,
  Star,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  CheckCircle2,
  Clock,
  Edit3,
  Quote,
  User,
  Filter,
} from "lucide-react";
import { DashboardLayout } from "@/components";
import {
  Button,
  ConfirmModal,
  FieldLabel,
  Modal,
  StatusBadge,
  useToast,
} from "@/components/ui";
import { ImageUpload } from "@/components/ui/ImageUpload";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import { RootState } from "@/lib/store/store";
import { cn } from "@/lib/tokens";
import TestimonialsRepository from "../domain/repository/testimonials_repository";
import {
  Testimonial,
  TestimonialPayload,
} from "../domain/data/response/testimonials_response";

export default function TestimonialsPage() {
  const { toast } = useToast();
  const role = useSelector((s: RootState) => s.user.userRole);
  const isAdmin = role === "admin";
  const repo = useMemo(() => new TestimonialsRepository(), []);

  // State
  const [items, setItems] = useState<Testimonial[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");

  // Dialogs
  const [confirm, setConfirm] = useState<{
    id: string;
    type: "publish" | "unpublish" | "delete";
    title?: string;
  } | null>(null);
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<TestimonialPayload>({
    testimony: "",
    rating: 5,
    displayName: "",
    photoUrl: "",
    jobTitle: "",
    organization: "",
    location: "",
    isPublished: true,
  });

  const load = async (p = 1) => {
    setLoading(true);
    const filterParam =
      statusFilter === "all" ? undefined : statusFilter === "published";
    const res = await repo.list(isAdmin, p, 30, filterParam);

    if (res.success && res.data) {
      setItems(res.data.items || []);
      setTotalCount(res.data.count || 0);
      setPage(p);
    } else {
      toast(res.message || "Failed to load testimonials", "danger");
    }
    setLoading(false);
  };

  useEffect(() => {
    load(1);
  }, [isAdmin, statusFilter]);

  // Client-side search filtering
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) => {
      const name =
        item.displayName ||
        `${item.user?.firstName ?? ""} ${item.user?.lastName ?? ""}`.trim();
      const org = item.organization || "";
      const job = item.jobTitle || "";
      const testimony = item.testimony || "";
      const loc = item.location || "";
      return (
        name.toLowerCase().includes(q) ||
        org.toLowerCase().includes(q) ||
        job.toLowerCase().includes(q) ||
        testimony.toLowerCase().includes(q) ||
        loc.toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  // Metrics
  const stats = useMemo(() => {
    const total = totalCount || items.length;
    const published = items.filter((i) => i.isPublished).length;
    const draft = items.filter((i) => !i.isPublished).length;
    return { total, published, draft };
  }, [items, totalCount]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      testimony: "",
      rating: 5,
      displayName: "",
      photoUrl: "",
      jobTitle: "",
      organization: "",
      location: "",
      isPublished: true,
    });
    setEditorModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: Testimonial) => {
    setEditingItem(item);
    const resolvedName =
      item.displayName ||
      `${item.user?.firstName ?? ""} ${item.user?.lastName ?? ""}`.trim();
    const resolvedPhoto = item.photoUrl || item.user?.picture || "";

    setFormData({
      testimony: item.testimony || "",
      rating: item.rating ?? 5,
      displayName: resolvedName,
      photoUrl: resolvedPhoto,
      jobTitle: item.jobTitle || "",
      organization: item.organization || "",
      location: item.location || "",
      isPublished: item.isPublished ?? true,
    });
    setEditorModalOpen(true);
  };

  // Submit Create or Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.testimony.trim()) {
      toast("Testimony content is required", "warning");
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        const res = await repo.update(editingItem.id, formData);
        if (res.success) {
          toast(res.message || "Testimonial updated successfully", "success");
          setEditorModalOpen(false);
          load(page);
        } else {
          toast(res.message, "danger");
        }
      } else {
        const res = await repo.create(formData);
        if (res.success) {
          toast(res.message || "Testimonial created successfully", "success");
          setEditorModalOpen(false);
          load(1);
        } else {
          toast(res.message, "danger");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Actions Handler
  const handleConfirmAction = async () => {
    if (!confirm) return;
    try {
      if (confirm.type === "delete") {
        const res = await repo.remove(confirm.id);
        if (res.success) {
          toast(res.message || "Testimonial removed", "success");
          load(page);
        } else {
          toast(res.message, "danger");
        }
      } else {
        const isPublish = confirm.type === "publish";
        const res = await repo.setPublished(confirm.id, isPublish);
        if (res.success) {
          toast(
            res.message || (isPublish ? "Published" : "Retracted"),
            "success",
          );
          load(page);
        } else {
          toast(res.message, "danger");
        }
      }
    } finally {
      setConfirm(null);
    }
  };

  return (
    <DashboardLayout title="Member Testimonials">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl border border-[#E7E9EB] p-6 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
                <Quote size={22} />
              </span>
              <h1 className="text-xl font-bold text-base-content tracking-tight">
                Testimonials Management
              </h1>
            </div>
            <p className="text-xs text-base-content/60 max-w-2xl leading-relaxed">
              Curate and publish member reviews and success stories for the
              public website. Showcase student achievements and organizational
              endorsements.
            </p>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleOpenCreate} className="btn btn-primary">
                <Plus size={16} /> Add Testimonial
              </button>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#E7E9EB] p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs text-base-content/60 font-medium">
                Total Testimonials
              </p>
              <h3 className="text-2xl font-bold text-base-content mt-0.5">
                {stats.total}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-semibold">
              <MessageSquare size={18} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E7E9EB] p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs text-base-content/60 font-medium">
                Published Live
              </p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-0.5">
                {stats.published}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold">
              <CheckCircle2 size={18} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E7E9EB] p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs text-base-content/60 font-medium">
                Draft / Unpublished
              </p>
              <h3 className="text-2xl font-bold text-amber-600 mt-0.5">
                {stats.draft}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-semibold">
              <Clock size={18} />
            </div>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="bg-white rounded-xl border border-[#E7E9EB] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="flex items-center gap-2 border border-[#E7E9EB] rounded-lg px-3 h-10 bg-white w-full md:w-80 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all">
            <Search size={16} className="text-base-content/40 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              placeholder="Search by author, company, quote..."
              className="flex-1 text-xs outline-none bg-transparent placeholder-base-content/40 text-base-content"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs text-base-content/50 flex items-center gap-1 mr-1">
              <Filter size={13} /> Filter:
            </span>
            {(["all", "published", "draft"] as const).map((filterKey) => (
              <button
                key={filterKey}
                type="button"
                onClick={() => setStatusFilter(filterKey)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition",
                  statusFilter === filterKey
                    ? "bg-brand-primary text-white shadow-xs"
                    : "bg-base-200/50 text-base-content/70 hover:bg-base-200",
                )}
              >
                {filterKey}
              </button>
            ))}
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {loading && (
            <>
              <div className="h-64 rounded-2xl skeleton" />
              <div className="h-64 rounded-2xl skeleton" />
              <div className="h-64 rounded-2xl skeleton" />
            </>
          )}

          {!loading && filteredItems.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl border border-dashed border-[#E7E9EB] p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mx-auto text-base-content/50">
                <Quote size={20} />
              </div>
              <h3 className="text-sm font-bold text-base-content">
                No testimonials found
              </h3>
              <p className="text-xs text-base-content/60 max-w-sm mx-auto">
                {search
                  ? `No matches for query "${search}". Try refining your keywords.`
                  : "No member or curated testimonials are currently available."}
              </p>
              {isAdmin && !search && (
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleOpenCreate}
                  >
                    <Plus size={14} className="mr-1" /> Add Your First
                    Testimonial
                  </Button>
                </div>
              )}
            </div>
          )}

          {!loading &&
            filteredItems.map((t) => {
              const name =
                t.displayName ||
                `${t.user?.firstName ?? ""} ${t.user?.lastName ?? ""}`.trim() ||
                "Anonymous";
              const photo = t.photoUrl || t.user?.picture;
              const rating = t.rating ?? 5;

              return (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl border border-[#E7E9EB] p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-brand-primary/40 transition-all group"
                >
                  <div className="space-y-4">
                    {/* Top Row: Author info & publish status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-brand-primary/10 text-brand-primary border border-[#E7E9EB] flex items-center justify-center text-sm font-bold overflow-hidden shrink-0">
                          {photo ? (
                            <img
                              src={photo}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            name[0]?.toUpperCase() || <User size={18} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-base-content truncate leading-snug">
                            {name}
                          </h4>
                          {(t.jobTitle || t.organization) && (
                            <p className="text-xs text-base-content/60 truncate flex items-center gap-1 mt-0.5">
                              {t.jobTitle}
                              {t.jobTitle && t.organization && " • "}
                              {t.organization}
                            </p>
                          )}
                        </div>
                      </div>

                      <StatusBadge
                        status={t.isPublished ? "published" : "unpublished"}
                        className="shrink-0"
                      />
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={cn(
                            i < rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-base-300 fill-base-200",
                          )}
                        />
                      ))}
                    </div>

                    {/* Testimony Content */}
                    <div className="relative">
                      <Quote
                        size={20}
                        className="absolute -top-1 -left-1 text-brand-primary/10 -z-0"
                      />
                      <p className="text-xs text-base-content/80 leading-relaxed italic relative z-10 pl-1 line-clamp-4">
                        &ldquo;{t.testimony}&rdquo;
                      </p>
                    </div>

                    {/* Location & Meta */}
                    {t.location && (
                      <div className="flex items-center gap-1.5 text-[11px] text-base-content/50 pt-1 border-t border-[#F2F3F4]">
                        <MapPin
                          size={12}
                          className="shrink-0 text-base-content/40"
                        />
                        <span className="truncate">{t.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  {isAdmin && (
                    <div className="pt-4 mt-4 border-t border-[#F2F3F4] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(t)}
                          className="text-xs text-base-content/70 hover:text-base-content px-2 h-8"
                        >
                          <Edit3 size={13} className="mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setConfirm({
                              id: t.id,
                              type: t.isPublished ? "unpublish" : "publish",
                              title: name,
                            })
                          }
                          className={cn(
                            "text-xs px-2 h-8",
                            t.isPublished
                              ? "text-amber-600 hover:text-amber-700"
                              : "text-emerald-600 hover:text-emerald-700",
                          )}
                        >
                          {t.isPublished ? (
                            <>
                              <EyeOff size={13} className="mr-1" /> Retract
                            </>
                          ) : (
                            <>
                              <Eye size={13} className="mr-1" /> Publish
                            </>
                          )}
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setConfirm({
                            id: t.id,
                            type: "delete",
                            title: name,
                          })
                        }
                        className="text-xs text-rose-600 hover:bg-rose-50 px-2 h-8"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Pagination Controls */}
        {totalCount > 30 && (
          <div className="flex justify-between items-center bg-white rounded-xl border border-[#E7E9EB] p-4 shadow-xs">
            <span className="text-xs text-base-content/60">
              Showing page {page} of {Math.ceil(totalCount / 30)}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => load(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page * 30 >= totalCount}
                onClick={() => load(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Testimonial Form Editor Modal */}
      <Modal
        open={editorModalOpen}
        onClose={() => setEditorModalOpen(false)}
        title={editingItem ? "Edit Testimonial" : "Create Testimonial"}
        description="Share inspiring endorsements from students, alumni, or corporate partners."
        size="lg"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 pt-2">
          {/* Testimony Text */}
          <div className="space-y-1.5">
            <FieldLabel required>Testimony Content</FieldLabel>
            <SimpleTextArea
              rows={4}
              required
              placeholder="e.g. The CHLPS certification dramatically elevated our team's risk management standards..."
              value={formData.testimony}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev) => ({ ...prev, testimony: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Display Name */}
            <div>
              <SimpleInput
                label="Author / Display Name"
                placeholder="e.g. Jane Doe"
                value={formData.displayName || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({
                    ...prev,
                    displayName: e.target.value,
                  }))
                }
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-semibold text-base-content/80 mb-1">
                Star Rating (1 - 5)
              </label>
              <select
                value={formData.rating ?? 5}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFormData((prev) => ({
                    ...prev,
                    rating: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full h-10 px-3 rounded-lg border border-[#E7E9EB] bg-white text-xs text-base-content focus:border-brand-primary outline-none"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                <option value={3}>⭐⭐⭐ (3 Stars)</option>
                <option value={2}>⭐⭐ (2 Stars)</option>
                <option value={1}>⭐ (1 Star)</option>
              </select>
            </div>

            {/* Job Title */}
            <div>
              <SimpleInput
                label="Job Title"
                placeholder="e.g. Security & Risk Analyst"
                value={formData.jobTitle || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({ ...prev, jobTitle: e.target.value }))
                }
              />
            </div>

            {/* Organization */}
            <div>
              <SimpleInput
                label="Company / Organization"
                placeholder="e.g. Horizon Security Group"
                value={formData.organization || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({
                    ...prev,
                    organization: e.target.value,
                  }))
                }
              />
            </div>

            {/* Location */}
            <div className="sm:col-span-2">
              <SimpleInput
                label="Location"
                placeholder="e.g. Toronto, Canada"
                value={formData.location || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-base-content/80">
              Author Photo (Optional)
            </label>
            <ImageUpload
              value={formData.photoUrl || null}
              onChange={(url) =>
                setFormData((prev) => ({ ...prev, photoUrl: url || "" }))
              }
              folder="chlps_testimonials"
              helperText="Upload a professional profile portrait for the testimonial card."
            />
          </div>

          {/* Publish Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPublishedCheck"
              checked={formData.isPublished}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({
                  ...prev,
                  isPublished: e.target.checked,
                }))
              }
              className="checkbox checkbox-sm checkbox-primary rounded"
            />
            <label
              htmlFor="isPublishedCheck"
              className="text-xs font-medium text-base-content cursor-pointer"
            >
              Publish immediately on public website
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E7E9EB]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditorModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingItem ? "Save Changes" : "Create Testimonial"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={
          confirm?.type === "delete"
            ? "Delete Testimonial"
            : confirm?.type === "publish"
              ? "Publish Testimonial"
              : "Retract Testimonial"
        }
        description={
          confirm?.type === "delete"
            ? `Are you sure you want to permanently delete this testimonial from ${
                confirm.title || "this author"
              }?`
            : confirm?.type === "publish"
              ? `Are you sure you want to publish this testimonial live on the website?`
              : `Are you sure you want to unpublish/retract this testimonial from the public view?`
        }
        variant={confirm?.type === "delete" ? "danger" : "primary"}
        onConfirm={handleConfirmAction}
      />
    </DashboardLayout>
  );
}
