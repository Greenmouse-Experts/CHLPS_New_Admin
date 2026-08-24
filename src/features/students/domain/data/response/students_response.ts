import { ApiResponse } from "@/lib/network/entity/api_response";
import { Person } from "@/features/admins/domain/data/response/admin_response";

export type Student = Person;

export interface StudentOrderItem {
  id: string;
  price?: number;
  course?: {
    id?: string;
    title?: string;
    coverImage?: string;
  };
}

export interface StudentOrder {
  id: string;
  number?: string;
  status?: string;
  createdDate?: string;
  orderItems?: StudentOrderItem[];
  trx?: {
    amount?: number;
    reference?: string;
    status?: string;
  };
}

export interface StudentCertificate {
  id: string;
  certificateNumber?: string;
  certificateUrl?: string;
  issuedAt?: string;
  isRevoked?: boolean;
  course?: { title?: string };
}

export type StudentsApiResponse = ApiResponse<Student[]>;
export type StudentApiResponse = ApiResponse<Student>;
export type StudentOrdersApiResponse = ApiResponse<StudentOrder[]>;
export type StudentCertificatesApiResponse = ApiResponse<StudentCertificate[]>;
