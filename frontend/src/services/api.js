const BASE_URL = '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('coffee_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || `Lỗi hệ thống (${response.status})`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  requestOtp: (identifier) => request('/auth/otp/request', {
    method: 'POST',
    body: JSON.stringify({ identifier }),
  }),
  verifyOtp: (identifier, otpCode, rememberDevice = false) => request('/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ identifier, otpCode, rememberDevice }),
  }),
  quickLogin: (phoneNumber) => request('/auth/quick-login', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
  }),
  getMe: () => request('/auth/me'),

  // Users / Employees
  getUsers: (search = '') => request(`/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getUser: (id) => request(`/users/${id}`),
  createUser: (userData) => request('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  updateUser: (id, userData) => request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  toggleUserStatus: (id) => request(`/users/${id}/toggle-status`, { method: 'PATCH' }),

  // Shifts
  getTemplates: () => request('/shifts/templates'),
  createTemplate: (template) => request('/shifts/templates', {
    method: 'POST',
    body: JSON.stringify(template),
  }),
  updateTemplate: (id, template) => request(`/shifts/templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(template),
  }),
  deleteTemplate: (id) => request(`/shifts/templates/${id}`, { method: 'DELETE' }),

  getWeeklySchedule: (startDate) => request(`/shifts/weekly${startDate ? `?startDate=${startDate}` : ''}`),
  getMyShifts: (startDate, endDate) => request(`/shifts/my-shifts${startDate ? `?startDate=${startDate}&endDate=${endDate}` : ''}`),
  assignShift: (assignment) => request('/shifts/assign', {
    method: 'POST',
    body: JSON.stringify(assignment),
  }),
  deleteAssignment: (id) => request(`/shifts/assignments/${id}`, { method: 'DELETE' }),

  // Attendance & QR
  getCurrentQr: () => request('/attendance/current-qr'),
  checkIn: (phoneNumber, qrCode, action = '', notes = '') => request('/attendance/check-in', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber, qrCode, action, notes }),
  }),
  getActiveStatus: () => request('/attendance/active-status'),
  getMyAttendance: (fromDate, toDate) => request(`/attendance/my-history${fromDate ? `?fromDate=${fromDate}&toDate=${toDate}` : ''}`),
  getAllAttendance: (fromDate, toDate) => request(`/attendance/all${fromDate ? `?fromDate=${fromDate}&toDate=${toDate}` : ''}`),
  getAttendanceSummary: (fromDate, toDate) => request(`/attendance/summary${fromDate ? `?fromDate=${fromDate}&toDate=${toDate}` : ''}`),

  // Shift Exchange & Leave
  createExchangeRequest: (reqData) => request('/exchange/requests', {
    method: 'POST',
    body: JSON.stringify(reqData),
  }),
  peerAction: (id, action) => request(`/exchange/requests/${id}/peer-action`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  }),
  managerApproval: (id, action, managerNote = '') => request(`/exchange/requests/${id}/manager-approval`, {
    method: 'PATCH',
    body: JSON.stringify({ action, managerNote }),
  }),
  getMyExchangeRequests: () => request('/exchange/my-requests'),
  getAllExchangeRequests: (status = '') => request(`/exchange/all${status ? `?status=${status}` : ''}`),

  // Payroll
  getPayrollSummary: (startDate, endDate) => request(`/payroll/summary${startDate ? `?startDate=${startDate}&endDate=${endDate}` : ''}`),
  getMyPayroll: (startDate, endDate) => request(`/payroll/my-payroll${startDate ? `?startDate=${startDate}&endDate=${endDate}` : ''}`),

  // Settings
  getSettings: () => request('/settings'),
  updateSetting: (setting) => request('/settings', {
    method: 'PUT',
    body: JSON.stringify(setting),
  }),
};
