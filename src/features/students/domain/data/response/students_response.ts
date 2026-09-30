import { ApiResponse } from "@/lib/network/entity/api_response";
import { Person } from "@/features/admins/domain/data/response/admin_response";

export interface Student extends Person {
  placeOfWork?: string | null;
  officialDesignation?: string | null;
  currentEducationOrProfessionalQualification?: string | null;
  country?: string | null;
  stateProvince?: string | null;
}

export interface StudentCourseItem {
  id: string;
  title?: string;
  slug?: string;
  shortDesc?: string;
  fullDesc?: string;
  price?: number;
  discount?: number;
  isPublished?: boolean;
  featured?: boolean;
  coverImage?: string | null;
  banner?: string | null;
  bannerText?: string | null;
  totalContent?: number;
  completedContent?: number;
  assessment?: {
    total?: number;
    done?: number;
  };
}

export interface StudentOrderDetails {
  id: string;
  number?: string;
  status?: string;
  createdDate?: string;
}

export interface StudentOrderItem {
  id: string;
  price?: number;
  course?: StudentCourseItem;
}

export interface StudentOrder {
  id: string;
  documents?: any;
  price?: number;
  course?: StudentCourseItem;
  order?: StudentOrderDetails;
  // Legacy / fallback fields
  number?: string;
  status?: string;
  createdDate?: string;
  orderItems?: StudentOrderItem[];
  trx?: {
    amount?: number;
    reference?: string;
    status?: string;
    currency?: string;
  };
}

export interface StudentCertificate {
  id: string;
  sourceType?: string;
  certificateNumber?: string;
  certificateUrl?: string;
  issuedAt?: string;
  isRevoked?: boolean;
  revokedAt?: string | null;
  course?: { id?: string; title?: string };
  membership?: { id?: string; name?: string; slug?: string };
}

export type StudentsApiResponse = ApiResponse<Student[]>;
export type StudentApiResponse = ApiResponse<Student>;
export type StudentOrdersApiResponse = ApiResponse<StudentOrder[]>;
export type StudentCertificatesApiResponse = ApiResponse<StudentCertificate[]>;
