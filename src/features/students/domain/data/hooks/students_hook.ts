"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui";
import StudentsRepository from "../../repository/students_repository";
import { Student } from "../response/students_response";

const PAGE_SIZE = 10;

export function useStudents() {
  const { toast } = useToast();
  const repo = useMemo(() => new StudentsRepository(), []);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      const res = await repo.getStudents();
      if (res.success && res.data) {
        setStudents(res.data);
      } else {
        setStudents([]);
        setIsError(true);
        setError(res.message || "Failed to load students");
        toast(res.message, "danger");
      }
    } catch (err) {
      setIsError(true);
      setError(err);
      toast("Failed to load students", "danger");
    } finally {
      setIsLoading(false);
    }
  }, [repo, toast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const visible = useMemo(() => {
    if (!search.trim()) return students;
    const query = search.toLowerCase();
    return students.filter((s) =>
      `${s.firstName ?? ""} ${s.lastName ?? ""} ${s.email ?? ""} ${s.phone ?? ""}`
        .toLowerCase()
        .includes(query),
    );
  }, [students, search]);

  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return visible.slice(start, start + PAGE_SIZE);
  }, [visible, page]);

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return {
    students: paginatedStudents,
    rawStudents: students,
    total: visible.length,
    isLoading,
    isError,
    error,
    search,
    page,
    pageSize: PAGE_SIZE,
    handleSearch,
    handlePageChange,
    refetch: fetchStudents,
  };
}
