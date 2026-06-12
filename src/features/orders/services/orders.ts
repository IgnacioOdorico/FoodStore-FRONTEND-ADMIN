import { api } from '../../../shared/services/api';
import type { AvanzarEstadoRequest, EstadoPedido, Pedido } from '../types/pedido';

export const ordersService = {
  getAll: (params?: { estado?: EstadoPedido }) =>
    api.get<{ items: Pedido[] }>('/api/v1/pedidos/admin/listado', { params }).then((r) => r.data.items || []),

  getById: (id: number) =>
    api.get<Pedido>(`/api/v1/pedidos/${id}`).then((r) => r.data),

  /** Avanzar el estado de un pedido */
  avanzarEstado: (id: number, data: AvanzarEstadoRequest) =>
    api
      .patch<Pedido>(`/api/v1/pedidos/${id}/avanzar`, data)
      .then((r) => r.data),
};
