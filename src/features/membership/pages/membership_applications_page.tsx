"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout, StatCard } from "@/components";
import { Button, Divider, Modal, StatusBadge, Tabs } from "@/components/ui";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";
import PageLoader from "@/components/PageLoader";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Eye,
  FileQuestion,
  FileText,
  Search,
  ShieldCheck,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { useMembershipApplications } from "../domain/data/hooks/membership_hook";
import { MembershipApplicationItem } from "../domain/data/response/membership_response";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";

const STATUS_TABS = [
  { key: "all", label: "All Purchases" },
  { key: "pending", label: "Pending Review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Denied" },
];

export default function MembershipApplicationsPage() {
  const router = useRouter();
  const {
    applications,
    rawApplications,
    total,
    page,
    pageSize,
    status,
    search,
    isLoading,
    isError,
    error,
    isSaving,
    setSearch,
    handleStatusChange,
    handlePageChange,
    approveApplication,
    rejectApplication,
    refetch,
  } = useMembershipApplications();

  // Modals
  const [reviewItem, setReviewItem] =
    useState<MembershipApplicationItem | null>(null);
  const [approveItem, setApproveItem] =
    useState<MembershipApplicationItem | null>(null);
  const [denyItem, setDenyItem] = useState<MembershipApplicationItem | null>(
    null,
  );
  const [denyReason, setDenyReason] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  // Stats calculation
  const stats = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    rawApplications.forEach((app) => {
      const s = String(app.status).toLowerCase();
      if (s === "pending") pending++;
      else if (s === "approved") approved++;
      else if (s === "rejected") rejected++;
    });

    return {
      total: rawApplications.length,
      pending,
      approved,
      rejected,
    };
  }, [rawApplications]);

  const handleApprove = async () => {
    if (!approveItem) return;
    setActionBusy(true);
    try {
      const ok = await approveApplication(approveItem.id);
      if (ok) {
        setApproveItem(null);
        if (reviewItem?.id === approveItem.id) setReviewItem(null);
      }
    } finally {
      setActionBusy(false);
    }
  };

  const handleDeny = async () => {
    if (!denyItem || !denyReason.trim()) return;
    setActionBusy(true);
    try {
      const ok = await rejectApplication(denyItem.id, denyReason.trim());
      if (ok) {
        setDenyItem(null);
        setDenyReason("");
        if (reviewItem?.id === denyItem.id) setReviewItem(null);
      }
    } finally {
      setActionBusy(false);
    }
  };

  const columns: columnType<MembershipApplicationItem>[] = [
    {
      key: "student",
      label: "Applicant",
      render: (_, row) => {
        const student = row.student;
        const name =
          `${student?.firstName ?? ""} ${student?.lastName ?? ""}`.trim() ||
          student?.email ||
          "Unknown Member";
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            {student?.picture ? (
              <img
                src={student.picture}
                alt=""
                className="w-10 h-10 rounded-full object-cover border border-[#E7E9EB] shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0 flex items-center justify-center">
                {(student?.firstName?.[0] || name[0] || "U").toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-base-content leading-tight">
                {name}
              </p>
              <p className="text-xs text-base-content/60 truncate">
                {student?.email}
              </p>
              {student?.phone && (
                <p className="text-[11px] text-base-content/40">
                  {student.phone}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "membership",
      label: "Membership Plan",
      render: (_, row) => (
        <div className="min-w-[170px]">
          <p className="text-sm font-semibold text-base-content">
            {row.membership?.name || "Membership Plan"}
          </p>
          <p className="text-xs text-base-content/70">
            {formatCurrency(Number(row.membership?.price) || 0, {
              currency: row.membership?.currency || "CAD",
            })}{" "}
            {row.membership?.duration ? `• ${row.membership.duration}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "order",
      label: "Order / Payment",
      render: (_, row) => (
        <div className="min-w-[150px]">
          <span className="text-xs font-mono font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded">
            {row.order?.reference ||
              (row.orderId ? row.orderId.slice(0, 13) + "..." : "—")}
          </span>
          <p className="text-xs text-base-content/60 mt-1">
            {row.order?.amount !== undefined
              ? formatCurrency(row.order.amount, {
                  currency: row.order.currency || "CAD",
                })
              : formatCurrency(Number(row.membership?.price) || 0, {
                  currency: row.membership?.currency || "CAD",
                })}
          </p>
        </div>
      ),
    },
    {
      key: "createdDate",
      label: "Submitted Date",
      render: (v) => (
        <span className="text-xs text-base-content/80 whitespace-nowrap">
          {v ? formatDate(v, "DD MMM YYYY, hh:mm A") : "—"}
        </span>
      ),
    },
    {
      key: "answers",
      label: "Screening Answers",
      render: (_, row) => {
        const count = row.answers?.length ?? 0;
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setReviewItem(row);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-base-200 hover:bg-base-300 text-base-content/80 transition-colors"
          >
            <FileQuestion size={14} className="text-primary" />
            {count > 0
              ? `${count} Answer${count > 1 ? "s" : ""}`
              : "View Details"}
          </button>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (v, row) => {
        const s = String(v).toLowerCase();
        if (s === "approved") {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle size={12} className="text-emerald-600" />
              Approved
            </span>
          );
        }
        if (s === "rejected") {
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
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Pending
            </span>
            {/*<button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setApproveItem(row);
              }}
              className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDenyReason("");
                setDenyItem(row);
              }}
              className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors"
            >
              Deny
            </button>*/}
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
      key: "approve_app",
      label: "Approve Membership",
      render: () => (
        <span className="flex items-center gap-2 text-emerald-600 font-medium">
          <CheckCircle size={15} />
          Approve Membership
        </span>
      ),
      disabled: (row) => row.status === "approved" || row.status === "rejected",
      action: (row) => {
        setApproveItem(row);
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
      disabled: (row) => row.status === "rejected" || row.status === "approved",
      action: (row) => {
        setDenyReason("");
        setDenyItem(row);
      },
    },
    {
      key: "view_student",
      label: "View Student Profile",
      render: () => (
        <span className="flex items-center gap-2 text-base-content/80 font-medium">
          <Users size={15} />
          View Student Profile
        </span>
      ),
      disabled: (row) => !row.student?.id,
      action: (row, r) => {
        if (row.student?.id) r.push(`/students/${row.student.id}`);
      },
    },
    {
      key: "view_plan",
      label: "View Membership Plan",
      render: () => (
        <span className="flex items-center gap-2 text-base-content/80 font-medium">
          <ShieldCheck size={15} />
          View Membership Plan
        </span>
      ),
      disabled: (row) => !row.membership?.id,
      action: (row, r) => {
        if (row.membership?.id) r.push(`/membership/${row.membership.id}`);
      },
    },
  ];

  return (
    <DashboardLayout title="Membership Applications">
      <div className="space-y-6">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-base-content">
              Membership Purchases & Applications
            </h1>
            <p className="text-xs text-base-content/60 mt-0.5">
              Review and process membership applications and student purchase
              requests.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/membership")}
            leftIcon={<ArrowLeft size={16} />}
          >
            Back to Memberships
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Applications"
            value={stats.total}
            loading={isLoading}
            icon={
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <FileText size={18} />
              </div>
            }
          />
          <StatCard
            title="Pending Review"
            value={stats.pending}
            loading={isLoading}
            icon={
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
            }
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            loading={isLoading}
            icon={
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle size={18} />
              </div>
            }
          />
          <StatCard
            title="Denied"
            value={stats.rejected}
            loading={isLoading}
            icon={
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle size={18} />
              </div>
            }
          />
        </div>

        {/* Filter Tabs */}
        <Tabs
          tabs={STATUS_TABS}
          activeKey={status}
          onChange={handleStatusChange}
        />

        {/* Main Content Area */}
        <PageLoader
          query={{
            data: applications,
            isLoading,
            isError,
            error,
            refetch,
          }}
        >
          {() => (
            <div className="bg-white rounded-xl border border-[#E7E9EB] p-4 shadow-sm space-y-4">
              {/* Search & Counter */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 border border-[#E7E9EB] rounded-lg px-3 h-9 bg-white w-72 focus-within:border-primary transition-colors">
                  <Search size={15} className="text-secondary" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search applicant, plan, order ref..."
                    className="flex-1 text-xs outline-none focus:outline-none focus-visible:outline-none ring-0 bg-transparent placeholder-[#ADADAD]"
                  />
                </div>
                <div className="text-xs text-base-content/60">
                  Showing <b>{applications.length}</b> of <b>{total}</b>{" "}
                  application(s)
                </div>
              </div>

              <Divider />

              {/* Table */}
              <CustomTable
                ring={false}
                columns={columns}
                data={applications}
                actions={actions}
                totalCount={applications.length}
                onRowClick={(row) => setReviewItem(row)}
              />
            </div>
          )}
        </PageLoader>
      </div>

      {/* Review Modal */}
      <Modal
        open={!!reviewItem}
        onClose={() => setReviewItem(null)}
        title="Application Review"
        size="lg"
      >
        {reviewItem && (
          <div className="space-y-5">
            {/* Status notification banner */}
            {reviewItem.status === "approved" && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <CheckCircle className="shrink-0 text-emerald-600" size={18} />
                <div>
                  <p className="font-semibold text-emerald-900">
                    Application Approved & Membership Active
                  </p>
                  <p className="mt-0.5 text-emerald-700">
                    Approved{" "}
                    {reviewItem.reviewedAt
                      ? formatDate(
                          reviewItem.reviewedAt,
                          "DD MMM YYYY, hh:mm A",
                        )
                      : ""}
                    . Certificate has been issued.
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
                    Reason:{" "}
                    {reviewItem.rejectReason || "No specific reason recorded."}
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
                    Review the applicant's screening answers below and approve
                    or deny this membership.
                  </p>
                </div>
              </div>
            )}

            {/* Applicant & Plan Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-base-100 rounded-lg border border-[#E7E9EB] p-3 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                  Applicant Information
                </p>
                <div className="flex items-center gap-3 pt-1">
                  {reviewItem.student?.picture ? (
                    <img
                      src={reviewItem.student.picture}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-base flex items-center justify-center">
                      {(
                        reviewItem.student?.firstName?.[0] || "U"
                      ).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-base-content">
                      {reviewItem.student?.firstName}{" "}
                      {reviewItem.student?.lastName}
                    </p>
                    <p className="text-xs text-base-content/70">
                      {reviewItem.student?.email}
                    </p>
                    <p className="text-xs text-base-content/50">
                      {reviewItem.student?.phone || "No phone"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-base-100 rounded-lg border border-[#E7E9EB] p-3 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                  Membership Plan
                </p>
                <div className="pt-1">
                  <p className="text-sm font-bold text-base-content">
                    {reviewItem.membership?.name}
                  </p>
                  <p className="text-xs font-semibold text-primary mt-0.5">
                    {formatCurrency(Number(reviewItem.membership?.price) || 0, {
                      currency: reviewItem.membership?.currency || "CAD",
                    })}{" "}
                    {reviewItem.membership?.duration
                      ? `• ${reviewItem.membership.duration}`
                      : ""}
                  </p>
                  <p className="text-xs text-base-content/60 mt-1 line-clamp-2">
                    {reviewItem.membership?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Screening Questions & Answers */}
            <div className="bg-base-200/50 rounded-lg p-4 border border-base-200 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-2">
                  <FileQuestion size={16} className="text-primary" />
                  Screening Questionnaire Answers
                </p>
                <span className="text-xs text-base-content/50">
                  {reviewItem.answers?.length ?? 0} question(s) answered
                </span>
              </div>

              {reviewItem.answers && reviewItem.answers.length > 0 ? (
                <div className="space-y-3 pt-1">
                  {reviewItem.answers.map((ans, idx) => {
                    const qText =
                      reviewItem.membership?.applicationQuestions?.find(
                        (q) => q.id === ans.questionId,
                      )?.question || `Question ${idx + 1}`;
                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-lg p-3 border border-[#E7E9EB] space-y-1"
                      >
                        <p className="text-xs font-semibold text-base-content">
                          <span className="text-primary mr-1">Q{idx + 1}:</span>{" "}
                          {qText}
                        </p>
                        <p className="text-xs font-bold text-emerald-700">
                          <span className="text-base-content/50 font-normal mr-1">
                            Answer:
                          </span>{" "}
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
                <p className="text-xs text-base-content/60 italic py-2">
                  No screening questionnaire was required for this membership.
                </p>
              )}
            </div>

            {/* Footer action buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-base-200">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setReviewItem(null)}
              >
                Close
              </Button>
              {reviewItem.status === "pending" && (
                <>
                  <Button
                    variant="danger"
                    size="md"
                    onClick={() => {
                      setDenyReason("");
                      setDenyItem(reviewItem);
                    }}
                  >
                    Deny Application
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="bg-emerald-600 hover:bg-emerald-700 border-none text-white"
                    onClick={() => setApproveItem(reviewItem)}
                  >
                    Approve Membership
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Approve Confirmation Modal */}
      <Modal
        open={!!approveItem}
        onClose={() => !actionBusy && setApproveItem(null)}
        title="Approve Membership"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            <CheckCircle
              className="shrink-0 text-emerald-600 mt-0.5"
              size={18}
            />
            <div>
              <p className="font-semibold text-emerald-900">
                Activate Membership & Issue Certificate
              </p>
              <p className="mt-0.5 text-emerald-700">
                Approving will immediately grant this member active access and
                generate their official membership certificate.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm bg-base-100 rounded-lg border border-[#E7E9EB] p-3">
            <div className="flex justify-between items-center py-1 border-b border-base-200">
              <span className="text-xs text-base-content/60">Applicant</span>
              <span className="font-semibold text-base-content">
                {approveItem?.student?.firstName}{" "}
                {approveItem?.student?.lastName}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-base-200">
              <span className="text-xs text-base-content/60">Email</span>
              <span className="text-xs text-base-content">
                {approveItem?.student?.email}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-base-content/60">Plan</span>
              <span className="font-semibold text-base-content">
                {approveItem?.membership?.name}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="md"
              disabled={actionBusy}
              onClick={() => setApproveItem(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={actionBusy}
              onClick={handleApprove}
              className="bg-emerald-600 hover:bg-emerald-700 border-none text-white"
            >
              Approve & Activate
            </Button>
          </div>
        </div>
      </Modal>

      {/* Deny Modal */}
      <Modal
        open={!!denyItem}
        onClose={() => !actionBusy && setDenyItem(null)}
        title="Deny Membership Application"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertTriangle
              className="shrink-0 text-rose-600 mt-0.5"
              size={18}
            />
            <div>
              <p className="font-semibold text-rose-900">
                Deny Membership Application
              </p>
              <p className="mt-0.5 text-rose-700">
                Denying will reject the student membership application. Please
                provide a clear reason for the applicant.
              </p>
            </div>
          </div>

          <div className="space-y-1 text-sm bg-base-100 rounded-lg border border-[#E7E9EB] p-3">
            <div className="flex justify-between items-center py-1 border-b border-base-200">
              <span className="text-xs text-base-content/60">Applicant</span>
              <span className="font-semibold text-base-content">
                {denyItem?.student?.firstName} {denyItem?.student?.lastName}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-base-content/60">Email</span>
              <span className="text-xs text-base-content">
                {denyItem?.student?.email}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-base-content">
              Reason for Denial <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              placeholder="e.g. Applicant did not meet minimum experience criteria or documentation was incomplete..."
              className="w-full text-xs rounded-lg border border-[#E7E9EB] p-3 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="md"
              disabled={actionBusy}
              onClick={() => {
                setDenyItem(null);
                setDenyReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              loading={actionBusy}
              disabled={!denyReason.trim() || actionBusy}
              onClick={handleDeny}
            >
              Deny Application
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
