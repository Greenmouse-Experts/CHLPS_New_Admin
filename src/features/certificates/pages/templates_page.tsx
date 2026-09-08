"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components";
import {
  Button,
  ConfirmModal,
  Divider,
  Modal,
  StatusBadge,
  TextField,
  useToast,
} from "@/components/ui";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";
import PageLoader from "@/components/PageLoader";
import { AddCircle } from "iconsax-react";
import CertificatesRepository from "../domain/repository/certificates_repository";
import { CertTemplate } from "../domain/data/response/certificates_response";
import { formatDate } from "@/utils/helper/formate_date";

const PAGE_SIZE = 10;

export default function TemplatesPage() {
  const { toast } = useToast();
  const repo = useMemo(() => new CertificatesRepository(), []);
  const [items, setItems] = useState<CertTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [confirm, setConfirm] = useState<{
    id: string;
    type: "default" | "delete";
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setIsError(false);
    setError(null);
    try {
      const res = await repo.listTemplates();
      if (res.success && res.data) setItems(res.data);
      else {
        setIsError(true);
        setError(res.message || "Failed to load templates");
        toast(res.message, "danger");
      }
    } catch (err) {
      setIsError(true);
      setError(err);
      toast("Failed to load templates", "danger");
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

  const columns: columnType<CertTemplate>[] = useMemo(
    () => [
      {
        key: "name",
        label: "Name",
        render: (v) => (
          <span className="text-sm font-medium text-base-content whitespace-nowrap">
            {v || "—"}
          </span>
        ),
      },
      {
        key: "createdDate",
        label: "Created",
        render: (v) => (
          <span className="text-sm text-secondary whitespace-nowrap">
            {v ? formatDate(v, "DD MMM YYYY") : "—"}
          </span>
        ),
      },
      {
        key: "isActive",
        label: "Default",
        render: (v) => <StatusBadge status={v ? "active" : "inactive"} />,
      },
    ],
    [],
  );

  const actions: Actions<CertTemplate>[] = [
    {
      key: "set_default",
      label: "Set default",
      disabled: (r) => !!r.isActive,
      render: (r) =>
        r.isActive ? (
          <span className="text-secondary opacity-50">Default</span>
        ) : (
          <span className="text-emerald-600 font-medium">Set default</span>
        ),
      action: (r) => !r.isActive && setConfirm({ id: r.id, type: "default" }),
    },
    {
      key: "delete",
      label: "Delete",
      render: () => <span className="text-error font-medium">Delete</span>,
      action: (r) => setConfirm({ id: r.id, type: "delete" }),
    },
  ];

  return (
    <DashboardLayout title="Certificate Templates">
      <div className="space-y-3 bg-white rounded-xl border border-base-300 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-base text-base-content">
            Templates
          </h2>
          <Button
            leftIcon={<AddCircle size={14} color="currentColor" />}
            onClick={() => setOpen(true)}
          >
            Upload template
          </Button>
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
        open={open}
        onClose={() => setOpen(false)}
        title="Upload Template"
        size="sm"
      >
        <div className="space-y-4">
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="file"
            className="text-sm text-[#717171]"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button
            fullWidth
            onClick={async () => {
              if (!file) return;
              const res = await repo.uploadTemplate(name, file);
              if (res.success) {
                toast(res.message, "success");
                setOpen(false);
                setName("");
                setFile(null);
                load();
              } else toast(res.message, "danger");
            }}
          >
            Upload
          </Button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Confirm"
        description="Apply this action?"
        variant={confirm?.type === "delete" ? "danger" : "primary"}
        onConfirm={async () => {
          if (!confirm) return;
          if (confirm.type === "default") await repo.setDefault(confirm.id);
          else await repo.deleteTemplate(confirm.id);
          setConfirm(null);
          load();
        }}
      />
    </DashboardLayout>
  );
}
