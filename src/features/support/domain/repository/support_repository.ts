import ApiService from "@/lib/network/api";
import { ApiUrls } from "@/lib/network/api_url";
import { fail, ok } from "@/lib/network/entity/api_response";
import { unwrapList, unwrapMessage } from "@/lib/tokens";
import { ContactMessage, MessagesApiResponse } from "../data/response/support_response";

class SupportRepository {
  private _api = new ApiService();

  public async list(): Promise<MessagesApiResponse> {
    const res = await this._api.getData<unknown>(ApiUrls.contactMessages);
    if (res.success) return ok(unwrapList<ContactMessage>(res.data));
    return fail(res.message || "Failed to fetch messages");
  }

  public async markRead(id: string) {
    const res = await this._api.patchData<undefined, { message?: string }>(ApiUrls.markContactRead(id));
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Marked as read") };
  }
}

export default SupportRepository;
