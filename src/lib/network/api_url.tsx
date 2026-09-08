export class ApiUrls {
  // Auth
  static login = "/auth/signin";
  static profile = "/auth/profile";
  static updateProfile = "/auth/update-profile";
  static updatePassword = "/auth/update-password";
  static resetPasswordRequest = "/auth/reset-password-request";
  static resetPassword = "/auth/reset-password";
  static signout = "/auth/signout";

  // Users
  static createSubadmin = "/user/admin/create";
  static createInstructor = "/user/instructor/create";
  static subadmins = "/user/subadmins";
  static subadminById(id: string) {
    return `/user/subadministrator/${id}`;
  }
  static instructors = "/user/instructors";
  static instructorById(id: string) {
    return `/user/instructor/${id}`;
  }
  static students = "/user/students";
  static studentById(id: string) {
    return `/user/student/${id}`;
  }
  static studentOrders(studentId: string) {
    return `/orders/student-purchased-courses/${studentId}`;
  }

  // Orders & Financial Transactions
  static adminAnalytics = "/orders/admin-analytics";
  static monthlyRevenue = "/transactions/monthly-revenue";
  static studentTrx = "/orders/fetch-student-trx";
  static accessOrderedItems = "/orders/access-ordered-items";
  static orderItemDetails(id: string) {
    return `/orders/access-item-details/${id}`;
  }
  static orderTrxDetails(id: string) {
    return `/orders/fetch-trx/${id}`;
  }
  static cancelStudentOrder(orderNumber: string) {
    return `/orders/cancel-student-order/${orderNumber}`;
  }

  // Programs
  static programs = "/programs";
  static programsFetch = "/programs/fetch-programs";
  static createProgram = "/programs/create";
  static programById(id: string) {
    return `/programs/${id}`;
  }

  // Memberships
  static memberships = "/memberships";
  static createMembership = "/memberships/create";
  static membershipById(id: string) {
    return `/memberships/${id}`;
  }
  static membershipStatus(id: string) {
    return `/memberships/status/${id}`;
  }
  static bulkMembershipStatus = "/memberships/bulk-status";
  static membershipEnums = "/memberships/enums";
  static membershipStats = "/memberships/stats";

  // Membership Sub-Resources
  static membershipJobOpportunities(id: string) {
    return `/memberships/${id}/job-opportunities`;
  }
  static membershipJobOpportunityItem(id: string, itemId: string) {
    return `/memberships/${id}/job-opportunities/${itemId}`;
  }
  static membershipHelps(id: string) {
    return `/memberships/${id}/how-membership-helps`;
  }
  static membershipHelpItem(id: string, itemId: string) {
    return `/memberships/${id}/how-membership-helps/${itemId}`;
  }
  static membershipHighlights(id: string) {
    return `/memberships/${id}/why-join-now/highlights`;
  }
  static membershipHighlightItem(id: string, itemId: string) {
    return `/memberships/${id}/why-join-now/highlights/${itemId}`;
  }
  static membershipCards(id: string) {
    return `/memberships/${id}/why-join-now/cards`;
  }
  static membershipCardItem(id: string, itemId: string) {
    return `/memberships/${id}/why-join-now/cards/${itemId}`;
  }

  // Membership Types
  static membershipTypes = "/membership-types";
  static createMembershipType = "/membership-types/create";
  static membershipTypeById(id: string) {
    return `/membership-types/${id}`;
  }

  // Student Memberships
  static studentMemberships = "/student-memberships";
  static studentMembershipStats = "/student-memberships/stats";
  static studentMembershipById(id: string) {
    return `/student-memberships/${id}`;
  }
  static studentMembershipHistory(studentId: string) {
    return `/student-memberships/student/${studentId}`;
  }
  static cancelStudentMembership(id: string) {
    return `/student-memberships/${id}/cancel`;
  }

  // Events
  static events = "/events";
  static createEvent = "/events";
  static eventById(id: string) {
    return `/events/${id}`;
  }
  static eventStatus(id: string) {
    return `/events/${id}/status`;
  }
  static eventStats = "/events/stats";
  static eventRegistrations(id: string) {
    return `/events/${id}/registrations`;
  }
  static eventCheckIn(id: string) {
    return `/events/${id}/check-in`;
  }
  static eventInvitations(id: string) {
    return `/events/${id}/invitations`;
  }
  static resendEventInvitation(id: string, inviteId: string) {
    return `/events/${id}/invitations/${inviteId}/resend`;
  }
  static revokeEventInvitation(id: string, inviteId: string) {
    return `/events/${id}/invitations/${inviteId}`;
  }

  // Event Categories
  static eventCategories = "/event-categories";
  static createEventCategory = "/event-categories";
  static eventCategoryById(id: string) {
    return `/event-categories/${id}`;
  }

  // Courses
  static courses = "/courses";
  static coursesInstructor = "/courses/instructor";
  static createCourse = "/courses/create";
  static courseById(id: string) {
    return `/courses/${id}`;
  }
  static courseInstructorById(id: string) {
    return `/courses/instructor/${id}`;
  }
  static featureCourse(id: string) {
    return `/courses/feature/${id}`;
  }

  // Course Content (Modules)
  static courseContentByCourse(id: string) {
    return `/course-content/by-course/${id}`;
  }
  static createCourseContent = "/course-content/create";
  static courseContentById(id: string) {
    return `/course-content/${id}`;
  }

  // Course Content Sub (Lessons)
  static createSubContent = "/course-content-sub/create";
  static subContentByContent(id: string) {
    return `/course-content-sub/by-course-content/${id}`;
  }
  static subContentById(id: string) {
    return `/course-content-sub/${id}`;
  }
  static reorderSubContent = "/course-content-sub/reorder";

  // Assessments
  static assessmentQuestions(id: string) {
    return `/assessments/fetch-questions/${id}`;
  }
  static assessmentSingleQuestion(id: string) {
    return `/assessments/single-question/${id}`;
  }
  static addQuestion = "/assessments/add-question";
  static questionById(id: string) {
    return `/assessments/question/${id}`;
  }

  // Reviews
  static courseReviews(id: string) {
    return `/reviews/fetch-course-reviews/${id}`;
  }
  static courseReviewsView(id: string) {
    return `/reviews/view-course-reviews/${id}`;
  }
  static muteReview(id: string) {
    return `/reviews/mute-course-review/${id}`;
  }
  static unmuteReview(id: string) {
    return `/reviews/unmute-course-review/${id}`;
  }

  // Uploads
  static uploadImage = "/upload/image";
  static uploadVideo = "/upload/video";
  static uploadDoc = "/upload/doc";
  static uploadAudio = "/upload/audio";

  // FAQs
  static faqs = "/faqs";
  static createFaq = "/faqs";
  static faqById(id: string) {
    return `/faqs/${id}`;
  }
  static publishFaq(id: string) {
    return `/faqs/publish/${id}`;
  }
  static bulkPublishFaqs = "/faqs/bulk-publish";

  // Blog
  static blogTags = "/blog/fetch-tags";
  static createBlogTag = "/blog/create-tag";
  static updateBlogTag(id: string) {
    return `/blog/update-tag/${id}`;
  }
  static deleteBlogTag(id: string) {
    return `/blog/remove-tag/${id}`;
  }
  static blogPosts = "/blog/fetch-posts";
  static blogPostById(id: string) {
    return `/blog/fetch-post/${id}`;
  }
  static createBlogPost = "/blog/create-post";
  static updateBlogPost(id: string) {
    return `/blog/update-post/${id}`;
  }
  static deleteBlogPost(id: string) {
    return `/blog/remove-post/${id}`;
  }
  static removePostTag(id: string) {
    return `/blog/remove-post-tag/${id}`;
  }

  // Testimonials
  static testimonials = "/testimonials";
  static testimonialsPublished = "/testimonials/published";
  static testimonialAvailability(id: string) {
    return `/testimonials/change-availability/${id}`;
  }
  static testimonialById(id: string) {
    return `/testimonials/${id}`;
  }

  // Certificates
  static certificates = "/certificates/all";
  static certificateStats = "/certificates/stats";
  static studentCertificates(studentId: string) {
    return `/certificates/student/${studentId}`;
  }
  static certificateById(id: string) {
    return `/certificates/${id}`;
  }
  static generateCertificate = "/certificates/generate";
  static certificateJobStatus(jobId: string) {
    return `/certificates/generate/${jobId}/status`;
  }
  static revokeCertificate(id: string) {
    return `/certificates/${id}/revoke`;
  }
  static certificateTemplates = "/certificates/templates/list";
  static createCertificateTemplate = "/certificates/templates";
  static certificateTemplateById(id: string) {
    return `/certificates/templates/${id}`;
  }
  static setDefaultTemplate(id: string) {
    return `/certificates/templates/${id}/set-default`;
  }
  static deleteTemplate(id: string) {
    return `/certificates/templates/${id}`;
  }

  // Contact / Support
  static contactMessages = "/contact-me";
  static contactMessageById(id: string) {
    return `/contact-me/${id}`;
  }
  static markContactRead(id: string) {
    return `/contact-me/${id}/read`;
  }

  // Notifications
  static notificationsAdmin = "/notifications/admin";
  static notificationsSubadmin = "/notifications/subadmin";
  static notificationsRead = "/notifications/read";
  static notificationsUnread = "/notifications/unread";
  static markNotificationRead(id: string) {
    return `/notifications/mark-as-read/${id}`;
  }
  static markAllNotificationsRead = "/notifications/mark-all-as-read";
}
