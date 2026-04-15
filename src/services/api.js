import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://task-sphere-management.vercel.app',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    // Try localStorage first, then fallback to sessionStorage
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('backupToken');
    
    console.log('API Request Interceptor - Debug:', {
      url: config.url,
      method: config.method,
      localStorageToken: !!localStorage.getItem('authToken'),
      sessionStorageToken: !!sessionStorage.getItem('backupToken'),
      finalToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'NONE'
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request - Token attached:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        tokenPreview: token.substring(0, 20) + '...'
      });
    } else {
      console.log('API Request - No token found:', {
        url: config.url,
        method: config.method,
        localStorageToken: !!localStorage.getItem('authToken'),
        sessionStorageToken: !!sessionStorage.getItem('backupToken')
      });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    console.error('Error Response:', error.response);
    console.error('Error Config:', error.config);
    
    if (error.response?.status === 401) {
      // Handle unauthorized access - but only if we're not already on login page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && !currentPath.includes('login')) {
        console.log('401 error - redirecting to login');
        
        // Clear both storages
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('backupToken');
        sessionStorage.removeItem('backupUser');
        
        // Redirect to login
        window.location.href = '/login';
      } else {
        console.log('401 error - already on login page, not redirecting');
      }
    }
    return Promise.reject(error);
  }
);

// Generic API methods
export const apiService = {
  // GET request
  get: (url, config = {}) => {
    return api.get(url, config);
  },

  // POST request
  post: (url, data = {}, config = {}) => {
    return api.post(url, data, config);
  },

  // PUT request
  put: (url, data = {}, config = {}) => {
    return api.put(url, data, config);
  },

  // PATCH request
  patch: (url, data = {}, config = {}) => {
    return api.patch(url, data, config);
  },

  // DELETE request
  delete: (url, config = {}) => {
    return api.delete(url, config);
  },
};

// API endpoints based on actual Django backend
export const endpoints = {
  // Authentication
  login: '/auth/login/',
  register: '/auth/register/',
  logout: '/auth/logout/',
  refresh: '/auth/refresh/', // if available
  
  // API endpoints (all under /api/)
  apiBase: '/api',
  
  // Tasks
  tasks: '/api/tasks/',
  taskById: (id) => `/api/tasks/${id}/`,
  taskDuplicate: (id) => `/api/tasks/${id}/duplicate/`,
  
  // Task statuses and priorities
  taskStatuses: '/api/task-statuses/',
  taskPriorities: '/api/task-priorities/',
  
  // Activity logs
  activityLogs: '/api/activity-logs/',
  
  // Notifications
  notifications: '/api/notifications/',
  markNotificationRead: (id) => `/api/notifications/${id}/mark-read/`,
  
  // Attachments
  attachments: '/api/attachments/',
  taskAttachments: (taskId) => `/api/tasks/${taskId}/attachments/`,
  
  // Health check (root endpoint)
  health: '/',
  status: '/',
};

export default api;
