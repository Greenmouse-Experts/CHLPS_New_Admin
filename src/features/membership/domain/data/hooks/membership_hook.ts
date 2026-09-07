import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui";
import {
  Membership,
  MembershipPayload,
  MembershipStatus,
  MembershipSubscriber,
  MembershipTransaction,
} from "../response/membership_response";
import { SEED_MEMBERSHIPS, SEED_SUBSCRIBERS, SEED_TRANSACTIONS } from "../seed";

const PAGE_SIZE = 10;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Global in-memory cache to sync state across views during session
let memoryMemberships: Membership[] = [...SEED_MEMBERSHIPS];
let memorySubscribers: MembershipSubscriber[] = [...SEED_SUBSCRIBERS];
let memoryTransactions: MembershipTransaction[] = [...SEED_TRANSACTIONS];
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function useMemberships() {
  const { toast } = useToast();
  const [items, setItems] = useState<Membership[]>(memoryMemberships);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await wait(300);
      if (!cancelled) {
        setItems([...memoryMemberships]);
        setIsLoading(false);
      }
    })();

    const updateState = () => {
      setItems([...memoryMemberships]);
    };
    listeners.add(updateState);

    return () => {
      cancelled = true;
      listeners.delete(updateState);
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
      await wait(350);
      const next: Membership = {
        ...payload,
        id: `mbr-${Date.now()}`,
        membersCount: 0,
        membersThisMonth: 0,
        amountPaid: 0,
        createdDate: new Date().toISOString(),
      };
      memoryMemberships = [next, ...memoryMemberships];
      notifyListeners();
      setPage(1);
      setIsSaving(false);
      toast("Membership created successfully", "success");
      return true;
    },
    [toast],
  );

  const updateMembership = useCallback(
    async (id: string, payload: MembershipPayload) => {
      setIsSaving(true);
      await wait(350);
      memoryMemberships = memoryMemberships.map((item) =>
        item.id === id ? { ...item, ...payload } : item,
      );
      notifyListeners();
      setIsSaving(false);
      toast("Membership updated successfully", "success");
      return true;
    },
    [toast],
  );

  const togglePublish = useCallback(
    async (id: string) => {
      const currentItem = memoryMemberships.find((item) => item.id === id);
      if (!currentItem) return;

      setIsSaving(true);
      await wait(250);
      const nextStatus: MembershipStatus =
        currentItem.status === "published" ? "draft" : "published";

      memoryMemberships = memoryMemberships.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item,
      );
      notifyListeners();
      setIsSaving(false);
      toast(
        nextStatus === "published"
          ? "Membership published successfully"
          : "Membership unpublished (moved to draft)",
        "success",
      );
    },
    [toast],
  );

  const removeMembership = useCallback(
    async (id: string) => {
      await wait(250);
      memoryMemberships = memoryMemberships.filter((item) => item.id !== id);
      notifyListeners();
      toast("Membership deleted successfully", "success");
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
    togglePublish,
    removeMembership,
  };
}

export function useMembershipDetail(id: string) {
  const { toast } = useToast();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [subscribers, setSubscribers] = useState<MembershipSubscriber[]>([]);
  const [transactions, setTransactions] = useState<MembershipTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(() => {
    const found = memoryMemberships.find((m) => m.id === id) || null;
    const subs = memorySubscribers.filter((s) => s.membershipId === id);
    const trxs = memoryTransactions.filter((t) => t.membershipId === id);

    setMembership(found);
    setSubscribers(subs);
    setTransactions(trxs);
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      await wait(300);
      if (!cancelled) {
        loadData();
      }
    })();

    listeners.add(loadData);
    return () => {
      cancelled = true;
      listeners.delete(loadData);
    };
  }, [id, loadData]);

  const updateMembership = useCallback(
    async (payload: MembershipPayload) => {
      setIsSaving(true);
      await wait(350);
      memoryMemberships = memoryMemberships.map((item) =>
        item.id === id ? { ...item, ...payload } : item,
      );
      notifyListeners();
      setIsSaving(false);
      toast("Membership updated successfully", "success");
      return true;
    },
    [id, toast],
  );

  const togglePublish = useCallback(async () => {
    if (!membership) return;
    setIsSaving(true);
    await wait(250);
    const nextStatus: MembershipStatus =
      membership.status === "published" ? "draft" : "published";
    memoryMemberships = memoryMemberships.map((item) =>
      item.id === id ? { ...item, status: nextStatus } : item,
    );
    notifyListeners();
    setIsSaving(false);
    toast(
      nextStatus === "published"
        ? "Membership published successfully"
        : "Membership unpublished (moved to draft)",
      "success",
    );
  }, [id, membership, toast]);

  const removeMembership = useCallback(async () => {
    await wait(250);
    memoryMemberships = memoryMemberships.filter((item) => item.id !== id);
    notifyListeners();
    toast("Membership deleted successfully", "success");
  }, [id, toast]);

  return {
    membership,
    subscribers,
    transactions,
    isLoading,
    isSaving,
    updateMembership,
    togglePublish,
    removeMembership,
    reload: loadData,
  };
}
