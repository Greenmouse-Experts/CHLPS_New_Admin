import { ApiResponse } from "@/lib/network/entity/api_response";

export interface PaymentOrder {
  id: string;
  number?: string;
  status?: string;
  createdDate?: string;
  buyer?: { firstName?: string; lastName?: string };
  trx?: {
    id?: string;
    reference?: string;
    amount?: number;
    subAmount?: number;
    status?: string;
    createdDate?: string;
  };
  orderItems?: { id: string; price?: number; course?: { title?: string; coverImage?: string } }[];
}

export type PaymentsApiResponse = ApiResponse<{ items: PaymentOrder[]; count: number }>;
export type PaymentDetailApiResponse = ApiResponse<PaymentOrder>;
