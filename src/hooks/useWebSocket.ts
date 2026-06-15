import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWsStore } from '../store/wsStore';

export interface WsMessage {
  event: string;
  data: unknown;
}

interface UseWebSocketOptions {
  onMessage?: (msg: WsMessage) => void;
  enabled?: boolean;
}

// useWebSocket hook
export function useWebSocket({
  onMessage,
  enabled = true,
}: UseWebSocketOptions = {}) {
  const onMessageRef = useRef(onMessage);
  const queryClient = useQueryClient();

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let retryCount = 0;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let currentWs: WebSocket | null = null;

    const closeCleanly = (ws: WebSocket) => {
      if (ws.readyState === WebSocket.CONNECTING) {
        ws.addEventListener('open', () => ws.close(1000), { once: true });
      } else if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000);
      }
    };

    const connect = () => {
      if (cancelled) return;

      const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
      const wsUrl = BASE_URL.replace(/^http/, 'ws') + '/api/v1/pedidos/ws/admin';

      const ws = new WebSocket(wsUrl);
      currentWs = ws;

      ws.onopen = () => {
        if (cancelled) {
          ws.close(1000);
          return;
        }
        const isReconnection = retryCount > 0;
        retryCount = 0;
        useWsStore.getState().connect();
        onMessageRef.current?.({ event: 'WS_CONNECTED', data: null });

        if (isReconnection) {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          onMessageRef.current?.({ event: 'WS_RECONNECTED', data: null });
        }
      };

      ws.onmessage = (event) => {
        if (cancelled) return;
        try {
          const msg = JSON.parse(event.data as string) as WsMessage;
          onMessageRef.current?.(msg);
        } catch {}
      };

      ws.onerror = () => {};

      ws.onclose = (e) => {
        if (currentWs === ws) currentWs = null;
        useWsStore.getState().disconnect();

        const wasNormal = e.code === 1000;
        const wasAuthRejected = e.code === 1008;

        if (cancelled || wasNormal || wasAuthRejected) return;

        retryCount++;
        const delay = Math.min(1000 * 2 ** retryCount, 30_000);
        console.warn(`[WS Admin] Reconectando en ${delay / 1000}s (intento ${retryCount})`);
        retryTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (retryTimer !== null) clearTimeout(retryTimer);
      if (currentWs) closeCleanly(currentWs);
    };
  }, [enabled, queryClient]);
}

