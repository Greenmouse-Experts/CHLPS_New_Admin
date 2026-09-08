"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components";
import { Button, ConfirmModal, StatusBadge, useToast } from "@/components/ui";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";
import PageLoader from "@/components/PageLoader";
import { AddCircle } from "iconsax-react";
import BlogRepository from "../domain/repository/blog_repository";
import { BlogPost } from "../domain/data/response/blog_response";
import { formatDate } from "@/utils/helper/formate_date";

export default function BlogPostsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const repo = new BlogRepository();
  const [items, setItems] = useState<BlogPost[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [confirm, setConfirm] = useState<{ id: string; type: string } | null>(
    null,
  );

  const load = async (p = 1) => {
    setLoading(true);
    setIsError(false);
    setError(null);
    try {
      const res = await repo.listPosts(p);
      if (res.success && res.data) {
        setItems(res.data.items);
        setCount(res.data.count);
        setPage(p);
      } else {
        setIsError(true);
        setError(res.message || "Failed to load blog posts");
        toast(res.message || "Failed to load blog posts", "danger");
      }
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const columns: columnType<BlogPost>[] = [
    { key: "title", label: "Title" },
    {
      key: "user",
      label: "Author",
      render: (_, r) =>
        r.user ? `${r.user.firstName} ${r.user.lastName}` : "—",
    },
    {
      key: "createdDate",
      label: "Date",
      render: (v) => formatDate(v, "DD MMM YYYY"),
    },
    {
      key: "isPublished",
      label: "Status",
      render: (v) => <StatusBadge status={v ? "published" : "unpublished"} />,
    },
  ];

  const actions: Actions<BlogPost>[] = [
    {
      key: "edit",
      label: "Edit",
      action: (r, rtr) => rtr.push(`/blog/edit/${r.id}`),
    },
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
    <DashboardLayout title="Blog Posts">
      <div className="bg-white rounded-xl border border-[#E7E9EB] p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center px-1 pb-2">
          <h2 className="font-semibold text-base text-base-content">Posts</h2>
          <Button
            leftIcon={<AddCircle size={14} color="currentColor" />}
            onClick={() => router.push("/blog/add")}
          >
            Add Post
          </Button>
        </div>
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
              setPagination: (newPage) => load(newPage),
            }}
          />
        </PageLoader>
      </div>
      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Confirm"
        description="Apply this action?"
        variant={confirm?.type === "delete" ? "danger" : "primary"}
        onConfirm={async () => {
          if (!confirm) return;
          if (confirm.type === "delete") await repo.deletePost(confirm.id);
          else
            await repo.updatePost(confirm.id, {
              isPublished: confirm.type === "publish",
            });
          setConfirm(null);
          load(page);
        }}
      />
    </DashboardLayout>
  );
}
