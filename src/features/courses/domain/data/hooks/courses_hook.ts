"use client";

import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useToast } from "@/components/ui";
import { RootState } from "@/lib/store/store";
import CoursesRepository from "../../repository/courses_repository";
import ProgramsRepository from "@/features/programs/domain/repository/programs_repository";
import UploadRepository from "@/features/uploads/domain/repository/upload_repository";
import { Course, CreateCoursePayload } from "../response/courses_response";
import { Program } from "@/features/programs/domain/data/response/programs_response";

const PAGE_SIZE = 20;

export function useCourses() {
  const { toast } = useToast();
  const role = useSelector((s: RootState) => s.user.userRole);
  const isAdmin = role === "admin";
  const repo = new CoursesRepository();
  const programsRepo = new ProgramsRepository();
  const uploads = new UploadRepository();

  const [courses, setCourses] = useState<Course[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    title: "",
    price: "",
    "program[id]": "",
    orderBy: "createdDate",
    sortOrder: "DESC",
  });

  const fetchCourses = useCallback(
    async (p = page, f = filters) => {
      try {
        setIsLoading(true);
        const params: Record<string, unknown> = {
          page: p,
          pageSize: PAGE_SIZE,
        };

        // Do not pass empty strings, null, or undefined query params to the API (e.g. program[id]="")
        Object.entries(f).forEach(([key, value]) => {
          if (value !== "" && value !== null && value !== undefined) {
            params[key] = value;
          }
        });

        const res = await repo.list(isAdmin, params);
        if (res.success && res.data) {
          setCourses(res.data.items);
          setCount(res.data.count);
          setPage(p);
        } else toast(res.message, "danger");
      } finally {
        setIsLoading(false);
      }
    },
    [isAdmin, page, filters],
  );

  useEffect(() => {
    fetchCourses(1, filters);
    programsRepo.list(isAdmin).then((res) => {
      if (res.success && res.data) setPrograms(res.data);
    });
  }, []);

  const createCourse = async (
    payload: Omit<CreateCoursePayload, "coverImage">,
    file: File,
  ) => {
    try {
      setBusy(true);
      const up = await uploads.upload("image", file);
      if (!up.success || !up.url) {
        toast(up.message, "danger");
        return false;
      }
      const res = await repo.create({
        ...payload,
        coverImage: up.url,
        previewUrl: null,
      });
      if (res.success) {
        toast(res.message, "success");
        await fetchCourses(1, filters);
        return true;
      }
      toast(res.message, "danger");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const updateCourse = async (
    id: string,
    payload: Partial<CreateCoursePayload>,
    file?: File | null,
  ) => {
    try {
      setBusy(true);
      let coverImage = payload.coverImage;
      if (file) {
        const up = await uploads.upload("image", file);
        if (!up.success || !up.url) {
          toast(up.message, "danger");
          return false;
        }
        coverImage = up.url;
      }
      const res = await repo.update(
        id,
        {
          ...payload,
          ...(coverImage ? { coverImage } : {}),
        },
        isAdmin,
      );
      if (res.success) {
        toast(res.message, "success");
        await fetchCourses(page, filters);
        return true;
      }
      toast(res.message, "danger");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const mutate = async (
    fn: () => Promise<{ success: boolean; message: string }>,
  ) => {
    const res = await fn();
    if (res.success) {
      toast(res.message, "success");
      await fetchCourses(page, filters);
    } else toast(res.message, "danger");
    return res.success;
  };

  return {
    courses,
    count,
    page,
    pageSize: PAGE_SIZE,
    isLoading,
    busy,
    programs,
    filters,
    isAdmin,
    setFilters,
    handlePageChange: (p: number) => fetchCourses(p, filters),
    applyFilters: (f: typeof filters) => {
      setFilters(f);
      fetchCourses(1, f);
    },
    createCourse,
    updateCourse,
    publish: (id: string, isPublished: boolean) =>
      mutate(() => repo.update(id, { isPublished }, isAdmin)),
    feature: (id: string, featured: boolean) =>
      mutate(() => repo.feature(id, featured)),
    remove: (id: string) => mutate(() => repo.remove(id)),
  };
}
