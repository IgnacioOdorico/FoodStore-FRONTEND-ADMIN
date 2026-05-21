import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,           // envía la cookie httpOnly automáticamente
  headers: { 'Content-Type': 'application/json' },
});


api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);


let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(null)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 en endpoints que no son login ni refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/token')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/api/v1/auth/refresh');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Extraer mensaje de error legible de FastAPI
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Error desconocido';

    return Promise.reject(new Error(message));
  },
);


export async function apiLogin(email: string, password: string) {
  const params = new URLSearchParams({ username: email, password });
  const { data } = await api.post('/api/v1/auth/token', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return data;
}


export async function apiFetch<T = unknown>(
  endpoint: string,
  options: { method?: string; body?: string; headers?: Record<string, string> } = {},
): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : undefined;
  const cfg = { headers: options.headers };

  let response;
  if (method === 'GET')    response = await api.get<T>(endpoint, cfg);
  else if (method === 'DELETE') response = await api.delete<T>(endpoint, cfg);
  else if (method === 'POST')   response = await api.post<T>(endpoint, body, cfg);
  else if (method === 'PUT')    response = await api.put<T>(endpoint, body, cfg);
  else                          response = await api.patch<T>(endpoint, body, cfg);

  return response.data;
}
