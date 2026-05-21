import { apiFetch } from '../../../shared/services/api';
import type { Ingrediente } from '../types/ingrediente';

export const ingredientsService = {
  getAll: () => apiFetch<Ingrediente[]>('/api/v1/ingredientes/'),
  getById: (id: number) => apiFetch<Ingrediente>(`/api/v1/ingredientes/${id}`),
  create: (data: Partial<Ingrediente>) => apiFetch<Ingrediente>('/api/v1/ingredientes/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Ingrediente>) => apiFetch<Ingrediente>(`/api/v1/ingredientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch<Ingrediente>(`/api/v1/ingredientes/${id}`, { method: 'DELETE' }),
};
