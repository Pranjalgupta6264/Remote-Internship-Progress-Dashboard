import axios from 'axios';
import { useAuthStore } from './store/authStore';
import type {
  AdminAnalytics,
  InternAnalytics,
  MentorAnalytics,
  Notification,
  ReadAllNotificationsResponse,
} from '@/types';

export interface ApiErrorShape {
  response?: {
    data?: {
      detail?: string;
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

export function getApiErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  const apiError = error as ApiErrorShape;
  return apiError?.response?.data?.detail || apiError?.response?.data?.message || apiError?.message || fallback;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle token expiration and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      console.error(`[API Error]: ${getApiErrorMessage(error)}`);
    }
    
    return Promise.reject(error);
  }
);

export default api;

export async function getAdminAnalytics() {
  const response = await api.get<AdminAnalytics>('/analytics/admin');
  return response.data;
}

export async function getMentorAnalytics() {
  const response = await api.get<MentorAnalytics>('/analytics/mentor');
  return response.data;
}

export async function getInternAnalytics() {
  const response = await api.get<InternAnalytics>('/analytics/intern');
  return response.data;
}

export async function getNotifications() {
  const response = await api.get<Notification[]>('/notifications');
  return response.data;
}

export async function markNotificationRead(notificationId: string) {
  const response = await api.patch<Notification>(`/notifications/${notificationId}/read`);
  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await api.patch<ReadAllNotificationsResponse>('/notifications/read-all');
  return response.data;
}