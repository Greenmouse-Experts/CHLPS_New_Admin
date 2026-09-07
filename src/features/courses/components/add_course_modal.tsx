"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
  useForm,
  FormProvider,
  useFieldArray,
  Controller,
} from "react-hook-form";
import DialogModal, { ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import LocalSelect from "@/components/inputs/LocalSelect";
import { Button, RichTextField } from "@/components/ui";
import { Trash } from "lucide-react";
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

interface CourseFormValues {
  title: string;
  shortDesc: string;
  fullDesc: string;
  price: string;
  discount: string;
  program: string;
  outcomes: CourseOutcome[];
}

export const AddCourseModal = forwardRef<ModalHandle, Props>(
  ({ programs, isSubmitting, onSubmit }, ref) => {
    const dialogRef = useRef<ModalHandle>(null);
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const methods = useForm<CourseFormValues>({
      defaultValues: {
        title: "",
        shortDesc: "",
        fullDesc: "",
        price: "",
        discount: "",
        program: "",
        outcomes: [{ description: "", order: 1 }],
      },
    });

    const { fields, append, remove } = useFieldArray({
      control: methods.control,
      name: "outcomes",
    });

    useImperativeHandle(ref, () => ({
      open: () => {
        methods.reset({
          title: "",
          shortDesc: "",
          fullDesc: "",
          price: "",
          discount: "",
          program: "",
          outcomes: [{ description: "", order: 1 }],
        });
        setFile(null);
        setFileError(null);
        dialogRef.current?.open();
      },
      close: () => {
        dialogRef.current?.close();
      },
    }));

    const handleFormSubmit = methods.handleSubmit(async (data) => {
      if (!file) {
        setFileError("Cover image is required");
        return;
      }
      setFileError(null);

      const ok = await onSubmit(
        {
          title: data.title,
          shortDesc: data.shortDesc,
          fullDesc: data.fullDesc,
          price: Number(data.price),
          discount: Number(data.discount) || 0,
          program: data.program,
          previewUrl: null,
          outcomes: data.outcomes.map((o, idx) => ({
            description: o.description,
            order: idx + 1,
          })),
        },
        file,
      );
      if (ok) dialogRef.current?.close();
    });

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
            <Button loading={isSubmitting} onClick={handleFormSubmit}>
              Create course
            </Button>
          </>
        }
      >
        <FormProvider {...methods}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <SimpleInput
                label="Title"
                placeholder="Enter course title"
                {...methods.register("title", {
                  required: "Title is required",
                })}
              />

              <LocalSelect
                label="Program"
                {...methods.register("program", {
                  required: "Program is required",
                })}
              >
                <option value="">Select a program</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </LocalSelect>

              <SimpleInput
                label="Price ($)"
                type="number"
                step="any"
                placeholder="0.00"
                {...methods.register("price", {
                  required: "Price is required",
                })}
              />

              <SimpleInput
                label="Discount ($)"
                type="number"
                step="any"
                placeholder="0.00"
                {...methods.register("discount")}
              />

              <div className="sm:col-span-2">
                <SimpleTextArea
                  label="Short description"
                  placeholder="Brief summary of the course..."
                  rows={2}
                  {...methods.register("shortDesc")}
                />
              </div>

              <div className="sm:col-span-2">
                <Controller
                  name="fullDesc"
                  control={methods.control}
                  render={({ field }) => (
                    <RichTextField
                      label="Full description"
                      value={field.value}
                      onChange={field.onChange}
                      minHeight="120px"
                    />
                  )}
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <div className="fieldset-label font-semibold">
                  <span className="text-sm">Course Outcomes</span>
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <SimpleInput
                        placeholder={`Outcome ${index + 1}`}
                        {...methods.register(
                          `outcomes.${index}.description` as const,
                          { required: "Outcome description is required" },
                        )}
                      />
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="btn btn-square btn-ghost btn-sm text-error mt-2"
                        title="Remove outcome"
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    append({ description: "", order: fields.length + 1 })
                  }
                >
                  Add outcome
                </Button>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <div className="fieldset-label font-semibold">
                  <span className="text-sm">Cover image</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full text-sm"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setFile(f);
                    if (f) setFileError(null);
                  }}
                />
                {fileError && (
                  <p className="text-error text-sm mt-1">{fileError}</p>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </DialogModal>
    );
  },
);

AddCourseModal.displayName = "AddCourseModal";
