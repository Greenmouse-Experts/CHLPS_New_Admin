import { ApiResponse } from "@/lib/network/entity/api_response";

export interface CertificateStudent {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  picture?: string | null;
  placeOfWork?: string | null;
  officialDesignation?: string | null;
  currentEducationOrProfessionalQualification?: string | null;
  country?: string | null;
  stateProvince?: string | null;
}

export interface CertificateCourse {
  id?: string;
  title?: string;
  slug?: string;
}

export interface CertificateMembership {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
}

export interface Certificate {
  id: string;
  sourceType?: "course" | "membership" | string;
  certificateNumber?: string;
  certificateUrl?: string;
  issuedAt?: string;
  isRevoked?: boolean;
  revokedAt?: string | null;
  templateId?: string;
  template?: { id?: string; name?: string };
  student?: CertificateStudent;
  course?: CertificateCourse;
  membership?: CertificateMembership;
  createdDate?: string;
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
export type CertificateApiResponse = ApiResponse<Certificate>;
export type CertStatsApiResponse = ApiResponse<CertStats>;
export type TemplatesApiResponse = ApiResponse<CertTemplate[]>;
