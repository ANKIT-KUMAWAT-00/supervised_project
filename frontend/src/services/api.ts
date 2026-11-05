import axios from 'axios';
import {
  User, Seat, LibraryFloor, LibrarySection, OccupancySummary,
  Reservation, OccupancyForecast, MLTelemetry, Book,
  ZoneRecommendation, BookRecommendation, SensorDevice, NotificationItem,
  DigitalDiscoveryBook
} from '../types';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('libra_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (data: { email: string; password: string; full_name: string; role: string; student_id_number?: string; department?: string; preferred_noise_level?: string }) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const libraryApi = {
  getFloors: async (): Promise<LibraryFloor[]> => {
    const res = await api.get('/library/floors');
    return res.data;
  },
  getSections: async (floorId?: number): Promise<LibrarySection[]> => {
    const res = await api.get('/library/sections', { params: { floor_id: floorId } });
    return res.data;
  },
  getSeats: async (params?: { floor_id?: number; section_id?: number; status?: string }): Promise<Seat[]> => {
    const res = await api.get('/library/seats', { params });
    return res.data;
  },
  getSeat: async (seatId: number): Promise<Seat> => {
    const res = await api.get(`/library/seats/${seatId}`);
    return res.data;
  },
  updateSeatStatus: async (seatId: number, status: string) => {
    const res = await api.patch(`/library/seats/${seatId}/status`, null, { params: { new_status: status } });
    return res.data;
  },
};

export const reservationsApi = {
  create: async (seatId: number, durationHours: number = 2): Promise<Reservation> => {
    const res = await api.post('/reservations', { seat_id: seatId, duration_hours: durationHours });
    return res.data;
  },
  getMyReservations: async (): Promise<Reservation[]> => {
    const res = await api.get('/reservations/my');
    return res.data;
  },
  checkIn: async (reservationId: number) => {
    const res = await api.post(`/reservations/${reservationId}/check-in`);
    return res.data;
  },
  checkOut: async (reservationId: number) => {
    const res = await api.post(`/reservations/${reservationId}/check-out`);
    return res.data;
  },
  cancel: async (reservationId: number) => {
    const res = await api.post(`/reservations/${reservationId}/cancel`);
    return res.data;
  },
  getAll: async () => {
    const res = await api.get('/reservations/all');
    return res.data;
  },
};

export const occupancyApi = {
  getCurrent: async (): Promise<OccupancySummary> => {
    const res = await api.get('/occupancy/current');
    return res.data;
  },
  getHourlyTrend: async () => {
    const res = await api.get('/occupancy/hourly-trend');
    return res.data;
  },
};

export const predictionsApi = {
  getForecast: async (): Promise<OccupancyForecast> => {
    const res = await api.get('/predictions/forecast');
    return res.data;
  },
};

export const mlLabApi = {
  getTelemetry: async (): Promise<MLTelemetry> => {
    const res = await api.get('/ml/telemetry');
    return res.data;
  },
  getModels: async () => {
    const res = await api.get('/ml/models');
    return res.data;
  },
  triggerRetraining: async () => {
    const res = await api.post('/ml/retrain');
    return res.data;
  },
};

export const booksApi = {
  list: async (search?: string, categoryId?: number, sortByDemand: boolean = false): Promise<Book[]> => {
    const res = await api.get('/books', {
      params: { search, category_id: categoryId, sort_by_demand: sortByDemand },
    });
    return res.data;
  },
  getCategories: async () => {
    const res = await api.get('/books/categories');
    return res.data;
  },
  getDemandForecast: async () => {
    const res = await api.get('/books/demand-forecast');
    return res.data;
  },
};

export const recommendationsApi = {
  getZones: async (noisePref?: string, studyType?: string): Promise<ZoneRecommendation[]> => {
    const res = await api.get('/recommendations/zones', {
      params: { noise_pref: noisePref, study_type: studyType },
    });
    return res.data;
  },
  getBooks: async (bookId?: number): Promise<BookRecommendation[]> => {
    const res = await api.get('/recommendations/books', { params: { book_id: bookId } });
    return res.data;
  },
  getOptimalTimes: async () => {
    const res = await api.get('/recommendations/optimal-times');
    return res.data;
  },
};

export const assistantApi = {
  chat: async (question: string) => {
    const res = await api.post('/assistant/chat', { question });
    return res.data;
  },
};

export const sensorsApi = {
  list: async (): Promise<SensorDevice[]> => {
    const res = await api.get('/sensors');
    return res.data;
  },
  simulatePulse: async () => {
    const res = await api.post('/sensors/simulate-pulse');
    return res.data;
  },
};

export const analyticsApi = {
  getSummary: async () => {
    const res = await api.get('/analytics/summary');
    return res.data;
  },
  getErrorAnalysis: async () => {
    const res = await api.get('/analytics/error-analysis');
    return res.data;
  },
  downloadCsvUrl: `${API_BASE}/analytics/export-csv`,
};

export const notificationsApi = {
  list: async (): Promise<NotificationItem[]> => {
    const res = await api.get('/notifications');
    return res.data;
  },
  markRead: async (id: number) => {
    const res = await api.post(`/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await api.post('/notifications/read-all');
    return res.data;
  },
};

export const discoveryApi = {
  search: async (q: string, provider: string = 'all', maxResults: number = 18): Promise<DigitalDiscoveryBook[]> => {
    const res = await api.get('/discovery/search', {
      params: { q, provider, max_results: maxResults },
    });
    return res.data;
  },
  getGooglePreview: async (bookId?: string, isbn?: string) => {
    const res = await api.get('/discovery/google-preview', {
      params: { book_id: bookId, isbn },
    });
    return res.data;
  },
  readContent: async (url: string) => {
    const res = await api.get('/discovery/read-content', {
      params: { url },
    });
    return res.data;
  },
};

export default api;
