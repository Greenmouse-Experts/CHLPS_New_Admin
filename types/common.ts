/**
 * CHLPS Admin Portal - Common API & Pagination Types
 * Derived from Postman Collection & Backend Specifications
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  code?: number;
  errors?: Record<string, string[] | string>;
}

export interface PaginatedResult<T> {
  items: T[];
  count: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export type PaginatedApiResponse<T> = ApiResponse<PaginatedResult<T>>;

export type SortOrder = "ASC" | "DESC";

export interface PaginationQueryDto {
  page?: number;
  pageSize?: number;
  search?: string;
  orderBy?: string;
  sortOrder?: SortOrder;
}

export interface BaseEntity {
  id: string;
  createdDate?: string;
  updatedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IdParam {
  id: string;
}
