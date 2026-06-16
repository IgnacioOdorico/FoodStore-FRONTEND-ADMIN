import { useWebSocket } from './useWebSocket';
import { useQueryClient } from '@tanstack/react-query';
import { useWsStore } from '../store/wsStore';

const ORDER_EVENTS = new Set([
  'PEDIDO_NUEVO',
  'PEDIDO_CONFIRMADO',
  'PEDIDO_EN_PREPARACION',
  'PEDIDO_EN_CAMINO',
  'PEDIDO_ENTREGADO',
  'PEDIDO_CANCELADO',
  'WS_RECONNECTED',
]);

export function useAdminOrdersFeed(enabled = true) {
  const queryClient = useQueryClient();
  const isConnected = useWsStore((s) => s.isConnected);

  useWebSocket({
    enabled,
    onMessage: (msg) => {
      if (ORDER_EVENTS.has(msg.event)) {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }
    },
  });

  return { isConnected };
}
