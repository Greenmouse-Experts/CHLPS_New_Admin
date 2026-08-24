import ApiService from "@/lib/network/api";
import { ApiUrls } from "@/lib/network/api_url";
import { fail, ok } from "@/lib/network/entity/api_response";
import { unwrapCount, unwrapEntity, unwrapList, unwrapMessage } from "@/lib/tokens";
import {
  AssessmentQuestion,
  ContentsApiResponse,
  Course,
  CourseApiResponse,
  CourseContent,
  CourseSubContent,
  CoursesApiResponse,
  CreateContentPayload,
  CreateCoursePayload,
  CreateQuestionPayload,
  CreateSubContentPayload,
  QuestionsApiResponse,
  ReviewsApiResponse,
  ReviewsData,
  SubContentsApiResponse,
} from "../data/response/courses_response";

class CoursesRepository {
  private _api = new ApiService();

  public async list(
    isAdmin: boolean,
    params: Record<string, unknown>,
  ): Promise<CoursesApiResponse> {
    const res = await this._api.getData<unknown>(
      isAdmin ? ApiUrls.courses : ApiUrls.coursesInstructor,
      params,
    );
    if (res.success) {
      return ok({
        items: unwrapList<Course>(res.data),
        count: unwrapCount(res.data, unwrapList(res.data).length),
      });
    }
    return fail(res.message || "Failed to fetch courses");
  }

  public async getOne(id: string, isAdmin: boolean): Promise<CourseApiResponse> {
    const res = await this._api.getData<unknown>(
      isAdmin ? ApiUrls.courseById(id) : ApiUrls.courseInstructorById(id),
    );
    if (res.success && res.data) {
      const course = unwrapEntity<Course>(res.data);
      if (course) return ok(course);
    }
    return fail(res.message || "Failed to fetch course");
  }

  public async create(payload: CreateCoursePayload) {
    const res = await this._api.postData<CreateCoursePayload, { message?: string }>(
      ApiUrls.createCourse,
      payload,
    );
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Created") };
  }

  public async update(id: string, payload: Partial<CreateCoursePayload> & { isPublished?: boolean }, isAdmin: boolean) {
    const res = await this._api.patchData<typeof payload, { message?: string }>(
      isAdmin ? ApiUrls.courseById(id) : ApiUrls.courseInstructorById(id),
      payload,
    );
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Updated") };
  }

  public async remove(id: string) {
    const res = await this._api.deleteData<{ message?: string }>(ApiUrls.courseById(id));
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Deleted") };
  }

  public async feature(id: string, featured: boolean) {
    const res = await this._api.patchData<{ featured: boolean }, { message?: string }>(
      ApiUrls.featureCourse(id),
      { featured },
    );
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Updated") };
  }

  public async listContent(courseId: string, page = 1): Promise<ContentsApiResponse> {
    const res = await this._api.getData<unknown>(ApiUrls.courseContentByCourse(courseId), {
      page,
      pageSize: 10,
    });
    if (res.success) {
      return ok({
        items: unwrapList<CourseContent>(res.data),
        count: unwrapCount(res.data, unwrapList(res.data).length),
      });
    }
    return fail(res.message || "Failed to fetch content");
  }

  public async createContent(payload: CreateContentPayload) {
    const res = await this._api.postData<CreateContentPayload, { message?: string }>(
      ApiUrls.createCourseContent,
      payload,
    );
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Created") };
  }

  public async updateContent(id: string, payload: { title: string }) {
    const res = await this._api.patchData<{ title: string }, { message?: string }>(
      ApiUrls.courseContentById(id),
      payload,
    );
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Updated") };
  }

  public async deleteContent(id: string) {
    const res = await this._api.deleteData<{ message?: string }>(ApiUrls.courseContentById(id));
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Deleted") };
  }

  public async listSubContent(contentId: string): Promise<SubContentsApiResponse> {
    const res = await this._api.getData<unknown>(ApiUrls.subContentByContent(contentId));
    if (res.success) return ok(unwrapList<CourseSubContent>(res.data));
    return fail(res.message || "Failed to fetch lessons");
  }

  public async getSubContent(id: string) {
    const res = await this._api.getData<CourseSubContent>(ApiUrls.subContentById(id));
    if (res.success && res.data) return ok(res.data as CourseSubContent);
    return fail(res.message || "Failed to fetch");
  }

  public async createSubContent(payload: CreateSubContentPayload) {
    const res = await this._api.postData<CreateSubContentPayload, { message?: string }>(
      ApiUrls.createSubContent,
      payload,
    );
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Created") };
  }

  public async updateSubContent(id: string, payload: Partial<CreateSubContentPayload>) {
    const res = await this._api.patchData<typeof payload, { message?: string }>(
      ApiUrls.subContentById(id),
      payload,
    );
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Updated") };
  }

  public async deleteSubContent(id: string) {
    const res = await this._api.deleteData<{ message?: string }>(ApiUrls.subContentById(id));
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Deleted") };
  }

  public async listQuestions(id: string, page = 1): Promise<QuestionsApiResponse> {
    const res = await this._api.getData<unknown>(ApiUrls.assessmentQuestions(id), {
      page,
      pageSize: 10,
    });
    if (res.success) {
      return ok({
        items: unwrapList<AssessmentQuestion>(res.data),
        count: unwrapCount(res.data, unwrapList(res.data).length),
      });
    }
    return fail(res.message || "Failed to fetch questions");
  }

  public async addQuestion(payload: CreateQuestionPayload) {
    const res = await this._api.postData<CreateQuestionPayload, { message?: string }>(
      ApiUrls.addQuestion,
      payload,
    );
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Created") };
  }

  public async updateQuestion(id: string, payload: Partial<CreateQuestionPayload>) {
    const res = await this._api.patchData<typeof payload, { message?: string }>(
      ApiUrls.questionById(id),
      payload,
    );
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Updated") };
  }

  public async deleteQuestion(id: string) {
    const res = await this._api.deleteData<{ message?: string }>(ApiUrls.questionById(id));
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Deleted") };
  }

  public async getReviews(courseId: string): Promise<ReviewsApiResponse> {
    const res = await this._api.getData<{ data?: ReviewsData } & ReviewsData>(
      ApiUrls.courseReviews(courseId),
    );
    if (res.success && res.data) {
      const data = (res.data as { data?: ReviewsData }).data ?? res.data;
      return ok(data);
    }
    return fail(res.message || "Failed to fetch reviews");
  }

  public async muteReview(id: string, mute: boolean) {
    const res = await this._api.postData<undefined, { message?: string }>(
      mute ? ApiUrls.muteReview(id) : ApiUrls.unmuteReview(id),
    );
    return { success: res.success, message: unwrapMessage(res.data, res.message || "Updated") };
  }
}

export default CoursesRepository;
