import ApiService from "@/lib/network/api";
import { ApiUrls } from "@/lib/network/api_url";
import { fail, ok } from "@/lib/network/entity/api_response";
import { unwrapEntity, unwrapList } from "@/lib/tokens";
import {
  Student,
  StudentApiResponse,
  StudentCertificate,
  StudentCertificatesApiResponse,
  StudentOrder,
  StudentOrdersApiResponse,
  StudentsApiResponse,
} from "../data/response/students_response";

class StudentsRepository {
  private _api = new ApiService();

  public async getStudents(): Promise<StudentsApiResponse> {
    const res = await this._api.getData<unknown>(ApiUrls.students);
    if (res.success) return ok(unwrapList<Student>(res.data));
    return fail(res.message || "Failed to fetch students");
  }

  public async getStudent(id: string): Promise<StudentApiResponse> {
    const res = await this._api.getData<unknown>(
      ApiUrls.studentById(id),
    );
    if (res.success && res.data) {
      const student = unwrapEntity<Student>(res.data);
      if (student) return ok(student);
    }
    return fail(res.message || "Failed to fetch student");
  }

  public async getStudentOrders(id: string): Promise<StudentOrdersApiResponse> {
    const res = await this._api.getData<unknown>(ApiUrls.studentOrders(id));
    if (res.success) return ok(unwrapList<StudentOrder>(res.data));
    return fail(res.message || "Failed to fetch orders");
  }

  public async getStudentCertificates(
    id: string,
  ): Promise<StudentCertificatesApiResponse> {
    const res = await this._api.getData<unknown>(ApiUrls.studentCertificates(id));
    if (res.success) return ok(unwrapList<StudentCertificate>(res.data));
    return fail(res.message || "Failed to fetch certificates");
  }
}

export default StudentsRepository;
