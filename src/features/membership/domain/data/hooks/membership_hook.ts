import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui";
import {
  Membership,
  MembershipPayload,
} from "../response/membership_response";
import { SEED_MEMBERSHIPS } from "../seed";

const PAGE_SIZE = 10;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useMemberships() {
  const { toast } = useToast();
  const [items, setItems] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await wait(350);
      if (!cancelled) {
        setItems(SEED_MEMBERSHIPS);
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.status.toLowerCase().includes(q) ||
        m.currency.toLowerCase().includes(q),
    );
  }, [items, search]);

  const total = filtered.length;
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(
    () => ({
      totalMembers: items.reduce((sum, m) => sum + m.membersCount, 0),
      totalThisMonth: items.reduce((sum, m) => sum + m.membersThisMonth, 0),
      amountPaid: items.reduce((sum, m) => sum + m.amountPaid, 0),
    }),
    [items],
  );

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const createMembership = useCallback(
    async (payload: MembershipPayload) => {
      setIsSaving(true);
      await wait(400);
      const next: Membership = {
        ...payload,
        id: `mbr-${Date.now()}`,
        membersCount: 0,
        membersThisMonth: 0,
        amountPaid: 0,
        createdDate: new Date().toISOString(),
      };
      setItems((prev) => [next, ...prev]);
      setPage(1);
      setIsSaving(false);
      toast("Membership created", "success");
      return true;
    },
    [toast],
  );

  const updateMembership = useCallback(
    async (id: string, payload: MembershipPayload) => {
      setIsSaving(true);
      await wait(400);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...payload } : item)),
      );
      setIsSaving(false);
      toast("Membership updated", "success");
      return true;
    },
    [toast],
  );

  const removeMembership = useCallback(
    async (id: string) => {
      await wait(250);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast("Membership deleted", "success");
    },
    [toast],
  );

  return {
    memberships: pageItems,
    total,
    page,
    pageSize: PAGE_SIZE,
    isLoading,
    isSaving,
    search,
    stats,
    handleSearch,
    handlePageChange: setPage,
    createMembership,
    updateMembership,
    removeMembership,
  };
}
