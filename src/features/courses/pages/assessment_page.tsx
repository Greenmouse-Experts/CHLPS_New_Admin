"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components";
import { Button, Column, ConfirmModal, DataTable, Modal, StatusBadge, TextField, Select, useToast } from "@/components/ui";
import CoursesRepository from "../domain/repository/courses_repository";
import { AssessmentQuestion } from "../domain/data/response/courses_response";
import { AddCircle } from "iconsax-react";

export default function AssessmentPage({
  subId,
  courseId,
  contentId,
}: {
  subId: string;
  courseId: string;
  contentId: string;
}) {
  const { toast } = useToast();
  const repo = new CoursesRepository();
  const [items, setItems] = useState<AssessmentQuestion[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [point, setPoint] = useState("1");
  const [option, setOption] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [correct, setCorrect] = useState(0);
  const [published, setPublished] = useState("true");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async (p = 1) => {
    setLoading(true);
    const res = await repo.listQuestions(subId, p);
    if (res.success && res.data) {
      setItems(res.data.items);
      setCount(res.data.count);
      setPage(p);
    } else toast(res.message, "danger");
    setLoading(false);
  };

  useEffect(() => {
    load(1);
  }, [subId]);

  const columns: Column<AssessmentQuestion>[] = [
    { key: "question", title: "Question" },
    { key: "point", title: "Points" },
    {
      key: "isPublished",
      title: "Status",
      render: (v) => <StatusBadge status={v ? "published" : "unpublished"} />,
    },
  ];

  return (
    <DashboardLayout title="Assessment">
      <div className="bg-white rounded-xl border border-[#E7E9EB] p-5 mb-4">
        <p className="text-sm text-[#717171]">Manage questions for this assessment.</p>
      </div>
      <div className="bg-white rounded-md border border-[#F0F0F0] pt-4">
        <div className="flex justify-end px-4 pb-3">
          <Button leftIcon={<AddCircle size={14} color="currentColor" />} onClick={() => setOpen(true)}>
            Add question
          </Button>
        </div>
        <DataTable
          className="border-none"
          columns={columns}
          data={items}
          keyField="id"
          loading={loading}
          actions={[{ label: "Delete", variant: "danger", onClick: (row) => setDeleteId(row.id) }]}
          pagination={{ page, pageSize: 10, total: count, onChange: load }}
          emptyText="No questions yet"
        />
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Question" size="md">
        <div className="space-y-4">
          <TextField label="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />
          <TextField label="Points" type="number" value={point} onChange={(e) => setPoint(e.target.value)} />
          <Select
            label="Published"
            value={published}
            onChange={setPublished}
            options={[{ label: "Published", value: "true" }, { label: "Draft", value: "false" }]}
          />
          <div className="flex gap-2">
            <TextField value={option} placeholder="Add option" onChange={(e) => setOption(e.target.value)} />
            <Button
              variant="outline"
              onClick={() => {
                if (option) {
                  setOptions([...options, option]);
                  setOption("");
                }
              }}
            >
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {options.map((opt, i) => (
              <button
                key={opt + i}
                type="button"
                className={`w-full text-left text-sm px-3 py-2 rounded-lg border ${correct === i ? "border-black bg-[#F7F7F7]" : "border-[#E7E9EB]"}`}
                onClick={() => setCorrect(i)}
              >
                {opt} {correct === i ? "(correct)" : ""}
              </button>
            ))}
          </div>
          <Button
            fullWidth
            onClick={async () => {
              const res = await repo.addQuestion({
                question,
                course: courseId,
                courseContent: contentId,
                courseContentSub: subId,
                options,
                correctOption: correct,
                point: Number(point) || 1,
                isPublished: published === "true",
              });
              if (res.success) {
                toast(res.message, "success");
                setOpen(false);
                setQuestion("");
                setOptions([]);
                load(1);
              } else toast(res.message, "danger");
            }}
          >
            Save question
          </Button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete question"
        description="This question will be removed."
        variant="danger"
        onConfirm={async () => {
          if (!deleteId) return;
          await repo.deleteQuestion(deleteId);
          setDeleteId(null);
          load(page);
        }}
      />
    </DashboardLayout>
  );
}
