import ApiService from "@/lib/network/api";
import { ApiUrls } from "@/lib/network/api_url";
import { unwrapMessage } from "@/lib/tokens";
import {
  MembershipPayload,
  MembershipStatus,
} from "../data/response/membership_response";

export class MembershipRepository {
  private _api = new ApiService();

  public async updateStatus(id: string, status: MembershipStatus | string) {
    const res = await this._api.patchData<{ status: string }, { message?: string }>(
      ApiUrls.membershipStatus(id),
      { status },
    );
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Status updated"),
    };
  }

  public async create(payload: MembershipPayload) {
    const res = await this._api.postData<MembershipPayload, { message?: string }>(
      ApiUrls.createMembership,
      payload,
    );
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Created"),
    };
  }

  public async update(id: string, payload: Partial<MembershipPayload>) {
    const res = await this._api.patchData<typeof payload, { message?: string }>(
      ApiUrls.membershipById(id),
      payload,
    );
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Updated"),
    };
  }

  public async remove(id: string) {
    const res = await this._api.deleteData<{ message?: string }>(
      ApiUrls.membershipById(id),
    );
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Deleted"),
    };
  }
}

export default MembershipRepository;
