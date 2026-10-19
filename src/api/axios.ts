import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';

import type { ApiEnvelope, ApiError } from '../types/api';
import { handleAuthenticationError } from '../utils/auth';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true,
});

// In-memory token (survives navigation, not refresh: cookies cover that).
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const clearAccessToken = () => {
  accessToken = null;
};

export const getAccessToken = () => accessToken;

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: () => void; reject: (e: unknown) => void }[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config as RetryConfig;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh-token') &&
      !originalRequest.url?.includes('/auth/verify')
    ) {
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => failedQueue.push({ resolve, reject })).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post<ApiEnvelope<{ accessToken: string }>>(`${baseURL}/auth/refresh-token`, {}, { withCredentials: true });
        const newAccessToken = refreshResponse.data?.data?.accessToken;
        if (newAccessToken) setAccessToken(newAccessToken);
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        clearAccessToken();
        handleAuthenticationError(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const rejection: ApiError = {
      message: error.response?.data?.message || error.message || 'Something went wrong',
      status: error.response?.status,
      data: error.response?.data,
    };
    return Promise.reject(rejection);
  },
);

/**
 * Typed helpers. The response interceptor already unwraps axios' `response.data`,
 * so each call resolves to the API envelope `{ success, message, data, ... }`.
 */
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) => api.get(url, config) as unknown as Promise<ApiEnvelope<T>>,
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => api.post(url, body, config) as unknown as Promise<ApiEnvelope<T>>,
  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => api.put(url, body, config) as unknown as Promise<ApiEnvelope<T>>,
  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => api.patch(url, body, config) as unknown as Promise<ApiEnvelope<T>>,
  delete: <T>(url: string, config?: AxiosRequestConfig) => api.delete(url, config) as unknown as Promise<ApiEnvelope<T>>,
  /** For file downloads: the interceptor hands back the raw Blob. */
  blob: (url: string, config?: AxiosRequestConfig) => api.get(url, { ...config, responseType: 'blob' }) as unknown as Promise<Blob>,
};

export const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export default api;
