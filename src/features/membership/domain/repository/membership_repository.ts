import ApiService from "@/lib/network/api";
import { ApiUrls } from "@/lib/network/api_url";
import { fail, ok } from "@/lib/network/entity/api_response";
import {
  unwrapCount,
  unwrapEntity,
  unwrapList,
  unwrapMessage,
} from "@/lib/tokens";
import {
  Membership,
  MembershipApiResponse,
  MembershipsApiResponse,
  MembershipPayload,
  MembershipStatus,
  MembershipStats,
  MembershipStatsApiResponse,
} from "../data/response/membership_response";

export class MembershipRepository {
  private _api = new ApiService();

  public async list(
    params?: Record<string, unknown>,
  ): Promise<MembershipsApiResponse> {
    const res = await this._api.getData<unknown>(ApiUrls.memberships, params);
    if (res.success) {
      return ok({
        items: unwrapList<Membership>(res.data),
        count: unwrapCount(res.data, unwrapList(res.data).length),
      });
    }
    return fail(res.message || "Failed to fetch memberships");
  }

  public async getOne(id: string): Promise<MembershipApiResponse> {
    const res = await this._api.getData<unknown>(ApiUrls.membershipById(id));
    if (res.success && res.data) {
      const item = unwrapEntity<Membership>(res.data);
      if (item) return ok(item);
    }
    return fail(res.message || "Failed to fetch membership details");
  }

  public async getStats(): Promise<MembershipStatsApiResponse> {
    const res = await this._api.getData<MembershipStats>(
      ApiUrls.membershipStats,
    );
    if (res.success && res.data) {
      return ok(unwrapEntity<MembershipStats>(res.data) ?? res.data);
    }
    return fail(res.message || "Failed to fetch membership statistics");
  }

  public async getEnums() {
    const res = await this._api.getData<Record<string, string[]>>(
      ApiUrls.membershipEnums,
    );
    return res;
  }

  public async create(payload: MembershipPayload) {
    const res = await this._api.postData<
      MembershipPayload,
      { message?: string }
    >(ApiUrls.createMembership, payload);
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

  public async updateStatus(id: string, status: MembershipStatus | string) {
    const res = await this._api.patchData<
      { status: string },
      { message?: string }
    >(ApiUrls.membershipStatus(id), { status });
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Status updated"),
    };
  }

  public async bulkUpdateStatus(
    ids: string[],
    status: MembershipStatus | string,
  ) {
    const res = await this._api.patchData<
      { ids: string[]; status: string },
      { message?: string }
    >(ApiUrls.bulkMembershipStatus, { ids, status });
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Bulk status updated"),
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
