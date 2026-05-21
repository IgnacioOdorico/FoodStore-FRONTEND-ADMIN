import { apiFetch } from '../../../shared/services/api';
import type { Categoria } from '../types/categoria';

export const categoriesService = {
  getAll: () => apiFetch<Categoria[]>('/api/v1/categorias/'),
  getById: (id: number) => apiFetch<Categoria>(`/api/v1/categorias/${id}`),
  create: (data: Partial<Categoria>) => apiFetch<Categoria>('/api/v1/categorias/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Categoria>) => apiFetch<Categoria>(`/api/v1/categorias/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch<Categoria>(`/api/v1/categorias/${id}`, { method: 'DELETE' }),
};
