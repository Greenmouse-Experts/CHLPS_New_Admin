"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardLayout, StatCard } from "@/components";
import {
  Button,
  ConfirmModal,
  Divider,
  Modal,
  StatusBadge,
  TextField,
  useToast,
} from "@/components/ui";
import DialogModal, { ModalHandle } from "@/components/DialogModal";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";
import PageLoader from "@/components/PageLoader";
import { MedalStar, Calendar } from "iconsax-react";
import { ExternalLink, Eye, Award, FileText } from "lucide-react";
import CertificatesRepository from "../domain/repository/certificates_repository";
import {
  Certificate,
  CertStats,
  CertTemplate,
} from "../domain/data/response/certificates_response";
import { formatDate } from "@/utils/helper/formate_date";

const PAGE_SIZE = 10;

export default function CertificatesPage() {
  const { toast } = useToast();
  const repo = useMemo(() => new CertificatesRepository(), []);
  const certModalRef = useRef<ModalHandle>(null);

  const [items, setItems] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<CertStats>({});
  const [templates, setTemplates] = useState<CertTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState<Certificate | null>(null);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [fetchingCert, setFetchingCert] = useState(false);

  const [form, setForm] = useState({
    certificateNumber: "",
    certificateUrl: "",
    templateId: "",
  });
  const [confirm, setConfirm] = useState<{
    id: string;
    type: "revoke" | "delete";
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setIsError(false);
    setError(null);
    try {
      const [list, st, tmpl] = await Promise.all([
        repo.list(),
        repo.stats(),
        repo.listTemplates(),
      ]);
      if (list.success && list.data) setItems(list.data);
      else {
        setIsError(true);
        setError(list.message || "Failed to load certificates");
      }
      if (st.success && st.data) setStats(st.data);
      if (tmpl.success && tmpl.data) setTemplates(tmpl.data);
    } catch (err) {
      setIsError(true);
      setError(err);
      toast("Failed to load certificates", "danger");
    } finally {
      setLoading(false);
    }
  }, [repo, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleViewCertificate = async (r: Certificate) => {
    try {
      setFetchingCert(true);
      const studentId = r.student?.id;
      const membershipId = r.membership?.id;

      // If student and membership IDs are available, fetch using /api/v1/certificates/student/:studentId/membership/:membershipId
      if (studentId && membershipId) {
        const res = await repo.getStudentMembershipCertificate(studentId, membershipId);
        if (res.success && res.data) {
          setSelectedCert(res.data);
          certModalRef.current?.open();
          return;
        }
      }

      setSelectedCert(r);
      certModalRef.current?.open();
    } catch (err: any) {
      setSelectedCert(r);
      certModalRef.current?.open();
    } finally {
      setFetchingCert(false);
    }
  };

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  const columns: columnType<Certificate>[] = useMemo(
    () => [
      {
        key: "certificateNumber",
        label: "Certificate Number",
        render: (v) => (
          <span className="font-mono text-xs font-semibold text-primary bg-primary/5 px-2.5 py-1 rounded border border-primary/10 whitespace-nowrap">
            {v || "—"}
          </span>
        ),
      },
      {
        key: "student",
        label: "Recipient / Student",
        render: (_, r) => (
          <div className="space-y-0.5">
            <span className="text-sm font-semibold text-base-content whitespace-nowrap block">
              {r.student ? `${r.student.firstName ?? ""} ${r.student.lastName ?? ""}`.trim() : "—"}
            </span>
            {r.student?.email && (
              <span className="text-xs text-base-content/60 block">{r.student.email}</span>
            )}
          </div>
        ),
      },
      {
        key: "source",
        label: "Program / Source",
        render: (_, r) => {
          const isMembership = r.sourceType === "membership" || !!r.membership;
          const title = r.membership?.name || r.course?.title || (isMembership ? "Membership" : "Course");
          return (
            <div className="space-y-0.5">
              <span className="text-sm font-medium text-base-content whitespace-nowrap block">
                {title}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-base-content/50">
                {isMembership ? "Membership" : "Course"}
              </span>
            </div>
          );
        },
      },
      {
        key: "issuedAt",
        label: "Issued Date",
        render: (v) => (
          <span className="text-sm text-base-content/70 whitespace-nowrap">
            {v ? formatDate(v, "DD MMM YYYY") : "—"}
          </span>
        ),
      },
      {
        key: "isRevoked",
        label: "Status",
        render: (v) => <StatusBadge status={v ? "revoked" : "active"} />,
      },
    ],
    [],
  );

  const actions: Actions<Certificate>[] = [
    {
      key: "view",
      label: "View Certificate",
      action: (r) => handleViewCertificate(r),
    },
    {
      key: "edit",
      label: "Edit",
      action: (r) => {
        setEdit(r);
        setForm({
          certificateNumber: r.certificateNumber ?? "",
          certificateUrl: r.certificateUrl ?? "",
          templateId: r.templateId || r.template?.id || "",
        });
      },
    },
    {
      key: "revoke",
      label: "Revoke",
      disabled: (r) => !!r.isRevoked,
      render: (r) =>
        r.isRevoked ? (
          <span className="text-secondary opacity-50">Revoked</span>
        ) : (
          <span className="text-amber-600 font-medium">Revoke</span>
        ),
      action: (r) => !r.isRevoked && setConfirm({ id: r.id, type: "revoke" }),
    },
    {
      key: "delete",
      label: "Delete",
      render: () => <span className="text-error font-medium">Delete</span>,
      action: (r) => setConfirm({ id: r.id, type: "delete" }),
    },
  ];

  return (
    <DashboardLayout title="Certificates">
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Certificates"
          value={stats.totalCertificates ?? 0}
          loading={loading}
          icon={<MedalStar size={20} color="#717171" />}
        />
        <StatCard
          title="This Month"
          value={stats.certificatesThisMonth ?? 0}
          loading={loading}
          icon={<Calendar size={20} color="#717171" />}
        />
        <StatCard
          title="This Year"
          value={stats.certificatesThisYear ?? 0}
          loading={loading}
          icon={<Calendar size={20} color="#717171" />}
        />
      </div>

      {!!stats.perCourse?.length && (
        <div className="bg-white rounded-xl border border-base-300 p-5 mb-6 shadow-sm">
          <h3 className="font-semibold text-base mb-3 text-base-content">
            Certificates per course
          </h3>
          <div className="divide-y divide-base-200">
            {stats.perCourse.map((row) => (
              <div
                key={row.courseTitle}
                className="flex justify-between py-2 text-sm text-base-content"
              >
                <span>{row.courseTitle}</span>
                <span className="font-medium">{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 bg-white rounded-xl border border-base-300 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-base text-base-content">
            All Certificates
          </h2>
        </div>
        <Divider />
        <PageLoader
          query={{
            data: items,
            isLoading: loading,
            isError,
            error,
            refetch: load,
          }}
        >
          <CustomTable
            ring={false}
            columns={columns}
            data={paginatedItems}
            actions={actions}
            totalCount={items.length}
            paginationProps={{
              page,
              pageSize: PAGE_SIZE,
              setPagination: setPage,
            }}
          />
        </PageLoader>
      </div>

      {/* View Certificate DialogModal */}
      <DialogModal
        ref={certModalRef}
        title={
          selectedCert
            ? `Certificate: ${selectedCert.certificateNumber || "Preview"}`
            : "Certificate Preview"
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
                Open Certificate
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
            {/* Metadata Summary Card */}
            <div className="bg-base-200/50 rounded-xl p-4 border border-base-300 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-base-content/60 block font-medium">
                  Certificate ID:
                </span>
                <span className="font-mono font-bold text-primary block mt-0.5">
                  {selectedCert.certificateNumber || "—"}
                </span>
              </div>
              <div>
                <span className="text-base-content/60 block font-medium">
                  Recipient:
                </span>
                <span className="font-semibold text-base-content block mt-0.5">
                  {selectedCert.student
                    ? `${selectedCert.student.firstName ?? ""} ${selectedCert.student.lastName ?? ""}`.trim()
                    : "—"}
                </span>
              </div>
              <div>
                <span className="text-base-content/60 block font-medium">
                  Source:
                </span>
                <span className="font-semibold text-base-content block mt-0.5">
                  {selectedCert.membership?.name ||
                    selectedCert.course?.title ||
                    (selectedCert.sourceType === "membership"
                      ? "Membership"
                      : "Course")}
                </span>
              </div>
              <div>
                <span className="text-base-content/60 block font-medium">
                  Status:
                </span>
                <div className="mt-0.5">
                  <StatusBadge
                    status={selectedCert.isRevoked ? "revoked" : "active"}
                  />
                </div>
              </div>
            </div>

            {/* Certificate Preview Frame */}
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

      {/* Edit Modal */}
      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title="Edit Certificate"
        size="md"
      >
        <div className="space-y-4">
          <TextField
            label="Certificate number"
            value={form.certificateNumber}
            onChange={(e) =>
              setForm({ ...form, certificateNumber: e.target.value })
            }
          />
          <TextField
            label="Certificate URL"
            value={form.certificateUrl}
            onChange={(e) =>
              setForm({ ...form, certificateUrl: e.target.value })
            }
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEdit(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (!edit) return;
                try {
                  const res = await repo.update(edit.id, form);
                  if (res.success) {
                    toast("Certificate updated", "success");
                    setEdit(null);
                    load();
                  } else {
                    toast(res.message || "Update failed", "danger");
                  }
                } catch {
                  toast("Update failed", "danger");
                }
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        open={!!confirm}
        title={
          confirm?.type === "revoke"
            ? "Revoke Certificate"
            : "Delete Certificate"
        }
        description={
          confirm?.type === "revoke"
            ? "Are you sure you want to revoke this certificate? This action cannot be easily undone."
            : "Are you sure you want to delete this certificate?"
        }
        confirmLabel={confirm?.type === "revoke" ? "Revoke" : "Delete"}
        variant="danger"
        onConfirm={async () => {
          if (!confirm) return;
          try {
            if (confirm.type === "revoke") {
              const res = await repo.revoke(confirm.id);
              if (res.success) {
                toast("Certificate revoked", "success");
                load();
              } else {
                toast(res.message || "Failed to revoke", "danger");
              }
            } else {
              const res = await repo.remove(confirm.id);
              if (res.success) {
                toast("Certificate deleted", "success");
                load();
              } else {
                toast(res.message || "Failed to delete", "danger");
              }
            }
          } catch {
            toast("Action failed", "danger");
          } finally {
            setConfirm(null);
          }
        }}
        onClose={() => setConfirm(null)}
      />
    </DashboardLayout>
  );
}
