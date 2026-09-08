/**
 * CHLPS Admin Portal - User & Sub-Admin Management Types
 * Endpoints: /api/v1/user/*
 */

import { BaseEntity, PaginationQueryDto } from "./common";

export type UserRole = "admin" | "subadmin" | "instructor" | "student";

export interface CreateSubAdminDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  roles?: string[];
  permissions?: string[];
}

export interface CreateInstructorDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  specialization?: string;
  bio?: string;
}

export interface UserPerson extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  picture?: string | null;
  isActive?: boolean;
  isEmailVerified?: boolean;
  status?: string;
  lastLogin?: string | null;
}

export interface SubAdminUser extends UserPerson {
  role: "subadmin" | "admin";
  permissions?: string[];
}

export interface InstructorUser extends UserPerson {
  role: "instructor";
  coursesCount?: number;
  studentsCount?: number;
  rating?: number;
}

export interface StudentUser extends UserPerson {
  role: "student";
  purchasedCoursesCount?: number;
  activeMembershipsCount?: number;
  certificatesCount?: number;
}

export interface UsersQueryDto extends PaginationQueryDto {
  role?: UserRole;
  isActive?: boolean;
  status?: string;
}
