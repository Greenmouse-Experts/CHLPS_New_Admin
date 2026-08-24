"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui";
import StudentsRepository from "../../repository/students_repository";
import { Student } from "../response/students_response";

export function useStudents() {
  const { toast } = useToast();
  const repo = new StudentsRepository();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await repo.getStudents();
      if (res.success && res.data) setStudents(res.data);
      else {
        setStudents([]);
        toast(res.message, "danger");
      }
    } catch {
      toast("Failed to load students", "danger");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const visible = search
    ? students.filter((s) =>
        `${s.firstName} ${s.lastName} ${s.email}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : students;

  return { students: visible, total: visible.length, isLoading, search, handleSearch: setSearch };
}
