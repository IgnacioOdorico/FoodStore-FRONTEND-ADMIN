import { api } from '../../../shared/services/api';
import type { Usuario, CreateUsuarioDto } from '../types/usuario';

export const usersService = {
  getAll: () =>
    api.get<Usuario[]>('/api/v1/auth/admin/usuarios').then((r) => r.data),

  create: (data: CreateUsuarioDto) => {
    const payload = { ...data };
    if (!payload.celular) {
      delete payload.celular;
    }
    return api.post<Usuario>('/api/v1/auth/admin/usuarios', payload).then((r) => r.data);
  },

  delete: (id: number) =>
    api.delete<Usuario>(`/api/v1/auth/admin/usuarios/${id}`).then((r) => r.data),
};
