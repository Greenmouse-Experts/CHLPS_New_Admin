import ApiService from "@/lib/network/api";
import { ApiUrls } from "@/lib/network/api_url";
import { fail, ok } from "@/lib/network/entity/api_response";
import { unwrapList, unwrapMessage } from "@/lib/tokens";
import {
  CreateAdminPayload,
  PeopleApiResponse,
  Person,
} from "../data/response/admin_response";

class AdminRepository {
  private _api = new ApiService();

  public async getAdmins(): Promise<PeopleApiResponse> {
    const res = await this._api.getData<unknown>(ApiUrls.subadmins);
    if (res.success) {
      return ok(unwrapList<Person>(res.data), "Admins fetched");
    }
    return fail(res.message || "Failed to fetch admins");
  }

  public async createAdmin(payload: CreateAdminPayload) {
    const res = await this._api.postData<CreateAdminPayload, { message?: string }>(
      ApiUrls.createSubadmin,
      payload,
    );
    return {
      success: res.success,
      message: unwrapMessage(
        res.data,
        res.message || (res.success ? "Admin created" : "Failed to create admin"),
      ),
    };
  }
}

export default AdminRepository;
