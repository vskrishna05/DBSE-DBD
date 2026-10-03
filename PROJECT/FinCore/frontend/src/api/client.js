import axios from 'axios';

export const DEFAULT_LIVE_TUNNEL_URL = 'https://audio-bra-arthritis-imported.trycloudflare.com';

export const getApiBaseUrl = () => {
  const customUrl = typeof window !== 'undefined' ? localStorage.getItem('fincore_api_url') : null;
  if (customUrl) {
    return customUrl.endsWith('/api') ? customUrl : `${customUrl.replace(/\/$/, '')}/api`;
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('solutions-habits-census-asn')) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
  }

  // When running on Render, localhost, or through a unified server, API is on the same domain
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('onrender.com') ||
     window.location.hostname.includes('trycloudflare.com') ||
     window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1')
  ) {
    return '/api';
  }

  // When hosted on external static host (e.g. Vercel) without collocated API, route to active tunnel
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return `${DEFAULT_LIVE_TUNNEL_URL}/api`;
  }

  return '/api';
};

export const setCustomApiUrl = (url) => {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      const cleanUrl = url.trim().replace(/\/api\/?$/, '').replace(/\/$/, '');
      localStorage.setItem('fincore_api_url', cleanUrl);
    } else {
      localStorage.removeItem('fincore_api_url');
    }
  }
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject JWT token and dynamic baseURL
api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  const token = localStorage.getItem('fincore_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Extract user-friendly error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      message = 'Network Error: Cannot connect to FinCore backend server. Please verify your backend server or live tunnel is running.';
    } else if (error.response?.data?.detail) {
      message = typeof error.response.data.detail === 'string'
        ? error.response.data.detail
        : JSON.stringify(error.response.data.detail);
    } else if (error.message) {
      message = error.message;
    }
    error.friendlyMessage = message;
    return Promise.reject(error);
  }
);

// Auth APIs
export const apiAuth = {
  sendOtp: (email, purpose = 'REGISTRATION') => api.post('/auth/otp/send', { email, purpose }),
  verifyOtp: (email, otp_code, purpose = 'REGISTRATION') => api.post('/auth/otp/verify', { email, otp_code, purpose }),
  sendGmailOtp: (email, role = 'customer') => api.post('/auth/gmail/send-otp', { email, role }),
  loginGmailOtp: (email, otp_code, role = 'customer') => api.post('/auth/gmail/login', { email, otp_code, role }),
  sendMobileOtp: (phone_number, role = 'customer') => api.post('/auth/mobile/send-otp', { phone_number, role }),
  loginMobile: (phone_number, otp_code, role = 'customer') => api.post('/auth/mobile/login', { phone_number, otp_code, role }),
  verifyGoogle: (data) => api.post('/auth/google/verify', data),
  registerCustomer: (data) => api.post('/auth/customer/register', data),
  loginCustomer: (email, password) => api.post('/auth/customer/login', { email, password }),
  loginAdmin: (email, password) => api.post('/auth/admin/login', { email, password }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (email, otp_code, new_password) => api.post('/auth/reset-password', { email, otp_code, new_password }),
  changePassword: (current_password, new_password) => api.post('/auth/change-password', { current_password, new_password }),
};

// Companies APIs
export const apiCompanies = {
  getPublic: () => api.get('/companies/public'),
  getAll: () => api.get('/companies'),
  getById: (id) => api.get(`/companies/${id}`),
  create: (data) => api.post('/companies', data),
  register: (data) => api.post('/companies/register', data),
  update: (id, data) => api.put(`/companies/${id}`, data),
};

// Plans APIs
export const apiPlans = {
  getPublic: (company_id) => api.get('/plans/public', { params: { company_id } }),
  getAll: () => api.get('/plans'),
  getById: (id) => api.get(`/plans/${id}`),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
};

// Subscriptions APIs
export const apiSubscriptions = {
  getActive: () => api.get('/subscriptions/active'),
  getHistory: () => api.get('/subscriptions/history'),
  subscribe: (plan_id, auto_renew = true) => api.post('/subscriptions/subscribe', { plan_id, auto_renew }),
  cancel: () => api.post('/subscriptions/cancel'),
  getAllAdmin: () => api.get('/subscriptions/admin/all'),
};

// Invoices APIs
export const apiInvoices = {
  getAll: (status) => api.get('/invoices', { params: { status_filter: status } }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
};

// Payments APIs
export const apiPayments = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  pay: (invoice_id, payment_method = 'UPI / NET_BANKING') => api.post('/payments/pay', { invoice_id, payment_method }),
};

// Loans APIs
export const apiLoans = {
  getAll: () => api.get('/loans'),
  getById: (id) => api.get(`/loans/${id}`),
  getLimits: () => api.get('/loans/limits'),
  updateLimits: (data) => api.put('/loans/limits', data),
  apply: (data) => api.post('/loans/apply', data),
  confirm: (id) => api.post(`/loans/${id}/confirm`),
  reject: (id, reason) => api.post(`/loans/${id}/reject`, { reason }),
  sanction: (data) => api.post('/loans', data),
  repay: (id, amount) => api.post(`/loans/${id}/repay`, { amount }),
};

// Customer Profile APIs
export const apiCustomers = {
  getMe: () => api.get('/customers/me'),
  updateMe: (data) => api.put('/customers/me', data),
  getAllAdmin: () => api.get('/customers'),
  getByIdAdmin: (id) => api.get(`/customers/${id}`),
  deleteCustomer: (id) => api.delete(`/customers/${id}`),
  toggleStatus: (id) => api.put(`/customers/${id}/toggle-status`),
};

// Notifications APIs
export const apiNotifications = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Analytics APIs
export const apiAnalytics = {
  getCustomerSummary: () => api.get('/analytics/customer-summary'),
  getAdminSummary: () => api.get('/analytics/admin-summary'),
};

// Audit Logs APIs
export const apiAuditLogs = {
  getAll: (params) => api.get('/audit-logs', { params }),
};

export default api;
