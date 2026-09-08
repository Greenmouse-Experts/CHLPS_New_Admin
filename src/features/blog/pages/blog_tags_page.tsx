"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components";
import {
  Button,
  ConfirmModal,
  Modal,
  StatusBadge,
  TextField,
  useToast,
} from "@/components/ui";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";
import PageLoader from "@/components/PageLoader";
import { AddCircle } from "iconsax-react";
import BlogRepository from "../domain/repository/blog_repository";
import { BlogTag } from "../domain/data/response/blog_response";
import { formatDate } from "@/utils/helper/formate_date";

export default function BlogTagsPage() {
  const { toast } = useToast();
  const repo = new BlogRepository();
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [open, setOpen] = useState(false);
  const [tag, setTag] = useState("");
  const [confirm, setConfirm] = useState<{ id: string; type: string } | null>(
    null,
  );

  const load = async () => {
    setLoading(true);
    setIsError(false);
    setError(null);
    try {
      const res = await repo.listTags();
      if (res.success && res.data) {
        setTags(res.data);
      } else {
        setIsError(true);
        setError(res.message || "Failed to load blog tags");
        toast(res.message || "Failed to load blog tags", "danger");
      }
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns: columnType<BlogTag>[] = [
    { key: "tag", label: "Tag" },
    {
      key: "createdDate",
      label: "Created",
      render: (v) => formatDate(v, "DD MMM YYYY"),
    },
    {
      key: "isPublished",
      label: "Status",
      render: (v) => <StatusBadge status={v ? "published" : "unpublished"} />,
    },
  ];

  const actions: Actions<BlogTag>[] = [
    {
      key: "publish",
      label: "Publish",
      disabled: (r) => !!r.isPublished,
      action: (r) => setConfirm({ id: r.id, type: "publish" }),
    },
    {
      key: "retract",
      label: "Retract",
      disabled: (r) => !r.isPublished,
      action: (r) => setConfirm({ id: r.id, type: "unpublish" }),
    },
    {
      key: "delete",
      label: "Delete",
      render: () => <span className="text-error font-medium">Delete</span>,
      action: (r) => setConfirm({ id: r.id, type: "delete" }),
    },
  ];

  return (
    <DashboardLayout title="Blog Tags">
      <div className="bg-white rounded-xl border border-[#E7E9EB] p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center px-1 pb-2">
          <h2 className="font-semibold text-base text-base-content">Tags</h2>
          <Button
            leftIcon={<AddCircle size={14} color="currentColor" />}
            onClick={() => setOpen(true)}
          >
            Add Tag
          </Button>
        </div>
        <PageLoader
          query={{
            data: tags,
            isLoading: loading,
            isError,
            error,
            refetch: load,
          }}
        >
          <CustomTable
            ring={false}
            columns={columns}
            data={tags}
            actions={actions}
            totalCount={tags.length}
          />
        </PageLoader>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Tag"
        size="sm"
      >
        <TextField
          label="Tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        />
        <Button
          className="mt-4"
          fullWidth
          onClick={async () => {
            const res = await repo.createTag(tag);
            if (res.success) {
              toast(res.message, "success");
              setOpen(false);
              setTag("");
              load();
            } else {
              toast(res.message, "danger");
            }
          }}
        >
          Save
        </Button>
      </Modal>

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Confirm"
        description="Apply this action?"
        variant={confirm?.type === "delete" ? "danger" : "primary"}
        onConfirm={async () => {
          if (!confirm) return;
          if (confirm.type === "delete") await repo.deleteTag(confirm.id);
          else
            await repo.updateTag(confirm.id, {
              isPublished: confirm.type === "publish",
            });
          setConfirm(null);
          load();
        }}
      />
    </DashboardLayout>
  );
}
