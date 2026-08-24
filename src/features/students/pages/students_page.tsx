"use client";

import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components";
import {
  Column,
  DataTable,
  Divider,
  StatusBadge,
  TableAction,
  UsersTableShimmer,
} from "@/components/ui";
import { SearchNormal1 } from "iconsax-react";
import { useStudents } from "../domain/data/hooks/students_hook";
import { Student } from "../domain/data/response/students_response";
import { formatDate } from "@/utils/helper/formate_date";
import { getAvatarColor } from "@/utils/avatar.colors";

export default function StudentsPage() {
  const router = useRouter();
  const { students, total, isLoading, search, handleSearch } = useStudents();

  const columns: Column<Student>[] = [
    {
      key: "firstName",
      title: "Name",
      render: (_, row) => {
        const fullName = `${row.firstName} ${row.lastName}`;
        const { bg, text } = getAvatarColor(fullName);
        return (
          <div className="flex items-center gap-3">
            {row.picture ? (
               
              <img src={row.picture} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{ backgroundColor: bg, color: text }}
              >
                {row.firstName?.[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-black">{fullName}</span>
          </div>
        );
      },
    },
    { key: "email", title: "Email" },
    { key: "phone", title: "Phone", render: (v) => v || "—" },
    {
      key: "createdDate",
      title: "Joined",
      render: (v) => formatDate(v, "DD MMMM YYYY"),
    },
    {
      key: "isActive",
      title: "Status",
      render: (v) => <StatusBadge status={v ? "active" : "inactive"} />,
    },
  ];

  const actions: TableAction<Student>[] = [
    {
      label: "View Details",
      onClick: (row) => router.push(`/students/${row.id}`),
    },
  ];

  return (
    <DashboardLayout title="Students">
      <div className="space-y-3 bg-white rounded-md border border-[#F0F0F0] pt-4 pb-2">
        <div className="flex items-center px-4">
          <div className="flex items-center gap-2 border border-[#E7E9EB] rounded-lg px-3 h-9 bg-white w-64">
            <SearchNormal1 size={13} color="#717171" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search students"
              className="flex-1 text-xs outline-none bg-transparent"
            />
          </div>
        </div>
        <Divider />
        {isLoading ? (
          <UsersTableShimmer rows={8} />
        ) : (
          <DataTable
            className="border-none rounded-none"
            columns={columns}
            data={students}
            keyField="id"
            actions={actions}
            emptyText="No students found"
            pagination={{ page: 1, pageSize: Math.max(total, 1), total, onChange: () => {} }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
