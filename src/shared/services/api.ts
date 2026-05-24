import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

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

const isOnLoginPage = () =>
  window.location.pathname === '/login' || window.location.pathname === '/forbidden';

api.interceptors.response.use(
  (response) => {
    updateActivity(); // renovar timer de inactividad en cada respuesta exitosa
    return response;
  },
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/auth/token') &&
      !isOnLoginPage()
    ) {
      clearActivity();
      window.location.href = '/login';
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
