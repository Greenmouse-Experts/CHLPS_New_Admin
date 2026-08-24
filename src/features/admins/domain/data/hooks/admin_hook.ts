"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui";
import AdminRepository from "../../repository/admin_repository";
import { CreateAdminPayload, Person } from "../response/admin_response";

export function useAdmins() {
  const { toast } = useToast();
  const repo = new AdminRepository();
  const [admins, setAdmins] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState("");

  const fetchAdmins = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await repo.getAdmins();
      if (res.success && res.data) setAdmins(res.data);
      else {
        setAdmins([]);
        toast(res.message, "danger");
      }
    } catch {
      toast("Failed to load admins", "danger");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleCreate = useCallback(
    async (payload: CreateAdminPayload) => {
      try {
        setIsCreating(true);
        const res = await repo.createAdmin(payload);
        if (res.success) {
          toast(res.message, "success");
          await fetchAdmins();
          return true;
        }
        toast(res.message, "danger");
        return false;
      } catch {
        toast("Failed to create admin", "danger");
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [fetchAdmins],
  );

  const visible = search
    ? admins.filter((a) =>
        `${a.firstName} ${a.lastName} ${a.email}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : admins;

  return {
    admins: visible,
    total: visible.length,
    isLoading,
    isCreating,
    search,
    handleSearch: setSearch,
    handleCreate,
  };
}
