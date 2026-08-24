"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components";
import {
  Button,
  Column,
  ConfirmModal,
  DataTable,
  Divider,
  Select,
  StatusBadge,
  TableAction,
} from "@/components/ui";
import { AddCircle, SearchNormal1 } from "iconsax-react";
import { useCourses } from "../domain/data/hooks/courses_hook";
import { Course } from "../domain/data/response/courses_response";
import { AddCourseModal } from "../components/add_course_modal";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";

export default function CoursesPage() {
  const router = useRouter();
  const {
    courses, count, page, pageSize, isLoading, busy, programs, filters, isAdmin,
    setFilters, applyFilters, handlePageChange, createCourse, publish, feature, remove,
  } = useCourses();
  const [addOpen, setAddOpen] = useState(false);
  const [confirm, setConfirm] = useState<{ id: string; type: string } | null>(null);

  const columns: Column<Course>[] = [
    { key: "title", title: "Title" },
    {
      key: "price",
      title: "Price",
      render: (v) => formatCurrency(Number(v) || 0, { currency: "USD" }),
    },
    { key: "program", title: "Program", render: (_, row) => row.program?.title || "—" },
    {
      key: "coverImage",
      title: "Cover",
      render: (v) =>
        v ? (
           
          <img src={v} alt="" className="w-12 h-8 object-cover rounded" />
        ) : "—",
    },
    ...(isAdmin
      ? [{
          key: "instructor",
          title: "Instructor",
          render: (_: unknown, row: Course) =>
            row.instructor ? `${row.instructor.firstName} ${row.instructor.lastName}` : "—",
        } as Column<Course>]
      : []),
    { key: "createdDate", title: "Created", render: (v) => formatDate(v, "DD MMM YYYY") },
    {
      key: "isPublished",
      title: "Status",
      render: (v) => <StatusBadge status={v ? "published" : "unpublished"} />,
    },
  ];

  const actions: TableAction<Course>[] = [
    { label: "View Details", onClick: (row) => router.push(`/courses/${row.id}`) },
    {
      label: "Publish",
      hidden: (row) => !!row.isPublished || !isAdmin,
      onClick: (row) => setConfirm({ id: row.id, type: "publish" }),
    },
    {
      label: "Retract",
      hidden: (row) => !row.isPublished || !isAdmin,
      onClick: (row) => setConfirm({ id: row.id, type: "unpublish" }),
    },
    {
      label: "Feature",
      hidden: (row) => !!row.featured,
      onClick: (row) => setConfirm({ id: row.id, type: "feature" }),
    },
    {
      label: "Unfeature",
      hidden: (row) => !row.featured,
      onClick: (row) => setConfirm({ id: row.id, type: "unfeature" }),
    },
    { label: "Delete", variant: "danger", onClick: (row) => setConfirm({ id: row.id, type: "delete" }) },
  ];

  return (
    <DashboardLayout title="Courses">
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-[#E7E9EB] p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 border border-[#E7E9EB] rounded-lg px-3 h-10">
            <SearchNormal1 size={14} color="#717171" />
            <input
              className="flex-1 text-sm outline-none"
              placeholder="Search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <Select
            placeholder="Program"
            value={filters["program[id]"]}
            onChange={(v) => setFilters({ ...filters, "program[id]": v })}
            options={[{ label: "All programs", value: "" }, ...programs.map((p) => ({ label: p.title, value: p.id }))]}
          />
          <Select
            value={filters.sortOrder}
            onChange={(v) => setFilters({ ...filters, sortOrder: v })}
            options={[{ label: "Newest", value: "DESC" }, { label: "Oldest", value: "ASC" }]}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => applyFilters(filters)}>Filter</Button>
            <Button onClick={() => setAddOpen(true)} leftIcon={<AddCircle size={14} color="currentColor" />}>
              Add Course
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-md border border-[#F0F0F0] pt-2">
          <Divider />
          <DataTable
            className="border-none rounded-none"
            columns={columns}
            data={courses}
            keyField="id"
            loading={isLoading}
            actions={actions}
            emptyText="No courses found"
            pagination={{ page, pageSize, total: count, onChange: handlePageChange }}
          />
        </div>
      </div>

      <AddCourseModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
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
