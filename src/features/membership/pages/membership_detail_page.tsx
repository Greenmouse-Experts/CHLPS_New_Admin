"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout, StatCard } from "@/components";
import {
  Button,
  ConfirmModal,
  Modal,
  StatusBadge,
  Tabs,
} from "@/components/ui";
import PopUp, { Actions } from "@/components/tables/pop-up";
import PageLoader from "@/components/PageLoader";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Pencil,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { useMembershipDetail } from "../domain/data/hooks/membership_hook";
import {
  MembershipSubscriber,
  MembershipTransaction,
} from "../domain/data/response/membership_response";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";
import {
  MembershipOverviewTab,
  MembershipMembersTab,
  MembershipApplicationsTab,
  MembershipTransactionsTab,
} from "../components/tabs";

export default function MembershipDetailPage({
  membershipId,
}: {
  membershipId: string;
}) {
  const router = useRouter();
  const {
    membership,
    subscribers,
    subscribersCount,
    isSubsLoading,
    fetchSubscribers,
    applications,
    applicationsCount,
    isAppsLoading,
    fetchApplications,
    transactions,
    isLoading,
    isError,
    error,
    isSaving,
    togglePublish,
    removeMembership,
    approveApplication,
    rejectApplication,
    cancelStudentMembership,
    cancelOrder,
    refetch,
  } = useMembershipDetail(membershipId);

  const [activeTab, setActiveTab] = useState("overview");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [headerMenuIndex, setHeaderMenuIndex] = useState<number | null>(null);

  // Approval / Denial modal states
  const [approveModalItem, setApproveModalItem] = useState<any>(null);
  const [denyModalItem, setDenyModalItem] = useState<any>(null);
  const [denyReason, setDenyReason] = useState("");
  const [cancelOrderTarget, setCancelOrderTarget] =
    useState<MembershipTransaction | null>(null);
  const [cancelSubTarget, setCancelSubTarget] =
    useState<MembershipSubscriber | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  const handleApprove = async () => {
    if (!approveModalItem) return;
    setActionBusy(true);
    try {
      const appId = approveModalItem.applicationId || approveModalItem.id;
      if (appId) {
        await approveApplication(appId);
      }
      setApproveModalItem(null);
    } finally {
      setActionBusy(false);
    }
  };

  const handleDeny = async () => {
    if (!denyModalItem || !denyReason.trim()) return;
    setActionBusy(true);
    try {
      const appId = denyModalItem.applicationId || denyModalItem.id;
      if (appId) {
        await rejectApplication(appId, denyReason.trim());
      }
      setDenyModalItem(null);
      setDenyReason("");
    } finally {
      setActionBusy(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelOrderTarget?.orderNumber) return;
    setActionBusy(true);
    try {
      await cancelOrder(cancelOrderTarget.orderNumber);
      setCancelOrderTarget(null);
    } finally {
      setActionBusy(false);
    }
  };

  const handleCancelSub = async () => {
    if (!cancelSubTarget?.studentMembershipId) return;
    setActionBusy(true);
    try {
      await cancelStudentMembership(cancelSubTarget.studentMembershipId);
      setCancelSubTarget(null);
    } finally {
      setActionBusy(false);
    }
  };

  // Actions for header pop-up
  const headerActions: Actions[] = [
    {
      key: "edit",
      label: "Edit Plan",
      action: () => router.push(`/membership/edit/${membershipId}`),
    },
    {
      key: "toggle_publish",
      label: "Toggle Publish Status",
      render: () => (
        <span
          className={
            membership?.status === "published"
              ? "text-amber-600 font-medium"
              : "text-emerald-600 font-medium"
          }
        >
          {membership?.status === "published"
            ? "Unpublish Plan"
            : "Publish Plan"}
        </span>
      ),
      action: () => togglePublish(),
    },
    {
      key: "delete",
      label: "Delete Plan",
      render: () => <span className="text-error font-medium">Delete Plan</span>,
      action: () => setDeleteOpen(true),
    },
  ];

  return (
    <DashboardLayout title="Membership Details">
      <PageLoader
        query={{
          data: membership,
          isLoading,
          isError,
          error,
          refetch,
        }}
      >
        {(currentPlan) => {
          const typeName =
            typeof currentPlan.type === "object" && currentPlan.type !== null
              ? currentPlan.type.name
              : (currentPlan.type ?? currentPlan.category ?? "Membership");

          return (
            <div className="space-y-6">
              {/* Top Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-xl border border-[#E7E9EB] p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/membership")}
                    className="w-9 h-9 rounded-lg border border-[#E7E9EB] hover:bg-base-200 flex items-center justify-center text-base-content/70 transition-colors cursor-pointer"
                    title="Back to Memberships"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-bold text-base-content">
                        {currentPlan.name}
                      </h1>
                      <StatusBadge status={currentPlan.status} />
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                        {typeName}
                      </span>
                      {currentPlan.category &&
                        currentPlan.category !== typeName && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-base-200 text-base-content/70 font-medium">
                            {currentPlan.category}
                          </span>
                        )}
                    </div>
                    {currentPlan.createdDate && (
                      <p className="text-xs text-base-content/60 mt-0.5">
                        Created on{" "}
                        {formatDate(currentPlan.createdDate, "DD MMMM YYYY")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={
                      currentPlan.status === "published" ? "outline" : "primary"
                    }
                    loading={isSaving}
                    onClick={togglePublish}
                  >
                    {currentPlan.status === "published"
                      ? "Unpublish Plan"
                      : "Publish Plan"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Pencil size={14} />}
                    onClick={() =>
                      router.push(`/membership/edit/${membershipId}`)
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-error hover:bg-error/10"
                    leftIcon={<Trash2 size={14} />}
                    onClick={() => setDeleteOpen(true)}
                  >
                    Delete
                  </Button>
                  <div className="relative">
                    <PopUp
                      item={currentPlan}
                      actions={headerActions}
                      currentIndex={headerMenuIndex}
                      setIndex={setHeaderMenuIndex}
                      itemIndex={0}
                    />
                  </div>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid sm:grid-cols-4 gap-4">
                <StatCard
                  title="Total Members"
                  value={currentPlan.membersCount ?? subscribers.length}
                  loading={isLoading}
                  icon={<Users size={20} className="text-secondary" />}
                />
                <StatCard
                  title="Enrolled This Month"
                  value={currentPlan.membersThisMonth ?? 0}
                  loading={isLoading}
                  icon={<Calendar size={20} className="text-secondary" />}
                />
                <StatCard
                  title="Total Revenue"
                  value={formatCurrency(
                    currentPlan.amountPaid ??
                      transactions.reduce(
                        (acc, t) => acc + (Number(t.amount) || 0),
                        0,
                      ),
                    {
                      currency: currentPlan.currency || "CAD",
                      decimals: 0,
                    },
                  )}
                  loading={isLoading}
                  icon={<Wallet size={20} className="text-secondary" />}
                />
                <div className="bg-white rounded-xl border border-[#E7E9EB] p-4 shadow-sm flex flex-col justify-between">
                  <p className="text-xs text-base-content/60 font-medium">
                    Plan Rate
                  </p>
                  <div className="mt-2">
                    <p className="text-xl font-bold text-base-content">
                      {formatCurrency(currentPlan.price, {
                        currency: currentPlan.currency || "CAD",
                      })}
                    </p>
                    <p className="text-xs text-base-content/60 capitalize mt-0.5">
                      Per {currentPlan.duration || "Term"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tab Navigation & Content */}
              <div className="space-y-4">
                <Tabs
                  tabs={[
                    { key: "overview", label: "Overview & Features" },
                    {
                      key: "members",
                      label: `Enrolled Members (${subscribers.length})`,
                    },
                    {
                      key: "applications",
                      label: `Applications (${applications.length})`,
                    },
                    {
                      key: "transactions",
                      label: `Payment History (${transactions.length})`,
                    },
                  ]}
                  activeKey={activeTab}
                  onChange={setActiveTab}
                />

                {activeTab === "overview" && (
                  <MembershipOverviewTab plan={currentPlan} />
                )}

                {activeTab === "members" && (
                  <MembershipMembersTab
                    membershipId={membershipId}
                    subscribers={subscribers}
                    totalCount={subscribersCount}
                    isLoading={isSubsLoading}
                    onFilterChange={fetchSubscribers}
                    onCancelSub={(item) => setCancelSubTarget(item)}
                  />
                )}

                {activeTab === "applications" && (
                  <MembershipApplicationsTab
                    applications={applications}
                    totalCount={applicationsCount}
                    isLoading={isAppsLoading}
                    applicationQuestions={currentPlan.applicationQuestions}
                    onFilterChange={fetchApplications}
                    onApprove={(item) => setApproveModalItem(item)}
                    onDeny={(item) => {
                      setDenyReason("");
                      setDenyModalItem(item);
                    }}
                  />
                )}

                {activeTab === "transactions" && (
                  <MembershipTransactionsTab
                    transactions={transactions}
                    onApprove={(item) => setApproveModalItem(item)}
                    onDeny={(item) => {
                      setDenyReason("");
                      setDenyModalItem(item);
                    }}
                    onCancelOrder={(item) => setCancelOrderTarget(item)}
                  />
                )}
              </div>
            </div>
          );
        }}
      </PageLoader>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete membership"
        description="Are you sure you want to delete this membership plan? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          await removeMembership();
          setDeleteOpen(false);
          router.push("/membership");
        }}
      />

      {/* Approve Membership Modal */}
      <Modal
        open={!!approveModalItem}
        onClose={() => !actionBusy && setApproveModalItem(null)}
        title="Approve Membership"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            <CheckCircle className="shrink-0 text-emerald-600 mt-0.5" size={18} />
            <div>
              <p className="font-semibold text-emerald-900">
                Activate Membership & Issue Certificate
              </p>
              <p className="mt-0.5 text-emerald-700">
                Approving will immediately grant this member active access and generate their official membership certificate.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm bg-base-100 rounded-lg border border-[#E7E9EB] p-3">
            <div className="flex justify-between items-center py-1 border-b border-base-200">
              <span className="text-xs text-base-content/60">Applicant</span>
              <span className="font-semibold text-base-content">
                {approveModalItem?.student
                  ? `${approveModalItem.student.firstName ?? ""} ${approveModalItem.student.lastName ?? ""}`.trim()
                  : "memberName" in (approveModalItem || {})
                  ? (approveModalItem as MembershipTransaction).memberName
                  : (approveModalItem as MembershipSubscriber)?.name}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-base-200">
              <span className="text-xs text-base-content/60">Email</span>
              <span className="text-xs text-base-content">
                {approveModalItem?.student?.email ||
                  ("memberEmail" in (approveModalItem || {})
                    ? (approveModalItem as MembershipTransaction).memberEmail
                    : (approveModalItem as MembershipSubscriber)?.email)}
              </span>
            </div>
            {"reference" in (approveModalItem || {}) && (
              <div className="flex justify-between items-center py-1 border-b border-base-200">
                <span className="text-xs text-base-content/60">Payment Ref</span>
                <span className="text-xs font-mono text-primary font-semibold">
                  {(approveModalItem as MembershipTransaction).reference}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-base-content/60">Plan</span>
              <span className="font-semibold text-base-content">
                {membership?.name}
              </span>
            </div>
          </div>

          {approveModalItem &&
            "answers" in approveModalItem &&
            Array.isArray(approveModalItem.answers) &&
            approveModalItem.answers.length > 0 && (
              <div className="bg-base-200/50 rounded-lg p-3 border border-base-200 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                  Screening Answers
                </p>
                {approveModalItem.answers.map(
                  (ans: { questionId: string; answer: boolean | string }, idx: number) => {
                    const qText =
                      membership?.applicationQuestions?.find(
                        (q) => q.id === ans.questionId,
                      )?.question || `Question ${idx + 1}`;
                    return (
                      <div key={idx} className="text-xs">
                        <p className="font-medium text-base-content">{qText}</p>
                        <p className="text-emerald-700 font-semibold">
                          {typeof ans.answer === "boolean"
                            ? ans.answer
                              ? "Yes"
                              : "No"
                            : String(ans.answer)}
                        </p>
                      </div>
                    );
                  },
                )}
              </div>
            )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="md"
              disabled={actionBusy}
              onClick={() => setApproveModalItem(null)}
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
              Approve Membership
            </Button>
          </div>
        </div>
      </Modal>

      {/* Deny Membership Modal */}
      <Modal
        open={!!denyModalItem}
        onClose={() => !actionBusy && setDenyModalItem(null)}
        title="Deny Membership Application"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertTriangle className="shrink-0 text-rose-600 mt-0.5" size={18} />
            <div>
              <p className="font-semibold text-rose-900">
                Deny Membership Application
              </p>
              <p className="mt-0.5 text-rose-700">
                Denying will reject the student membership application. Please provide a clear reason for the applicant.
              </p>
            </div>
          </div>

          <div className="space-y-1 text-sm bg-base-100 rounded-lg border border-[#E7E9EB] p-3">
            <div className="flex justify-between items-center py-1 border-b border-base-200">
              <span className="text-xs text-base-content/60">Applicant</span>
              <span className="font-semibold text-base-content">
                {denyModalItem?.student
                  ? `${denyModalItem.student.firstName ?? ""} ${denyModalItem.student.lastName ?? ""}`.trim()
                  : "memberName" in (denyModalItem || {})
                  ? (denyModalItem as MembershipTransaction).memberName
                  : (denyModalItem as MembershipSubscriber)?.name}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-base-content/60">Email</span>
              <span className="text-xs text-base-content">
                {denyModalItem?.student?.email ||
                  ("memberEmail" in (denyModalItem || {})
                    ? (denyModalItem as MembershipTransaction).memberEmail
                    : (denyModalItem as MembershipSubscriber)?.email)}
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
                setDenyModalItem(null);
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

      {/* Cancel Pending Order Modal */}
      <ConfirmModal
        open={!!cancelOrderTarget}
        onClose={() => setCancelOrderTarget(null)}
        title="Cancel Pending Order"
        description={`Are you sure you want to cancel pending order ${cancelOrderTarget?.orderNumber || cancelOrderTarget?.reference}? This action cannot be undone.`}
        confirmLabel="Cancel Order"
        variant="danger"
        loading={actionBusy}
        onConfirm={handleCancelOrder}
      />

      {/* Cancel Active Student Membership Modal */}
      <ConfirmModal
        open={!!cancelSubTarget}
        onClose={() => setCancelSubTarget(null)}
        title="Cancel Student Membership"
        description={`Are you sure you want to cancel the membership for ${cancelSubTarget?.name}? This will revoke their membership certificate and benefits.`}
        confirmLabel="Cancel Membership"
        variant="danger"
        loading={actionBusy}
        onConfirm={handleCancelSub}
      />
    </DashboardLayout>
  );
}
