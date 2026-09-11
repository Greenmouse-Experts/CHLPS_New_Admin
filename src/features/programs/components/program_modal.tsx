"use client";

import { useEffect, useState } from "react";
import { Button, Modal, Toggle } from "@/components/ui";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { CheckCircle2 } from "lucide-react";
import { Program } from "../domain/data/response/programs_response";

interface ProgramModalProps {
  open: boolean;
  onClose: () => void;
  program?: Program | null;
  busy: boolean;
  onSubmit: (payload: {
    title: string;
    description: string;
    coverImage: string | null;
    isPublished: boolean;
  }) => Promise<boolean>;
}

export function ProgramModal({
  open,
  onClose,
  program,
  busy,
  onSubmit,
}: ProgramModalProps) {
  const isEdit = Boolean(program);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (program) {
        setTitle(program.title || "");
        setDescription(program.description || "");
        setCoverImage(program.coverImage || null);
        setIsPublished(Boolean(program.isPublished));
      } else {
        setTitle("");
        setDescription("");
        setCoverImage(null);
        setIsPublished(true); // Default to published for new programs or draft
      }
      setTitleError(null);
    }
  }, [open, program]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setTitleError("Program title is required");
      return;
    }
    setTitleError(null);

    const ok = await onSubmit({
      title: cleanTitle,
      description: description.trim(),
      coverImage,
      isPublished,
    });

    if (ok) {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Program" : "Add New Program"}
      description={
        isEdit
          ? "Update the program title, description, cover image, and status."
          : "Create a new learning program category for grouping courses."
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <SimpleInput
            label="Program Title"
            placeholder="e.g. Computer Science"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError(null);
            }}
          />
          {titleError && (
            <p className="text-xs text-error mt-1">{titleError}</p>
          )}
        </div>

        <div>
          <SimpleTextArea
            label="Description"
            placeholder="A comprehensive program covering loss prevention fundamentals..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-base-content/80">
            Cover Image
          </label>
          <ImageUpload
            value={coverImage}
            onChange={(url) => setCoverImage(url)}
            folder="chlps_programs"
            helperText="Recommended: 16:9 ratio image. Max 5MB."
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-[#E7E9EB] bg-base-200/20">
          <div>
            <span className="text-xs font-semibold text-base-content block">
              Publication Status
            </span>
            <span className="text-xs text-base-content/60">
              {isPublished ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Published (visible to students)
                </span>
              ) : (
                <span className="text-amber-600">Draft / Unpublished</span>
              )}
            </span>
          </div>
          <Toggle
            checked={isPublished}
            onChange={(checked: boolean) => setIsPublished(checked)}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E9EB]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={busy}
          >
            {isEdit ? "Save Changes" : "Create Program"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
