export class ApiUrls {
  static login = "/auth/signin";
  static updateProfile = "/auth/update-profile";
  static updatePassword = "/auth/update-password";

  static createSubadmin = "/user/admin/create";
  static createInstructor = "/user/instructor/create";
  static subadmins = "/user/subadmins";
  static instructors = "/user/instructors";
  static students = "/user/students";
  static studentById(id: string) {
    return `/user/student/${id}`;
  }
  static studentOrders(studentId: string) {
    return `/orders/student-purchased-courses/${studentId}`;
  }

  static adminAnalytics = "/orders/admin-analytics";
  static monthlyRevenue = "/transactions/monthly-revenue";
  static studentTrx = "/orders/fetch-student-trx";
  static orderItemDetails(id: string) {
    return `/orders/access-item-details/${id}`;
  }

  static programs = "/programs";
  static programsFetch = "/programs/fetch-programs";
  static createProgram = "/programs/create";
  static programById(id: string) {
    return `/programs/${id}`;
  }

  static memberships = "/memberships";
  static createMembership = "/memberships";
  static membershipById(id: string) {
    return `/memberships/${id}`;
  }
  static membershipStatus(id: string) {
    return `/memberships/status/${id}`;
  }

  static events = "/events";
  static createEvent = "/events";
  static eventById(id: string) {
    return `/events/${id}`;
  }
  static eventStatus(id: string) {
    return `/events/${id}/status`;
  }

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

  static courseContentByCourse(id: string) {
    return `/course-content/by-course/${id}`;
  }
  static createCourseContent = "/course-content/create";
  static courseContentById(id: string) {
    return `/course-content/${id}`;
  }

  static createSubContent = "/course-content-sub/create";
  static subContentByContent(id: string) {
    return `/course-content-sub/by-course-content/${id}`;
  }
  static subContentById(id: string) {
    return `/course-content-sub/${id}`;
  }

  static assessmentQuestions(id: string) {
    return `/assessments/fetch-questions/${id}`;
  }
  static addQuestion = "/assessments/add-question";
  static questionById(id: string) {
    return `/assessments/question/${id}`;
  }

  static courseReviews(id: string) {
    return `/reviews/view-course-reviews/${id}`;
  }
  static muteReview(id: string) {
    return `/reviews/mute-course-review/${id}`;
  }
  static unmuteReview(id: string) {
    return `/reviews/unmute-course-review/${id}`;
  }

  static uploadImage = "/upload/image";
  static uploadVideo = "/upload/video";
  static uploadDoc = "/upload/doc";
  static uploadAudio = "/upload/audio";

  static faqs = "/faqs";
  static createFaq = "/faqs/";
  static faqById(id: string) {
    return `/faqs/${id}`;
  }
  static publishFaq(id: string) {
    return `/faqs/publish/${id}`;
  }

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

  static testimonials = "/testimonials";
  static testimonialsPublished = "/testimonials/published";
  static testimonialAvailability(id: string) {
    return `/testimonials/change-availability/${id}`;
  }
  static testimonialById(id: string) {
    return `/testimonials/${id}`;
  }

  static certificates = "/certificates/all";
  static certificateStats = "/certificates/stats";
  static studentCertificates(studentId: string) {
    return `/certificates/student/${studentId}`;
  }
  static certificateById(id: string) {
    return `/certificates/${id}`;
  }
  static revokeCertificate(id: string) {
    return `/certificates/${id}/revoke`;
  }
  static certificateTemplates = "/certificates/templates/list";
  static createCertificateTemplate = "/certificates/templates";
  static setDefaultTemplate(id: string) {
    return `/certificates/templates/${id}/set-default`;
  }
  static deleteTemplate(id: string) {
    return `/certificates/templates/${id}`;
  }

  static contactMessages = "/contact-me";
  static markContactRead(id: string) {
    return `/contact-me/${id}/read`;
  }

  static notificationsAdmin = "/notifications/admin";
  static notificationsRead = "/notifications/read";
  static notificationsUnread = "/notifications/unread";
  static markNotificationRead(id: string) {
    return `/notifications/mark-as-read/${id}`;
  }
  static markAllNotificationsRead = "/notifications/mark-all-as-read";
}
