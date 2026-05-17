import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ems_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ems_token');
      localStorage.removeItem('ems_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ===== Auth =====
export const authApi = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// ===== Employees =====
export const employeeApi = {
  getAll:    (params) => api.get('/employees', { params }),
  getById:   (id)     => api.get(`/employees/${id}`),
  create:    (data)   => api.post('/employees', data),
  update:    (id, data) => api.put(`/employees/${id}`, data),
  delete:    (id)     => api.delete(`/employees/${id}`),
  dashboard: ()       => api.get('/employees/dashboard'),
  exportCsv: (search = '') =>
    api.get('/employees/export/csv', { params: { search }, responseType: 'blob' }),
  exportPdf: (search = '') =>
    api.get('/employees/export/pdf', { params: { search }, responseType: 'blob' }),
};

// ===== Departments =====
export const departmentApi = {
  getAll:  ()         => api.get('/departments'),
  getById: (id)       => api.get(`/departments/${id}`),
  create:  (data)     => api.post('/departments', data),
  update:  (id, data) => api.put(`/departments/${id}`, data),
  delete:  (id)       => api.delete(`/departments/${id}`),
};

export default api;
