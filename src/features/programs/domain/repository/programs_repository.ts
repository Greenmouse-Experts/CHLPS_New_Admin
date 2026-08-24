import ApiService from "@/lib/network/api";
import { ApiUrls } from "@/lib/network/api_url";
import { fail, ok } from "@/lib/network/entity/api_response";
import { unwrapList, unwrapMessage } from "@/lib/tokens";
import {
  CreateProgramPayload,
  Program,
  ProgramsApiResponse,
  UpdateProgramPayload,
} from "../data/response/programs_response";

class ProgramsRepository {
  private _api = new ApiService();

  public async list(isAdmin: boolean): Promise<ProgramsApiResponse> {
    const res = await this._api.getData<unknown>(
      isAdmin ? ApiUrls.programs : ApiUrls.programsFetch,
    );
    if (res.success) return ok(unwrapList<Program>(res.data));
    return fail(res.message || "Failed to fetch programs");
  }

  public async create(payload: CreateProgramPayload) {
    const res = await this._api.postData<CreateProgramPayload, { message?: string }>(
      ApiUrls.createProgram,
      payload,
    );
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Program created"),
    };
  }

  public async update(id: string, payload: UpdateProgramPayload) {
    const res = await this._api.patchData<UpdateProgramPayload, { message?: string }>(
      ApiUrls.programById(id),
      payload,
    );
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Program updated"),
    };
  }

  public async remove(id: string) {
    const res = await this._api.deleteData<{ message?: string }>(ApiUrls.programById(id));
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Program deleted"),
    };
  }
}

export default ProgramsRepository;
