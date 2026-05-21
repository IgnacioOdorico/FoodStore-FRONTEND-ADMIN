import { api } from '../../../shared/services/api';
import type { Producto } from '../types/producto';

export const productsService = {
  getAll: () => api.get<Producto[]>('/api/v1/productos/').then((r) => r.data),
  getById: (id: number) => api.get<Producto>(`/api/v1/productos/${id}`).then((r) => r.data),
  create: (data: Partial<Producto>) => api.post<Producto>('/api/v1/productos/', data).then((r) => r.data),
  update: (id: number, data: Partial<Producto>) => api.put<Producto>(`/api/v1/productos/${id}`, data).then((r) => r.data),
  patchDisponibilidad: (id: number, disponible: boolean) =>
    api.patch<Producto>(`/api/v1/productos/${id}/disponibilidad`, { disponible }).then((r) => r.data),
  delete: (id: number) => api.delete(`/api/v1/productos/${id}`).then((r) => r.data),
};
