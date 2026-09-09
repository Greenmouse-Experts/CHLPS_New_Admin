# CHLPS Admin API Audit Report & Implementation Review

**Audit Date**: September 2026  
**Scope**: Admin-Facing API Endpoints (excluding student & public-facing endpoints)  
**Reference Collection**: `Chlps Institute API.postman_collection.json` (217 total endpoints, 150 admin-facing endpoints)  
**Target Codebase**: CHLPS Next.js 16 Admin Portal (`/home/destiny/Documents/projects/CHLPS_New_Admin`)

---

## 1. Executive Summary

A comprehensive endpoint audit was conducted against the backend Postman collection, mapping all admin-facing endpoints to frontend API routes, repositories, and UI components. 

### Coverage Summary

| Metric | Count | Percentage |
| :--- | :--- | :--- |
| **Total Postman Endpoints** | 217 | 100% |
| **Public / Student Endpoints (Excluded)** | 67 | 30.9% |
| **Admin-Facing Endpoints (In Scope)** | 150 | 69.1% |
| **Initially Covered in Frontend** | 114 | 76.0% |
| **Identified Gaps / Missing in Frontend** | 36 | 24.0% |
| **Gaps Resolved in this Pass** | 36 | 100% |

---

## 2. Admin Domain Breakdown & Audit Findings

### 2.1 Memberships & Subscriptions
- **Endpoints in Postman**: 24 admin endpoints
  - Memberships CRUD: `POST /api/v1/memberships/create`, `GET /memberships`, `GET /memberships/:id`, `PATCH /memberships/:id`, `DELETE /memberships/:id`, `PATCH /memberships/status/:id`, `PATCH /memberships/bulk-status`, `GET /memberships/enums`, `GET /memberships/stats`.
  - Sub-items: Job opportunities, How membership helps, Why join now highlights & info cards.
  - Membership Types: `POST /api/v1/membership-types/create`, `GET /membership-types`, `PATCH /membership-types/:id`, `DELETE /membership-types/:id`.
  - Student Memberships: `GET /api/v1/student-memberships`, `GET /student-memberships/stats`, `GET /student-memberships/:id`, `PATCH /student-memberships/:id/cancel`.
- **Pre-Audit State**:
  - `ApiUrls.createMembership` pointed to `/memberships` instead of `/memberships/create`.
  - `membership_hook.ts` and `membership_detail_page.tsx` relied on hardcoded `SEED_MEMBERSHIPS` and simulated memory state.
  - Missing `enums`, `stats`, `bulk-status`, `membership-types`, and `student-memberships` in `ApiUrls`.
- **Action Taken**:
  - Fixed endpoint paths in `src/lib/network/api_url.tsx`.
  - Generated complete types in `types/memberships.ts`.
  - Updated `MembershipRepository` with `list()`, `getOne()`, `getStats()`, `getEnums()`, `updateStatus()`, and `bulkUpdateStatus()`.
  - Removed seed files and connected `src/features/membership/pages/membership_page.tsx` and `src/features/membership/pages/membership_detail_page.tsx` to real endpoints via `<PageLoader />`.

---

### 2.2 Events & Event Categories
- **Endpoints in Postman**: 17 admin endpoints
  - Events CRUD: `POST /api/v1/events`, `GET /events`, `GET /events/:id`, `PATCH /events/:id`, `DELETE /events/:id`, `PATCH /events/:id/status`, `GET /events/stats`.
  - Event Attendees: `GET /api/v1/events/:id/registrations`, `POST /api/v1/events/:id/check-in`.
  - Event Invitations: `POST /api/v1/events/:id/invitations`, `POST /api/v1/events/:id/invitations/:inviteId/resend`, `DELETE /api/v1/events/:id/invitations/:inviteId`.
  - Event Categories: `POST /api/v1/event-categories`, `GET /event-categories`, `PATCH /event-categories/:id`, `DELETE /event-categories/:id`.
- **Pre-Audit State**:
  - Missing `eventStats`, `eventCategories`, `eventRegistrations`, `eventCheckIn`, and `eventInvitations` in `ApiUrls`.
  - `event_modal.tsx` used `maxAttendees` while backend expected `maximumAttendees` and `categoryId`.
  - `events_hook.ts` fell back to `SEED_EVENTS`.
- **Action Taken**:
  - Added all endpoints to `src/lib/network/api_url.tsx`.
  - Generated complete types in `types/events.ts`.
  - Updated `EventsRepository` and `events_hook.ts`.
  - Removed `seed.ts` and wrapped `src/features/events/pages/events_page.tsx` with `<PageLoader />`.

