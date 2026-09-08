import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui";
import {
  EventItem,
  EventPayload,
  EventStats,
  EventStatus,
} from "../response/events_response";
import EventsRepository from "../../repository/events_repository";

const PAGE_SIZE = 10;

export function useEvents() {
  const { toast } = useToast();
  const repo = useMemo(() => new EventsRepository(), []);
  const [items, setItems] = useState<EventItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<EventStats>({
    totalEvents: 0,
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
          setError(listRes.message || "Failed to load events");
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

  const createEvent = useCallback(
    async (payload: EventPayload) => {
      setIsSaving(true);
      try {
        const res = await repo.create(payload);
        if (res.success) {
          toast("Event created successfully", "success");
          loadData(1, search);
          return true;
        } else {
          toast(res.message, "danger");
          return false;
        }
      } catch (err) {
        toast("Failed to create event", "danger");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [loadData, repo, search, toast],
  );

  const updateEvent = useCallback(
    async (id: string, payload: Partial<EventPayload>) => {
      setIsSaving(true);
      try {
        const res = await repo.update(id, payload);
        if (res.success) {
          toast("Event updated successfully", "success");
          loadData(page, search);
          return true;
        } else {
          toast(res.message, "danger");
          return false;
        }
      } catch (err) {
        toast("Failed to update event", "danger");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [loadData, page, repo, search, toast],
  );

  const togglePublish = useCallback(
    async (id: string, currentStatus?: EventStatus) => {
      setIsSaving(true);
      const nextStatus: EventStatus =
        currentStatus === "published" ? "draft" : "published";

      try {
        const res = await repo.updateStatus(id, nextStatus);
        if (res.success) {
          toast(
            nextStatus === "published"
              ? "Event published"
              : "Event unpublished",
            "success",
          );
          loadData(page, search);
        } else {
          toast(res.message, "danger");
        }
      } catch (err) {
        toast("Failed to update status", "danger");
      } finally {
        setIsSaving(false);
      }
    },
    [loadData, page, repo, search, toast],
  );

  const removeEvent = useCallback(
    async (id: string) => {
      setIsSaving(true);
      try {
        const res = await repo.remove(id);
        if (res.success) {
          toast("Event deleted successfully", "success");
          loadData(page, search);
        } else {
          toast(res.message, "danger");
        }
      } catch (err) {
        toast("Failed to delete event", "danger");
      } finally {
        setIsSaving(false);
      }
    },
    [loadData, page, repo, search, toast],
  );

  return {
    events: items,
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
    createEvent,
    updateEvent,
    togglePublish,
    removeEvent,
    refetch: () => loadData(page, search),
  };
}
