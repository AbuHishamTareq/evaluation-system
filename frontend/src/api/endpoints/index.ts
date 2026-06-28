// API endpoints
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/api/v1/auth/login',
    logout: '/api/v1/auth/logout',
    me: '/api/v1/auth/me',
    refresh: '/api/v1/auth/refresh',
    forgotPassword: '/api/v1/auth/forgot-password',
    resetPassword: '/api/v1/auth/reset-password',
    permissions: '/api/v1/auth/permissions',
    changePassword: '/api/v1/auth/change-password',
  },

  // Staff
  staff: {
    list: '/api/v1/staff',
    show: (id: string | number) => `/api/v1/staff/${id}`,
    store: '/api/v1/staff',
    update: (id: string | number) => `/api/v1/staff/${id}`,
    destroy: (id: string | number) => `/api/v1/staff/${id}`,
    toggleStatus: (id: string | number) => `/api/v1/staff/${id}/toggle-active`,
    search: '/api/v1/staff/search',
    export: '/api/v1/staff/export',
    import: '/api/v1/staff/import',
    sample: '/api/v1/staff/sample',
    statistics: '/api/v1/staff/statistics',
    byCenter: (id: string | number) => `/api/v1/staff/center/${id}`,
    byTeamCode: (code: string) => `/api/v1/staff/team-code/${code}`,
    deactivations: (id: string | number) => `/api/v1/staff/${id}/deactivations`,
    uploadPhoto: (id: string | number) => `/api/v1/staff/${id}/upload-photo`,
    uploadDocuments: (id: string | number) => `/api/v1/staff/${id}/upload-documents`,
    deleteDocument: (id: string | number, documentId: string | number) => `/api/v1/staff/${id}/documents/${documentId}`,
  },

