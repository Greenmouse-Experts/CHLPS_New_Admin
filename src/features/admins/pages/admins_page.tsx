"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components";
import {
  AdminsTableShimmer,
  Button,
  Column,
  DataTable,
  Divider,
  StatusBadge,
} from "@/components/ui";
import { AddCircle, SearchNormal1 } from "iconsax-react";
import { useAdmins } from "../domain/data/hooks/admin_hook";
import { Person } from "../domain/data/response/admin_response";
import { AddAdminModal } from "../components/add_admin_modal";
import { formatDate } from "@/utils/helper/formate_date";
import { getAvatarColor } from "@/utils/avatar.colors";

export default function AdminsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const { admins, total, isLoading, isCreating, search, handleSearch, handleCreate } =
    useAdmins();

  const columns: Column<Person>[] = [
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
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
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

  return (
    <DashboardLayout title="Admins">
      <div className="space-y-3 bg-white rounded-md border border-[#F0F0F0] pt-4 pb-2">
        <div className="flex flex-wrap items-center justify-between px-4 gap-3">
          <div className="flex items-center gap-2 border border-[#E7E9EB] rounded-lg px-3 h-9 bg-white w-52">
            <SearchNormal1 size={13} color="#717171" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search"
              className="flex-1 text-xs outline-none focus:outline-none focus-visible:outline-none ring-0 bg-transparent placeholder-[#ADADAD]"
            />
          </div>
          <Button leftIcon={<AddCircle size={14} color="currentColor" />} onClick={() => setAddOpen(true)}>
            Add Admin
          </Button>
        </div>
        <Divider />
        {isLoading ? (
          <AdminsTableShimmer rows={8} />
        ) : (
          <DataTable
            className="border-none rounded-none"
            columns={columns}
            data={admins}
            keyField="id"
            title="Admins"
            emptyText="No admins found"
            pagination={{ page: 1, pageSize: Math.max(total, 1), total, onChange: () => {} }}
          />
        )}
      </div>
      <AddAdminModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
      />
    </DashboardLayout>
  );
}
