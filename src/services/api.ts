import {
  IUser,
  IService,
  IBooking,
  ITechnician,
  IComplaint,
  IReview,
  INotification,
  IDashboardStats,
  ITechnicianRecommendation,
  IDiagnosisResult,
} from '../types/index.ts';

const TOKEN_KEY = 'servicehub_auth_token';
const REFRESH_TOKEN_KEY = 'servicehub_refresh_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only add application/json if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    await response.text();
    throw new Error(
      response.status === 404
        ? `API endpoint not found: ${endpoint}`
        : `Server returned an invalid response (${response.status})`
    );
  }

  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Image Upload
  uploadImages: async (formData: FormData): Promise<{ success: boolean; urls: string[]; message: string }> => {
    return request<{ success: boolean; urls: string[]; message: string }>('/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // Auth
  login: (email: string, password: string) =>
    request<{ success: boolean; token: string; accessToken: string; refreshToken?: string; user: IUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  demoLogin: (role: 'ADMIN' | 'TECHNICIAN' | 'CUSTOMER') =>
    request<{ success: boolean; token: string; accessToken: string; refreshToken?: string; user: IUser }>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  refreshToken: (refreshToken: string) =>
    request<{ success: boolean; token: string; accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  register: (payload: any) =>
    request<{ success: boolean; token: string; accessToken: string; refreshToken?: string; user: IUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<{ success: boolean; user: IUser }>('/auth/me'),

  // Dashboard
  getStats: () => request<{ success: boolean; data: IDashboardStats }>('/dashboard/stats'),
  getRevenue: (year?: number) =>
    request<{ success: boolean; data: Array<{ month: string; revenue: number; bookings: number }> }>(
      `/dashboard/revenue${year ? `?year=${year}` : ''}`
    ),
  getBookingsCategory: () =>
    request<{ success: boolean; data: Array<{ name: string; value: number; color: string }> }>(
      '/dashboard/bookings'
    ),
  getTopServices: () =>
    request<{
      success: boolean;
      data: Array<{ id: string; name: string; category: string; bookings: number; revenue: number; percentage: number }>;
    }>('/dashboard/top-services'),
  getDashboardStats: async () => {
    const [statsRes, revRes, catRes, topRes] = await Promise.all([
      request<{ success: boolean; data: IDashboardStats }>('/dashboard/stats'),
      request<{ success: boolean; data: Array<{ month: string; revenue: number; bookings: number }> }>('/dashboard/revenue'),
      request<{ success: boolean; data: Array<{ name: string; value: number; color: string }> }>('/dashboard/bookings'),
      request<{
        success: boolean;
        data: Array<{ id: string; name: string; category: string; bookings: number; revenue: number; percentage: number }>;
      }>('/dashboard/top-services'),
    ]);
    return {
      success: true,
      data: {
        kpi: statsRes.data,
        revenueTrend: revRes.data,
        categoryDistribution: catRes.data,
        topServices: topRes.data,
      },
    };
  },

  // Services
  getServices: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    return request<{ success: boolean; count: number; data: IService[] }>(
      `/services${params.toString() ? `?${params.toString()}` : ''}`
    );
  },
  createService: (service: Partial<IService>) =>
    request<{ success: boolean; data: IService }>('/services', {
      method: 'POST',
      body: JSON.stringify(service),
    }),
  updateService: (id: string, service: Partial<IService>) =>
    request<{ success: boolean; data: IService }>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(service),
    }),
  deleteService: (id: string) =>
    request<{ success: boolean; message: string }>(`/services/${id}`, {
      method: 'DELETE',
    }),

  // Bookings
  getBookings: (params?: { status?: string; category?: string; customerId?: string; technicianId?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.category) q.append('category', params.category);
    if (params?.customerId) q.append('customerId', params.customerId);
    if (params?.technicianId) q.append('technicianId', params.technicianId);
    if (params?.search) q.append('search', params.search);
    return request<{ success: boolean; total: number; data: IBooking[] }>(
      `/bookings${q.toString() ? `?${q.toString()}` : ''}`
    );
  },
  getBookingById: (id: string) =>
    request<{ success: boolean; data: IBooking }>(`/bookings/${id}`),
  getMyBookings: () =>
    request<{ success: boolean; count: number; data: IBooking[] }>('/bookings/my-bookings'),
  getBookingTracking: (bookingId: string) =>
    request<{
      success: boolean;
      data: IBooking & { liveLocationAvailable: boolean; liveLocationStatus: string };
    }>(`/bookings/${bookingId}/tracking`),
  cancelBooking: (bookingId: string, cancellationReason?: string) => {
    const cleanId = encodeURIComponent((bookingId || '').trim().replace(/^#/, ''));
    return request<{ success: boolean; data: IBooking; message: string }>(`/bookings/${cleanId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({
        cancellationReason: cancellationReason || 'Cancelled by customer',
        reason: cancellationReason || 'Cancelled by customer',
      }),
    });
  },
  createBooking: (bookingData: Partial<IBooking>) =>
    request<{ success: boolean; data: IBooking }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }),
  updateBookingStatus: (id: string, status: string, note?: string) =>
    request<{ success: boolean; data: IBooking }>(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note }),
    }),
  getRecommendedTechnicians: (bookingId: string) =>
    request<{ success: boolean; data: ITechnicianRecommendation[] }>(
      `/bookings/${bookingId}/recommended-technicians`
    ),
  assignTechnician: (bookingId: string, technicianId: string) =>
    request<{ success: boolean; data: IBooking }>(`/bookings/${bookingId}/assign-technician`, {
      method: 'PUT',
      body: JSON.stringify({ technicianId }),
    }),

  // Technicians
  getTechnicians: (params?: { skill?: string; area?: string }) => {
    const q = new URLSearchParams();
    if (params?.skill) q.append('skill', params.skill);
    if (params?.area) q.append('area', params.area);
    return request<{ success: boolean; count: number; data: ITechnician[] }>(
      `/technicians${q.toString() ? `?${q.toString()}` : ''}`
    );
  },
  getTechnicianById: (id: string) =>
    request<{ success: boolean; data: ITechnician }>(`/technicians/${id}`),
  createTechnician: (tech: Partial<ITechnician>) =>
    request<{ success: boolean; data: ITechnician }>('/technicians', {
      method: 'POST',
      body: JSON.stringify(tech),
    }),
  updateTechnician: (id: string, tech: Partial<ITechnician>) =>
    request<{ success: boolean; data: ITechnician }>(`/technicians/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tech),
    }),
  technicianJobAction: (bookingId: string, payload: any) =>
    request<{ success: boolean; data: IBooking }>(`/technicians/job-action/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Customers
  getCustomers: () => request<{ success: boolean; count: number; data: any[] }>('/customers'),
  getCustomerById: (id: string) => request<{ success: boolean; data: any }>(`/customers/${id}`),

  // Complaints
  getComplaints: () => request<{ success: boolean; count: number; data: IComplaint[] }>('/complaints'),
  createComplaint: (complaint: Partial<IComplaint>) =>
    request<{ success: boolean; data: IComplaint }>('/complaints', {
      method: 'POST',
      body: JSON.stringify(complaint),
    }),
  updateComplaint: (id: string, payload: Partial<IComplaint>) =>
    request<{ success: boolean; data: IComplaint }>(`/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Reviews
  getReviews: () => request<{ success: boolean; count: number; data: IReview[] }>('/reviews'),
  createReview: (review: Partial<IReview>) =>
    request<{ success: boolean; data: IReview }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    }),

  // Payments
  createPaymentOrder: (bookingId: string, amount: number) =>
    request<{ success: boolean; orderId: string; amount: number; keyId: string; mockMode: boolean }>(
      '/payments/create',
      {
        method: 'POST',
        body: JSON.stringify({ bookingId, amount }),
      }
    ),
  verifyPayment: (bookingId: string, paymentId: string, orderId: string) =>
    request<{ success: boolean; message: string; transactionId: string; data: IBooking }>(
      '/payments/verify',
      {
        method: 'POST',
        body: JSON.stringify({ bookingId, paymentId, orderId }),
      }
    ),

  // Invoices
  getInvoice: (bookingId: string) =>
    request<{ success: boolean; data: any }>(`/invoices/${bookingId}`),

  // Notifications
  getNotifications: () => request<{ success: boolean; data: INotification[] }>('/notifications'),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/notifications/read-all', { method: 'PUT' }),

  // AI Diagnostic & Assistant
  diagnoseAI: (query: string) =>
    request<{ success: boolean; data: IDiagnosisResult }>('/ai/diagnose', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),
  askAIAssistant: (query: string, bookingId?: string) =>
    request<{ success: boolean; data: any }>('/ai/assistant', {
      method: 'POST',
      body: JSON.stringify({ query, bookingId }),
    }),

  // Reports & Analytics (Admin Only)
  getReports: (period: string = '30d') =>
    request<{ success: boolean; data: any }>(`/reports?period=${period}`),
  getAdminAnalytics: () =>
    request<{ success: boolean; data: any }>('/admin/analytics'),
};
