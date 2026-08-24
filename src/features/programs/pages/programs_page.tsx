"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components";
import {
  Button,
  Column,
  ConfirmModal,
  DataTable,
  Divider,
  Modal,
  StatusBadge,
  TableAction,
  TextField,
} from "@/components/ui";
import { AddCircle } from "iconsax-react";
import { usePrograms } from "../domain/data/hooks/programs_hook";
import { Program } from "../domain/data/response/programs_response";
import { formatDate } from "@/utils/helper/formate_date";

export default function ProgramsPage() {
  const { programs, isLoading, busy, createProgram, updateProgram, deleteProgram } =
    usePrograms();
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [edit, setEdit] = useState<Program | null>(null);
  const [confirm, setConfirm] = useState<{
    id: string;
    type: "publish" | "unpublish" | "delete";
  } | null>(null);

  const columns: Column<Program>[] = [
    {
      key: "coverImage",
      title: "Cover",
      render: (v) =>
        v ? (
           
          <img src={v} alt="" className="w-14 h-10 object-cover rounded" />
        ) : (
          <div className="w-14 h-10 rounded bg-[#F1F1F1] text-[10px] text-[#717171] flex items-center justify-center">
            No image
          </div>
        ),
    },
    { key: "title", title: "Title" },
    {
      key: "createdDate",
      title: "Created",
      render: (v) => formatDate(v, "DD MMM YYYY"),
    },
    {
      key: "isPublished",
      title: "Status",
      render: (v) => <StatusBadge status={v ? "published" : "unpublished"} />,
    },
  ];

  const actions: TableAction<Program>[] = [
    { label: "Edit", onClick: (row) => setEdit(row) },
    {
      label: "Publish",
      hidden: (row) => !!row.isPublished,
      onClick: (row) => setConfirm({ id: row.id, type: "publish" }),
    },
    {
      label: "Retract",
      hidden: (row) => !row.isPublished,
      onClick: (row) => setConfirm({ id: row.id, type: "unpublish" }),
    },
    {
      label: "Delete",
      variant: "danger",
      onClick: (row) => setConfirm({ id: row.id, type: "delete" }),
    },
  ];

  return (
    <DashboardLayout title="Programs">
      <div className="space-y-3 bg-white rounded-md border border-[#F0F0F0] pt-4 pb-2">
        <div className="flex items-center justify-between px-4">
          <h2 className="font-semibold">All Programs</h2>
          <Button leftIcon={<AddCircle size={14} color="currentColor" />} onClick={() => setAddOpen(true)}>
            Add Program
          </Button>
        </div>
        <Divider />
        <DataTable
          className="border-none rounded-none"
          columns={columns}
          data={programs}
          keyField="id"
          loading={isLoading}
          actions={actions}
          emptyText="No programs found"
        />
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Program" size="sm">
        <div className="space-y-4">
          <TextField label="Program title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          <div>
            <p className="text-sm font-medium mb-1.5">Cover image</p>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <Button
            fullWidth
            loading={busy}
            onClick={async () => {
              const ok = await createProgram(title, file);
              if (ok) {
                setAddOpen(false);
                setTitle("");
                setFile(null);
              }
            }}
          >
            Submit
          </Button>
        </div>
      </Modal>

      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit Program" size="sm">
        <div className="space-y-4">
          <TextField
            label="Program title"
            value={edit?.title ?? ""}
            onChange={(e) => setEdit(edit ? { ...edit, title: e.target.value } : edit)}
          />
          <Button
            fullWidth
            loading={busy}
            onClick={async () => {
              if (!edit) return;
              const ok = await updateProgram(edit.id, { title: edit.title });
              if (ok) setEdit(null);
            }}
          >
            Save
          </Button>
        </div>
      </Modal>

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
          else await updateProgram(confirm.id, { isPublished: confirm.type === "publish" });
          setConfirm(null);
        }}
      />
    </DashboardLayout>
  );
}
