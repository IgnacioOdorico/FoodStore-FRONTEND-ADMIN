import { create } from "zustand";
import { apiLogin, apiFetch } from "../shared/services/api";
import type { IRole, IUser } from "../shared/types/auth.types";

interface AuthState {
  user: IUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  fetchUser: () => Promise<void>;
  logout: VoidFunction;
  hasRole: (...roles: IRole[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await apiLogin(email, password);
      // Después del login exitoso, pedimos los datos del usuario
      const user = await apiFetch<IUser>("/api/v1/auth/me");
      set({ user, loading: false });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión";
      set({ error: message, loading: false });
      return false;
    }
  },

  fetchUser: async () => {
    try {
      const user = await apiFetch<IUser>("/api/v1/auth/me");
      set({ user });
    } catch {
      set({ user: null });
    }
  },

  logout: () => {
    apiFetch("/api/v1/auth/logout", { method: "POST" }).catch(() => {});
    set({ user: null });
  },

  hasRole: (...roles) => {
    const { user } = get();
    if (!user) return false;
    return user.roles.some((r) => roles.includes(r));
  },
}));
