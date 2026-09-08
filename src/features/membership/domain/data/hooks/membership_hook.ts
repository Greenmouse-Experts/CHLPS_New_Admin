import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui";
import {
  Membership,
  MembershipPayload,
  MembershipStatus,
  MembershipSubscriber,
  MembershipTransaction,
  MembershipStats,
} from "../response/membership_response";
import MembershipRepository from "../../repository/membership_repository";

const PAGE_SIZE = 10;

export function useMemberships() {
  const { toast } = useToast();
  const repo = useMemo(() => new MembershipRepository(), []);
  const [items, setItems] = useState<Membership[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<MembershipStats>({
    totalMembers: 0,
    totalThisMonth: 0,
    amountPaid: 0,
  });

  const loadData = useCallback(
    async (p = 1, searchQuery = search) => {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      try {
        const [listRes, statsRes] = await Promise.all([
          repo.list({
            page: p,
            pageSize: PAGE_SIZE,
            search: searchQuery.trim() || undefined,
          }),
          repo.getStats().catch(() => ({ success: false, data: undefined })),
        ]);

        if (listRes.success && listRes.data) {
          setItems(listRes.data.items ?? []);
          setTotal(listRes.data.count ?? (listRes.data.items?.length || 0));
          setPage(p);
        } else {
          setIsError(true);
          setError(listRes.message || "Failed to load memberships");
        }

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (err) {
        setIsError(true);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [repo, search],
  );

  useEffect(() => {
    loadData(1, search);
  }, [loadData, search]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      loadData(nextPage, search);
    },
    [loadData, search],
  );

  const createMembership = useCallback(
    async (payload: MembershipPayload) => {
      setIsSaving(true);
      try {
        const res = await repo.create(payload);
        if (res.success) {
          toast("Membership created successfully", "success");
          loadData(1, search);
          return true;
        } else {
          toast(res.message, "danger");
          return false;
        }
      } catch (err) {
        toast("Failed to create membership", "danger");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [loadData, repo, search, toast],
  );

  const updateMembership = useCallback(
    async (id: string, payload: Partial<MembershipPayload>) => {
      setIsSaving(true);
      try {
        const res = await repo.update(id, payload);
        if (res.success) {
          toast("Membership updated successfully", "success");
          loadData(page, search);
          return true;
        } else {
          toast(res.message, "danger");
          return false;
        }
      } catch (err) {
        toast("Failed to update membership", "danger");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [loadData, page, repo, search, toast],
  );

  const togglePublish = useCallback(
    async (id: string, currentStatus?: MembershipStatus) => {
      setIsSaving(true);
      const nextStatus: MembershipStatus =
        currentStatus === "published" ? "draft" : "published";
      try {
        const res = await repo.updateStatus(id, nextStatus);
        if (res.success) {
          toast(
            nextStatus === "published"
              ? "Membership published successfully"
              : "Membership unpublished (moved to draft)",
            "success",
          );
          loadData(page, search);
        } else {
          toast(res.message, "danger");
        }
      } catch (err) {
        toast("Failed to update membership status", "danger");
      } finally {
        setIsSaving(false);
      }
    },
    [loadData, page, repo, search, toast],
  );

  const removeMembership = useCallback(
    async (id: string) => {
      setIsSaving(true);
      try {
        const res = await repo.remove(id);
        if (res.success) {
          toast("Membership deleted successfully", "success");
          loadData(page, search);
        } else {
          toast(res.message, "danger");
        }
      } catch (err) {
        toast("Failed to delete membership", "danger");
      } finally {
        setIsSaving(false);
      }
    },
    [loadData, page, repo, search, toast],
  );

  return {
    memberships: items,
    total,
    page,
    pageSize: PAGE_SIZE,
    isLoading,
    isError,
    error,
    isSaving,
    search,
    stats,
    handleSearch,
    handlePageChange,
    createMembership,
    updateMembership,
    togglePublish,
    removeMembership,
    refetch: () => loadData(page, search),
  };
}

export function useMembershipDetail(id: string) {
  const { toast } = useToast();
  const repo = useMemo(() => new MembershipRepository(), []);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [subscribers, setSubscribers] = useState<MembershipSubscriber[]>([]);
  const [transactions, setTransactions] = useState<MembershipTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setIsError(false);
    setError(null);
    try {
      const res = await repo.getOne(id);
      if (res.success && res.data) {
        setMembership(res.data);
      } else {
        setIsError(true);
        setError(res.message || "Membership not found");
      }
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id, repo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateMembership = useCallback(
    async (payload: Partial<MembershipPayload>) => {
      if (!id) return false;
      setIsSaving(true);
      try {
        const res = await repo.update(id, payload);
        if (res.success) {
          toast("Membership updated successfully", "success");
          loadData();
          return true;
        } else {
          toast(res.message, "danger");
          return false;
        }
      } catch (err) {
        toast("Failed to update membership", "danger");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [id, loadData, repo, toast],
  );

  const togglePublish = useCallback(async () => {
    if (!membership || !id) return;
    setIsSaving(true);
    const nextStatus: MembershipStatus =
      membership.status === "published" ? "draft" : "published";

    try {
      const res = await repo.updateStatus(id, nextStatus);
      if (res.success) {
        toast(
          nextStatus === "published"
            ? "Membership published successfully"
            : "Membership unpublished (moved to draft)",
          "success",
        );
        loadData();
      } else {
        toast(res.message, "danger");
      }
    } catch (err) {
      toast("Failed to update status", "danger");
    } finally {
      setIsSaving(false);
    }
  }, [id, loadData, membership, repo, toast]);

  const removeMembership = useCallback(async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      const res = await repo.remove(id);
      if (res.success) {
        toast("Membership deleted successfully", "success");
      } else {
        toast(res.message, "danger");
      }
    } catch (err) {
      toast("Failed to delete membership", "danger");
    } finally {
      setIsSaving(false);
    }
  }, [id, repo, toast]);

  return {
    membership,
    subscribers,
    transactions,
    isLoading,
    isError,
    error,
    isSaving,
    updateMembership,
    togglePublish,
    removeMembership,
    refetch: loadData,
  };
}
