"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components";
import { Button, Modal, StatusBadge, useToast } from "@/components/ui";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";
import { SearchNormal1, Sms, Call, Clock, User, Category } from "iconsax-react";
import SupportRepository from "../domain/repository/support_repository";
import { ContactMessage } from "../domain/data/response/support_response";
import { formatDate } from "@/utils/helper/formate_date";
import { getInitials } from "@/utils/helper/formate_name";
import { getAvatarColor } from "@/utils/avatar.colors";

function displayName(item: ContactMessage) {
  if (item.name) return item.name;
  return `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim() || "—";
}

function DetailRow({
  icon,
  label,
  children,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border border-base-300 bg-base-100/60 p-3 ${className ?? ""}`}
    >
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-base-200 text-base-content/60">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-2xs font-semibold uppercase tracking-wide text-base-content/50">
          {label}
        </p>
        <div className="mt-0.5 text-sm font-medium break-words text-base-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function SupportPage() {
  const { toast } = useToast();
  const repo = new SupportRepository();
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [markingRead, setMarkingRead] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await repo.list();
    if (res.success && res.data) setItems(res.data);
    else toast(res.message, "danger");
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((item) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return `${displayName(item)} ${item.email} ${item.interestedIn}`
      .toLowerCase()
      .includes(q);
  });

  const columns: columnType<ContactMessage>[] = [
    { key: "name", label: "Name", render: (_, r) => displayName(r) },
    { key: "email", label: "Email" },
    { key: "interestedIn", label: "Interested in", render: (v) => v || "—" },
    {
      key: "createdDate",
      label: "Date",
      render: (_, r) => formatDate(r.createdDate || r.createdAt, "DD MMM YYYY"),
    },
    {
      key: "isRead",
      label: "Status",
      render: (v) => <StatusBadge status={v ? "read" : "unread"} />,
    },
  ];

  const actions: Actions<ContactMessage>[] = [
    {
      key: "view",
      label: "View",
      action: (row) => setSelected(row),
    },
  ];

  const handleMarkRead = async () => {
    if (!selected) return;
    setMarkingRead(true);
    try {
      const res = await repo.markRead(selected.id);
      if (res.success) {
        toast(res.message, "success");
        setSelected({ ...selected, isRead: true });
        load();
      } else {
        toast(res.message, "danger");
      }
    } finally {
      setMarkingRead(false);
    }
  };

  const senderName = selected ? displayName(selected) : "";
  const avatar = getAvatarColor(senderName || "user");

  return (
    <DashboardLayout title="Support">
      <div className="bg-white rounded-md border border-[#F0F0F0] pt-4">
        <div className="flex items-center justify-between px-4 pb-3">
          <h2 className="font-semibold">Contact Messages</h2>
          <div className="flex items-center gap-2 border border-[#E7E9EB] rounded-lg px-3 h-9 w-64">
            <SearchNormal1 size={13} color="#717171" />
            <input
              className="flex-1 text-xs outline-none focus:outline-none focus-visible:outline-none ring-0 bg-transparent"
              placeholder="Search by name, email or interest"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        ) : (
          <CustomTable
            ring={false}
            columns={columns}
            data={filtered}
            actions={actions}
          />
        )}
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Message details"
        size="lg"
        scrollable
      >
        {selected && (
          <div className="space-y-5">
            {/* Sender header */}
            <div className="flex items-start gap-3">
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-semibold"
                style={{ backgroundColor: avatar.bg, color: avatar.text }}
              >
                {getInitials(senderName, 2) || "?"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-base-content">
                  {senderName}
                </p>
                <p className="truncate text-xs text-base-content/60">
                  {selected.email || "—"}
                </p>
              </div>
              <StatusBadge
                status={selected.isRead ? "read" : "unread"}
                size="md"
                className="shrink-0"
              />
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailRow
                icon={<Sms size={15} />}
                label="Email"
                className="sm:col-span-1"
              >
                {selected.email ? (
                  <a
                    href={`mailto:${selected.email}`}
                    className="link link-hover break-all"
                  >
                    {selected.email}
                  </a>
                ) : (
                  "—"
                )}
              </DetailRow>

              <DetailRow icon={<Call size={15} />} label="Phone">
                {selected.phone ? (
                  <a href={`tel:${selected.phone}`} className="link link-hover">
                    {selected.phone}
                  </a>
                ) : (
                  "—"
                )}
              </DetailRow>

              <DetailRow icon={<Category size={15} />} label="Interested in">
                {selected.interestedIn ? (
                  <span className="badge badge-soft badge-primary badge-sm align-middle">
                    {selected.interestedIn}
                  </span>
                ) : (
                  "—"
                )}
              </DetailRow>

              <DetailRow icon={<Clock size={15} />} label="Received">
                {formatDate(
                  selected.createdDate || selected.createdAt,
                  "DD MMM YYYY, h:mm A",
                )}
              </DetailRow>
            </div>

            {/* Message body */}
            <div>
              <p className="mb-2 flex items-center gap-2 text-2xs font-semibold uppercase tracking-wide text-base-content/50">
                <User size={13} /> Message
              </p>
              <div className="rounded-xl border border-base-300 bg-base-100/60 p-4">
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-base-content">
                  {selected.message?.trim() || "No message content."}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => setSelected(null)}>
            Close
          </Button>
          {selected && !selected.isRead && (
            <Button loading={markingRead} onClick={handleMarkRead}>
              Mark as read
            </Button>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
}
