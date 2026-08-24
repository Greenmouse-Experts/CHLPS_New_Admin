import ApiService from "@/lib/network/api";
import { ApiUrls } from "@/lib/network/api_url";
import { fail, ok } from "@/lib/network/entity/api_response";
import { unwrapCount, unwrapList, unwrapMessage } from "@/lib/tokens";
import { Faq, FaqsApiResponse } from "../data/response/faqs_response";

class FaqsRepository {
  private _api = new ApiService();

  public async list(page = 1): Promise<FaqsApiResponse> {
    const res = await this._api.getData<unknown>(ApiUrls.faqs, { page, pageSize: 10 });
    if (res.success) {
      return ok({ items: unwrapList<Faq>(res.data), count: unwrapCount(res.data, unwrapList(res.data).length) });
    }
    return fail(res.message || "Failed to fetch FAQs");
  }

  public async create(payload: { question: string; answer: string }) {
    const res = await this._api.postData<typeof payload, { message?: string }>(ApiUrls.createFaq, payload);
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Created") };
  }

  public async update(id: string, payload: { question?: string; answer?: string }) {
    const res = await this._api.patchData<typeof payload, { message?: string }>(ApiUrls.faqById(id), payload);
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Updated") };
  }

  public async publish(id: string, isPublished: boolean) {
    const res = await this._api.patchData<{ isPublished: boolean }, { message?: string }>(
      ApiUrls.publishFaq(id),
      { isPublished },
    );
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Updated") };
  }

  public async remove(id: string) {
    const res = await this._api.deleteData<{ message?: string }>(ApiUrls.faqById(id));
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Deleted") };
  }
}

export default FaqsRepository;
