import { ApiResponse } from "@/lib/network/entity/api_response";

export interface CourseOutcome {
  id?: string;
  description: string;
  order: number;
  createdDate?: string;
  updatedDate?: string;
  deletedDate?: string | null;
}

export interface CourseInstructor {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  isSuspended?: boolean;
  role?: string;
  picture?: string;
  address?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  bio?: string | null;
  createdDate?: string;
}

export interface Course {
  id: string;
  title: string;
  slug?: string;
  shortDesc?: string;
  fullDesc?: string;
  price?: number;
  discount?: number;
  isPublished?: boolean;
  featured?: boolean;
  coverImage?: string;
  createdDate?: string;
  updatedDate?: string;
  program?: { id: string; title: string } | null;
  instructor?: CourseInstructor | null;
  contents?: CourseContent[];
  courseOutcomes?: CourseOutcome[];
}

export interface CourseContent {
  id: string;
  title: string;
}

export interface CourseSubContent {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  media?: string;
  previewUrl?: string | null;
  mediaType?: "video" | "image" | "document" | "audio" | "assessment";
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctOption: number;
  point: number;
  isPublished?: boolean;
}

export interface CourseReview {
  id: string;
  rating?: number;
  comment?: string;
  muted?: boolean;
  user?: { firstName?: string; lastName?: string; picture?: string };
}

export interface ReviewsData {
  avgRating?: number;
  results?: CourseReview[];
}

export interface CreateCoursePayload {
  title: string;
  shortDesc: string;
  fullDesc: string;
  price: number;
  discount: number;
  program: string;
  coverImage: string;
  previewUrl: null;
  outcomes: CourseOutcome[];
}

export interface CreateContentPayload {
  title: string;
  course: string;
}

export interface CreateSubContentPayload {
  title: string;
  description?: string;
  course: string;
  courseContent: string;
  duration: number;
  media: string | null;
  previewUrl: string | null;
  mediaType: string;
}

export interface CreateQuestionPayload {
  question: string;
  course: string;
  courseContent: string;
  courseContentSub: string;
  options: string[];
  correctOption: number;
  point: number;
  isPublished: boolean;
}

export type CoursesApiResponse = ApiResponse<{
  items: Course[];
  count: number;
}>;
export type CourseApiResponse = ApiResponse<Course>;
export type ContentsApiResponse = ApiResponse<{
  items: CourseContent[];
  count: number;
}>;
export type SubContentsApiResponse = ApiResponse<CourseSubContent[]>;
export type QuestionsApiResponse = ApiResponse<{
  items: AssessmentQuestion[];
  count: number;
}>;
export type ReviewsApiResponse = ApiResponse<ReviewsData>;
