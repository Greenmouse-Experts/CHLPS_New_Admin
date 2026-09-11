"use client";

import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components";
import {
  Button,
  ConfirmModal,
  Divider,
  StatusBadge,
} from "@/components/ui";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";
import { AddCircle, Edit2, SearchNormal1 } from "iconsax-react";
import { usePrograms } from "../domain/data/hooks/programs_hook";
import { Program } from "../domain/data/response/programs_response";
import { ProgramModal } from "../components/program_modal";
import { formatDate } from "@/utils/helper/formate_date";

export default function ProgramsPage() {
  const {
    programs,
    isLoading,
    busy,
    createProgram,
    updateProgram,
    deleteProgram,
  } = usePrograms();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [edit, setEdit] = useState<Program | null>(null);
  const [confirm, setConfirm] = useState<{
    id: string;
    type: "publish" | "unpublish" | "delete";
  } | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return programs;
    return programs.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
    );
  }, [programs, search]);

  const columns: columnType<Program>[] = [
    {
      key: "coverImage",
      label: "Cover",
      render: (v) =>
        v ? (
          <img
            src={v}
            alt=""
            className="w-14 h-10 object-cover rounded border border-base-300 shrink-0"
          />
        ) : (
          <div className="w-14 h-10 rounded bg-base-200 text-xs text-base-content/60 flex items-center justify-center font-medium shrink-0">
            No cover
          </div>
        ),
    },
    {
      key: "title",
      label: "Program",
      render: (v, row) => (
        <div className="min-w-[200px]">
          <span className="text-sm font-semibold text-base-content block">
            {v}
          </span>
          {row.description ? (
            <p className="text-xs text-base-content/60 line-clamp-1 mt-0.5 max-w-md">
              {row.description}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "createdDate",
      label: "Created",
      render: (v) => (
        <span className="text-sm text-base-content/80 whitespace-nowrap">
          {formatDate(v, "DD MMM YYYY")}
        </span>
      ),
    },
    {
      key: "isPublished",
      label: "Status",
      render: (v) => <StatusBadge status={v ? "published" : "unpublished"} />,
    },
  ];

  const actions: Actions<Program>[] = [
    {
      key: "edit",
      label: "Edit",
      render: () => (
        <span className="text-primary font-medium flex items-center gap-1.5">
          <Edit2 size={15} /> Edit
        </span>
      ),
      action: (row) => setEdit(row),
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
      action: (row) =>
        setConfirm({
          id: row.id,
          type: row.isPublished ? "unpublish" : "publish",
        }),
    },
    {
      key: "delete",
      label: "Delete",
      render: () => <span className="text-error font-medium">Delete</span>,
      action: (row) => setConfirm({ id: row.id, type: "delete" }),
    },
  ];

  return (
    <DashboardLayout title="Programs">
      <div className="space-y-4 bg-white rounded-xl border border-[#E7E9EB] p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 border border-[#E7E9EB] rounded-lg px-3 h-9 bg-white w-64 focus-within:border-primary transition-colors">
            <SearchNormal1 size={15} color="#717171" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search programs..."
              className="flex-1 text-xs outline-none focus:outline-none focus-visible:outline-none ring-0 bg-transparent placeholder-[#ADADAD]"
            />
          </div>
          <Button
            leftIcon={<AddCircle size={14} color="currentColor" />}
            onClick={() => setAddOpen(true)}
          >
            Add Program
          </Button>
        </div>

        <Divider />

        {isLoading ? (
          <div className="h-48 rounded-xl skeleton" />
        ) : (
          <CustomTable
            ring={false}
            columns={columns}
            data={filtered}
            actions={actions}
            totalCount={filtered.length}
          />
        )}
      </div>

      {/* Add Program Modal */}
      <ProgramModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        busy={busy}
        onSubmit={async (payload) => {
          return await createProgram(payload);
        }}
      />

      {/* Edit Program Modal */}
      <ProgramModal
        open={Boolean(edit)}
        onClose={() => setEdit(null)}
        program={edit}
        busy={busy}
        onSubmit={async (payload) => {
          if (!edit) return false;
          return await updateProgram(edit.id, payload);
        }}
      />

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.type === "delete" ? "Delete program" : "Update status"}
        description={
          confirm?.type === "delete"
            ? "This program will be permanently deleted."
            : confirm?.type === "publish"
              ? "Publish this program?"
              : "Retract this program?"
        }
        variant={confirm?.type === "delete" ? "danger" : "primary"}
        onConfirm={async () => {
          if (!confirm) return;
          if (confirm.type === "delete") await deleteProgram(confirm.id);
          else
            await updateProgram(confirm.id, {
              isPublished: confirm.type === "publish",
            });
          setConfirm(null);
        }}
      />
    </DashboardLayout>
  );
}
