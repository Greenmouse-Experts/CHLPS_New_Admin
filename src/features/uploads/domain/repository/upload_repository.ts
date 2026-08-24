import ApiService from "@/lib/network/api";
import { ApiUrls } from "@/lib/network/api_url";

type UploadKind = "image" | "video" | "document" | "audio";

const FIELD: Record<UploadKind, string> = {
  image: "image",
  video: "video",
  document: "doc",
  audio: "audio",
};

const ENDPOINT: Record<UploadKind, string> = {
  image: ApiUrls.uploadImage,
  video: ApiUrls.uploadVideo,
  document: ApiUrls.uploadDoc,
  audio: ApiUrls.uploadAudio,
};

class UploadRepository {
  private _api = new ApiService();

  public async upload(
    kind: UploadKind,
    file: File,
  ): Promise<{ success: boolean; message: string; url: string | null }> {
    const response = await this._api.postUploadFile<Record<string, string>>(
      ENDPOINT[kind],
      file,
      FIELD[kind],
    );

    if (response.success && response.data) {
      const url =
        response.data[FIELD[kind]] ||
        response.data.image ||
        response.data.video ||
        response.data.doc ||
        response.data.audio ||
        null;
      return {
        success: !!url,
        message: response.data.message || "Uploaded",
        url,
      };
    }

    return {
      success: false,
      message: response.message || "Upload failed",
      url: null,
    };
  }
}

export default UploadRepository;
