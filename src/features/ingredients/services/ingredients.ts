import { api } from '../../../shared/services/api';
import type { Ingrediente } from '../types/ingrediente';

export const ingredientsService = {
  getAll: () => api.get<Ingrediente[]>('/api/v1/ingredientes/').then((r) => r.data),
  getById: (id: number) => api.get<Ingrediente>(`/api/v1/ingredientes/${id}`).then((r) => r.data),
  create: (data: Partial<Ingrediente>) => api.post<Ingrediente>('/api/v1/ingredientes/', data).then((r) => r.data),
  update: (id: number, data: Partial<Ingrediente>) => api.put<Ingrediente>(`/api/v1/ingredientes/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/api/v1/ingredientes/${id}`).then((r) => r.data),
};