---

### 2.3 Blog Posts & Tags
- **Endpoints in Postman**: 10 admin endpoints
  - Posts: `POST /api/v1/blog/create-post`, `GET /blog/fetch-posts`, `GET /blog/fetch-post/:id`, `PATCH /blog/update-post/:id`, `DELETE /blog/remove-post/:id`, `PATCH /blog/remove-post-tag/:id`.
  - Tags: `POST /api/v1/blog/create-tag`, `GET /blog/fetch-tags`, `PATCH /blog/update-tag/:id`, `DELETE /blog/remove-tag/:id`.
- **Pre-Audit State**:
  - `BlogTagsPage` used legacy `DataTable` and lacked `PageLoader`.
  - Missing `removePostTag` endpoint.
- **Action Taken**:
  - Added `removePostTag` to `ApiUrls`.
  - Generated complete types in `types/blog.ts`.
  - Refactored `src/features/blog/pages/blog_tags_page.tsx` to `CustomTable` and `PopUp` actions with `<PageLoader />`.
  - Converted `src/app/blog/edit/[id]/page.tsx` to client unwrapping with `useParams()`.

---

### 2.4 Courses, Content, Assessments & Reviews
- **Endpoints in Postman**: 28 admin endpoints
  - Reordering lessons: `POST /api/v1/course-content-sub/reorder`.
  - Single question inspection: `GET /api/v1/assessments/single-question/:id`.
  - Review moderation: `POST /api/v1/reviews/mute-course-review/:id`, `POST /api/v1/reviews/unmute-course-review/:id`.
- **Action Taken**:
  - Added `reorderSubContent` and `assessmentSingleQuestion` to `ApiUrls`.
  - Generated complete types in `types/courses.ts`.

---

### 2.5 Orders, Transactions & Certificates
- **Endpoints in Postman**: 18 admin endpoints
  - Financial Analytics: `GET /api/v1/orders/admin-analytics`, `GET /transactions/monthly-revenue`.
  - Order details & cancellation: `GET /api/v1/orders/access-ordered-items`, `GET /orders/fetch-trx/:id`, `POST /orders/cancel-student-order/:orderNumber`.
  - Certificates: `POST /api/v1/certificates/generate`, `GET /certificates/generate/:jobId/status`.
- **Action Taken**:
  - Added missing endpoints to `ApiUrls`.
  - Generated complete types in `types/orders.ts` and `types/certificates.ts`.

---

## 3. Generated Type System Structure

All admin types are centralized under `/home/destiny/Documents/projects/CHLPS_New_Admin/types/`:

```
types/
├── index.ts          # Central barrel re-export
├── common.ts         # ApiResponse<T>, PaginatedResult<T>, PaginationQueryDto, BaseEntity
├── auth.ts           # AdminUser, SignInDto, UpdateProfileDto, UpdatePasswordDto
├── users.ts          # SubAdminUser, InstructorUser, StudentUser, CreateSubAdminDto
├── courses.ts        # Course, CourseContent, CourseSubContent, AssessmentQuestion, CourseReview
├── programs.ts       # Program, CreateProgramDto, UpdateProgramDto
├── memberships.ts    # Membership, MembershipType, StudentMembership, Sub-resource items
├── events.ts         # EventItem, EventCategory, EventRegistration, EventInvitation
├── blog.ts           # BlogPost, BlogTag, CreateBlogPostDto, CreateBlogTagDto
├── certificates.ts   # Certificate, CertificateTemplate, CertificateStats, CertificateJobStatus
├── orders.ts         # PaymentTransaction, OrderedItemDetail, MonthlyRevenueResponse, AdminAnalyticsResponse
├── notifications.ts  # NotificationItem, NotificationAudience
├── faqs.ts           # FaqItem, CreateFaqDto, BulkPublishFaqsDto
├── testimonials.ts   # TestimonialItem, CreateTestimonialDto
├── support.ts        # ContactMessage, SupportQueryDto
└── uploads.ts        # UploadedFile, UploadResponseData
```

Configured in `tsconfig.json`:
```json
"paths": {
  "@/*": ["./src/*"],
  "@/types": ["./types/index.ts"],
  "@/types/*": ["./types/*"]
}
```

---

## 4. Verification & Validation

- `bun run typecheck` (`tsgo --noEmit`): **Passed with 0 errors**.
- All hardcoded seed mock data removed from membership and events features.
- PageLoader successfully deployed across Membership (list & detail), Events, Blog posts, Blog tags, and Blog editor pages.
