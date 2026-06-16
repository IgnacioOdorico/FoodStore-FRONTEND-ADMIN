import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, _token: unknown = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(_token);
    }
  });
  failedQueue = [];
}

// ── Inactividad max de 30 minutos ─────────────────────────────────────────────
const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;

export const updateActivity = () => {
  localStorage.setItem('last_activity', Date.now().toString());
};

export const clearActivity = () => {
  localStorage.removeItem('last_activity');
};

export const isSessionExpiredByInactivity = (): boolean => {
  const val = localStorage.getItem('last_activity');
  if (!val) return true;
  return Date.now() - parseInt(val, 10) > INACTIVITY_LIMIT_MS;
};
// ─────────────────────────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    updateActivity();
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url || '';

    const isSessionEndpoint =
      url.includes('/auth/token') ||
      url.includes('/auth/me') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout') ||
      url.includes('/auth/register');

    const onAuthPage = window.location.pathname.startsWith('/login');

    if (status === 401 && !isSessionEndpoint && !onAuthPage) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await api.post('/api/v1/auth/refresh', {}, { withCredentials: true });
          processQueue(null);
          return api(error.config);
        } catch (refreshError) {
          processQueue(refreshError, null);
          clearActivity();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(error.config);
        });
      }
    }

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
  if (method === 'GET')         response = await api.get<T>(endpoint, cfg);
  else if (method === 'DELETE') response = await api.delete<T>(endpoint, cfg);
  else if (method === 'POST')   response = await api.post<T>(endpoint, body, cfg);
  else if (method === 'PUT')    response = await api.put<T>(endpoint, body, cfg);
  else                          response = await api.patch<T>(endpoint, body, cfg);

  return response.data;
}

export async function attemptRefresh(): Promise<boolean> {
  try {
    await api.post('/api/v1/auth/refresh', {}, { withCredentials: true });
    return true;
  } catch {
    return false;
  }
}
