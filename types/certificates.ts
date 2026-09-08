/**
 * CHLPS Admin Portal - Certificates & Templates Types
 * Endpoints: /api/v1/certificates/*
 */

import { BaseEntity, PaginationQueryDto } from "./common";

export interface Certificate extends BaseEntity {
  certificateNumber: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
  };
  templateId?: string;
  certificateUrl: string;
  issueDate?: string;
  isRevoked: boolean;
  revokedAt?: string | null;
  revocationReason?: string | null;
}

export interface GenerateCertificateDto {
  courseId: string;
  studentId?: string;
}

export interface CertificateJobStatus {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  certificateId?: string;
  certificateUrl?: string;
  error?: string;
}

export interface UpdateCertificateDto {
  certificateUrl?: string;
  templateId?: string;
  certificateNumber?: string;
}

export interface CertificateStats {
  totalIssued: number;
  activeCertificates: number;
  revokedCertificates: number;
  pendingGeneration: number;
}

export interface CertificateTemplate extends BaseEntity {
  name: string;
  fileUrl: string;
  previewUrl?: string;
  isDefault: boolean;
}

export interface CreateCertificateTemplateDto {
  name: string;
  file: File | Blob;
  isDefault?: boolean;
}

export interface CertificatesQueryDto extends PaginationQueryDto {
  studentId?: string;
  courseId?: string;
  isRevoked?: boolean;
}
