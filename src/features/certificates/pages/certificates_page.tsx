"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardLayout, StatCard } from "@/components";
import {
  Button,
  ConfirmModal,
  Divider,
  Modal,
  StatusBadge,
  TextField,
  Select,
  useToast,
} from "@/components/ui";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";
import PageLoader from "@/components/PageLoader";
import { MedalStar, Calendar } from "iconsax-react";
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
  const [items, setItems] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<CertStats>({});
  const [templates, setTemplates] = useState<CertTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState<Certificate | null>(null);
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

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  const columns: columnType<Certificate>[] = useMemo(
    () => [
      {
        key: "certificateNumber",
        label: "Number",
        render: (v) => (
          <span className="text-sm font-semibold text-base-content whitespace-nowrap">
            {v || "—"}
          </span>
        ),
      },
      {
        key: "student",
        label: "Student",
        render: (_, r) => (
          <span className="text-sm text-base-content whitespace-nowrap">
            {r.student ? `${r.student.firstName} ${r.student.lastName}` : "—"}
          </span>
        ),
      },
      {
        key: "course",
        label: "Course",
        render: (_, r) => (
          <span className="text-sm text-base-content whitespace-nowrap">
            {r.course?.title || "—"}
          </span>
        ),
      },
      {
        key: "issuedAt",
        label: "Issued",
        render: (v) => (
          <span className="text-sm text-secondary whitespace-nowrap">
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
      disabled: (r) => !r.certificateUrl,
      action: (r) =>
        r.certificateUrl && window.open(r.certificateUrl, "_blank"),
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
          <Select
            label="Template"
            value={form.templateId}
            onChange={(v) => setForm({ ...form, templateId: v })}
            options={templates.map((t) => ({ label: t.name, value: t.id }))}
          />
          <Button
            fullWidth
            onClick={async () => {
              if (!edit) return;
              const res = await repo.update(edit.id, form);
              if (res.success) {
                toast(res.message, "success");
                setEdit(null);
                load();
              } else toast(res.message, "danger");
            }}
          >
            Save
          </Button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Confirm"
        description="Apply this action?"
        variant="danger"
        onConfirm={async () => {
          if (!confirm) return;
          if (confirm.type === "revoke") await repo.revoke(confirm.id);
          else await repo.remove(confirm.id);
          setConfirm(null);
          load();
        }}
      />
    </DashboardLayout>
  );
}
