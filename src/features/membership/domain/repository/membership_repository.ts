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
  CreateMembershipTypePayload,
  Membership,
  MembershipApiResponse,
  MembershipsApiResponse,
  MembershipPayload,
  MembershipStatus,
  MembershipStats,
  MembershipStatsApiResponse,
  MembershipSubscriber,
  MembershipSubscribersApiResponse,
  MembershipTransaction,
  MembershipTransactionsApiResponse,
  MembershipTypeItem,
  MembershipTypesApiResponse,
  MembershipApplicationItem,
  MembershipApplicationsApiResponse,
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

  // --- Enrolled Members (Subscribers) ---
  public async listSubscribers(
    membershipId: string,
    params?: { page?: number; pageSize?: number; status?: string },
  ): Promise<MembershipSubscribersApiResponse> {
    const res = await this._api.getData<unknown>(ApiUrls.studentMemberships, {
      membershipId,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 100,
      ...(params?.status ? { status: params.status } : {}),
    });

    if (res.success) {
      const rawList = unwrapList<any>(res.data);
      const items: MembershipSubscriber[] = rawList.map((item: any) => {
        const student = item.student || {};
        const mem = item.membership || {};
        const fullName =
          `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() ||
          student.email ||
          "Unknown Member";
        const memberNum = student.id
          ? student.id.slice(0, 8).toUpperCase()
          : `MEM-${(item.id ?? "").slice(0, 6).toUpperCase()}`;

        return {
          id: student.id || item.id,
          studentMembershipId: item.id,
          applicationId: item.applicationId,
          applicationStatus:
            item.status === "active"
              ? "approved"
              : item.status === "cancelled"
              ? "rejected"
              : "pending",
          membershipId: mem.id || membershipId,
          memberNumber: memberNum,
          name: fullName,
          email: student.email || "—",
          phone: student.phone || "—",
          avatar: student.picture || undefined,
          joinedDate: item.startDate || item.createdDate || "",
          expiryDate: item.endDate || "",
          status: item.status || "active",
          amountPaid: Number(mem.price) || 0,
          currency: mem.currency || "CAD",
        };
      });

      return ok({
        items,
        count: unwrapCount(res.data, items.length),
      });
    }

    return fail(res.message || "Failed to fetch enrolled members");
  }

  // --- Transactions / Payments ---
  public async listTransactions(
    membershipId: string,
  ): Promise<MembershipTransactionsApiResponse> {
    const [ordersRes, appsRes] = await Promise.all([
      this._api.getData<unknown>(ApiUrls.studentTrx, {
        page: 1,
        pageSize: 100,
      }),
      this._api.getData<unknown>(ApiUrls.membershipApplications, {
        membershipId,
        page: 1,
        pageSize: 100,
      }),
    ]);

    if (ordersRes.success) {
      const rawOrders = unwrapList<any>(ordersRes.data);
      const applications = appsRes.success ? unwrapList<any>(appsRes.data) : [];
      const items: MembershipTransaction[] = [];

      for (const order of rawOrders) {
        const orderItems = Array.isArray(order.orderItems) ? order.orderItems : [];
        const matchedItem = orderItems.find(
          (it: any) =>
            it.membership?.id === membershipId ||
            it.membershipId === membershipId,
        );

        if (matchedItem) {
          const buyer = order.buyer || {};
          const trx = order.trx || {};
          const buyerName =
            `${buyer.firstName ?? ""} ${buyer.lastName ?? ""}`.trim() ||
            buyer.email ||
            "Unknown Payer";

          const matchedApp = applications.find(
            (app: any) =>
              app.orderId === order.id ||
              (app.student?.id === buyer.id && (app.membership?.id === membershipId || !app.membership)),
          );

          items.push({
            id: trx.id || order.id,
            orderId: order.id,
            orderNumber: order.number,
            membershipId,
            reference: trx.reference || order.number || "—",
            memberName: buyerName,
            memberEmail: buyer.email || "—",
            amount: Number(trx.amount ?? matchedItem.price ?? 0),
            currency: trx.currency || matchedItem.membership?.currency || "CAD",
            paymentMethod: trx.gateway || "card",
            status: trx.status || order.status || "confirmed",
            date: trx.createdDate || order.createdDate || "",
            applicationId: matchedApp?.id,
            applicationStatus:
              matchedApp?.status ||
              (order.status === "confirmed" ? "approved" : "pending"),
            rejectReason: matchedApp?.rejectReason || null,
            studentId: buyer.id,
            answers: matchedApp?.answers || [],
          });
        }
      }

      return ok({
        items,
        count: items.length,
      });
    }

    return fail(ordersRes.message || "Failed to fetch transactions");
  }

  // --- Membership Applications (Fetch, Approve & Reject) ---
  public async listApplications(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    membershipId?: string;
  }): Promise<MembershipApplicationsApiResponse> {
    const queryParams: Record<string, unknown> = {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
    };
    if (params?.status && params.status !== "all") {
      queryParams.status = params.status;
    }
    if (params?.membershipId) {
      queryParams.membershipId = params.membershipId;
    }

    const [appsRes, ordersRes] = await Promise.all([
      this._api.getData<unknown>(ApiUrls.membershipApplications, queryParams),
      this._api.getData<unknown>(ApiUrls.studentTrx, { page: 1, pageSize: 100 }),
    ]);

    if (appsRes.success) {
      const rawApps = unwrapList<any>(appsRes.data);
      const orders = ordersRes.success ? unwrapList<any>(ordersRes.data) : [];

      const items: MembershipApplicationItem[] = rawApps.map((app: any) => {
        const matchedOrder = orders.find(
          (o: any) =>
            o.id === app.orderId ||
            (o.buyer?.id === app.student?.id &&
              o.orderItems?.some(
                (it: any) => it.membership?.id === app.membership?.id,
              )),
        );

        return {
          id: app.id,
          orderId: app.orderId,
          answers: app.answers || [],
          status: app.status,
          reviewedBy: app.reviewedBy,
          reviewedAt: app.reviewedAt,
          rejectReason: app.rejectReason,
          createdDate: app.createdDate,
          updatedDate: app.updatedDate,
          student: app.student,
          membership: app.membership,
          order: matchedOrder
            ? {
                id: matchedOrder.id,
                number: matchedOrder.number,
                status: matchedOrder.status,
                reference: matchedOrder.trx?.reference || matchedOrder.number,
                amount: Number(
                  matchedOrder.trx?.amount ?? app.membership?.price ?? 0,
                ),
                currency:
                  matchedOrder.trx?.currency ||
                  app.membership?.currency ||
                  "CAD",
              }
            : undefined,
        };
      });

      return ok({
        items,
        count: unwrapCount(appsRes.data, items.length),
      });
    }

    return fail(appsRes.message || "Failed to fetch membership applications");
  }

  // --- Membership Applications (Approve / Reject) ---
  public async approveApplication(applicationId: string) {
    const res = await this._api.patchData<
      Record<string, never>,
      { message?: string }
    >(ApiUrls.approveMembershipApplication(applicationId), {});
    return {
      success: res.success,
      message: unwrapMessage(
        res.data,
        res.message || "Application approved. Membership activated and certificate issued.",
      ),
    };
  }

  public async rejectApplication(applicationId: string, reason: string) {
    const res = await this._api.patchData<
      { reason: string },
      { message?: string }
    >(ApiUrls.rejectMembershipApplication(applicationId), { reason });
    return {
      success: res.success,
      message: unwrapMessage(
        res.data,
        res.message || "Membership application denied.",
      ),
    };
  }

  public async cancelStudentMembership(studentMembershipId: string) {
    const res = await this._api.patchData<
      Record<string, never>,
      { message?: string }
    >(ApiUrls.cancelStudentMembership(studentMembershipId), {});
    return {
      success: res.success,
      message: unwrapMessage(
        res.data,
        res.message || "Student membership cancelled.",
      ),
    };
  }

  public async cancelOrder(orderNumber: string) {
    const res = await this._api.postData<
      Record<string, never>,
      { message?: string }
    >(ApiUrls.cancelStudentOrder(orderNumber), {});
    return {
      success: res.success,
      message: unwrapMessage(
        res.data,
        res.message || "Order cancelled successfully.",
      ),
    };
  }

  // --- Membership Types (Categories) ---
  public async listTypes(): Promise<MembershipTypesApiResponse> {
    const res = await this._api.getData<unknown>(ApiUrls.membershipTypes);
    if (res.success) {
      const items = unwrapList<MembershipTypeItem>(res.data);
      return ok({
        items,
        count: unwrapCount(res.data, items.length),
      });
    }
    return fail(res.message || "Failed to fetch membership types");
  }

  public async createType(payload: CreateMembershipTypePayload) {
    const res = await this._api.postData<
      CreateMembershipTypePayload,
      { message?: string }
    >(ApiUrls.createMembershipType, payload);
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Created successfully"),
    };
  }

  public async updateType(
    id: string,
    payload: Partial<CreateMembershipTypePayload>,
  ) {
    const res = await this._api.patchData<typeof payload, { message?: string }>(
      ApiUrls.membershipTypeById(id),
      payload,
    );
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Updated successfully"),
    };
  }

  public async deleteType(id: string) {
    const res = await this._api.deleteData<{ message?: string }>(
      ApiUrls.membershipTypeById(id),
    );
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Deleted successfully"),
    };
  }
}

export default MembershipRepository;