// Questions
  questions: {
    list: '/api/v1/questions',
    show: (id: string | number) => `/api/v1/questions/${id}`,
    store: '/api/v1/questions',
    update: (id: string | number) => `/api/v1/questions/${id}`,
    destroy: (id: string | number) => `/api/v1/questions/${id}`,
    import: '/api/v1/questions/import',
    export: '/api/v1/questions/export',
    sample: '/api/v1/questions/sample',
    categories: '/api/v1/questions/categories',
    storeCategory: '/api/v1/questions/categories',
    updateCategory: (id: string | number) => `/api/v1/questions/categories/${id}`,
    destroyCategory: (id: string | number) => `/api/v1/questions/categories/${id}`,
  },

  // Evaluations
  evaluations: {
    list: '/api/v1/evaluations',
    show: (id: string | number) => `/api/v1/evaluations/${id}`,
    store: '/api/v1/evaluations',
    update: (id: string | number) => `/api/v1/evaluations/${id}`,
    destroy: (id: string | number) => `/api/v1/evaluations/${id}`,
    submit: (id: string | number) => `/api/v1/evaluations/${id}/submit`,
    approve: (id: string | number) => `/api/v1/evaluations/${id}/approve`,
  },

  // Templates
  templates: {
    list: '/api/v1/templates',
    show: (id: string | number) => `/api/v1/templates/${id}`,
    store: '/api/v1/templates',
    update: (id: string | number) => `/api/v1/templates/${id}`,
    destroy: (id: string | number) => `/api/v1/templates/${id}`,
    toggleStatus: (id: string | number) => `/api/v1/templates/${id}/toggle-status`,
    active: '/api/v1/templates/active',
  },

  // Centers
  centers: {
    list: '/api/v1/centers',
    show: (id: string | number) => `/api/v1/centers/${id}`,
    store: '/api/v1/centers',
    update: (id: string | number) => `/api/v1/centers/${id}`,
    destroy: (id: string | number) => `/api/v1/centers/${id}`,
    export: '/api/v1/centers/export',
    import: '/api/v1/centers/import',
  },

  // Action Plans
  actionPlans: {
    list: '/api/v1/action-plans',
    show: (id: string | number) => `/api/v1/action-plans/${id}`,
    store: '/api/v1/action-plans',
    update: (id: string | number) => `/api/v1/action-plans/${id}`,
    destroy: (id: string | number) => `/api/v1/action-plans/${id}`,
  },

  // Analytics
  analytics: {
    dashboard: '/api/v1/analytics/dashboard',
    evaluationTrends: '/api/v1/analytics/evaluation-trends',
    topPerformers: '/api/v1/analytics/top-performers',
    centerPerformance: '/api/v1/analytics/center-performance',
    questionAnalytics: '/api/v1/analytics/question-analytics',
    actionPlanStatistics: '/api/v1/analytics/action-plan-statistics',
    scoreDistribution: '/api/v1/analytics/score-distribution',
    zoneAnalytics: '/api/v1/analytics/zone-analytics',
    classificationBreakdown: '/api/v1/analytics/classification-breakdown',
    recentActivity: '/api/v1/analytics/recent-activity',
    compositeScore: '/api/v1/analytics/composite-score',
    exportPdf: '/api/v1/analytics/export/pdf',
    exportExcel: '/api/v1/analytics/export/excel',
  },

  // Categories
  categories: {
    list: '/api/v1/categories',
    show: (id: string | number) => `/api/v1/categories/${id}`,
    store: '/api/v1/categories',
    update: (id: string | number) => `/api/v1/categories/${id}`,
    destroy: (id: string | number) => `/api/v1/categories/${id}`,
    active: '/api/v1/categories/active',
    search: '/api/v1/categories/search',
  },

  // Zones
  zones: {
    list: '/api/v1/zones',
    show: (id: string | number) => `/api/v1/zones/${id}`,
    store: '/api/v1/zones',
    update: (id: string | number) => `/api/v1/zones/${id}`,
    destroy: (id: string | number) => `/api/v1/zones/${id}`,
    tree: '/api/v1/zones/tree',
    export: '/api/v1/zones/export',
    import: '/api/v1/zones/import',
  },

  // SHC Classification - Fields
  fields: {
    list: '/api/v1/fields',
    show: (id: string | number) => `/api/v1/fields/${id}`,
    store: '/api/v1/fields',
    update: (id: string | number) => `/api/v1/fields/${id}`,
    destroy: (id: string | number) => `/api/v1/fields/${id}`,
    active: '/api/v1/fields/active',
    search: '/api/v1/fields/search',
    export: '/api/v1/fields/export',
    import: '/api/v1/fields/import',
    sample: '/api/v1/fields/sample',
  },

  // SHC Classification - Specialties
  specialties: {
    list: '/api/v1/specialties',
    show: (id: string | number) => `/api/v1/specialties/${id}`,
    store: '/api/v1/specialties',
    update: (id: string | number) => `/api/v1/specialties/${id}`,
    destroy: (id: string | number) => `/api/v1/specialties/${id}`,
    active: '/api/v1/specialties/active',
    search: '/api/v1/specialties/search',
    byField: (fieldId: string | number) => `/api/v1/specialties/field/${fieldId}`,
    export: '/api/v1/specialties/export',
    import: '/api/v1/specialties/import',
    sample: '/api/v1/specialties/sample',
  },

  // SHC Classification - Ranks
  ranks: {
    list: '/api/v1/ranks',
    show: (id: string | number) => `/api/v1/ranks/${id}`,
    store: '/api/v1/ranks',
    update: (id: string | number) => `/api/v1/ranks/${id}`,
    destroy: (id: string | number) => `/api/v1/ranks/${id}`,
    active: '/api/v1/ranks/active',
    search: '/api/v1/ranks/search',
    export: '/api/v1/ranks/export',
    import: '/api/v1/ranks/import',
    sample: '/api/v1/ranks/sample',
  },

  // SHC Classification - Categories
  classificationCategories: {
    list: '/api/v1/categories',
    show: (id: string | number) => `/api/v1/categories/${id}`,
    store: '/api/v1/categories',
    update: (id: string | number) => `/api/v1/categories/${id}`,
    destroy: (id: string | number) => `/api/v1/categories/${id}`,
    active: '/api/v1/categories/active',
    search: '/api/v1/categories/search',
    export: '/api/v1/categories/export',
    import: '/api/v1/categories/import',
    sample: '/api/v1/categories/sample',
  },

  // SHC Classification - Classification Mappings
  classifications: {
    list: '/api/v1/classifications',
    show: (id: string | number) => `/api/v1/classifications/${id}`,
    store: '/api/v1/classifications',
    update: (id: string | number) => `/api/v1/classifications/${id}`,
    destroy: (id: string | number) => `/api/v1/classifications/${id}`,
    resolve: '/api/v1/classifications/resolve',
    export: '/api/v1/classifications/export',
    import: '/api/v1/classifications/import',
    sample: '/api/v1/classifications/sample',
  },

  // Educational Degrees
  educationalDegrees: {
    list: '/api/v1/educational-degrees',
    show: (id: string | number) => `/api/v1/educational-degrees/${id}`,
    store: '/api/v1/educational-degrees',
    update: (id: string | number) => `/api/v1/educational-degrees/${id}`,
    destroy: (id: string | number) => `/api/v1/educational-degrees/${id}`,
    toggleStatus: (id: string | number) => `/api/v1/educational-degrees/${id}/toggle-status`,
    active: '/api/v1/educational-degrees/active',
    search: '/api/v1/educational-degrees/search',
    export: '/api/v1/educational-degrees/export',
    import: '/api/v1/educational-degrees/import',
    sample: '/api/v1/educational-degrees/sample',
  },

  // Departments
  departments: {
    list: '/api/v1/departments',
    show: (id: string | number) => `/api/v1/departments/${id}`,
    store: '/api/v1/departments',
    update: (id: string | number) => `/api/v1/departments/${id}`,
    destroy: (id: string | number) => `/api/v1/departments/${id}`,
    toggleStatus: (id: string | number) => `/api/v1/departments/${id}/toggle-status`,
    active: '/api/v1/departments/active',
    search: '/api/v1/departments/search',
    export: '/api/v1/departments/export',
    import: '/api/v1/departments/import',
    sample: '/api/v1/departments/sample',
  },

  // Clinic Assignments
  clinicAssignments: {
    list: '/api/v1/clinic-assignments',
    show: (id: string | number) => `/api/v1/clinic-assignments/${id}`,
    store: '/api/v1/clinic-assignments',
    update: (id: string | number) => `/api/v1/clinic-assignments/${id}`,
    destroy: (id: string | number) => `/api/v1/clinic-assignments/${id}`,
    toggleStatus: (id: string | number) => `/api/v1/clinic-assignments/${id}/toggle-status`,
    export: '/api/v1/clinic-assignments/export',
    import: '/api/v1/clinic-assignments/import',
    sample: '/api/v1/clinic-assignments/sample',
  },

  // Professionals
  professionals: {
    list: '/api/v1/professionals',
    show: (id: string | number) => `/api/v1/professionals/${id}`,
    store: '/api/v1/professionals',
    update: (id: string | number) => `/api/v1/professionals/${id}`,
    destroy: (id: string | number) => `/api/v1/professionals/${id}`,
    toggleStatus: (id: string | number) => `/api/v1/professionals/${id}/toggle-status`,
    export: '/api/v1/professionals/export',
    import: '/api/v1/professionals/import',
    sample: '/api/v1/professionals/sample',
  },

  // Roles
  roles: {
    list: '/api/v1/roles',
    show: (id: string | number) => `/api/v1/roles/${id}`,
    store: '/api/v1/roles',
    update: (id: string | number) => `/api/v1/roles/${id}`,
    destroy: (id: string | number) => `/api/v1/roles/${id}`,
    getPermissions: (id: string | number) => `/api/v1/roles/${id}/permissions`,
    syncPermissions: (id: string | number) => `/api/v1/roles/${id}/permissions`,
    getUserRoles: (userId: string | number) => `/api/v1/users/${userId}/roles`,
    assignUserRoles: (userId: string | number) => `/api/v1/users/${userId}/roles`,
    getUsers: (id: string | number) => `/api/v1/roles/${id}/users`,
    syncUsers: (id: string | number) => `/api/v1/roles/${id}/users`,
  },

  // Users
  users: {
    list: '/api/v1/users',
    show: (id: string | number) => `/api/v1/users/${id}`,
    store: '/api/v1/users',
    update: (id: string | number) => `/api/v1/users/${id}`,
    destroy: (id: string | number) => `/api/v1/users/${id}`,
    toggleActive: (id: string | number) => `/api/v1/users/${id}/toggle-active`,
    export: '/api/v1/users/export',
    import: '/api/v1/users/import',
  },
  permissions: {
    list: '/api/v1/permissions',
    show: (id: string | number) => `/api/v1/permissions/${id}`,
    store: '/api/v1/permissions',
    update: (id: string | number) => `/api/v1/permissions/${id}`,
    destroy: (id: string | number) => `/api/v1/permissions/${id}`,
  },

  // Question Categories (standalone)
  questionCategories: {
    list: '/api/v1/question-categories',
    store: '/api/v1/question-categories',
    show: (id: string | number) => `/api/v1/question-categories/${id}`,
    update: (id: string | number) => `/api/v1/question-categories/${id}`,
    destroy: (id: string | number) => `/api/v1/question-categories/${id}`,
    toggleStatus: (id: string | number) => `/api/v1/question-categories/${id}/toggle-status`,
    export: '/api/v1/question-categories/export',
    import: '/api/v1/question-categories/import',
    sample: '/api/v1/question-categories/sample',
    active: '/api/v1/question-categories/active',
  },

  // Question Sub-Categories
  questionSubCategories: {
    list: '/api/v1/question-sub-categories',
    store: '/api/v1/question-sub-categories',
    show: (id: string | number) => `/api/v1/question-sub-categories/${id}`,
    update: (id: string | number) => `/api/v1/question-sub-categories/${id}`,
    destroy: (id: string | number) => `/api/v1/question-sub-categories/${id}`,
    toggleStatus: (id: string | number) => `/api/v1/question-sub-categories/${id}/toggle-status`,
    export: '/api/v1/question-sub-categories/export',
    import: '/api/v1/question-sub-categories/import',
    sample: '/api/v1/question-sub-categories/sample',
    active: '/api/v1/question-sub-categories/active',
    byCategory: (categoryId: string | number) => `/api/v1/question-sub-categories?question_category_id=${categoryId}`,
  },

  // Medication Evaluation Templates
  medicationEvaluationTemplates: {
    list: '/api/v1/medication-evaluation-templates',
    show: (id: string | number) => `/api/v1/medication-evaluation-templates/${id}`,
    store: '/api/v1/medication-evaluation-templates',
    update: (id: string | number) => `/api/v1/medication-evaluation-templates/${id}`,
    destroy: (id: string | number) => `/api/v1/medication-evaluation-templates/${id}`,
  },

  // Medication Evaluations
  medicationEvaluations: {
    list: '/api/v1/medication-evaluations',
    show: (id: string | number) => `/api/v1/medication-evaluations/${id}`,
    store: '/api/v1/medication-evaluations',
    update: (id: string | number) => `/api/v1/medication-evaluations/${id}`,
    destroy: (id: string | number) => `/api/v1/medication-evaluations/${id}`,
  },

};

export default API_ENDPOINTS;