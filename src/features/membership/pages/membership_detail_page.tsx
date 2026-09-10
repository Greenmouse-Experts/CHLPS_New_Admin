"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout, StatCard } from "@/components";
import {
  Button,
  ConfirmModal,
  Divider,
  StatusBadge,
  Tabs,
} from "@/components/ui";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import PopUp, { Actions } from "@/components/tables/pop-up";
import PageLoader from "@/components/PageLoader";
import {
  ArrowLeft2,
  Briefcase,
  Calendar,
  DocumentText,
  Edit2,
  InfoCircle,
  LampCharge,
  MessageQuestion,
  People,
  SearchNormal1,
  ShieldTick,
  TickCircle,
  Trash,
  Wallet3,
} from "iconsax-react";
import { useMembershipDetail } from "../domain/data/hooks/membership_hook";
import {
  MembershipSubscriber,
  MembershipTransaction,
} from "../domain/data/response/membership_response";
import { MembershipModal } from "../components/membership_modal";
import { Trash2 } from "lucide-react";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";

export default function MembershipDetailPage({
  membershipId,
}: {
  membershipId: string;
}) {
  const router = useRouter();
  const {
    membership,
    subscribers,
    transactions,
    isLoading,
    isError,
    error,
    isSaving,
    updateMembership,
    togglePublish,
    removeMembership,
    refetch,
  } = useMembershipDetail(membershipId);

  const [activeTab, setActiveTab] = useState("overview");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [headerMenuIndex, setHeaderMenuIndex] = useState<number | null>(null);

  // Filter subscribers
  const filteredSubscribers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.memberNumber.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q),
    );
  }, [subscribers, memberSearch]);

  // Actions for header pop-up
  const headerActions: Actions[] = [
    {
      key: "edit",
      label: "Edit Plan",
      action: () => setModalOpen(true),
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

  // Subscriber table columns & actions
  const subscriberColumns: columnType<MembershipSubscriber>[] = [
    {
      key: "name",
      label: "Member",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
            {row.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-base-content leading-tight">
              {row.name}
            </p>
            <p className="text-xs text-base-content/60 font-mono mt-0.5">
              {row.memberNumber}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Contact",
      render: (_, row) => (
        <div>
          <p className="text-sm text-base-content font-medium">{row.email}</p>
          <p className="text-xs text-base-content/60">{row.phone}</p>
        </div>
      ),
    },
    {
      key: "joinedDate",
      label: "Enrolled Date",
      render: (v) => (
        <span className="text-sm text-base-content/80 whitespace-nowrap">
          {formatDate(v, "DD MMM YYYY")}
        </span>
      ),
    },
    {
      key: "expiryDate",
      label: "Expiry Date",
      render: (v) => (
        <span className="text-sm text-base-content/80 whitespace-nowrap">
          {v.startsWith("2099") ? "Lifetime" : formatDate(v, "DD MMM YYYY")}
        </span>
      ),
    },
    {
      key: "amountPaid",
      label: "Paid",
      render: (v, row) => (
        <span className="text-sm font-semibold text-base-content whitespace-nowrap">
          {formatCurrency(Number(v) || 0, { currency: row.currency })}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v) => <StatusBadge status={v} />,
    },
  ];

  const subscriberActions: Actions<MembershipSubscriber>[] = [
    {
      key: "view_member",
      label: "View Member Details",
      action: (row, r) => {
        r.push(`/students/${row.id}`);
      },
    },
  ];

  // Transaction table columns & actions
  const transactionColumns: columnType<MembershipTransaction>[] = [
    {
      key: "reference",
      label: "Reference",
      render: (v) => (
        <span className="text-xs font-mono font-semibold text-primary bg-primary/5 px-2 py-1 rounded">
          {v}
        </span>
      ),
    },
    {
      key: "memberName",
      label: "Payer",
      render: (_, row) => (
        <div>
          <p className="text-sm font-semibold text-base-content">
            {row.memberName}
          </p>
          <p className="text-xs text-base-content/60">{row.memberEmail}</p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (v, row) => (
        <span className="text-sm font-bold text-base-content whitespace-nowrap">
          {formatCurrency(Number(v) || 0, { currency: row.currency })}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
      render: (v) => (
        <span className="text-xs font-medium uppercase text-base-content/80 bg-base-200 px-2 py-0.5 rounded">
          {String(v).replace("_", " ")}
        </span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (v) => (
        <span className="text-sm text-base-content/80 whitespace-nowrap">
          {formatDate(v, "DD MMM YYYY, hh:mm A")}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v) => <StatusBadge status={v} />,
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
                    <ArrowLeft2 size={18} color="currentColor" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-bold text-base-content">
                        {currentPlan.name}
                      </h1>
                      <StatusBadge status={currentPlan.status as any} />
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                        {typeName}
                      </span>
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
                    leftIcon={<Edit2 size={14} color="currentColor" />}
                    onClick={() => setModalOpen(true)}
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
                  value={currentPlan.membersCount ?? 0}
                  loading={isLoading}
                  icon={<People size={20} color="#717171" />}
                />
                <StatCard
                  title="Enrolled This Month"
                  value={currentPlan.membersThisMonth ?? 0}
                  loading={isLoading}
                  icon={<Calendar size={20} color="#717171" />}
                />
                <StatCard
                  title="Total Revenue"
                  value={formatCurrency(currentPlan.amountPaid ?? 0, {
                    currency: currentPlan.currency || "NGN",
                    decimals: 0,
                  })}
                  loading={isLoading}
                  icon={<Wallet3 size={20} color="#717171" />}
                />
                <div className="bg-white rounded-xl border border-[#E7E9EB] p-4 shadow-sm flex flex-col justify-between">
                  <p className="text-xs text-base-content/60 font-medium">
                    Plan Rate
                  </p>
                  <div className="mt-2">
                    <p className="text-xl font-bold text-base-content">
                      {formatCurrency(currentPlan.price, {
                        currency: currentPlan.currency || "NGN",
                      })}
                    </p>
                    <p className="text-xs text-base-content/60 capitalize mt-0.5">
                      Per {currentPlan.duration || "Term"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="space-y-4">
                <Tabs
                  tabs={[
                    { key: "overview", label: "Overview & Criteria" },
                    {
                      key: "members",
                      label: `Enrolled Members (${subscribers.length})`,
                    },
                    {
                      key: "transactions",
                      label: `Payment History (${transactions.length})`,
                    },
                  ]}
                  activeKey={activeTab}
                  onChange={setActiveTab}
                />

                {/* Tab 1: Overview & Criteria */}
                {activeTab === "overview" && (
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      {/* Basic Info */}
                      <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-5">
                        <div className="flex items-start gap-4">
                          {currentPlan.image ? (
                            <img
                              src={currentPlan.image}
                              alt=""
                              className="w-16 h-16 rounded-xl object-cover border border-[#E7E9EB] shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xl shrink-0">
                              {currentPlan.name?.[0] || "M"}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-base-content">
                              {currentPlan.name}
                            </h2>
                            <p className="text-sm text-base-content/70 mt-1 leading-relaxed whitespace-pre-wrap">
                              {currentPlan.description}
                            </p>
                          </div>
                        </div>

                        <Divider />

                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="bg-base-200/40 p-3 rounded-lg border border-base-300">
                            <p className="text-xs text-base-content/60">Type</p>
                            <p className="text-sm font-semibold text-base-content mt-0.5 capitalize">
                              {typeName}
                            </p>
                          </div>
                          <div className="bg-base-200/40 p-3 rounded-lg border border-base-300">
                            <p className="text-xs text-base-content/60">
                              Duration
                            </p>
                            <p className="text-sm font-semibold text-base-content mt-0.5">
                              {currentPlan.duration || "—"}
                            </p>
                          </div>
                          <div className="bg-base-200/40 p-3 rounded-lg border border-base-300">
                            <p className="text-xs text-base-content/60">
                              Membership Price
                            </p>
                            <p className="text-sm font-semibold text-base-content mt-0.5">
                              {formatCurrency(currentPlan.price, {
                                currency: currentPlan.currency || "NGN",
                              })}
                            </p>
                          </div>
                          <div className="bg-base-200/40 p-3 rounded-lg border border-base-300">
                            <p className="text-xs text-base-content/60">
                              Auto-Renewal
                            </p>
                            <p className="text-sm font-semibold text-base-content mt-0.5">
                              {currentPlan.autoRenewal ? "Enabled" : "Disabled"}
                            </p>
                          </div>
                          {currentPlan.autoRenewal && (
                            <>
                              <div className="bg-base-200/40 p-3 rounded-lg border border-base-300">
                                <p className="text-xs text-base-content/60">
                                  Renewal Price
                                </p>
                                <p className="text-sm font-semibold text-base-content mt-0.5">
                                  {formatCurrency(
                                    currentPlan.renewalPrice ||
                                      currentPlan.price,
                                    { currency: currentPlan.currency || "NGN" },
                                  )}
                                </p>
                              </div>
                              <div className="bg-base-200/40 p-3 rounded-lg border border-base-300">
                                <p className="text-xs text-base-content/60">
                                  Renewal Cycle
                                </p>
                                <p className="text-sm font-semibold text-base-content mt-0.5 capitalize">
                                  {currentPlan.renewalPeriod || "Annually"}
                                </p>
                              </div>
                            </>
                          )}
                          {currentPlan.createdDate && (
                            <div className="bg-base-200/40 p-3 rounded-lg border border-base-300">
                              <p className="text-xs text-base-content/60">
                                Created Date
                              </p>
                              <p className="text-sm font-semibold text-base-content mt-0.5">
                                {formatDate(
                                  currentPlan.createdDate,
                                  "DD MMM YYYY",
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Why Join Now Section */}
                      {currentPlan.whyJoinNow && (
                        <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
                          <div className="flex items-center gap-2">
                            <InfoCircle size={20} className="text-primary" />
                            <h3 className="text-base font-bold text-base-content">
                              {currentPlan.whyJoinNow.heading ||
                                "Why should I join now?"}
                            </h3>
                          </div>
                          {currentPlan.whyJoinNow.description && (
                            <p className="text-sm text-base-content/70 whitespace-pre-line leading-relaxed">
                              {currentPlan.whyJoinNow.description}
                            </p>
                          )}
                          {currentPlan.whyJoinNow.highlights &&
                            currentPlan.whyJoinNow.highlights.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2">
                                {currentPlan.whyJoinNow.highlights.map(
                                  (hl: any, i) => (
                                    <div
                                      key={hl?.id || i}
                                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 text-primary text-xs font-semibold"
                                    >
                                      <TickCircle size={14} variant="Bold" />
                                      <span>{typeof hl === "string" ? hl : (hl?.value || "")}</span>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                          {currentPlan.whyJoinNow.infoCards &&
                            currentPlan.whyJoinNow.infoCards.length > 0 && (
                              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                                {currentPlan.whyJoinNow.infoCards.map(
                                  (card, i) => (
                                    <div
                                      key={card.id || i}
                                      className="p-3.5 rounded-lg bg-base-200/40 border border-base-300 space-y-1"
                                    >
                                      <p className="text-xs font-bold text-base-content">
                                        {card.title}
                                      </p>
                                      <p className="text-xs text-base-content/70">
                                        {card.description}
                                      </p>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                        </div>
                      )}

                      {/* How Membership Helps */}
                      {currentPlan.howMembershipHelps &&
                        currentPlan.howMembershipHelps.length > 0 && (
                          <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2">
                              <LampCharge size={20} className="text-primary" />
                              <h3 className="text-base font-bold text-base-content">
                                How Membership Helps
                              </h3>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                              {currentPlan.howMembershipHelps.map((item, i) => (
                                <div
                                  key={item.id || i}
                                  className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/60 space-y-2"
                                >
                                  {item.iconUrl && (
                                    <img
                                      src={item.iconUrl}
                                      alt=""
                                      className="w-7 h-7 object-contain"
                                    />
                                  )}
                                  <p className="text-sm font-bold text-base-content">
                                    {item.title}
                                  </p>
                                  <p className="text-xs text-base-content/70 leading-relaxed">
                                    {item.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Job Opportunities */}
                      {currentPlan.jobOpportunities &&
                        currentPlan.jobOpportunities.length > 0 && (
                          <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2">
                              <Briefcase size={20} className="text-primary" />
                              <h3 className="text-base font-bold text-base-content">
                                Job & Career Opportunities
                              </h3>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                              {currentPlan.jobOpportunities.map((job, i) => (
                                <div
                                  key={job.id || i}
                                  className="p-4 rounded-xl bg-blue-50/40 border border-blue-200/60 space-y-2"
                                >
                                  {job.iconUrl && (
                                    <img
                                      src={job.iconUrl}
                                      alt=""
                                      className="w-7 h-7 object-contain"
                                    />
                                  )}
                                  <p className="text-sm font-bold text-base-content">
                                    {job.title}
                                  </p>
                                  <p className="text-xs text-base-content/70 leading-relaxed">
                                    {job.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Application Questions */}
                      {currentPlan.applicationQuestions &&
                        currentPlan.applicationQuestions.length > 0 && (
                          <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2">
                              <MessageQuestion size={20} className="text-primary" />
                              <h3 className="text-base font-bold text-base-content">
                                Application Questions
                              </h3>
                            </div>
                            <div className="space-y-2">
                              {currentPlan.applicationQuestions.map((q: any, i) => (
                                <div
                                  key={q?.id || i}
                                  className="flex items-start gap-3 p-3 rounded-lg bg-base-200/40 border border-base-300"
                                >
                                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                                    {i + 1}
                                  </span>
                                  <span className="text-sm text-base-content font-medium">
                                    {typeof q === "string" ? q : (q?.question || "")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Member Benefits */}
                      <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2">
                          <ShieldTick size={20} className="text-primary" />
                          <h3 className="text-base font-bold text-base-content">
                            Member Benefits & Privileges
                          </h3>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {currentPlan.benefits?.map((benefit, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100"
                            >
                              <TickCircle
                                size={18}
                                className="text-emerald-600 shrink-0 mt-0.5"
                                variant="Bold"
                              />
                              <span className="text-sm text-base-content font-medium leading-snug">
                                {benefit}
                              </span>
                            </div>
                          ))}
                          {(!currentPlan.benefits ||
                            currentPlan.benefits.length === 0) && (
                            <p className="text-sm text-base-content/60">
                              No benefits specified.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sidebar: Criteria & Required Documents */}
                    <div className="space-y-6">
                      <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-base-content">
                          Eligibility Criteria
                        </h3>
                        <div className="space-y-2.5">
                          {currentPlan.eligibilityCriteria?.map((crit, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2.5 text-sm text-base-content p-2.5 rounded-lg bg-base-200/40 border border-base-300"
                            >
                              <span className="w-5 h-5 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="leading-snug">{crit}</span>
                            </div>
                          ))}
                          {(!currentPlan.eligibilityCriteria ||
                            currentPlan.eligibilityCriteria.length === 0) && (
                            <p className="text-sm text-base-content/60">
                              No criteria specified.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2">
                          <DocumentText size={18} className="text-primary" />
                          <h3 className="text-base font-bold text-base-content">
                            Required Documents
                          </h3>
                        </div>
                        <div className="space-y-2">
                          {currentPlan.requiredDocuments?.map((docKey, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-3 rounded-lg border border-[#E7E9EB] bg-base-100"
                            >
                              <DocumentText
                                size={18}
                                className="text-base-content/70"
                              />
                              <span className="text-sm font-medium text-base-content capitalize">
                                {String(docKey).replace(/_/g, " ")}
                              </span>
                            </div>
                          ))}
                          {(!currentPlan.requiredDocuments ||
                            currentPlan.requiredDocuments.length === 0) && (
                            <p className="text-sm text-base-content/60">
                              No documents required for registration.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Enrolled Members */}
                {activeTab === "members" && (
                  <div className="bg-white rounded-xl border border-[#E7E9EB] p-4 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 border border-[#E7E9EB] rounded-lg px-3 h-9 bg-white w-64 focus-within:border-primary transition-colors">
                        <SearchNormal1 size={15} color="#717171" />
                        <input
                          type="text"
                          value={memberSearch}
                          onChange={(e) => setMemberSearch(e.target.value)}
                          placeholder="Search enrolled members..."
                          className="flex-1 text-xs outline-none focus:outline-none focus-visible:outline-none ring-0 bg-transparent placeholder-[#ADADAD]"
                        />
                      </div>
                      <p className="text-xs text-base-content/60">
                        Showing <b>{filteredSubscribers.length}</b> member(s)
                      </p>
                    </div>

                    <Divider />

                    <CustomTable
                      ring={false}
                      columns={subscriberColumns}
                      data={filteredSubscribers}
                      actions={subscriberActions}
                      totalCount={filteredSubscribers.length}
                      onRowClick={(row) => router.push(`/students/${row.id}`)}
                    />
                  </div>
                )}

                {/* Tab 3: Payment History */}
                {activeTab === "transactions" && (
                  <div className="bg-white rounded-xl border border-[#E7E9EB] p-4 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-base-content">
                        Transaction Records
                      </h3>
                      <p className="text-xs text-base-content/60">
                        Total transactions: <b>{transactions.length}</b>
                      </p>
                    </div>

                    <Divider />

                    <CustomTable
                      ring={false}
                      columns={transactionColumns}
                      data={transactions}
                      actions={[]}
                      totalCount={transactions.length}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        }}
      </PageLoader>

      <MembershipModal
        open={modalOpen}
        membership={membership}
        isSubmitting={isSaving}
        onClose={() => setModalOpen(false)}
        onSubmit={async (payload) => {
          const ok = await updateMembership(payload);
          if (ok) setModalOpen(false);
          return ok;
        }}
      />

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
    </DashboardLayout>
  );
}
