import ApiService from "@/lib/network/api";
import { ApiUrls } from "@/lib/network/api_url";
import { fail, ok } from "@/lib/network/entity/api_response";
import { unwrapCount, unwrapList, unwrapMessage } from "@/lib/tokens";
import { Testimonial, TestimonialsApiResponse } from "../data/response/testimonials_response";

class TestimonialsRepository {
  private _api = new ApiService();

  public async list(isAdmin: boolean, page = 1): Promise<TestimonialsApiResponse> {
    const res = await this._api.getData<unknown>(
      isAdmin ? ApiUrls.testimonials : ApiUrls.testimonialsPublished,
      { page },
    );
    if (res.success) {
      return ok({
        items: unwrapList<Testimonial>(res.data),
        count: unwrapCount(res.data, unwrapList(res.data).length),
      });
    }
    return fail(res.message || "Failed to fetch testimonials");
  }

  public async setPublished(id: string, isPublished: boolean) {
    const res = await this._api.patchData<{ isPublished: boolean }, { message?: string }>(
      ApiUrls.testimonialAvailability(id),
      { isPublished },
    );
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Updated") };
  }

  public async remove(id: string) {
    const res = await this._api.deleteData<{ message?: string }>(ApiUrls.testimonialById(id));
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Deleted") };
  }
}

export default TestimonialsRepository;
