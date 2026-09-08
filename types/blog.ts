/**
 * CHLPS Admin Portal - Blog Posts & Tags Types
 * Endpoints: /api/v1/blog/*
 */

import { BaseEntity, PaginationQueryDto } from "./common";

export interface BlogTag extends BaseEntity {
  tag: string;
  name?: string;
  isPublished?: boolean;
}

export interface CreateBlogTagDto {
  tag: string;
  isPublished?: boolean;
}

export type UpdateBlogTagDto = Partial<CreateBlogTagDto>;

export interface BlogPost extends BaseEntity {
  title: string;
  slug?: string;
  brief: string;
  description: string;
  coverImage?: string;
  isPublished: boolean;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    picture?: string;
  };
  tags?: BlogTag[] | string[];
  viewsCount?: number;
}

export interface CreateBlogPostDto {
  title: string;
  description: string;
  brief: string;
  coverImage?: string;
  tags?: string[];
  isPublished?: boolean;
}

export type UpdateBlogPostDto = Partial<CreateBlogPostDto>;

export interface RemovePostTagDto {
  tagId: string;
}

export interface BlogQueryDto extends PaginationQueryDto {
  tag?: string;
  isPublished?: boolean;
}
