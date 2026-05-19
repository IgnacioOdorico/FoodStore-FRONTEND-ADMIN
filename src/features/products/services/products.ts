import { apiFetch } from '../../../shared/services/api';
import type { Producto } from '../types/producto';

export const productsService = {
  getAll: () => apiFetch<Producto[]>('/productos/'),
  getById: (id: number) => apiFetch<Producto>(`/productos/${id}`),
  create: (data: Partial<Producto>) => apiFetch<Producto>('/productos/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Producto>) => apiFetch<Producto>(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch<Producto>(`/productos/${id}`, { method: 'DELETE' }),
};
