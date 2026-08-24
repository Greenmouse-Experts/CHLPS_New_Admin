import ApiService from "@/lib/network/api";
import { ApiUrls } from "@/lib/network/api_url";
import { fail, ok } from "@/lib/network/entity/api_response";
import { unwrapCount, unwrapList } from "@/lib/tokens";
import { PaymentDetailApiResponse, PaymentOrder, PaymentsApiResponse } from "../data/response/payments_response";

class PaymentsRepository {
  private _api = new ApiService();

  public async list(status: string, page = 1): Promise<PaymentsApiResponse> {
    const res = await this._api.getData<unknown>(ApiUrls.studentTrx, { status, page });
    if (res.success) {
      return ok({
        items: unwrapList<PaymentOrder>(res.data),
        count: unwrapCount(res.data, unwrapList(res.data).length),
      });
    }
    return fail(res.message || "Failed to fetch payments");
  }

  public async detail(id: string): Promise<PaymentDetailApiResponse> {
    const res = await this._api.getData<PaymentOrder | { data: PaymentOrder }>(ApiUrls.orderItemDetails(id));
    if (res.success && res.data) {
      const data = "data" in res.data && (res.data as { data: PaymentOrder }).data
        ? (res.data as { data: PaymentOrder }).data
        : (res.data as PaymentOrder);
      return ok(data);
    }
    return fail(res.message || "Failed to fetch payment");
  }
}

export default PaymentsRepository;
