import ApiService from "@/lib/network/api";
import { ApiUrls } from "@/lib/network/api_url";
import { unwrapMessage } from "@/lib/tokens";
import {
  ChangePasswordPayload,
  LoginPayload,
  UpdateProfilePayload,
} from "../payload/user.login";
import {
  LoginAccountResponse,
  LoginRawResponse,
  MessageApiResponse,
} from "../entities/user.account.completed";

class AuthenticationRepository {
  private _apiService = new ApiService();

  public async loginUser(data: LoginPayload): Promise<LoginAccountResponse> {
    const response = await this._apiService.postData<
      LoginPayload,
      LoginRawResponse
    >(ApiUrls.login, data);

    if (response.success && response.data?.accessToken && response.data.data) {
      return {
        status: 200,
        success: true,
        message: response.data.message || "Login successful",
        data: {
          accessToken: response.data.accessToken,
          user: response.data.data,
        },
      };
    }

    return {
      status: response.status ?? 400,
      success: false,
      message: response.message || "Login failed",
      data: null,
    };
  }

  public async updateProfile(
    payload: UpdateProfilePayload,
  ): Promise<MessageApiResponse> {
    const response = await this._apiService.postData<
      UpdateProfilePayload,
      { message?: string }
    >(ApiUrls.updateProfile, payload);

    return {
      status: response.success ? 200 : (response.status ?? 400),
      success: response.success,
      message: unwrapMessage(
        response.data,
        response.message || (response.success ? "Profile updated" : "Failed"),
      ),
      data: null,
    };
  }

  public async changePassword(
    payload: ChangePasswordPayload,
  ): Promise<MessageApiResponse> {
    const response = await this._apiService.postData<
      ChangePasswordPayload,
      { message?: string }
    >(ApiUrls.updatePassword, payload);

    return {
      status: response.success ? 200 : (response.status ?? 400),
      success: response.success,
      message: unwrapMessage(
        response.data,
        response.message || (response.success ? "Password updated" : "Failed"),
      ),
      data: null,
    };
  }

  public async uploadImage(
    file: File,
  ): Promise<{ success: boolean; message: string; url: string | null }> {
    const response = await this._apiService.postUploadFile<{
      image?: string;
      message?: string;
    }>(ApiUrls.uploadImage, file, "image");

    if (response.success && response.data?.image) {
      return {
        success: true,
        message: response.data.message || "Image uploaded",
        url: response.data.image,
      };
    }

    return {
      success: false,
      message: response.message || "Upload failed",
      url: null,
    };
  }
}

export default AuthenticationRepository;
