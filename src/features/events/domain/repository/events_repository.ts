import ApiService from "@/lib/network/api";
import { ApiUrls } from "@/lib/network/api_url";
import { unwrapMessage } from "@/lib/tokens";
import { EventPayload, EventStatus } from "../data/response/events_response";

export class EventsRepository {
  private _api = new ApiService();

  public async updateStatus(id: string, status: EventStatus | string) {
    const res = await this._api.patchData<{ status: string }, { message?: string }>(
      ApiUrls.eventStatus(id),
      { status },
    );
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
