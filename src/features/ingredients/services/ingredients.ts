import { apiFetch } from '../../../shared/services/api';
import type { Ingrediente } from '../types/ingrediente';

export const ingredientsService = {
  getAll: () => apiFetch<Ingrediente[]>('/ingredientes/'),
  getById: (id: number) => apiFetch<Ingrediente>(`/ingredientes/${id}`),
  create: (data: Partial<Ingrediente>) => apiFetch<Ingrediente>('/ingredientes/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Ingrediente>) => apiFetch<Ingrediente>(`/ingredientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch<Ingrediente>(`/ingredientes/${id}`, { method: 'DELETE' }),
};
