/**
 * CHLPS Admin Portal - Educational Programs Types
 * Endpoints: /api/v1/programs/*
 */

import { BaseEntity, PaginationQueryDto } from "./common";

export interface Program extends BaseEntity {
  title: string;
  slug?: string;
  coverImage?: string;
  isPublished: boolean;
  coursesCount?: number;
  description?: string;
}

export interface CreateProgramDto {
  title: string;
  coverImage?: string;
  isPublished?: boolean;
}

export type UpdateProgramDto = Partial<CreateProgramDto>;

export interface ProgramsQueryDto extends PaginationQueryDto {
  title?: string;
  isPublished?: boolean;
}
