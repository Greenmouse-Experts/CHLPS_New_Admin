"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components";
import { Button, Divider, StatusBadge, Tabs, useToast } from "@/components/ui";
import CustomTable, { columnType } from "@/components/tables/CustomTable";
import { Actions } from "@/components/tables/pop-up";
import PageLoader from "@/components/PageLoader";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Briefcase,
  Building,
  Calendar,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  User,
} from "lucide-react";
import StudentsRepository from "../domain/repository/students_repository";
import {
  Student,
  StudentCertificate,
  StudentOrder,
} from "../domain/data/response/students_response";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";
import { getAvatarColor } from "@/utils/avatar.colors";

export default function StudentDetailPage({ studentId }: { studentId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const repo = useMemo(() => new StudentsRepository(), []);

  const [activeTab, setActiveTab] = useState("profile");
  const [student, setStudent] = useState<Student | null>(null);
  const [orders, setOrders] = useState<StudentOrder[]>([]);
  const [certs, setCerts] = useState<StudentCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setIsError(false);
      setErrorMsg(null);

      const [s, o, c] = await Promise.all([
        repo.getStudent(studentId),
        repo.getStudentOrders(studentId),
        repo.getStudentCertificates(studentId),
      ]);

      if (s.success && s.data) {
        setStudent(s.data);
      } else {
        setIsError(true);
        setErrorMsg(s.message || "Failed to load member profile");
        toast(s.message || "Failed to load member profile", "danger");
      }

      if (o.success && o.data) {
        setOrders(o.data);
      } else {
        setOrders([]);
      }

      if (c.success && c.data) {
        setCerts(c.data);
      } else {
        setCerts([]);
      }
    } catch (err: any) {
      setIsError(true);
      setErrorMsg(err?.message || "An unexpected error occurred");
      toast("Error loading member data", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const fullName = useMemo(() => {
    if (!student) return "";
    return `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() || student.email || "Member";
  }, [student]);

  const avatarStyle = useMemo(() => {
    return getAvatarColor(fullName || studentId);
  }, [fullName, studentId]);

  // Orders Table Columns
  const orderColumns: columnType<StudentOrder>[] = [
    {
      key: "number",
      label: "Order Reference",
      render: (v, row) => (
        <span className="font-mono text-xs font-semibold text-primary bg-primary/5 px-2.5 py-1 rounded">
          {v || row.trx?.reference || row.id?.slice(0, 8).toUpperCase() || "—"}
        </span>
      ),
    },
    {
      key: "items",
      label: "Items / Courses",
      render: (_, row) => {
        const titles = row.orderItems
          ?.map((it) => it.course?.title)
          .filter(Boolean);
        if (!titles || titles.length === 0) {
          return <span className="text-xs text-base-content/60">Standard Enrollment</span>;
        }
        return (
          <div className="space-y-0.5">
            {titles.map((t, idx) => (
              <p key={idx} className="text-xs font-medium text-base-content leading-tight">
                {t}
              </p>
            ))}
          </div>
        );
      },
    },
    {
      key: "trx",
      label: "Amount Paid",
      render: (_, row) => (
        <span className="text-sm font-semibold text-base-content whitespace-nowrap">
          {formatCurrency(row.trx?.amount ?? 0, {
            currency: (row.trx as any)?.currency || "CAD",
          })}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v, row) => {
        const status = v || (row.trx?.status === "success" ? "confirmed" : "pending");
        return <StatusBadge status={status} />;
      },
    },
    {
      key: "createdDate",
      label: "Date",
      render: (v) => (
        <span className="text-sm text-base-content/70 whitespace-nowrap">
          {v ? formatDate(v, "DD MMM YYYY") : "—"}
        </span>
      ),
    },
  ];

  // Certificate Table Columns
  const certColumns: columnType<StudentCertificate>[] = [
    {
      key: "certificateNumber",
      label: "Certificate ID",
      render: (v) => (
        <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
          {v || "—"}
        </span>
      ),
    },
    {
      key: "course",
      label: "Program / Course",
      render: (_, row) => (
        <span className="text-sm font-medium text-base-content">
          {row.course?.title || "Professional Certification"}
        </span>
      ),
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
    {
      key: "actions",
      label: "Action",
      render: (_, row) =>
        row.certificateUrl ? (
          <a
            href={row.certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <ExternalLink size={13} />
            View Certificate
          </a>
        ) : (
          <span className="text-xs text-base-content/40">—</span>
        ),
    },
  ];

  return (
    <DashboardLayout title="Member Details">
      <div className="space-y-6">
        {/* Top Header / Back Button */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/students")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-base-content/70 hover:text-base-content transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Members</span>
          </button>
        </div>

        <PageLoader
          query={{
            data: student,
            isLoading: loading,
            isError,
            error: errorMsg,
            refetch: loadData,
          }}
        >
          {student && (
            <div className="space-y-6">
              {/* Member Profile Hero Banner Card */}
              <div className="bg-white rounded-2xl border border-[#E7E9EB] p-6 shadow-xs">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    {student.picture ? (
                      <img
                        src={student.picture}
                        alt={fullName}
                        className="w-20 h-20 rounded-2xl object-cover border border-[#E7E9EB] shadow-xs shrink-0"
                      />
                    ) : (
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 shadow-xs"
                        style={{
                          backgroundColor: avatarStyle.bg,
                          color: avatarStyle.text,
                        }}
                      >
                        {(student.firstName?.[0] || fullName[0] || "M").toUpperCase()}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h1 className="text-xl font-bold text-base-content">
                          {fullName}
                        </h1>
                        <StatusBadge status={student.isActive ? "active" : "inactive"} />
                        {student.isSuspended && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Suspended
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-base-200 text-base-content/80 uppercase tracking-wide">
                          {student.role || "Member"}
                        </span>
                      </div>

                      {/* Official Designation & Work */}
                      {(student.officialDesignation || student.placeOfWork) && (
                        <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                          <Briefcase size={14} className="shrink-0" />
                          <span>
                            {student.officialDesignation || "Professional"}
                            {student.placeOfWork ? ` at ${student.placeOfWork}` : ""}
                          </span>
                        </p>
                      )}

                      {/* Contact metadata pills */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-base-content/60 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail size={13} className="text-base-content/40" />
                          {student.email}
                        </span>
                        {student.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={13} className="text-base-content/40" />
                            {student.phone}
                          </span>
                        )}
                        {(student.stateProvince || student.country) && (
                          <span className="flex items-center gap-1">
                            <MapPin size={13} className="text-base-content/40" />
                            {[student.stateProvince, student.country]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-base-content/40" />
                          Joined {formatDate(student.createdDate, "DD MMM YYYY")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="space-y-4">
                <Tabs
                  tabs={[
                    { key: "profile", label: "Profile & Overview" },
                    { key: "orders", label: `Orders (${orders.length})` },
                    { key: "certificates", label: `Certificates (${certs.length})` },
                  ]}
                  activeKey={activeTab}
                  onChange={setActiveTab}
                />

                {/* TAB 1: Profile & Overview */}
                {activeTab === "profile" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Personal & Contact Details */}
                    <div className="bg-white rounded-xl border border-[#E7E9EB] p-5 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-[#E7E9EB]">
                        <User size={18} className="text-primary" />
                        <h2 className="text-sm font-bold text-base-content">
                          Personal & Contact Information
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-base-content/60 font-medium">First Name</p>
                          <p className="font-semibold text-base-content mt-0.5">
                            {student.firstName || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-base-content/60 font-medium">Last Name</p>
                          <p className="font-semibold text-base-content mt-0.5">
                            {student.lastName || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-base-content/60 font-medium">Email Address</p>
                          <p className="font-semibold text-base-content mt-0.5">
                            {student.email || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-base-content/60 font-medium">Phone Number</p>
                          <p className="font-semibold text-base-content mt-0.5">
                            {student.phone || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-base-content/60 font-medium">Country</p>
                          <p className="font-semibold text-base-content mt-0.5">
                            {student.country || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-base-content/60 font-medium">State / Province</p>
                          <p className="font-semibold text-base-content mt-0.5">
                            {student.stateProvince || "—"}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-base-content/60 font-medium">Address</p>
                          <p className="font-semibold text-base-content mt-0.5">
                            {student.address || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-base-content/60 font-medium">Joined Date</p>
                          <p className="font-semibold text-base-content mt-0.5">
                            {student.createdDate
                              ? formatDate(student.createdDate, "DD MMMM YYYY")
                              : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-base-content/60 font-medium">System Role</p>
                          <p className="font-semibold text-base-content mt-0.5 uppercase">
                            {student.role || "student"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Professional & Qualification Details */}
                    <div className="bg-white rounded-xl border border-[#E7E9EB] p-5 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-[#E7E9EB]">
                        <Briefcase size={18} className="text-primary" />
                        <h2 className="text-sm font-bold text-base-content">
                          Professional & Educational Information
                        </h2>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div>
                          <p className="text-base-content/60 font-medium">
                            Place of Work / Organization
                          </p>
                          <p className="font-semibold text-base-content mt-0.5 text-sm">
                            {student.placeOfWork || "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-base-content/60 font-medium">
                            Official Designation / Title
                          </p>
                          <p className="font-semibold text-base-content mt-0.5 text-sm">
                            {student.officialDesignation || "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-base-content/60 font-medium">
                            Education & Professional Qualifications
                          </p>
                          <p className="font-semibold text-base-content mt-0.5 text-sm">
                            {student.currentEducationOrProfessionalQualification || "—"}
                          </p>
                        </div>

                        {student.bio && (
                          <div>
                            <p className="text-base-content/60 font-medium">Bio / Summary</p>
                            <p className="text-base-content/80 mt-1 leading-relaxed">
                              {student.bio}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Social Profiles if present */}
                      {(student.linkedinUrl || student.twitterUrl || student.facebookUrl) && (
                        <div className="pt-3 border-t border-[#E7E9EB] space-y-2">
                          <p className="text-xs font-bold text-base-content/70 uppercase tracking-wider">
                            Social & Online Profiles
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            {student.linkedinUrl && (
                              <a
                                href={student.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7E9EB] text-primary hover:bg-primary/5 transition-colors"
                              >
                                <ExternalLink size={13} />
                                LinkedIn Profile
                              </a>
                            )}
                            {student.twitterUrl && (
                              <a
                                href={student.twitterUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7E9EB] text-primary hover:bg-primary/5 transition-colors"
                              >
                                <ExternalLink size={13} />
                                Twitter / X
                              </a>
                            )}
                            {student.facebookUrl && (
                              <a
                                href={student.facebookUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7E9EB] text-primary hover:bg-primary/5 transition-colors"
                              >
                                <ExternalLink size={13} />
                                Facebook
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: Orders */}
                {activeTab === "orders" && (
                  <div className="bg-white rounded-xl border border-[#E7E9EB] p-4 shadow-xs">
                    <CustomTable
                      ring={false}
                      columns={orderColumns}
                      data={orders}
                      totalCount={orders.length}
                    />
                  </div>
                )}

                {/* TAB 3: Certificates */}
                {activeTab === "certificates" && (
                  <div className="bg-white rounded-xl border border-[#E7E9EB] p-4 shadow-xs">
                    <CustomTable
                      ring={false}
                      columns={certColumns}
                      data={certs}
                      totalCount={certs.length}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </PageLoader>
      </div>
    </DashboardLayout>
  );
}
