"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Divider, FilterBar, FilterOption, Modal } from "@/components/ui";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  FileQuestion,
  XCircle,
} from "lucide-react";
import {
  MembershipApplicationItem,
} from "../../domain/data/response/membership_response";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";

export interface MembershipApplicationsTabProps {
  applications: MembershipApplicationItem[];
  totalCount?: number;
  isLoading?: boolean;
  applicationQuestions?: Array<{ id?: string; question: string }>;
  onFilterChange?: (params: { status?: string; search?: string }) => void;
  onApprove: (item: any) => void;
  onDeny: (item: any) => void;
}

export function MembershipApplicationsTab({
  applications = [],
  totalCount,
  isLoading = false,
  applicationQuestions = [],
  onFilterChange,
  onApprove,
  onDeny,
}: MembershipApplicationsTabProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reviewItem, setReviewItem] = useState<MembershipApplicationItem | null>(
    null,
  );

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    onFilterChange?.({
      status: newStatus !== "all" ? newStatus : undefined,
      search: search.trim() || undefined,
    });
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    onFilterChange?.({
      status: statusFilter !== "all" ? statusFilter : undefined,
      search: newSearch.trim() || undefined,
    });
  };

  // Client-side fallback / safety filtering if onFilterChange is not provided
  const displayedApplications = useMemo(() => {
    if (onFilterChange) {
      if (!search.trim()) return applications;
      const q = search.toLowerCase();
      return applications.filter((app) => {
        const student = app.student;
        const fullName = `${student?.firstName ?? ""} ${student?.lastName ?? ""}`.toLowerCase();
        const email = (student?.email ?? "").toLowerCase();
        const phone = (student?.phone ?? "").toLowerCase();
        const ref = (app.order?.reference ?? app.orderId ?? "").toLowerCase();
        const status = (app.status ?? "").toLowerCase();

        return (
          fullName.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          ref.includes(q) ||
          status.includes(q)
        );
      });
    }

    let result = applications;
    if (statusFilter !== "all") {
      result = result.filter(
        (app) => String(app.status).toLowerCase() === statusFilter.toLowerCase(),
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((app) => {
        const student = app.student;
        const fullName = `${student?.firstName ?? ""} ${student?.lastName ?? ""}`.toLowerCase();
        const email = (student?.email ?? "").toLowerCase();
        const phone = (student?.phone ?? "").toLowerCase();
        const ref = (app.order?.reference ?? app.orderId ?? "").toLowerCase();
        const status = (app.status ?? "").toLowerCase();

        return (
          fullName.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          ref.includes(q) ||
          status.includes(q)
        );
      });
    }
    return result;
  }, [applications, onFilterChange, statusFilter, search]);

  const filterOptions: FilterOption[] = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    applications.forEach((app) => {
      const s = String(app.status).toLowerCase();
      if (s === "pending") pending++;
      else if (s === "approved" || s === "active") approved++;
      else if (s === "rejected" || s === "cancelled") rejected++;
    });

    return [
      { value: "all", label: "All", count: totalCount ?? applications.length },
      { value: "pending", label: "Pending", count: pending, badgeVariant: "warning" },
      { value: "approved", label: "Approved", count: approved, badgeVariant: "success" },
      { value: "rejected", label: "Denied", count: rejected, badgeVariant: "danger" },
    ];
  }, [applications, totalCount]);

  const columns: columnType<MembershipApplicationItem>[] = [
    {
      key: "student",
      label: "Applicant",
      render: (_, row) => {
        const student = row.student;
        const name = `${student?.firstName ?? ""} ${student?.lastName ?? ""}`.trim() || student?.email || "Unknown Applicant";

        return (
          <div className="flex items-center gap-3">
            {student?.picture ? (
              <img
                src={student.picture}
                alt=""
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#E7E9EB]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                {(student?.firstName?.[0] || name[0] || "A").toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p
                onClick={() => {
                  if (student?.id) router.push(`/students/${student.id}`);
                }}
                className="text-sm font-semibold text-base-content leading-tight hover:text-primary transition-colors cursor-pointer"
              >
                {name}
              </p>
              <p className="text-xs text-base-content/60 truncate">{student?.email || "—"}</p>
              {student?.phone && (
                <p className="text-[11px] text-base-content/40">{student.phone}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "order",
      label: "Order / Amount",
      render: (_, row) => (
        <div>
          <span className="font-mono text-xs font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded">
            {row.order?.reference || (row.orderId ? row.orderId.slice(0, 10) + "..." : "—")}
          </span>
          <p className="text-xs text-base-content/70 mt-1 font-semibold">
            {formatCurrency(Number(row.order?.amount ?? row.membership?.price ?? 0), {
              currency: row.order?.currency || row.membership?.currency || "CAD",
            })}
          </p>
        </div>
      ),
    },
    {
      key: "createdDate",
      label: "Submitted Date",
      render: (v) => (
        <span className="text-sm text-base-content/80 whitespace-nowrap">
          {v ? formatDate(v, "DD MMM YYYY") : "—"}
        </span>
      ),
    },
    {
      key: "answers",
      label: "Screening Answers",
      render: (_, row) => {
        const count = row.answers?.length ?? 0;
        if (count === 0) {
          return <span className="text-xs text-base-content/40">None</span>;
        }

        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setReviewItem(row);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary transition-colors cursor-pointer"
          >
            <FileQuestion size={13} />
            <span>{count} Answer{count > 1 ? "s" : ""}</span>
          </button>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (v, row) => {
        const s = String(v).toLowerCase();
        if (s === "approved" || s === "active") {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle size={12} className="text-emerald-600" />
              Approved
            </span>
          );
        }

        if (s === "rejected" || s === "cancelled") {
          return (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
              title={row.rejectReason || undefined}
            >
              <XCircle size={12} className="text-rose-600" />
              Denied
            </span>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Pending
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove(row);
                }}
                className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeny(row);
                }}
                className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
              >
                Deny
              </button>
            </div>
          </div>
        );
      },
    },
  ];

  const actions: Actions<MembershipApplicationItem>[] = [
    {
      key: "review_application",
      label: "Review Application",
      render: () => (
        <span className="flex items-center gap-2 text-base-content/80 font-medium">
          <Eye size={15} />
          Review Application
        </span>
      ),
      action: (row) => {
        setReviewItem(row);
      },
    },
    {
      key: "view_student",
      label: "View Student Profile",
      render: () => (
        <span className="flex items-center gap-2 text-base-content/80 font-medium">
          <Eye size={15} />
          View Student Profile
        </span>
      ),
      disabled: (row) => !row.student?.id,
      action: (row, r) => {
        if (row.student?.id) r.push(`/students/${row.student.id}`);
      },
    },
    {
      key: "approve_app",
      label: "Approve Membership",
      render: () => (
        <span className="flex items-center gap-2 text-emerald-600 font-medium">
          <CheckCircle size={15} />
          Approve Membership
        </span>
      ),
      disabled: (row) => row.status === "approved" || row.status === "active",
      action: (row) => {
        onApprove(row);
      },
    },
    {
      key: "deny_app",
      label: "Deny Membership",
      render: () => (
        <span className="flex items-center gap-2 text-rose-600 font-medium">
          <XCircle size={15} />
          Deny Membership
        </span>
      ),
      disabled: (row) => row.status === "rejected" || row.status === "cancelled",
      action: (row) => {
        onDeny(row);
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#E7E9EB] p-4 shadow-sm space-y-4">
      {/* Reusable Dynamic Filter Bar */}
      <FilterBar
        statusTabs={{
          key: "status",
          options: filterOptions,
          selectedValue: statusFilter,
          onChange: handleStatusChange,
        }}
        search={{
          value: search,
          placeholder: "Search applications...",
          onChange: handleSearchChange,
        }}
        isLoading={isLoading}
      />

      <Divider />

      <CustomTable
        ring={false}
        columns={columns}
        data={displayedApplications}
        actions={actions}
        totalCount={displayedApplications.length}
        onRowClick={(row) => setReviewItem(row)}
      />

      {/* Review Application Modal */}
      <Modal
        open={!!reviewItem}
        onClose={() => setReviewItem(null)}
        title="Application Review"
        size="md"
      >
        {reviewItem && (
          <div className="space-y-4">
            {/* Status notification banner */}
            {reviewItem.status === "approved" && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <CheckCircle className="shrink-0 text-emerald-600" size={18} />
                <div>
                  <p className="font-semibold text-emerald-900">
                    Application Approved
                  </p>
                  <p className="mt-0.5 text-emerald-700">
                    This membership application has been approved and granted active status.
                  </p>
                </div>
              </div>
            )}

            {reviewItem.status === "rejected" && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                <XCircle className="shrink-0 text-rose-600 mt-0.5" size={18} />
                <div>
                  <p className="font-semibold text-rose-900">
                    Application Denied
                  </p>
                  <p className="mt-0.5 text-rose-700 font-medium">
                    Reason: {reviewItem.rejectReason || "No specific reason recorded."}
                  </p>
                </div>
              </div>
            )}

            {reviewItem.status === "pending" && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <AlertTriangle className="shrink-0 text-amber-600" size={18} />
                <div>
                  <p className="font-semibold text-amber-900">Pending Review</p>
                  <p className="mt-0.5 text-amber-700">
                    Review the applicant's screening answers below and approve or deny this membership.
                  </p>
                </div>
              </div>
            )}

            {/* Applicant info */}
            <div className="bg-base-100 rounded-lg border border-[#E7E9EB] p-3 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                Applicant Details
              </p>
              <div className="flex items-center gap-3 pt-1">
                {reviewItem.student?.picture ? (
                  <img
                    src={reviewItem.student.picture}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                    {(reviewItem.student?.firstName?.[0] || "A").toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-base-content">
                    {reviewItem.student?.firstName} {reviewItem.student?.lastName}
                  </p>
                  <p className="text-xs text-base-content/60">
                    {reviewItem.student?.email}
                  </p>
                  {reviewItem.student?.phone && (
                    <p className="text-[11px] text-base-content/40">
                      {reviewItem.student.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Screening Answers */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                Screening Questions & Responses
              </p>
              {reviewItem.answers && reviewItem.answers.length > 0 ? (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {reviewItem.answers.map((ans, idx) => {
                    const qText =
                      applicationQuestions.find((q) => q.id === ans.questionId)?.question ||
                      `Question ${idx + 1}`;
                    return (
                      <div
                        key={ans.questionId || idx}
                        className="p-3 rounded-lg bg-base-200/50 border border-base-200 space-y-1"
                      >
                        <p className="text-xs font-semibold text-base-content">
                          {idx + 1}. {qText}
                        </p>
                        <p className="text-xs font-medium text-primary">
                          {typeof ans.answer === "boolean"
                            ? ans.answer
                              ? "Yes"
                              : "No"
                            : String(ans.answer)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-base-content/50 italic p-3 bg-base-200/30 rounded-lg">
                  No screening questions were submitted with this application.
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E7E9EB]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setReviewItem(null)}
              >
                Close
              </Button>
              {reviewItem.status === "pending" && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setReviewItem(null);
                      onDeny(reviewItem);
                    }}
                  >
                    Deny
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                    onClick={() => {
                      setReviewItem(null);
                      onApprove(reviewItem);
                    }}
                  >
                    Approve Application
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
