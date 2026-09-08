"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components";
import { Divider, StatusBadge } from "@/components/ui";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";
import PageLoader from "@/components/PageLoader";
import { SearchNormal1 } from "iconsax-react";
import { useStudents } from "../domain/data/hooks/students_hook";
import { Student } from "../domain/data/response/students_response";
import { formatDate } from "@/utils/helper/formate_date";
import { getAvatarColor } from "@/utils/avatar.colors";

export default function StudentsPage() {
  const router = useRouter();
  const {
    students,
    total,
    page,
    pageSize,
    isLoading,
    isError,
    error,
    search,
    handleSearch,
    handlePageChange,
    refetch,
  } = useStudents();

  const columns: columnType<Student>[] = useMemo(
    () => [
      {
        key: "firstName",
        label: "Name",
        render: (_, row) => {
          const fullName =
            `${row.firstName ?? ""} ${row.lastName ?? ""}`.trim() || "—";
          const { bg, text } = getAvatarColor(fullName);
          return (
            <div className="flex items-center gap-3 min-w-[200px]">
              {row.picture ? (
                <img
                  src={row.picture}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-base-300"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                  style={{ backgroundColor: bg, color: text }}
                >
                  {(row.firstName?.[0] || fullName?.[0] || "?").toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium text-base-content hover:underline">
                {fullName}
              </span>
            </div>
          );
        },
      },
      {
        key: "email",
        label: "Email",
        render: (v) => (
          <span className="text-sm text-base-content whitespace-nowrap">
            {v || "—"}
          </span>
        ),
      },
      {
        key: "phone",
        label: "Phone",
        render: (v) => (
          <span className="text-sm text-secondary whitespace-nowrap">
            {v || "—"}
          </span>
        ),
      },
      {
        key: "createdDate",
        label: "Joined",
        render: (v) => (
          <span className="text-sm text-secondary whitespace-nowrap">
            {v ? formatDate(v, "DD MMMM YYYY") : "—"}
          </span>
        ),
      },
      {
        key: "isActive",
        label: "Status",
        render: (v) => <StatusBadge status={v ? "active" : "inactive"} />,
      },
    ],
    [],
  );

  const actions: Actions<Student>[] = [
    {
      key: "view_details",
      label: "View Details",
      action: (row) => router.push(`/students/${row.id}`),
    },
  ];

  return (
    <DashboardLayout title="Members">
      <div className="space-y-3 bg-white rounded-xl border border-base-300 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 border border-base-300 rounded-lg px-3 h-10 bg-white w-64 focus-within:border-primary transition-colors">
            <SearchNormal1 size={14} color="#717171" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search members..."
              className="flex-1 text-sm outline-none focus:outline-none focus-visible:outline-none ring-0 bg-transparent placeholder-secondary/50"
            />
          </div>
        </div>
        <Divider />
        <PageLoader
          query={{
            data: students,
            isLoading,
            isError,
            error,
            refetch,
          }}
        >
          <CustomTable
            ring={false}
            columns={columns}
            data={students}
            actions={actions}
            totalCount={total}
            onRowClick={(row) => router.push(`/students/${row.id}`)}
            paginationProps={{
              page,
              pageSize,
              setPagination: handlePageChange,
            }}
          />
        </PageLoader>
      </div>
    </DashboardLayout>
  );
}
