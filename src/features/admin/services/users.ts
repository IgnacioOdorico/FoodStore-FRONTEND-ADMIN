import { api } from '../../../shared/services/api';
import type { Usuario, CreateUsuarioDto, UpdateUsuarioDto } from '../types/usuario';

const BASE = '/api/v1/auth/admin/usuarios';

export const usersService = {
  getAll: () =>
    api.get<Usuario[]>(BASE).then((r) => r.data),

  /** Registrar nuevo empleado — usa el endpoint público de registro */
  create: (data: CreateUsuarioDto) => {
    const payload = { ...data };
    if (!payload.celular) delete payload.celular;
    return api.post<Usuario>('/api/v1/auth/register', payload).then((r) => r.data);
  },

  /** Editar nombre, apellido o celular de cualquier usuario */
  update: (id: number, data: UpdateUsuarioDto) =>
    api.patch<Usuario>(`${BASE}/${id}`, data).then((r) => r.data),

  /** Reactivar usuario eliminado por soft-delete */
  reactivar: (id: number) =>
    api.post<Usuario>(`${BASE}/${id}/reactivar`).then((r) => r.data),

  delete: (id: number) =>
    api.delete<Usuario>(`${BASE}/${id}`).then((r) => r.data),
};
