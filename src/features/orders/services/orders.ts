import { api } from '../../../shared/services/api';
import type { EstadoPedido, Pedido } from '../types/pedido';

export const ordersService = {
  getAll: (params?: { estado?: EstadoPedido; page?: number; size?: number }) =>
    api.get<Pedido[]>('/api/v1/pedidos/', { params }).then((r) => r.data),

  getById: (id: number) =>
    api.get<Pedido>(`/api/v1/pedidos/${id}`).then((r) => r.data),

  /** Avanzar el estado de un pedido */
  avanzarEstado: (id: number, nuevo_estado: EstadoPedido, observacion?: string) =>
    api
      .patch<Pedido>(`/api/v1/pedidos/${id}/estado`, { estado: nuevo_estado, observacion })
      .then((r) => r.data),
};
