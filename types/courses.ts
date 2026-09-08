/**
 * CHLPS Admin Portal - Courses, Modules, Lessons, Assessments & Reviews Types
 * Endpoints: /api/v1/courses/*, /api/v1/course-content/*, /api/v1/course-content-sub/*, /api/v1/assessments/*, /api/v1/reviews/*
 */

import { BaseEntity, PaginationQueryDto } from "./common";

export interface CourseOutcome {
  id?: string;
  description: string;
}

export interface Course extends BaseEntity {
  title: string;
  slug?: string;
  shortDesc: string;
  fullDesc: string;
  price: number;
  discount?: number;
  coverImage?: string;
  program?: string | { id: string; title: string };
  isPublished: boolean;
  featured?: boolean;
  instructor?: {
    id: string;
    firstName: string;
    lastName: string;
    picture?: string;
  };
  duration?: string;
  level?: string;
  language?: string;
  outcomes?: string[] | CourseOutcome[];
  totalEnrolled?: number;
  totalLessons?: number;
  rating?: number;
}

export interface CreateCourseDto {
  title: string;
  shortDesc: string;
  fullDesc: string;
  price: number;
  discount?: number;
  coverImage: string;
  program: string;
  isPublished?: boolean;
  outcomes?: string[];
}

export type UpdateCourseDto = Partial<CreateCourseDto>;

export interface FeatureCourseDto {
  featured: boolean;
}

export interface CoursesQueryDto extends PaginationQueryDto {
  title?: string;
  slug?: string;
  price?: number;
  program?: string;
  isPublished?: boolean;
  featured?: boolean;
}

/* Course Module (Course Content) */

export interface CourseContent extends BaseEntity {
  title: string;
  description?: string;
  course: string | Course;
  sequence?: number;
  isPublished?: boolean;
  subContents?: CourseSubContent[];
}

export interface CreateCourseContentDto {
  title: string;
  course: string;
  description?: string;
}

export interface UpdateCourseContentDto {
  title?: string;
  description?: string;
  course?: string;
}

/* Course Lesson (Course Content Sub) */

export type LessonMediaType = "video" | "doc" | "audio";

export interface CourseSubContent extends BaseEntity {
  title: string;
  course: string;
  courseContent: string;
  duration?: number | string;
  media: string;
  mediaType: LessonMediaType;
  previewUrl?: string;
  sequence?: number;
  isPublished?: boolean;
}

export interface CreateSubContentDto {
  title: string;
  course: string;
  courseContent: string;
  duration?: number | string;
  media: string;
  mediaType: LessonMediaType;
  previewUrl?: string;
}

export type UpdateSubContentDto = Partial<CreateSubContentDto>;

export interface ReorderSubContentDto {
  content: string; // content ID
  sequence: number;
}

/* Assessments & Questions */

export interface QuestionOption {
  key?: string;
  text: string;
  isCorrect?: boolean;
}

export interface AssessmentQuestion extends BaseEntity {
  question: string;
  courseContentSub: string;
  options: string[] | QuestionOption[];
  correctOption: string;
  point: number;
  isPublished?: boolean;
}

export interface AddQuestionDto {
  question: string;
  courseContentSub: string;
  options: string[];
  correctOption: string;
  point: number;
  isPublished?: boolean;
}

export type UpdateQuestionDto = Partial<AddQuestionDto>;

/* Reviews */

export interface CourseReview extends BaseEntity {
  rating: number;
  comment: string;
  isMuted?: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    picture?: string;
  };
  course?: {
    id: string;
    title: string;
  };
}

export interface ReviewsResponseData {
  items: CourseReview[];
  averageRating: number;
  totalReviews: number;
}
