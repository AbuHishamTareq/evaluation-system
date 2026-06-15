// Application constants

export const APP_NAME = 'PHC Evaluation System';
export const APP_VERSION = '1.0.0';

// API
export const API_TIMEOUT = 30000;
export const API_RETRY_ATTEMPTS = 3;

// Pagination
export const DEFAULT_PAGE_SIZE = 15;
export const PAGE_SIZE_OPTIONS = [10, 15, 25, 50, 100];

// Date formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm:ss';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const DISPLAY_DATE_FORMAT = 'MMM DD, YYYY';
export const DISPLAY_DATETIME_FORMAT = 'MMM DD, YYYY HH:mm';

// File upload
export const MAX_FILE_SIZE = 5242880; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
} as const;

// Evaluation status
export const EVALUATION_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

// Question types
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple-choice',
  TRUE_FALSE: 'true-false',
  SHORT_ANSWER: 'short-answer',
  RATING: 'rating',
} as const;

// Question difficulty
export const QUESTION_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

// Staff status
export const STAFF_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_LEAVE: 'on-leave',
} as const;

// Notification durations
export const NOTIFICATION_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
  PERMANENT: 0,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  LANGUAGE: 'language',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',

  // Staff
  STAFF: '/staff',
  STAFF_DETAIL: '/staff/:id',
  STAFF_CREATE: '/staff/create',
  STAFF_EDIT: '/staff/:id/edit',

  // Questions
  QUESTIONS: '/questions',
  QUESTION_DETAIL: '/questions/:id',
  QUESTION_CREATE: '/questions/create',
  QUESTION_EDIT: '/questions/:id/edit',

  // Evaluations
  EVALUATIONS: '/evaluations',
  EVALUATION_DETAIL: '/evaluations/:id',
  EVALUATION_CREATE: '/evaluations/create',
  EVALUATION_EDIT: '/evaluations/:id/edit',
  EVALUATION_TAKE: '/evaluations/:id/take',

  // Centers
  CENTERS: '/centers',
  CENTER_DETAIL: '/centers/:id',
  CENTER_CREATE: '/centers/create',
  CENTER_EDIT: '/centers/:id/edit',

  // Reports
  REPORTS: '/reports',
  REPORTS_STAFF: '/reports/staff',
  REPORTS_EVALUATIONS: '/reports/evaluations',
  REPORTS_ANALYTICS: '/reports/analytics',

  // Action Plans
  ACTION_PLANS: '/action-plans',
  ACTION_PLAN_DETAIL: '/action-plans/:id',
  ACTION_PLAN_CREATE: '/action-plans/create',
  ACTION_PLAN_EDIT: '/action-plans/:id/edit',

  // Settings
  SETTINGS: '/settings',
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_ACCOUNT: '/settings/account',
} as const;

// Colors (for charts, badges, etc.)
export const CHART_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

export const STATUS_COLORS = {
  active: 'green',
  inactive: 'gray',
  'on-leave': 'yellow',
  draft: 'gray',
  completed: 'green',
  archived: 'purple',
} as const;