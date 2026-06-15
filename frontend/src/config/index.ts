// Configuration export
export const config = {
  app: {
    name: 'PHC Evaluation System',
    version: '1.0.0',
    env: import.meta.env.MODE,
  },

  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    timeout: 30000,
  },

  pagination: {
    defaultPageSize: 15,
    pageSizeOptions: [10, 15, 25, 50, 100],
  },

  features: {
    enableExport: true,
    enableNotifications: true,
    enableDarkMode: false,
  },
};

export default config;