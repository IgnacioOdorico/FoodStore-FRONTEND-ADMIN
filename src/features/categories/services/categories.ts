import { api } from '../../../shared/services/api';
import type { Categoria } from '../types/categoria';

export interface PaginatedCategorias {
  items: Categoria[];
  total: number;
  skip: number;
  limit: number;
}

export const categoriesService = {
  getAll: (params?: { skip?: number; limit?: number }) =>
    api.get<PaginatedCategorias>('/api/v1/categorias/', { params }).then((r) => r.data),
  getById: (id: number) => api.get<Categoria>(`/api/v1/categorias/${id}`).then((r) => r.data),
  create: (data: Partial<Categoria>) => api.post<Categoria>('/api/v1/categorias/', data).then((r) => r.data),
  update: (id: number, data: Partial<Categoria>) => api.patch<Categoria>(`/api/v1/categorias/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/api/v1/categorias/${id}`).then((r) => r.data),
};
