"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
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
  Course,
  CourseOutcome,
  CreateCoursePayload,
} from "../domain/data/response/courses_response";
import { Program } from "@/features/programs/domain/data/response/programs_response";

export interface EditCourseModalHandle extends ModalHandle {
  open: (course?: Course) => void;
}

interface Props {
  programs: Program[];
  isSubmitting: boolean;
  course?: Course | null;
  onClose?: () => void;
  onSubmit: (
    id: string,
    payload: Partial<CreateCoursePayload>,
    file?: File | null,
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

function getCourseFormDefaults(c?: Course | null): CourseFormValues {
  return {
    title: c?.title ?? "",
    shortDesc: c?.shortDesc ?? "",
    fullDesc: c?.fullDesc ?? "",
    price: c?.price !== undefined ? String(c.price) : "",
    discount: c?.discount !== undefined ? String(c.discount) : "0",
    program: c?.program?.id ?? "",
    outcomes: c?.courseOutcomes?.length
      ? c.courseOutcomes.map((o) => ({
          description: o.description,
          order: o.order,
        }))
      : [{ description: "", order: 1 }],
  };
}

export const EditCourseModal = forwardRef<EditCourseModalHandle, Props>(
  function EditCourseModal(
    { programs, isSubmitting, course: propCourse, onClose, onSubmit },
    ref,
  ) {
    const dialogRef = useRef<ModalHandle>(null);
    const [currentCourse, setCurrentCourse] = useState<Course | null>(
      propCourse || null,
    );
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const methods = useForm<CourseFormValues>({
      defaultValues: getCourseFormDefaults(propCourse),
      mode: "onBlur",
    });

    const { fields, append, remove } = useFieldArray({
      control: methods.control,
      name: "outcomes",
    });

    const initForm = (targetCourse: Course | null) => {
      setCurrentCourse(targetCourse);
      methods.reset(getCourseFormDefaults(targetCourse));
      setFile(null);
      setPreviewUrl(targetCourse?.coverImage ?? null);
    };

    useEffect(() => {
      if (propCourse) {
        initForm(propCourse);
      }
    }, [propCourse]);

    useImperativeHandle(ref, () => ({
      open: (courseToEdit?: Course) => {
        const target = courseToEdit || propCourse || null;
        initForm(target);
        dialogRef.current?.open();
      },
      close: () => {
        dialogRef.current?.close();
      },
    }));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0] ?? null;
      setFile(selected);
      if (selected) {
        setPreviewUrl(URL.createObjectURL(selected));
      } else {
        setPreviewUrl(currentCourse?.coverImage ?? null);
      }
    };

    const handleFormSubmit = methods.handleSubmit(async (data) => {
      if (!currentCourse) return;

      const payload: Partial<CreateCoursePayload> = {
        title: data.title.trim(),
        shortDesc: data.shortDesc.trim(),
        fullDesc: data.fullDesc,
        price: Number(data.price),
        discount: Number(data.discount) || 0,
        program: data.program,
        outcomes: data.outcomes
          .map((o, idx) => ({
            description: o.description.trim(),
            order: idx + 1,
          }))
          .filter((o) => o.description.length > 0),
      };

      const ok = await onSubmit(currentCourse.id, payload, file);
      if (ok) {
        dialogRef.current?.close();
        onClose?.();
      }
    });

    return (
      <DialogModal
        ref={dialogRef}
        title={`Edit Course: ${currentCourse?.title || ""}`}
        onClose={onClose}
        actions={
          <>
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                dialogRef.current?.close();
                onClose?.();
              }}
            >
              Cancel
            </Button>
            <Button
              loading={isSubmitting}
              type="button"
              onClick={handleFormSubmit}
            >
              Save changes
            </Button>
          </>
        }
      >
        <FormProvider {...methods}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <SimpleInput
                  label="Title"
                  placeholder="Enter course title"
                  required
                  {...methods.register("title", {
                    required: "Title is required",
                    minLength: {
                      value: 3,
                      message: "Title must be at least 3 characters",
                    },
                  })}
                />
              </div>

              <LocalSelect
                label="Program"
                required
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
                required
                {...methods.register("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price cannot be negative" },
                })}
              />

              <SimpleInput
                label="Discount ($)"
                type="number"
                step="any"
                placeholder="0.00"
                {...methods.register("discount", {
                  min: { value: 0, message: "Discount cannot be negative" },
                })}
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
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-base-content">
                    Course Outcomes
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      append({ description: "", order: fields.length + 1 })
                    }
                  >
                    + Add outcome
                  </Button>
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
              </div>

              <div className="sm:col-span-2 space-y-2">
                <span className="text-sm font-semibold text-base-content block">
                  Cover Image
                </span>
                {previewUrl && (
                  <div className="flex items-center gap-3 p-2 border border-base-300 rounded-lg bg-base-200/50">
                    <img
                      src={previewUrl}
                      alt="Cover preview"
                      className="w-16 h-12 object-cover rounded border border-base-300 shrink-0"
                    />
                    <div className="text-xs text-base-content/70">
                      <p className="font-medium text-base-content">
                        {file ? file.name : "Current cover image"}
                      </p>
                      <p>
                        {file
                          ? `${(file.size / 1024).toFixed(1)} KB`
                          : "Upload a new file below to replace"}
                      </p>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full text-sm"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </form>
        </FormProvider>
      </DialogModal>
    );
  },
);

export default EditCourseModal;
