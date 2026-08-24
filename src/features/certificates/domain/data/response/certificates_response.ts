import { ApiResponse } from "@/lib/network/entity/api_response";

export interface Certificate {
  id: string;
  certificateNumber?: string;
  certificateUrl?: string;
  issuedAt?: string;
  isRevoked?: boolean;
  templateId?: string;
  template?: { id?: string };
  student?: { firstName?: string; lastName?: string };
  course?: { title?: string };
}

export interface CertStats {
  totalCertificates?: number;
  certificatesThisMonth?: number;
  certificatesThisYear?: number;
  perCourse?: { courseTitle: string; count: number | string }[];
}

export interface CertTemplate {
  id: string;
  name: string;
  fileUrl?: string;
  isActive?: boolean;
  createdDate?: string;
}

export type CertificatesApiResponse = ApiResponse<Certificate[]>;
export type CertStatsApiResponse = ApiResponse<CertStats>;
export type TemplatesApiResponse = ApiResponse<CertTemplate[]>;
