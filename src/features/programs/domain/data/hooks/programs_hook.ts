"use client";

import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useToast } from "@/components/ui";
import { RootState } from "@/lib/store/store";
import ProgramsRepository from "../../repository/programs_repository";
import UploadRepository from "@/features/uploads/domain/repository/upload_repository";
import {
  Program,
  UpdateProgramPayload,
} from "../response/programs_response";

export function usePrograms() {
  const { toast } = useToast();
  const role = useSelector((s: RootState) => s.user.userRole);
  const repo = new ProgramsRepository();
  const uploads = new UploadRepository();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const fetchPrograms = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await repo.list(role === "admin");
      if (res.success && res.data) setPrograms(res.data);
      else toast(res.message, "danger");
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const createProgram = async (title: string, file?: File | null) => {
    try {
      setBusy(true);
      let coverImage: string | null = null;
      if (file) {
        const up = await uploads.upload("image", file);
        if (!up.success) {
          toast(up.message, "danger");
          return false;
        }
        coverImage = up.url;
      }
      const res = await repo.create({ title, coverImage });
      if (res.success) {
        toast(res.message, "success");
        await fetchPrograms();
        return true;
      }
      toast(res.message, "danger");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const updateProgram = async (id: string, payload: UpdateProgramPayload) => {
    try {
      setBusy(true);
      const res = await repo.update(id, payload);
      if (res.success) {
        toast(res.message, "success");
        await fetchPrograms();
        return true;
      }
      toast(res.message, "danger");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const deleteProgram = async (id: string) => {
    try {
      setBusy(true);
      const res = await repo.remove(id);
      if (res.success) {
        toast(res.message, "success");
        await fetchPrograms();
        return true;
      }
      toast(res.message, "danger");
      return false;
    } finally {
      setBusy(false);
    }
  };

  return { programs, isLoading, busy, createProgram, updateProgram, deleteProgram };
}
