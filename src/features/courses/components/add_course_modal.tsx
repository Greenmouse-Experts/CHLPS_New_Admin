"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import DialogModal, { ModalHandle } from "@/components/DialogModal";
import { Button, TextField, Select, RichTextField } from "@/components/ui";
import {
  CreateCoursePayload,
  CourseOutcome,
} from "../domain/data/response/courses_response";
import { Program } from "@/features/programs/domain/data/response/programs_response";

interface Props {
  programs: Program[];
  isSubmitting: boolean;
  onSubmit: (
    payload: Omit<CreateCoursePayload, "coverImage">,
    file: File,
  ) => Promise<boolean>;
}

export const AddCourseModal = forwardRef<ModalHandle, Props>(
  ({ programs, isSubmitting, onSubmit }, ref) => {
    const dialogRef = useRef<ModalHandle>(null);
    const [form, setForm] = useState({
      title: "",
      shortDesc: "",
      fullDesc: "",
      price: "",
      discount: "",
      program: "",
    });
    const [outcomes, setOutcomes] = useState<CourseOutcome[]>([
      { description: "", order: 1 },
    ]);
    const [file, setFile] = useState<File | null>(null);

    useImperativeHandle(ref, () => ({
      open: () => {
        setForm({
          title: "",
          shortDesc: "",
          fullDesc: "",
          price: "",
          discount: "",
          program: "",
        });
        setOutcomes([{ description: "", order: 1 }]);
        setFile(null);
        dialogRef.current?.open();
      },
      close: () => {
        dialogRef.current?.close();
      },
    }));

    const handleSubmit = async () => {
      if (!file) return;
      const ok = await onSubmit(
        {
          title: form.title,
          shortDesc: form.shortDesc,
          fullDesc: form.fullDesc,
          price: Number(form.price),
          discount: Number(form.discount) || 0,
          program: form.program,
          previewUrl: null,
          outcomes,
        },
        file,
      );
      if (ok) dialogRef.current?.close();
    };

    return (
      <DialogModal
        ref={dialogRef}
        title="Add Course"
        actions={
          <>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => dialogRef.current?.close()}
            >
              Cancel
            </button>
            <Button loading={isSubmitting} onClick={handleSubmit}>
              Create course
            </Button>
          </>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Select
            label="Program"
            required
            value={form.program}
            onChange={(v) => setForm({ ...form, program: v })}
            options={programs.map((p) => ({ label: p.title, value: p.id }))}
          />
          <TextField
            label="Price"
            type="number"
            required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <TextField
            label="Discount"
            type="number"
            value={form.discount}
            onChange={(e) => setForm({ ...form, discount: e.target.value })}
          />
          <div className="sm:col-span-2">
            <TextField
              label="Short description"
              value={form.shortDesc}
              onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <RichTextField
              label="Full description"
              value={form.fullDesc}
              onChange={(fullDesc) => setForm({ ...form, fullDesc })}
              minHeight="120px"
            />
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm font-medium mb-2 text-base-content">
              Outcomes
            </p>
            {outcomes.map((o, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <TextField
                  value={o.description}
                  placeholder={`Outcome ${i + 1}`}
                  onChange={(e) =>
                    setOutcomes(
                      outcomes.map((x, idx) =>
                        idx === i ? { ...x, description: e.target.value } : x,
                      ),
                    )
                  }
                />
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setOutcomes([
                  ...outcomes,
                  { description: "", order: outcomes.length + 1 },
                ])
              }
            >
              Add outcome
            </Button>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm font-medium mb-1.5 text-base-content">
              Cover image
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
      </DialogModal>
    );
  },
);

AddCourseModal.displayName = "AddCourseModal";
