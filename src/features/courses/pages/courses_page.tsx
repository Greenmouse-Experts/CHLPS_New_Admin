"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components";
import {
  Button,
  ConfirmModal,
  Divider,
  Select,
  StatusBadge,
} from "@/components/ui";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";
import { ModalHandle } from "@/components/DialogModal";
import { AddCircle, SearchNormal1 } from "iconsax-react";
import { useCourses } from "../domain/data/hooks/courses_hook";
import { Course } from "../domain/data/response/courses_response";
import { AddCourseModal } from "../components/add_course_modal";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";

export default function CoursesPage() {
  const router = useRouter();
  const {
    courses,
    count,
    page,
    pageSize,
    isLoading,
    busy,
    programs,
    filters,
    isAdmin,
    setFilters,
    applyFilters,
    handlePageChange,
    createCourse,
    publish,
    feature,
    remove,
  } = useCourses();

  const addModalRef = useRef<ModalHandle>(null);
  const [confirm, setConfirm] = useState<{ id: string; type: string } | null>(
    null,
  );

  const columns: columnType<Course>[] = useMemo(
    () => [
      {
        key: "title",
        label: "Title",
        render: (_, row) => (
          <div className="flex items-center gap-3 min-w-[200px]">
            {row.coverImage ? (
              <img
                src={row.coverImage}
                alt=""
                className="w-12 h-8 object-cover rounded border border-base-300 shrink-0"
              />
            ) : (
              <div className="w-12 h-8 rounded bg-base-200 text-xs text-base-content/60 flex items-center justify-center font-medium shrink-0">
                No cover
              </div>
            )}
            <span className="font-semibold text-sm text-base-content hover:underline cursor-pointer">
              {row.title}
            </span>
          </div>
        ),
      },
      {
        key: "price",
        label: "Price",
        render: (v) => (
          <span className="text-sm font-semibold text-base-content whitespace-nowrap">
            {formatCurrency(Number(v) || 0, { currency: "USD" })}
          </span>
        ),
      },
      {
        key: "program",
        label: "Program",
        render: (_, row) => (
          <span className="text-sm text-base-content">
            {row.program?.title || "—"}
          </span>
        ),
      },
      ...(isAdmin
        ? [
            {
              key: "instructor",
              label: "Instructor",
              render: (_: unknown, row: Course) => (
                <span className="text-sm text-base-content">
                  {row.instructor
                    ? `${row.instructor.firstName} ${row.instructor.lastName}`
                    : "—"}
                </span>
              ),
            } as columnType<Course>,
          ]
        : []),
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
    ],
    [isAdmin],
  );

  const actions: Actions<Course>[] = [
    {
      key: "view_details",
      label: "View Details",
      action: (row, r) => r.push(`/courses/${row.id}`),
    },
    {
      key: "toggle_publish",
      label: "Publish / Retract",
      disabled: () => !isAdmin,
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
      key: "toggle_feature",
      label: "Feature / Unfeature",
      render: (row) => (
        <span
          className={
            row.featured
              ? "text-blue-600 font-medium"
              : "text-base-content font-medium"
          }
        >
          {row.featured ? "Unfeature" : "Feature"}
        </span>
      ),
      action: (row) =>
        setConfirm({
          id: row.id,
          type: row.featured ? "unfeature" : "feature",
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
    <DashboardLayout title="Courses">
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-[#E7E9EB] p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 shadow-sm">
          <div className="flex items-center gap-2 border border-[#E7E9EB] rounded-lg px-3 h-10 focus-within:border-primary transition-colors">
            <SearchNormal1 size={14} color="#717171" />
            <input
              className="flex-1 text-sm outline-none focus:outline-none focus-visible:outline-none ring-0 bg-transparent placeholder-[#ADADAD]"
              placeholder="Search courses..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
          <Select
            placeholder="Program"
            value={filters["program[id]"]}
            onChange={(v) => setFilters({ ...filters, "program[id]": v })}
            options={[
              { label: "All programs", value: "" },
              ...programs.map((p) => ({ label: p.title, value: p.id })),
            ]}
          />
          <Select
            value={filters.sortOrder}
            onChange={(v) => setFilters({ ...filters, sortOrder: v })}
            options={[
              { label: "Newest", value: "DESC" },
              { label: "Oldest", value: "ASC" },
            ]}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => applyFilters(filters)}>
              Filter
            </Button>
            <Button
              onClick={() => addModalRef.current?.open()}
              leftIcon={<AddCircle size={14} color="currentColor" />}
            >
              Add Course
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E7E9EB] p-4 shadow-sm space-y-3">
          <Divider />
          {isLoading ? (
            <div className="h-48 rounded-xl skeleton" />
          ) : (
            <CustomTable
              ring={false}
              columns={columns}
              data={courses}
              actions={actions}
              totalCount={count}
              onRowClick={(row) => router.push(`/courses/${row.id}`)}
              paginationProps={{
                page,
                pageSize,
                setPagination: handlePageChange,
              }}
            />
          )}
        </div>
      </div>

      <AddCourseModal
        ref={addModalRef}
        programs={programs}
        isSubmitting={busy}
        onSubmit={createCourse}
      />

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Confirm action"
        description="This will update the selected course."
        variant={confirm?.type === "delete" ? "danger" : "primary"}
        onConfirm={async () => {
          if (!confirm) return;
          if (confirm.type === "publish") await publish(confirm.id, true);
          if (confirm.type === "unpublish") await publish(confirm.id, false);
          if (confirm.type === "feature") await feature(confirm.id, true);
          if (confirm.type === "unfeature") await feature(confirm.id, false);
          if (confirm.type === "delete") await remove(confirm.id);
          setConfirm(null);
        }}
      />
    </DashboardLayout>
  );
}
