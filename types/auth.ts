/**
 * CHLPS Admin Portal - Authentication & Admin Profile Types
 * Endpoints: /api/v1/auth/*
 */

import { BaseEntity } from "./common";

export interface SignInDto {
  email: string;
  password: string;
}

export interface SignInResponseData {
  token: string;
  user: AdminUser;
}

export interface AdminUser extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "admin" | "subadmin" | "superadmin";
  picture?: string | null;
  address?: string | null;
  bio?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  isEmailVerified?: boolean;
  isActive?: boolean;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  picture?: string;
  address?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  bio?: string;
}

export interface UpdatePasswordDto {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}

export interface ResetPasswordRequestDto {
  email: string;
}

export interface ResetPasswordDto {
  newPassword: string;
  newPasswordConfirmation: string;
}
