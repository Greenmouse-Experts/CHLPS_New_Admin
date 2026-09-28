import ApiService from "@/lib/network/api";
import { ApiUrls } from "@/lib/network/api_url";
import { fail, ok } from "@/lib/network/entity/api_response";
import { unwrapCount, unwrapList, unwrapMessage } from "@/lib/tokens";
import {
  Testimonial,
  TestimonialPayload,
  TestimonialsApiResponse,
} from "../data/response/testimonials_response";

class TestimonialsRepository {
  private _api = new ApiService();

  public async list(
    isAdmin: boolean,
    page = 1,
    pageSize = 20,
    publishedFilter?: boolean,
  ): Promise<TestimonialsApiResponse> {
    const params: Record<string, unknown> = { page, pageSize };
    if (typeof publishedFilter === "boolean") {
      params.published = publishedFilter ? 1 : 0;
    }

    const endpoint = isAdmin ? ApiUrls.adminTestimonials : ApiUrls.testimonialsPublished;
    const res = await this._api.getData<unknown>(endpoint, params);

    if (res.success) {
      const items = unwrapList<Testimonial>(res.data);
      const count = unwrapCount(res.data, items.length);
      return ok({ items, count });
    }
    return fail(res.message || "Failed to fetch testimonials");
  }

  public async create(payload: TestimonialPayload) {
    const res = await this._api.postData<TestimonialPayload, { message?: string }>(
      ApiUrls.adminTestimonials,
      payload,
    );
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Testimonial created successfully"),
    };
  }

  public async update(id: string, payload: Partial<TestimonialPayload>) {
    const res = await this._api.patchData<Partial<TestimonialPayload>, { message?: string }>(
      ApiUrls.adminTestimonialById(id),
      payload,
    );
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Testimonial updated successfully"),
    };
  }

  public async setPublished(id: string, isPublished: boolean) {
    // Try the specific change-availability endpoint first, fallback to PATCH update
    const res = await this._api.patchData<{ isPublished: boolean }, { message?: string }>(
      ApiUrls.adminTestimonialAvailability(id),
      { isPublished },
    );

    if (res.success) {
      return {
        success: true,
        message: unwrapMessage(res.data, res.message || "Availability updated successfully"),
      };
    }

    // Fallback: direct PATCH on resource
    const fallbackRes = await this.update(id, { isPublished });
    return fallbackRes;
  }

  public async remove(id: string) {
    const res = await this._api.deleteData<{ message?: string }>(
      ApiUrls.adminTestimonialById(id),
    );
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Testimonial deleted successfully"),
    };
  }
}

export default TestimonialsRepository;
