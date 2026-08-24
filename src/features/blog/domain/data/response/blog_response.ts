import { ApiResponse } from "@/lib/network/entity/api_response";

export interface BlogTag {
  id: string;
  tag: string;
  isPublished?: boolean;
  createdDate?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  brief?: string;
  description?: string;
  coverImage?: string;
  isPublished?: boolean;
  createdDate?: string;
  tags?: BlogTag[];
  user?: { firstName?: string; lastName?: string };
}

export type TagsApiResponse = ApiResponse<BlogTag[]>;
export type PostsApiResponse = ApiResponse<{ items: BlogPost[]; count: number }>;
export type PostApiResponse = ApiResponse<BlogPost>;
