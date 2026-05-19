const BASE_URL = 'http://localhost:8000';

export async function apiFetch<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error en la petición');
  }

  if (response.status === 204) return null as T;

  return response.json();
}

/** Login: usa form-urlencoded (OAuth2PasswordRequestForm) */
export async function apiLogin(email: string, password: string) {
  const body = new URLSearchParams({ username: email, password });
  const response = await fetch(`${BASE_URL}/api/v1/auth/token`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al iniciar sesión');
  }

  return response.json();
}
