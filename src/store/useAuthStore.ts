import { create } from "zustand";
import { apiLogin, apiFetch, updateActivity, clearActivity, isSessionExpiredByInactivity } from "../shared/services/api";
import type { IRole, IUser } from "../shared/types/auth.types";

interface AuthState {
  user: IUser | null;
  loading: boolean;
  error: string | null;
  /** true cuando ya se intentó restaurar la sesión al arrancar (con o sin éxito) */
  initialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  /** Intenta restaurar la sesión desde la cookie existente. Llamar al arrancar la app. */
  fetchUser: () => Promise<void>;
  logout: VoidFunction;
  hasRole: (...roles: IRole[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await apiLogin(email, password);
      const user = await apiFetch<IUser>("/api/v1/auth/me");
      updateActivity(); // registrar actividad al iniciar sesión
      set({ user, loading: false, initialized: true });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión";
      set({ error: message, loading: false });
      return false;
    }
  },

  fetchUser: async () => {
    // Si pasaron más de 30 min sin actividad, no restaurar sesión
    if (isSessionExpiredByInactivity()) {
      clearActivity();
      set({ user: null, initialized: true });
      return;
    }
    try {
      const user = await apiFetch<IUser>("/api/v1/auth/me");
      set({ user, initialized: true });
    } catch {
      set({ user: null, initialized: true });
    }
  },

  logout: () => {
    apiFetch("/api/v1/auth/logout", { method: "POST" }).catch(() => {});
    clearActivity(); // limpiar registro de actividad al cerrar sesión
    set({ user: null, initialized: true });
  },

  hasRole: (...roles) => {
    const { user } = get();
    if (!user) return false;
    return user.roles.some((r) => roles.includes(r));
  },
}));
