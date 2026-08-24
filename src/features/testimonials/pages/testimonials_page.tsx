"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { DashboardLayout } from "@/components";
import { Button, ConfirmModal, StatusBadge, useToast } from "@/components/ui";
import { RootState } from "@/lib/store/store";
import TestimonialsRepository from "../domain/repository/testimonials_repository";
import { Testimonial } from "../domain/data/response/testimonials_response";

export default function TestimonialsPage() {
  const { toast } = useToast();
  const role = useSelector((s: RootState) => s.user.userRole);
  const isAdmin = role === "admin";
  const repo = new TestimonialsRepository();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{ id: string; type: string } | null>(null);

  const load = async (p = 1) => {
    setLoading(true);
    const res = await repo.list(isAdmin, p);
    if (res.success && res.data) { setItems(res.data.items); setCount(res.data.count); setPage(p); }
    else toast(res.message, "danger");
    setLoading(false);
  };
  useEffect(() => { load(1); }, [isAdmin]);

  return (
    <DashboardLayout title="Testimonials">
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && <div className="h-40 rounded-xl skeleton sm:col-span-2" />}
        {!loading && items.length === 0 && <p className="text-sm text-[#717171]">No testimonials.</p>}
        {items.map((t) => (
          <div key={t.id} className="bg-white rounded-xl border border-[#E7E9EB] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm overflow-hidden">
                {t.user?.picture ? (
                   
                  <img src={t.user.picture} alt="" className="w-full h-full object-cover" />
                ) : (t.user?.firstName?.[0] ?? "T")}
              </div>
              <div>
                <p className="text-sm font-medium">{t.user?.firstName} {t.user?.lastName}</p>
                <p className="text-xs text-[#717171]">{t.user?.email}</p>
              </div>
            </div>
            <p className="text-sm text-[#717171] mb-3">{t.testimony}</p>
            {isAdmin && (
              <div className="flex items-center justify-between">
                <StatusBadge status={t.isPublished ? "published" : "unpublished"} />
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setConfirm({ id: t.id, type: t.isPublished ? "unpublish" : "publish" })}>
                    {t.isPublished ? "Retract" : "Publish"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirm({ id: t.id, type: "delete" })}>Delete</Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {count > 10 && (
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" disabled={page === 1} onClick={() => load(page - 1)}>Prev</Button>
          <Button variant="outline" onClick={() => load(page + 1)}>Next</Button>
        </div>
      )}
      <ConfirmModal open={!!confirm} onClose={() => setConfirm(null)} title="Confirm" description="Apply this action?"
        variant={confirm?.type === "delete" ? "danger" : "primary"}
        onConfirm={async () => {
          if (!confirm) return;
          if (confirm.type === "delete") await repo.remove(confirm.id);
          else await repo.setPublished(confirm.id, confirm.type === "publish");
          setConfirm(null); load(page);
        }} />
    </DashboardLayout>
  );
}
