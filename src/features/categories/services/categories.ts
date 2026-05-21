import { api } from '../../../shared/services/api';
import type { Categoria } from '../types/categoria';

export const categoriesService = {
  getAll: () => api.get<Categoria[]>('/api/v1/categorias/').then((r) => r.data),
  getById: (id: number) => api.get<Categoria>(`/api/v1/categorias/${id}`).then((r) => r.data),
  create: (data: Partial<Categoria>) => api.post<Categoria>('/api/v1/categorias/', data).then((r) => r.data),
  update: (id: number, data: Partial<Categoria>) => api.patch<Categoria>(`/api/v1/categorias/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/api/v1/categorias/${id}`).then((r) => r.data),
};
