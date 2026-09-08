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
  useToast,
} from "@/components/ui";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";
import PageLoader from "@/components/PageLoader";
import { AddCircle } from "iconsax-react";
import FaqsRepository from "../domain/repository/faqs_repository";
import { Faq } from "../domain/data/response/faqs_response";
import { formatDate } from "@/utils/helper/formate_date";

export default function FaqsPage() {
  const { toast } = useToast();
  const repo = useMemo(() => new FaqsRepository(), []);
  const [items, setItems] = useState<Faq[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Faq | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [confirm, setConfirm] = useState<{
    id: string;
    type: "delete" | "publish" | "unpublish";
  } | null>(null);

  const load = useCallback(
    async (p = 1) => {
      setLoading(true);
      setIsError(false);
      setError(null);
      try {
        const res = await repo.list(p);
        if (res.success && res.data) {
          setItems(res.data.items);
          setCount(res.data.count);
          setPage(p);
        } else {
          setIsError(true);
          setError(res.message || "Failed to load FAQs");
          toast(res.message, "danger");
        }
      } catch (err) {
        setIsError(true);
        setError(err);
        toast("Failed to load FAQs", "danger");
      } finally {
        setLoading(false);
      }
    },
    [repo, toast],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const columns: columnType<Faq>[] = useMemo(
    () => [
      {
        key: "question",
        label: "Question",
        render: (_, row) => (
          <div className="min-w-[240px] max-w-md">
            <p className="text-sm font-semibold text-base-content line-clamp-2">
              {row.question}
            </p>
            <p className="text-xs text-secondary line-clamp-1 mt-0.5">
              {row.answer}
            </p>
          </div>
        ),
      },
      {
        key: "createdDate",
        label: "Created",
        render: (v) => (
          <span className="text-sm text-secondary whitespace-nowrap">
            {v ? formatDate(v, "DD MMM YYYY") : "—"}
          </span>
        ),
      },
      {
        key: "isPublished",
        label: "Status",
        render: (v) => <StatusBadge status={v ? "published" : "unpublished"} />,
      },
    ],
    [],
  );

  const actions: Actions<Faq>[] = [
    {
      key: "edit",
      label: "Edit",
      action: (row) => {
        setEdit(row);
        setQuestion(row.question);
        setAnswer(row.answer);
      },
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
    <DashboardLayout title="FAQs">
      <div className="space-y-3 bg-white rounded-xl border border-base-300 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-base text-base-content">
            All FAQs
          </h2>
          <Button
            leftIcon={<AddCircle size={14} color="currentColor" />}
            onClick={() => {
              setEdit(null);
              setQuestion("");
              setAnswer("");
              setOpen(true);
            }}
          >
            Add FAQ
          </Button>
        </div>
        <Divider />
        <PageLoader
          query={{
            data: items,
            isLoading: loading,
            isError,
            error,
            refetch: () => load(page),
          }}
        >
          <CustomTable
            ring={false}
            columns={columns}
            data={items}
            actions={actions}
            totalCount={count}
            paginationProps={{
              page,
              pageSize: 10,
              setPagination: load,
            }}
          />
        </PageLoader>
      </div>

      <Modal
        open={open || !!edit}
        onClose={() => {
          setOpen(false);
          setEdit(null);
        }}
        title={edit ? "Edit FAQ" : "Add FAQ"}
        size="md"
      >
        <div className="space-y-4">
          <TextField
            label="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium mb-1.5">Answer</label>
            <textarea
              className="flipex-input-base min-h-24"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>
          <Button
            fullWidth
            onClick={async () => {
              const res = edit
                ? await repo.update(edit.id, { question, answer })
                : await repo.create({ question, answer });
              if (res.success) {
                toast(res.message, "success");
                setOpen(false);
                setEdit(null);
                load(page);
              } else toast(res.message, "danger");
            }}
          >
            Save
          </Button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Confirm"
        description="Apply this action?"
        variant={confirm?.type === "delete" ? "danger" : "primary"}
        onConfirm={async () => {
          if (!confirm) return;
          if (confirm.type === "delete") await repo.remove(confirm.id);
          else await repo.publish(confirm.id, confirm.type === "publish");
          setConfirm(null);
          load(page);
        }}
      />
    </DashboardLayout>
  );
}
