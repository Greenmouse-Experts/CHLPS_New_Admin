"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { AddCircle, Personalcard, SearchNormal1 } from "iconsax-react";
import MembershipRepository from "../domain/repository/membership_repository";
import { MembershipTypeItem } from "../domain/data/response/membership_response";
import { formatDate } from "@/utils/helper/formate_date";

const PAGE_SIZE = 10;

export default function MembershipTypesPage() {
  const { toast } = useToast();
  const repo = useMemo(() => new MembershipRepository(), []);

  const [types, setTypes] = useState<MembershipTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modal create/edit state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<MembershipTypeItem | null>(null);
  const [name, setName] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation state
  const [deleteItem, setDeleteItem] = useState<MembershipTypeItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setIsError(false);
    setError(null);
    try {
      const res = await repo.listTypes();
      if (res.success && res.data) {
        setTypes(res.data.items);
      } else {
        setIsError(true);
        setError(res.message || "Failed to load membership types");
        toast(res.message || "Failed to load membership types", "danger");
      }
    } catch (err) {
      setIsError(true);
      setError(err);
      toast("Failed to load membership types", "danger");
    } finally {
      setLoading(false);
    }
  }, [repo, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredTypes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return types;
    return types.filter((t) => t.name.toLowerCase().includes(q));
  }, [types, search]);

  const paginatedTypes = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredTypes.slice(start, start + PAGE_SIZE);
  }, [filteredTypes, page]);

  const openCreateModal = () => {
    setEditingType(null);
    setName("");
    setIsPublished(true);
    setModalOpen(true);
  };

  const openEditModal = (item: MembershipTypeItem) => {
    setEditingType(item);
    setName(item.name);
    setIsPublished(item.isPublished ?? true);
    setModalOpen(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast("Please enter a membership type name", "warning");
      return;
    }

    setSubmitting(true);
    try {
      if (editingType) {
        const res = await repo.updateType(editingType.id, {
          name: trimmed,
          isPublished,
        });
        if (res.success) {
          toast(res.message || "Membership type updated", "success");
          setModalOpen(false);
          load();
        } else {
          toast(res.message || "Failed to update membership type", "danger");
        }
      } else {
        const res = await repo.createType({
          name: trimmed,
          isPublished,
        });
        if (res.success) {
          toast(res.message || "Membership type created", "success");
          setModalOpen(false);
          load();
        } else {
          toast(res.message || "Failed to create membership type", "danger");
        }
      }
    } catch {
      toast("An error occurred while saving", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (item: MembershipTypeItem) => {
    const nextStatus = !item.isPublished;
    try {
      const res = await repo.updateType(item.id, { isPublished: nextStatus });
      if (res.success) {
        toast(
          nextStatus
            ? "Membership type published"
            : "Membership type unpublished",
          "success",
        );
        load();
      } else {
        toast(res.message || "Failed to update status", "danger");
      }
    } catch {
      toast("Failed to update status", "danger");
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      const res = await repo.deleteType(deleteItem.id);
      if (res.success) {
        toast(res.message || "Membership type deleted", "success");
        setDeleteItem(null);
        load();
      } else {
        toast(res.message || "Failed to delete membership type", "danger");
      }
    } catch {
      toast("Failed to delete membership type", "danger");
    } finally {
      setDeleting(false);
    }
  };

  const columns: columnType<MembershipTypeItem>[] = useMemo(
    () => [
      {
        key: "name",
        label: "Category / Type Name",
        render: (_, row) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Personalcard size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-base-content">
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

  const actions: Actions<MembershipTypeItem>[] = [
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
    <DashboardLayout title="Membership Categories & Types">
      <div className="space-y-4">
        {/* Header & Controls */}
        <div className="bg-white rounded-xl border border-base-300 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-base-content">
                Membership Categories & Types
              </h2>
              <p className="text-xs text-secondary mt-0.5">
                Manage membership categories, classification types, and availability.
              </p>
            </div>
            <Button
              leftIcon={<AddCircle size={16} color="currentColor" />}
              onClick={openCreateModal}
            >
              Add Category / Type
            </Button>
          </div>

          <Divider />

          {/* Search bar */}
          <div className="max-w-md relative">
            <input
              type="text"
              className="flipex-input-base pl-9 text-sm"
              placeholder="Search category or type..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <SearchNormal1
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
            />
          </div>

          {/* Table */}
          <PageLoader
            query={{
              data: types,
              isLoading: loading,
              isError,
              error,
              refetch: load,
            }}
          >
            <CustomTable
              ring={false}
              columns={columns}
              data={paginatedTypes}
              actions={actions}
              totalCount={filteredTypes.length}
              paginationProps={{
                page,
                pageSize: PAGE_SIZE,
                setPagination: setPage,
              }}
            />
          </PageLoader>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingType
            ? "Edit Membership Category / Type"
            : "New Membership Category / Type"
        }
        size="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <TextField
            label="Category / Type Name"
            placeholder="e.g. Professional, Student, Associate"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <div className="flex items-center justify-between p-3 rounded-lg bg-base-200/50 border border-base-300">
            <div>
              <p className="text-sm font-medium text-base-content">Published Status</p>
              <p className="text-xs text-secondary">
                Make this category available when creating membership plans.
              </p>
            </div>
            <Toggle checked={isPublished} onChange={setIsPublished} />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingType ? "Save Changes" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        title="Delete Membership Category"
        description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
}
