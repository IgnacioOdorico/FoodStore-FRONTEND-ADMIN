import { useEffect, useRef, useCallback } from 'react';

export interface WsMessage {
  event: string;
  data: unknown;
}

interface UseWebSocketOptions {
  onMessage?: (msg: WsMessage) => void;
  enabled?: boolean;
}

/**
 * Hook que gestiona una conexión WebSocket persistente con el backend.
 *
 * AUTENTICACIÓN
 * El backend autentica el socket leyendo la cookie httpOnly que el navegador
 * envía automáticamente durante el handshake HTTP → WS. No se necesita
 * pasar ningún header o token manualmente.
 * Si la cookie no es válida el servidor cierra con código 1008 (Policy Violation)
 * y el hook NO reintenta para no hacer bucles de reconexión sin sentido.
 *
 * ROOMS POR ROL (staff)
 * Al conectarse el backend automáticamente une el socket a la sala "role:{rol}".
 * El staff (ADMIN, PEDIDOS) recibe TODOS los eventos de pedidos en tiempo real
 * sin necesidad de hacer suscripciones adicionales.
 *
 * RECONEXIÓN CON BACKOFF EXPONENCIAL
 * Si la conexión se cierra de forma anormal (cualquier código que no sea 1000 ni 1008)
 * el hook programa un reintento con backoff exponencial:
 *   intento 1 → 2 s, intento 2 → 4 s, intento 3 → 8 s … máximo 30 s.
 * Al reconectarse exitosamente el contador se reinicia.
 *
 * EVENTO SINTÉTICO WS_CONNECTED
 * El backend no emite ningún mensaje al conectarse. Para que las páginas puedan
 * reaccionar a la (re)conexión —por ejemplo recargando datos— el hook emite
 * un mensaje local ficticio con event "WS_CONNECTED" en el handler onopen.
 *
 * COMPATIBILIDAD CON REACT STRICTMODE
 * En desarrollo React monta, desmonta y vuelve a montar cada componente.
 * El flag `cancelled` y la función closeCleanly garantizan que si el efecto
 * se limpia mientras el socket está en CONNECTING, la conexión se cierra
 * en cuanto abre, sin dejar sockets huérfanos.
 */
export function useWebSocket({
  onMessage,
  enabled = true,
}: UseWebSocketOptions = {}) {
  // Ref al callback onMessage para evitar que el efecto se re-ejecute
  // cada vez que el padre re-renderiza con una nueva función anónima.
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled) return;

    // Flag que se activa al desmontar o cuando `enabled` cambia a false.
    let cancelled = false;

    // Número de intentos de reconexión fallidos consecutivos.
    // Se usa para calcular el delay exponencial.
    let retryCount = 0;

    // Timer de reconexión pendiente (para cancelarlo en cleanup).
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    // Referencia local al socket del intento actual.
    let currentWs: WebSocket | null = null;

    /**
     * Cierra el socket de forma segura teniendo en cuenta su estado actual.
     * No se puede llamar ws.close() mientras el socket está en CONNECTING.
     */
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
      const wsUrl = BASE_URL.replace(/^http/, 'ws') + '/api/v1/pedidos/ws';

      const ws = new WebSocket(wsUrl);
      currentWs = ws;

      ws.onopen = () => {
        if (cancelled) {
          // El componente se desmontó mientras conectaba (StrictMode).
          ws.close(1000);
          return;
        }
        // Reconexión exitosa: resetear el backoff.
        retryCount = 0;
        // Emitir evento sintético para que las páginas sepan que el canal
        // está listo y puedan recargar datos o invalidar queries.
        onMessageRef.current?.({ event: 'WS_CONNECTED', data: null });
      };

      ws.onmessage = (event) => {
        if (cancelled) return;
        try {
          const msg = JSON.parse(event.data as string) as WsMessage;
          onMessageRef.current?.(msg);
        } catch {
          // Ignorar mensajes malformados.
        }
      };

      ws.onerror = () => {
        // Los errores de WebSocket siempre van seguidos de onclose.
        // Toda la lógica de reconexión se centraliza allí.
      };

      ws.onclose = (e) => {
        if (currentWs === ws) currentWs = null;

        const wasNormal = e.code === 1000;       // cierre limpio / intencional
        const wasAuthRejected = e.code === 1008; // token inválido o expirado

        // No reintentar si: desmontado, cierre limpio, o auth rechazada.
        if (cancelled || wasNormal || wasAuthRejected) return;

        // Backoff exponencial con techo de 30 s.
        // Fórmula: 1000 * 2^retryCount → 2 s, 4 s, 8 s, 16 s, 30 s, 30 s…
        retryCount++;
        const delay = Math.min(1000 * 2 ** retryCount, 30_000);
        console.warn(`[WS Admin] Reconectando en ${delay / 1000}s (intento ${retryCount})`);
        retryTimer = setTimeout(connect, delay);
      };
    };

    connect();

    // Cleanup: cancela reconexiones pendientes y cierra el socket activo.
    return () => {
      cancelled = true;
      if (retryTimer !== null) clearTimeout(retryTimer);
      if (currentWs) closeCleanly(currentWs);
    };
  }, [enabled]);
}
