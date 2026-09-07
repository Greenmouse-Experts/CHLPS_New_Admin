import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui";
import { EventItem, EventPayload } from "../response/events_response";
import { SEED_EVENTS } from "../seed";
import EventsRepository from "../../repository/events_repository";

const PAGE_SIZE = 10;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isSameMonth(dateStr: string, ref = new Date()) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return false;
  return (
    date.getFullYear() === ref.getFullYear() &&
    date.getMonth() === ref.getMonth()
  );
}

export function useEvents() {
  const { toast } = useToast();
  const repo = useMemo(() => new EventsRepository(), []);
  const [items, setItems] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await wait(350);
      if (!cancelled) {
        setItems(SEED_EVENTS);
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
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.format.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        item.organizerName.toLowerCase().includes(q),
    );
  }, [items, search]);

  const total = filtered.length;
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(
    () => ({
      totalEvents: items.length,
      totalThisMonth: items.filter((item) => isSameMonth(item.startDate))
        .length,
      amountPaid: items.reduce((sum, item) => sum + item.amountPaid, 0),
    }),
    [items],
  );

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const createEvent = useCallback(
    async (payload: EventPayload) => {
      setIsSaving(true);
      await wait(400);
      try {
        await repo.create(payload);
      } catch {
        /* fallback */
      }
      const next: EventItem = {
        ...payload,
        id: `evt-${Date.now()}`,
        attendeesCount: 0,
        attendeesThisMonth: 0,
        amountPaid: 0,
        createdDate: new Date().toISOString(),
      };
      setItems((prev) => [next, ...prev]);
      setPage(1);
      setIsSaving(false);
      toast("Event created", "success");
      return true;
    },
    [repo, toast],
  );

  const updateEvent = useCallback(
    async (id: string, payload: EventPayload) => {
      setIsSaving(true);
      await wait(400);
      try {
        await repo.update(id, payload);
      } catch {
        /* fallback */
      }
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...payload } : item)),
      );
      setIsSaving(false);
      toast("Event updated", "success");
      return true;
    },
    [repo, toast],
  );

  const togglePublish = useCallback(
    async (id: string) => {
      const current = items.find((item) => item.id === id);
      const nextStatus =
        current?.status === "published" ? "draft" : "published";

      setIsSaving(true);
      try {
        // PATCH /events/:id/status with body { status: "published" | "draft" }
        await repo.updateStatus(id, nextStatus);
      } catch {
        /* fallback */
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: nextStatus } : item,
        ),
      );
      setIsSaving(false);
      toast(
        nextStatus === "published" ? "Event published" : "Event unpublished",
        "success",
      );
    },
    [items, repo, toast],
  );

  const removeEvent = useCallback(
    async (id: string) => {
      await wait(250);
      try {
        await repo.remove(id);
      } catch {
        /* fallback */
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast("Event deleted", "success");
    },
    [repo, toast],
  );

  return {
    events: pageItems,
    total,
    page,
    pageSize: PAGE_SIZE,
    isLoading,
    isSaving,
    search,
    stats,
    handleSearch,
    handlePageChange: setPage,
    createEvent,
    updateEvent,
    togglePublish,
    removeEvent,
  };
}
