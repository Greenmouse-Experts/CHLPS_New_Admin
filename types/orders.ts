/**
 * CHLPS Admin Portal - Orders, Transactions & Financial Analytics Types
 * Endpoints: /api/v1/orders/*, /api/v1/transactions/*
 */

import { BaseEntity, PaginationQueryDto } from "./common";

export type OrderItemType = "course" | "membership";
export type PaymentStatus = "pending" | "successful" | "failed" | "cancelled" | "refunded";
export type PaymentGateway = "paystack" | "stripe" | "bank_transfer" | "manual";

export interface OrderItem {
  id: string;
  itemType: OrderItemType;
  itemId: string;
  title: string;
  price: number;
  discount?: number;
}

export interface PaymentTransaction extends BaseEntity {
  trxRef: string;
  orderNumber: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentGateway: PaymentGateway;
  paidAt?: string | null;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: OrderItem[];
}

export interface OrderedItemDetail extends BaseEntity {
  orderNumber: string;
  itemType: OrderItemType;
  item: {
    id: string;
    title: string;
    price: number;
    coverImage?: string;
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  amount: number;
  currency: string;
  status: PaymentStatus;
  enrolledAt: string;
  progress?: number;
}

export interface CancelStudentOrderDto {
  orderNumber: string;
  reason?: string;
}

export interface StudentPurchasedCourse extends BaseEntity {
  course: {
    id: string;
    title: string;
    coverImage?: string;
  };
  purchaseDate: string;
  amount: number;
  progress: number;
  completed: boolean;
}

export interface MonthlyRevenueDataPoint {
  month: string;
  year: number;
  revenue: number;
  totalOrders: number;
}

export interface MonthlyRevenueResponse {
  data: MonthlyRevenueDataPoint[];
  totalAnnualRevenue: number;
}

export interface AdminAnalyticsResponse {
  totalRevenue: number;
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalMemberships: number;
  totalOrders: number;
  recentOrders: PaymentTransaction[];
  revenueByMonth: MonthlyRevenueDataPoint[];
}

export interface OrdersQueryDto extends PaginationQueryDto {
  status?: PaymentStatus;
  itemType?: OrderItemType;
  studentId?: string;
  startDate?: string;
  endDate?: string;
}
