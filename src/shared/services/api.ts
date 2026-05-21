const BASE_URL = 'http://localhost:8000';

export async function apiFetch<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
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
      throw new Error(errorData.detail || `Error HTTP ${response.status}: ${response.statusText}`);
    }

    if (response.status === 204) return null as T;

    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      // TypeError: Failed to fetch - typically means network error or server is down
      console.error('Network error - Backend might be offline:', error);
      throw new Error('Error de conexión: ¿El backend está corriendo en http://localhost:8000?');
    }
    throw error;
  }
}

/** Login: usa form-urlencoded (OAuth2PasswordRequestForm) */
export async function apiLogin(email: string, password: string) {
  try {
    const body = new URLSearchParams({ username: email, password });
    const response = await fetch(`${BASE_URL}/api/v1/auth/token`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('Network error on login - Backend might be offline:', error);
      throw new Error('Error de conexión: ¿El backend está corriendo en http://localhost:8000?');
    }
    throw error;
  }
}
