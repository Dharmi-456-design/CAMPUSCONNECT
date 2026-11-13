export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000';

// Configurable External Constants (as per Master Prompt)
// Initially null / empty until real public link is provided
export const APK_DOWNLOAD_URL = process.env.EXPO_PUBLIC_APK_DOWNLOAD_URL || null;
export const GITHUB_REPOSITORY_URL = 'https://github.com/Dharmi-456-design/CAMPUSCONNECT.git';
export const APP_VERSION = '1.0.0';

export const ENDPOINTS = {
  HEALTH: '/health',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  USERS: {
    ME: '/users/me',
    UPDATE_PROFILE: '/users/profile',
    UPDATE_PASSWORD: '/users/password',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    ACTIVITIES: '/dashboard/activities',
  },
  ACADEMICS: {
    SUBJECTS: '/academics/subjects',
    SUBJECT_DETAIL: (id) => `/academics/subjects/${id}`,
  },
  NOTES: {
    BASE: '/notes',
    DETAIL: (id) => `/notes/${id}`,
    BY_SUBJECT: (subjectId) => `/notes/subject/${subjectId}`,
    SEARCH: '/notes/search',
  },
  EVENTS: {
    BASE: '/events',
    DETAIL: (id) => `/events/${id}`,
    REGISTER: (id) => `/events/${id}/register`,
    CANCEL: (id) => `/events/${id}/cancel`,
    MY_REGISTRATIONS: '/events/my-registrations',
  },
  NOTICES: {
    BASE: '/notices',
    DETAIL: (id) => `/notices/${id}`,
    RECENT: '/notices/recent',
  },
  LOST_FOUND: {
    BASE: '/lost-found',
    DETAIL: (id) => `/lost-found/${id}`,
    STATUS: (id) => `/lost-found/${id}/status`,
  },
  COMMUNITY: {
    POSTS: '/community/posts',
    POST_DETAIL: (id) => `/community/posts/${id}`,
    COMMENTS: (postId) => `/community/posts/${postId}/comments`,
    COMMENT_DETAIL: (postId, commentId) => `/community/posts/${postId}/comments/${commentId}`,
  },
  ADMIN: {
    EVENTS: '/admin/events',
    NOTICES: '/admin/notices',
    USERS: '/admin/users',
    ANALYTICS: '/admin/analytics',
  },
};
