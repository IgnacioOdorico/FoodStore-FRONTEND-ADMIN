import { api } from '../../../shared/services/api';
import type { Usuario, CreateUsuarioDto } from '../types/usuario';

export const usersService = {
  getAll: () =>
    api.get<Usuario[]>('/api/v1/admin/usuarios/').then((r) => r.data),

  getById: (id: number) =>
    api.get<Usuario>(`/api/v1/admin/usuarios/${id}`).then((r) => r.data),

  create: (data: CreateUsuarioDto) =>
    api.post<Usuario>('/api/v1/admin/usuarios/', data).then((r) => r.data),

  update: (id: number, data: Partial<Usuario>) =>
    api.patch<Usuario>(`/api/v1/admin/usuarios/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/api/v1/admin/usuarios/${id}`).then((r) => r.data),

  updateRoles: (id: number, roles: string[]) =>
    api.patch<Usuario>(`/api/v1/admin/usuarios/${id}/roles`, { roles }).then((r) => r.data),
};
