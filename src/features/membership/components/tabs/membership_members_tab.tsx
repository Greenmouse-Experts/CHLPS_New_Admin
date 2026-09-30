"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Divider, FilterBar, FilterOption, StatusBadge, useToast } from "@/components/ui";
import DialogModal, { ModalHandle } from "@/components/DialogModal";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";
import { Award, Ban, ExternalLink, Eye, Mail, Phone, User } from "lucide-react";
import { MembershipSubscriber } from "../../domain/data/response/membership_response";
import { Certificate } from "@/features/certificates/domain/data/response/certificates_response";
import CertificatesRepository from "@/features/certificates/domain/repository/certificates_repository";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";

export interface MembershipMembersTabProps {
  membershipId?: string;
  subscribers: MembershipSubscriber[];
  totalCount?: number;
  isLoading?: boolean;
  onFilterChange?: (params: { status?: string; search?: string }) => void;
  onCancelSub?: (item: MembershipSubscriber) => void;
}

export function MembershipMembersTab({
  membershipId,
  subscribers = [],
  totalCount,
  isLoading = false,
  onFilterChange,
  onCancelSub,
}: MembershipMembersTabProps) {
  const router = useRouter();
  const { toast } = useToast();
  const certRepo = useMemo(() => new CertificatesRepository(), []);
  const certModalRef = useRef<ModalHandle>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [certLoading, setCertLoading] = useState(false);

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

  const handleFetchCertificate = async (member: MembershipSubscriber) => {
    const studentId = member.studentId || member.id;
    if (!studentId) {
      toast("Member identifier not found", "danger");
      return;
    }
    if (!membershipId) {
      toast("Membership identifier missing", "danger");
      return;
    }

    try {
      setCertLoading(true);
      const res = await certRepo.getStudentMembershipCertificate(studentId, membershipId);
      if (res.success && res.data) {
        setSelectedCert(res.data);
        certModalRef.current?.open();
      } else {
        toast(res.message || "No certificate issued for this member yet", "info");
      }
    } catch (err: any) {
      toast(err?.message || "Failed to fetch certificate", "danger");
    } finally {
      setCertLoading(false);
    }
  };

  // Client-side safety filtering if backend pagination isn't active
  const displayedMembers = useMemo(() => {
    if (onFilterChange) {
      if (!search.trim()) return subscribers;
      const q = search.toLowerCase();
      return subscribers.filter((sub) => {
        const name = (sub.name || "").toLowerCase();
        const email = (sub.email || "").toLowerCase();
        const phone = (sub.phone || "").toLowerCase();
        const memberNum = (sub.memberNumber || "").toLowerCase();
        return (
          name.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          memberNum.includes(q)
        );
      });
    }

    let result = subscribers;
    if (statusFilter !== "all") {
      result = result.filter(
        (sub) => String(sub.status).toLowerCase() === statusFilter.toLowerCase(),
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((sub) => {
        const name = (sub.name || "").toLowerCase();
        const email = (sub.email || "").toLowerCase();
        const phone = (sub.phone || "").toLowerCase();
        const memberNum = (sub.memberNumber || "").toLowerCase();
        return (
          name.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          memberNum.includes(q)
        );
      });
    }
    return result;
  }, [subscribers, onFilterChange, statusFilter, search]);

  const filterOptions: FilterOption[] = useMemo(() => {
    let active = 0;
    let expired = 0;
    let cancelled = 0;

    subscribers.forEach((sub) => {
      const s = String(sub.status).toLowerCase();
      if (s === "active") active++;
      else if (s === "expired") expired++;
      else if (s === "cancelled" || s === "rejected") cancelled++;
    });

    return [
      { value: "all", label: "All", count: totalCount ?? subscribers.length },
      { value: "active", label: "Active", count: active, badgeVariant: "success" },
      { value: "expired", label: "Expired", count: expired, badgeVariant: "warning" },
      { value: "cancelled", label: "Cancelled", count: cancelled, badgeVariant: "danger" },
    ];
  }, [subscribers, totalCount]);

  const columns: columnType<MembershipSubscriber>[] = [
    {
      key: "name",
      label: "Member",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          {row.avatar ? (
            <img
              src={row.avatar}
              alt=""
              className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#E7E9EB]"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
              {(row.name?.[0] || "M").toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p
              onClick={() => {
                if (row.id) router.push(`/students/${row.id}`);
              }}
              className="text-sm font-semibold text-base-content leading-tight hover:text-primary transition-colors cursor-pointer"
            >
              {row.name}
            </p>
            <p className="text-xs text-base-content/60 truncate">{row.email || "—"}</p>
            {row.phone && row.phone !== "—" && (
              <p className="text-[11px] text-base-content/40">{row.phone}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "memberNumber",
      label: "Member ID",
      render: (v) => (
        <span className="font-mono text-xs font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded">
          {v || "—"}
        </span>
      ),
    },
    {
      key: "joinedDate",
      label: "Joined Date",
      render: (v) => (
        <span className="text-sm text-base-content/80 whitespace-nowrap">
          {v ? formatDate(v, "DD MMM YYYY") : "—"}
        </span>
      ),
    },
    {
      key: "expiryDate",
      label: "Expires",
      render: (v) => (
        <span className="text-sm text-base-content/80 whitespace-nowrap">
          {!v ? "—" : v.startsWith("2099") ? "Lifetime" : formatDate(v, "DD MMM YYYY")}
        </span>
      ),
    },
    {
      key: "amountPaid",
      label: "Paid",
      render: (v, row) => (
        <span className="text-sm font-semibold text-base-content whitespace-nowrap">
          {formatCurrency(Number(v) || 0, { currency: row.currency || "CAD" })}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v) => <StatusBadge status={v} />,
    },
  ];

  const actions: Actions<MembershipSubscriber>[] = [
    {
      key: "view_certificate",
      label: "View Certificate",
      render: () => (
        <span className="flex items-center gap-2 text-primary font-medium">
          <Award size={15} />
          View Certificate
        </span>
      ),
      action: (row) => handleFetchCertificate(row),
    },
    {
      key: "view_member",
      label: "View Member Details",
      render: () => (
        <span className="flex items-center gap-2 text-base-content/80 font-medium">
          <Eye size={15} />
          View Member Details
        </span>
      ),
      action: (row, r) => {
        r.push(`/students/${row.id}`);
      },
    },
    {
      key: "cancel_membership",
      label: "Cancel Membership",
      render: () => (
        <span className="flex items-center gap-2 text-rose-600 font-medium">
          <Ban size={15} />
          Cancel Membership
        </span>
      ),
      disabled: (row) => row.status === "cancelled" || !row.studentMembershipId,
      action: (row) => {
        if (onCancelSub) onCancelSub(row);
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
          placeholder: "Search members by name, email, phone, ID...",
          onChange: handleSearchChange,
        }}
        isLoading={isLoading}
      />

      <CustomTable
        ring={false}
        columns={columns}
        data={displayedMembers}
        actions={actions}
        totalCount={totalCount ?? displayedMembers.length}
      />

      {/* Certificate Viewer Modal */}
      <DialogModal
        ref={certModalRef}
        title={
          selectedCert
            ? `Membership Certificate: ${selectedCert.certificateNumber || "Preview"}`
            : "Membership Certificate"
        }
        onClose={() => setSelectedCert(null)}
        actions={
          <div className="flex items-center gap-2">
            {selectedCert?.certificateUrl && (
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  selectedCert.certificateUrl &&
                  window.open(selectedCert.certificateUrl, "_blank")
                }
                className="inline-flex items-center gap-1.5"
              >
                <ExternalLink size={14} />
                Open in New Tab
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => certModalRef.current?.close()}
            >
              Close
            </Button>
          </div>
        }
      >
        {selectedCert && (
          <div className="space-y-4">
            <div className="bg-base-200/50 rounded-xl p-4 border border-base-300 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-base-content/60 block font-medium">Certificate No:</span>
                <span className="font-mono font-bold text-primary block mt-0.5">
                  {selectedCert.certificateNumber || "—"}
                </span>
              </div>
              <div>
                <span className="text-base-content/60 block font-medium">Member Name:</span>
                <span className="font-semibold text-base-content block mt-0.5">
                  {selectedCert.student
                    ? `${selectedCert.student.firstName ?? ""} ${selectedCert.student.lastName ?? ""}`.trim()
                    : "—"}
                </span>
              </div>
              <div>
                <span className="text-base-content/60 block font-medium">Membership:</span>
                <span className="font-semibold text-base-content block mt-0.5">
                  {selectedCert.membership?.name || "Membership Certificate"}
                </span>
              </div>
              <div>
                <span className="text-base-content/60 block font-medium">Status:</span>
                <div className="mt-0.5">
                  <StatusBadge status={selectedCert.isRevoked ? "revoked" : "active"} />
                </div>
              </div>
            </div>

            {selectedCert.certificateUrl ? (
              <div className="rounded-xl overflow-hidden border border-base-300 bg-black/5">
                <iframe
                  src={`${selectedCert.certificateUrl}#toolbar=0`}
                  className="w-full h-[480px] border-0"
                  title="Certificate Document"
                />
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-base-content/50">
                No certificate document URL found.
              </div>
            )}
          </div>
        )}
      </DialogModal>
    </div>
  );
}
