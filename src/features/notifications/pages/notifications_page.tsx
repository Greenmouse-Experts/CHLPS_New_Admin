"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components";
import { Button, Tabs, useToast } from "@/components/ui";
import NotificationsRepository from "../domain/repository/notifications_repository";
import { AppNotification } from "../domain/data/response/notifications_response";
import { formatRelativeTime } from "@/utils/helper/formate_date";

export default function NotificationsPage() {
  const { toast } = useToast();
  const repo = new NotificationsRepository();
  const [tab, setTab] = useState<"all" | "read" | "unread">("all");
  const [items, setItems] = useState<AppNotification[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async (t = tab, p = 1) => {
    setLoading(true);
    const res = await repo.list(t, p);
    if (res.success && res.data) { setItems(res.data.items); setCount(res.data.count); setPage(p); }
    else toast(res.message, "danger");
    setLoading(false);
  };

  useEffect(() => { load(tab, 1); }, [tab]);

  return (
    <DashboardLayout title="Notifications">
      <div className="flex items-center justify-between mb-4">
        <Tabs
          tabs={[
            { key: "all", label: "All" },
            { key: "unread", label: "Unread" },
            { key: "read", label: "Read" },
          ]}
          activeKey={tab}
          onChange={(k) => setTab(k as typeof tab)}
        />
        {tab === "unread" && (
          <Button size="sm" variant="outline" onClick={async () => {
            const res = await repo.markAll();
            if (res.success) { toast(res.message, "success"); load(tab, 1); }
            else toast(res.message, "danger");
          }}>Mark all as read</Button>
        )}
      </div>
      <div className="space-y-2">
        {loading && <div className="h-24 rounded-xl skeleton" />}
        {!loading && items.length === 0 && <p className="text-sm text-[#717171]">No notifications.</p>}
        {items.map((n) => (
          <button
            key={n.id}
            className={`w-full text-left bg-white rounded-xl border p-4 ${n.read ? "border-[#E7E9EB]" : "border-black"}`}
            onClick={async () => {
              if (!n.read) {
                await repo.markRead(n.id);
                load(tab, page);
              }
            }}
          >
            <p className="text-sm font-medium">{n.title || "Notification"}</p>
            <p className="text-sm text-[#717171] mt-1">{n.body}</p>
            <p className="text-xs text-[#717171] mt-2">{formatRelativeTime(n.createdDate)}</p>
          </button>
        ))}
      </div>
      {count > 10 && (
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" disabled={page === 1} onClick={() => load(tab, page - 1)}>Prev</Button>
          <Button variant="outline" onClick={() => load(tab, page + 1)}>Next</Button>
        </div>
      )}
    </DashboardLayout>
  );
}
