import ApiService from "@/lib/network/api";
import { ApiUrls } from "@/lib/network/api_url";
import { fail, ok } from "@/lib/network/entity/api_response";
import { unwrapCount, unwrapList, unwrapMessage } from "@/lib/tokens";
import { BlogPost, BlogTag, PostApiResponse, PostsApiResponse, TagsApiResponse } from "../data/response/blog_response";

class BlogRepository {
  private _api = new ApiService();

  public async listTags(): Promise<TagsApiResponse> {
    const res = await this._api.getData<unknown>(ApiUrls.blogTags);
    if (res.success) return ok(unwrapList<BlogTag>(res.data));
    return fail(res.message || "Failed to fetch tags");
  }

  public async createTag(tag: string) {
    const res = await this._api.postData<{ tag: string }, { message?: string }>(ApiUrls.createBlogTag, { tag });
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Created") };
  }

  public async updateTag(id: string, payload: { tag?: string; isPublished?: boolean }) {
    const res = await this._api.patchData<typeof payload, { message?: string }>(ApiUrls.updateBlogTag(id), payload);
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Updated") };
  }

  public async deleteTag(id: string) {
    const res = await this._api.deleteData<{ message?: string }>(ApiUrls.deleteBlogTag(id));
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Deleted") };
  }

  public async listPosts(page = 1): Promise<PostsApiResponse> {
    const res = await this._api.getData<unknown>(ApiUrls.blogPosts, { page, pageSize: 10 });
    if (res.success) {
      return ok({ items: unwrapList<BlogPost>(res.data), count: unwrapCount(res.data, unwrapList(res.data).length) });
    }
    return fail(res.message || "Failed to fetch posts");
  }

  public async getPost(id: string): Promise<PostApiResponse> {
    const res = await this._api.getData<BlogPost | { data: BlogPost }>(ApiUrls.blogPostById(id));
    if (res.success && res.data) {
      const post = "data" in res.data && (res.data as { data: BlogPost }).data
        ? (res.data as { data: BlogPost }).data
        : (res.data as BlogPost);
      return ok(post);
    }
    return fail(res.message || "Failed to fetch post");
  }

  public async createPost(payload: {
    title: string; brief: string; description: string; coverImage: string; isPublished: boolean; tags: { id: string }[];
  }) {
    const res = await this._api.postData<typeof payload, { message?: string }>(ApiUrls.createBlogPost, payload);
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Created") };
  }

  public async updatePost(id: string, payload: Record<string, unknown>) {
    const res = await this._api.patchData<typeof payload, { message?: string }>(ApiUrls.updateBlogPost(id), payload);
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Updated") };
  }

  public async deletePost(id: string) {
    const res = await this._api.deleteData<{ message?: string }>(ApiUrls.deleteBlogPost(id));
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Deleted") };
  }
}

export default BlogRepository;
