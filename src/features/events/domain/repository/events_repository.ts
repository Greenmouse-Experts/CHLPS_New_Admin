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
  EventApiResponse,
  EventItem,
  EventPayload,
  EventsApiResponse,
  EventStats,
  EventStatsApiResponse,
  EventStatus,
} from "../data/response/events_response";

export class EventsRepository {
  private _api = new ApiService();

  public async list(
    params?: Record<string, unknown>,
  ): Promise<EventsApiResponse> {
    const res = await this._api.getData<unknown>(ApiUrls.events, params);
    if (res.success) {
      return ok({
        items: unwrapList<EventItem>(res.data),
        count: unwrapCount(res.data, unwrapList(res.data).length),
      });
    }
    return fail(res.message || "Failed to fetch events");
  }

  public async getOne(id: string): Promise<EventApiResponse> {
    const res = await this._api.getData<unknown>(ApiUrls.eventById(id));
    if (res.success && res.data) {
      const item = unwrapEntity<EventItem>(res.data);
      if (item) return ok(item);
    }
    return fail(res.message || "Failed to fetch event details");
  }

  public async getStats(): Promise<EventStatsApiResponse> {
    const res = await this._api.getData<EventStats>(ApiUrls.eventStats);
    if (res.success && res.data) {
      return ok(unwrapEntity<EventStats>(res.data) ?? res.data);
    }
    return fail(res.message || "Failed to fetch event statistics");
  }

  public async listRegistrations(id: string) {
    const res = await this._api.getData<unknown>(
      ApiUrls.eventRegistrations(id),
    );
    return res;
  }

  public async checkIn(id: string, code: string) {
    const res = await this._api.postData<
      { code: string },
      { message?: string }
    >(ApiUrls.eventCheckIn(id), { code });
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Check-in successful"),
    };
  }

  public async bulkInvite(id: string, userIds: string[]) {
    const res = await this._api.postData<
      { userIds: string[] },
      { message?: string }
    >(ApiUrls.eventInvitations(id), { userIds });
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Invitations sent"),
    };
  }

  public async listCategories() {
    const res = await this._api.getData<unknown>(ApiUrls.eventCategories);
    return res;
  }

  public async updateStatus(id: string, status: EventStatus | string) {
    const res = await this._api.patchData<
      { status: string },
      { message?: string }
    >(ApiUrls.eventStatus(id), { status });
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Event status updated"),
    };
  }

  public async create(payload: EventPayload) {
    const res = await this._api.postData<EventPayload, { message?: string }>(
      ApiUrls.createEvent,
      payload,
    );
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Created"),
    };
  }

  public async update(id: string, payload: Partial<EventPayload>) {
    const res = await this._api.patchData<typeof payload, { message?: string }>(
      ApiUrls.eventById(id),
      payload,
    );
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Updated"),
    };
  }

  public async remove(id: string) {
    const res = await this._api.deleteData<{ message?: string }>(
      ApiUrls.eventById(id),
    );
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Deleted"),
    };
  }
}

export default EventsRepository;
