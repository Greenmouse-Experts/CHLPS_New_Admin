import ApiService from "@/lib/network/api";
import { ApiUrls } from "@/lib/network/api_url";
import { fail, ok } from "@/lib/network/entity/api_response";
import { unwrapCount, unwrapList, unwrapMessage } from "@/lib/tokens";
import {
  Certificate,
  CertificatesApiResponse,
  CertStats,
  CertStatsApiResponse,
  CertTemplate,
  TemplatesApiResponse,
} from "../data/response/certificates_response";

class CertificatesRepository {
  private _api = new ApiService();

  public async list(params?: {
    page?: number | string;
    limit?: number | string;
    pageSize?: number | string;
  }): Promise<CertificatesApiResponse & { total?: number }> {
    const query = new URLSearchParams();
    if (
      params?.page !== undefined &&
      params?.page !== null &&
      params?.page !== ""
    ) {
      query.set("page", String(params.page));
    }
    if (
      params?.limit !== undefined &&
      params?.limit !== null &&
      params?.limit !== ""
    ) {
      query.set("limit", String(params.limit));
    }
    if (
      params?.pageSize !== undefined &&
      params?.pageSize !== null &&
      params?.pageSize !== ""
    ) {
      query.set("pageSize", String(params.pageSize));
    }
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await this._api.getData<unknown>(
      `${ApiUrls.certificates}${qs}`,
    );
    if (res.success) {
      const items = unwrapList<Certificate>(res.data);
      const total = unwrapCount(res.data, items.length);
      const okRes = ok(items);
      return { ...okRes, total };
    }
    return fail(res.message || "Failed to fetch certificates");
  }

  public async getStudentMembershipCertificate(
    studentId: string,
    membershipId: string,
  ) {
    const res = await this._api.getData<Certificate>(
      ApiUrls.studentMembershipCertificate(studentId, membershipId),
    );
    if (res.success && res.data) return ok(res.data as Certificate);
    return fail(
      res.message || "Failed to fetch student membership certificate",
    );
  }

  public async getMembershipCertificatesAll(
    membershipId: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<CertificatesApiResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.pageSize) query.set("pageSize", String(params.pageSize));
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await this._api.getData<unknown>(
      `${ApiUrls.allMembershipCertificates(membershipId)}${qs}`,
    );
    if (res.success) return ok(unwrapList<Certificate>(res.data));
    return fail(res.message || "Failed to fetch membership certificates");
  }

  public async getStudentCertificates(
    studentId: string,
  ): Promise<CertificatesApiResponse> {
    const res = await this._api.getData<unknown>(
      ApiUrls.studentCertificates(studentId),
    );
    if (res.success) return ok(unwrapList<Certificate>(res.data));
    return fail(res.message || "Failed to fetch student certificates");
  }

  public async stats(): Promise<CertStatsApiResponse> {
    const res = await this._api.getData<CertStats>(ApiUrls.certificateStats);
    if (res.success && res.data) return ok(res.data as CertStats);
    return fail(res.message || "Failed to fetch stats");
  }

  public async update(
    id: string,
    payload: {
      certificateUrl: string;
      templateId: string;
      certificateNumber: string;
    },
  ) {
    const res = await this._api.patchData<typeof payload, { message?: string }>(
      ApiUrls.certificateById(id),
      payload,
    );
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Updated"),
    };
  }

  public async revoke(id: string) {
    const res = await this._api.patchData<undefined, { message?: string }>(
      ApiUrls.revokeCertificate(id),
    );
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Revoked"),
    };
  }

  public async remove(id: string) {
    const res = await this._api.deleteData<{ message?: string }>(
      ApiUrls.certificateById(id),
    );
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Deleted"),
    };
  }

  public async listTemplates(): Promise<TemplatesApiResponse> {
    const res = await this._api.getData<unknown>(ApiUrls.certificateTemplates);
    if (res.success) return ok(unwrapList<CertTemplate>(res.data));
    return fail(res.message || "Failed to fetch templates");
  }

  public async uploadTemplate(name: string, file: File) {
    const fd = new FormData();
    fd.append("name", name);
    fd.append("template", file);
    const res = await this._api.postFormData<{ message?: string }>(
      ApiUrls.createCertificateTemplate,
      fd,
    );
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Uploaded"),
    };
  }

  public async setDefault(id: string) {
    const res = await this._api.patchData<undefined, { message?: string }>(
      ApiUrls.setDefaultTemplate(id),
    );
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Set as default"),
    };
  }

  public async deleteTemplate(id: string) {
    const res = await this._api.deleteData<{ message?: string }>(
      ApiUrls.deleteTemplate(id),
    );
    return {
      success: res.success,
      message: unwrapMessage(res.data, res.message || "Deleted"),
    };
  }
}

export default CertificatesRepository;
