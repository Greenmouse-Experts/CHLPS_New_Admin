"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components";
import {
  Button,
  ConfirmModal,
  Divider,
  Modal,
  StatusBadge,
  TextField,
  Toggle,
  useToast,
} from "@/components/ui";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";
import PageLoader from "@/components/PageLoader";
import { EventsRepository } from "../domain/repository/events_repository";
import { EventCategoryItem } from "../domain/data/response/events_response";
import { formatDate } from "@/utils/helper/formate_date";
import { ArrowLeft, Calendar, Plus, Tag } from "lucide-react";
import { SearchNormal1 } from "iconsax-react";

const PAGE_SIZE = 10;

export default function EventCategoriesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const repo = useMemo(() => new EventsRepository(), []);

  const [categories, setCategories] = useState<EventCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modal create/edit state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EventCategoryItem | null>(null);
  const [name, setName] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation state
  const [deleteItem, setDeleteItem] = useState<EventCategoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setIsError(false);
    setError(null);
    try {
      const res = await repo.listCategories();
      if (res.success && res.data) {
        setCategories(res.data.items || []);
      } else {
        setIsError(true);
        setError(res.message || "Failed to load event categories");
        toast(res.message || "Failed to load event categories", "danger");
      }
    } catch (err) {
      setIsError(true);
      setError(err);
      toast("Failed to load event categories", "danger");
    } finally {
      setLoading(false);
    }
  }, [repo, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(q) || (c.slug && c.slug.toLowerCase().includes(q)),
    );
  }, [categories, search]);

  const paginatedCategories = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredCategories.slice(start, start + PAGE_SIZE);
  }, [filteredCategories, page]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setIsPublished(true);
    setModalOpen(true);
  };

  const openEditModal = (item: EventCategoryItem) => {
    setEditingCategory(item);
    setName(item.name);
    setIsPublished(item.isPublished ?? true);
    setModalOpen(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast("Please enter a category name", "warning");
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        const res = await repo.updateCategory(editingCategory.id, {
          name: trimmed,
          isPublished,
        });
        if (res.success) {
          toast(res.message || "Event category updated", "success");
          setModalOpen(false);
          load();
        } else {
          toast(res.message || "Failed to update category", "danger");
        }
      } else {
        const res = await repo.createCategory({
          name: trimmed,
          isPublished,
        });
        if (res.success) {
          toast(res.message || "Event category created", "success");
          setModalOpen(false);
          load();
        } else {
          toast(res.message || "Failed to create category", "danger");
        }
      }
    } catch {
      toast("An error occurred while saving", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (item: EventCategoryItem) => {
    const nextStatus = !item.isPublished;
    try {
      const res = await repo.updateCategory(item.id, { isPublished: nextStatus });
      if (res.success) {
        toast(
          nextStatus ? "Category published" : "Category retracted to draft",
          "success",
        );
        load();
      } else {
        toast(res.message || "Failed to update category status", "danger");
      }
    } catch {
      toast("Failed to update status", "danger");
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      const res = await repo.deleteCategory(deleteItem.id);
      if (res.success) {
        toast(res.message || "Event category deleted", "success");
        setDeleteItem(null);
        load();
      } else {
        toast(res.message || "Failed to delete category", "danger");
      }
    } catch {
      toast("Failed to delete category", "danger");
    } finally {
      setDeleting(false);
    }
  };

  const columns: columnType<EventCategoryItem>[] = useMemo(
    () => [
      {
        key: "name",
        label: "Category Name",
        render: (_, row) => (
          <div className="flex items-center gap-3 min-w-[220px]">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Tag size={16} />
            </div>
            <div>
              <p
                className="text-sm font-semibold text-base-content hover:underline cursor-pointer"
                onClick={() => openEditModal(row)}
              >
                {row.name}
              </p>
              {row.slug && (
                <p className="text-2xs text-secondary font-mono">
                  slug: {row.slug}
                </p>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "createdDate",
        label: "Created Date",
        render: (v) => (
          <span className="text-sm text-secondary whitespace-nowrap">
            {v ? formatDate(v, "DD MMM YYYY") : "—"}
          </span>
        ),
      },
      {
        key: "isPublished",
        label: "Status",
        render: (v) => (
          <StatusBadge status={v ? "published" : "draft"} />
        ),
      },
    ],
    [],
  );

  const actions: Actions<EventCategoryItem>[] = [
    {
      key: "edit",
      label: "Edit",
      action: (row) => openEditModal(row),
    },
    {
      key: "toggle_publish",
      label: "Publish / Retract",
      render: (row) => (
        <span
          className={
            row.isPublished
              ? "text-amber-600 font-medium"
              : "text-emerald-600 font-medium"
          }
        >
          {row.isPublished ? "Retract" : "Publish"}
        </span>
      ),
      action: (row) => handleTogglePublish(row),
    },
    {
      key: "delete",
      label: "Delete",
      render: () => <span className="text-error font-medium">Delete</span>,
      action: (row) => setDeleteItem(row),
    },
  ];

  return (
    <DashboardLayout title="Event Categories">
      <div className="space-y-4">
        {/* Header & Controls */}
        <div className="bg-white rounded-xl border border-base-300 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => router.push("/events")}
                  leftIcon={<ArrowLeft size={14} />}
                >
                  Events
                </Button>
                <span className="text-secondary text-sm">/</span>
                <h2 className="text-lg font-bold text-base-content">
                  Event Categories
                </h2>
              </div>
              <p className="text-xs text-secondary">
                Manage categories used for organizing, tagging, and filtering institute events.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/events")}
                leftIcon={<Calendar size={14} />}
              >
                View Events
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus size={15} />}
                onClick={openCreateModal}
              >
                Add Category
              </Button>
            </div>
          </div>

          <Divider />

          {/* Search bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 border border-base-300 rounded-lg px-3 h-10 bg-white w-full sm:w-80 focus-within:border-primary transition-colors">
              <SearchNormal1 size={15} color="#717171" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search categories..."
                className="flex-1 text-sm outline-none bg-transparent placeholder-secondary/50"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="text-xs text-secondary hover:text-base-content"
                >
                  Clear
                </button>
              )}
            </div>

            <span className="text-xs text-secondary font-medium">
              Total: {filteredCategories.length} categor{filteredCategories.length === 1 ? "y" : "ies"}
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-xl border border-base-300 shadow-xs overflow-hidden">
          <PageLoader
            query={{
              data: categories,
              isLoading: loading,
              isError,
              error,
              refetch: load,
            }}
          >
            {filteredCategories.length === 0 && !loading ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mx-auto text-secondary">
                  <Tag size={22} />
                </div>
                <h3 className="text-sm font-semibold text-base-content">
                  {search ? "No categories found" : "No event categories yet"}
                </h3>
                <p className="text-xs text-secondary max-w-sm mx-auto">
                  {search
                    ? "Try refining your search keyword to find the event category you are looking for."
                    : "Create your first category to start organizing institute events."}
                </p>
                {!search && (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus size={15} />}
                    onClick={openCreateModal}
                  >
                    Add Category
                  </Button>
                )}
              </div>
            ) : (
              <CustomTable
                ring={false}
                columns={columns}
                data={paginatedCategories}
                actions={actions}
                totalCount={filteredCategories.length}
                paginationProps={{
                  page,
                  pageSize: PAGE_SIZE,
                  setPagination: (p) => setPage(p),
                }}
              />
            )}
          </PageLoader>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title={editingCategory ? "Edit Event Category" : "Add Event Category"}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-1">
          <TextField
            label="Category Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Annual Conference, Workshop, Seminar"
            autoFocus
          />

          <div className="pt-2">
            <Toggle
              checked={isPublished}
              onChange={setIsPublished}
              label="Publish Category"
              hint={
                isPublished
                  ? "Category is active and selectable for events"
                  : "Category is saved as draft and hidden"
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-base-200">
            <Button
              type="button"
              variant="ghost"
              disabled={submitting}
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteItem}
        onClose={() => !deleting && setDeleteItem(null)}
        title="Delete Event Category"
        description={`Are you sure you want to delete "${deleteItem?.name}"? Events attached to this category might need to be reassigned.`}
        variant="danger"
        confirmLabel="Delete Category"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
}
