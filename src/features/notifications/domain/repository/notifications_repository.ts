import ApiService from "@/lib/network/api";
import { ApiUrls } from "@/lib/network/api_url";
import { fail, ok } from "@/lib/network/entity/api_response";
import { unwrapCount, unwrapList, unwrapMessage } from "@/lib/tokens";
import { AppNotification, NotificationsApiResponse } from "../data/response/notifications_response";

class NotificationsRepository {
  private _api = new ApiService();

  public async list(tab: "all" | "read" | "unread", page = 1): Promise<NotificationsApiResponse> {
    const url =
      tab === "read"
        ? ApiUrls.notificationsRead
        : tab === "unread"
          ? ApiUrls.notificationsUnread
          : ApiUrls.notificationsAdmin;
    const res = await this._api.getData<unknown>(url, {
      page,
      pageSize: 10,
      orderBy: "createdDate",
      sortOrder: "DESC",
    });
    if (res.success) {
      return ok({
        items: unwrapList<AppNotification>(res.data),
        count: unwrapCount(res.data, unwrapList(res.data).length),
      });
    }
    return fail(res.message || "Failed to fetch notifications");
  }

  public async markRead(id: string) {
    const res = await this._api.patchData<undefined, { message?: string }>(ApiUrls.markNotificationRead(id));
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Marked as read") };
  }

  public async markAll() {
    const res = await this._api.patchData<undefined, { message?: string }>(ApiUrls.markAllNotificationsRead);
    return { success: res.success, message: unwrapMessage(res.data, res.message || "All marked as read") };
  }
}

export default NotificationsRepository;
