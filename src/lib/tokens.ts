export const colors = {
  black: "#000000",
  white: "#FFFFFF",
  gray: {
    700: "#717171",
    200: "#E7E9EB",
    100: "#F1F1F1",
    50: "#F7F7F7",
  },
  success: "#38CB89",
  successBg: "#E8F8F1",
  danger: "#E84D52",
  dangerBg: "#FDF0F0",
  warning: "#EED202",
  warningBg: "#FEFAE0",
  orange: "#F5A623",
  orangeBg: "#FEF4E7",
} as const;

export type StatusVariant =
  | "active"
  | "inactive"
  | "pending"
  | "approved"
  | "deleted"
  | "suspended"
  | "done"
  | "published"
  | "unpublished"
  | "draft"
  | "confirmed"
  | "cancelled"
  | "revoked"
  | "unread"
  | "read";

export const statusConfig: Record<
  StatusVariant,
  { label: string; dotColor: string; textColor: string; bgColor: string }
> = {
  active: {
    label: "Active",
    dotColor: "#38CB89",
    textColor: "#166534",
    bgColor: "#E8F8F1",
  },
  inactive: {
    label: "Inactive",
    dotColor: "#717171",
    textColor: "#374151",
    bgColor: "#F1F1F1",
  },
  pending: {
    label: "Pending",
    dotColor: "#EED202",
    textColor: "#854D0E",
    bgColor: "#FEFAE0",
  },
  approved: {
    label: "Approved",
    dotColor: "#38CB89",
    textColor: "#166534",
    bgColor: "#E8F8F1",
  },
  deleted: {
    label: "Deleted",
    dotColor: "#E84D52",
    textColor: "#991B1B",
    bgColor: "#FDF0F0",
  },
  suspended: {
    label: "Suspended",
    dotColor: "#E84D52",
    textColor: "#991B1B",
    bgColor: "#FDF0F0",
  },
  done: {
    label: "Done",
    dotColor: "#38CB89",
    textColor: "#166534",
    bgColor: "#E8F8F1",
  },
  published: {
    label: "Published",
    dotColor: "#38CB89",
    textColor: "#166534",
    bgColor: "#E8F8F1",
  },
  unpublished: {
    label: "Restricted",
    dotColor: "#717171",
    textColor: "#374151",
    bgColor: "#F1F1F1",
  },
  draft: {
    label: "Draft",
    dotColor: "#717171",
    textColor: "#374151",
    bgColor: "#F1F1F1",
  },
  confirmed: {
    label: "Completed",
    dotColor: "#38CB89",
    textColor: "#166534",
    bgColor: "#E8F8F1",
  },
  cancelled: {
    label: "Cancelled",
    dotColor: "#E84D52",
    textColor: "#991B1B",
    bgColor: "#FDF0F0",
  },
  revoked: {
    label: "Revoked",
    dotColor: "#E84D52",
    textColor: "#991B1B",
    bgColor: "#FDF0F0",
  },
  unread: {
    label: "Unread",
    dotColor: "#EED202",
    textColor: "#854D0E",
    bgColor: "#FEFAE0",
  },
  read: {
    label: "Read",
    dotColor: "#38CB89",
    textColor: "#166534",
    bgColor: "#E8F8F1",
  },
};

export type Size = "xs" | "sm" | "md" | "lg";
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success";

export type UserRole = "admin" | "sub-admin" | "instructor";

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && "data" in payload) {
    const inner = (payload as { data: unknown }).data;
    if (Array.isArray(inner)) return inner as T[];
  }
  return [];
}

export function unwrapCount(payload: unknown, fallback = 0): number {
  if (payload && typeof payload === "object" && "count" in payload) {
    const count = (payload as { count?: number }).count;
    if (typeof count === "number") return count;
  }
  return fallback;
}

export function unwrapMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: string }).message;
    if (message) return message;
  }
  return fallback;
}

export function unwrapEntity<T extends object>(payload: unknown): T | null {
  if (!payload || typeof payload !== "object") return null;
  const obj = payload as Record<string, unknown>;
  if (
    obj.data &&
    typeof obj.data === "object" &&
    !Array.isArray(obj.data)
  ) {
    return obj.data as T;
  }
  return payload as T;
}
