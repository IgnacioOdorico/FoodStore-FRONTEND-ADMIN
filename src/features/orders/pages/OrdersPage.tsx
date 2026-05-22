import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '../services/orders';
import {
  type EstadoPedido,
  type Pedido,
  ESTADO_LABELS,
  TRANSICIONES_VALIDAS,
} from '../types/pedido';
import { LoadingState, ErrorState } from '../../../shared/ui/States';

// Colummnas del tablero estilo kanban
interface ColumnaConfig {
  estado: EstadoPedido;
  label: string;
  icon: string;
  borderColor: string;
  badgeClass: string;
  iconClass: string;
  dimmed?: boolean;
}

const COLUMNAS: ColumnaConfig[] = [
  {
    estado: 'PENDIENTE',
    label: 'Pendiente',
    icon: 'pending_actions',
    borderColor: 'border-error/40',
    badgeClass: 'bg-error-container text-on-error-container',
    iconClass: 'text-error',
  },
  {
    estado: 'CONFIRMADO',
    label: 'Confirmado',
    icon: 'thumb_up',
    borderColor: 'border-secondary/40',
    badgeClass: 'bg-secondary-container text-on-secondary-container',
    iconClass: 'text-secondary',
  },
  {
    estado: 'EN_PREP',
    label: 'En Preparación',
    icon: 'restaurant',
    borderColor: 'border-tertiary/40',
    badgeClass: 'bg-[#cce5ff] text-[#001e31]',
    iconClass: 'text-tertiary',
  },
  {
    estado: 'EN_CAMINO',
    label: 'En Camino',
    icon: 'local_shipping',
    borderColor: 'border-primary/40',
    badgeClass: 'bg-primary-fixed text-on-primary-fixed',
    iconClass: 'text-primary',
  },
  {
    estado: 'ENTREGADO',
    label: 'Entregado',
    icon: 'check_circle',
    borderColor: 'border-secondary/30',
    badgeClass: 'bg-secondary-container text-on-secondary-container',
    iconClass: 'text-secondary',
    dimmed: true,
  },
  {
    estado: 'CANCELADO',
    label: 'Cancelado',
    icon: 'cancel',
    borderColor: 'border-error/30',
    badgeClass: 'bg-error-container text-on-error-container',
    iconClass: 'text-error',
    dimmed: true,
  },
];


function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return 'ahora';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const PedidoCard: React.FC<{
  pedido: Pedido;
  onAvanzar: (id: number, nuevoEstado: EstadoPedido) => void;
  isLoading: boolean;
  isEntregado?: boolean;
}> = ({ pedido, onAvanzar, isLoading, isEntregado }) => {
  const transiciones = TRANSICIONES_VALIDAS[pedido.estado_actual];
  const nextStates   = transiciones.filter((e) => e !== 'CANCELADO');
  const canCancel    = transiciones.includes('CANCELADO');
  const isEnCamino   = pedido.estado_actual === 'EN_CAMINO';

  const customerName = pedido.usuario_nombre
    ? `${pedido.usuario_nombre} ${pedido.usuario_apellido ?? ''}`.trim()
    : `Usuario #${pedido.usuario_id}`;

  if (isEntregado) {
    return (
      <div className="bg-surface-container-low p-md rounded-xl border border-outline-variant grayscale">
        <div className="flex justify-between items-start mb-sm">
          <span className="text-label-caps text-on-surface-variant">#{pedido.id}</span>
          <span className="text-body-sm text-on-surface-variant">{timeAgo(pedido.created_at)}</span>
        </div>
        <h4 className="text-title-md text-on-surface-variant mb-xs">{customerName}</h4>
        <div className="flex justify-between items-center pt-md border-t border-dashed border-outline-variant">
          <span className="text-title-md font-bold">
            ${Number(pedido.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
          <span className="material-symbols-outlined text-secondary">check_circle</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white p-md rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow group
        ${isEnCamino ? 'bg-primary/5 border-2 border-primary relative overflow-hidden' : ''}`}
    >
      {isEnCamino && (
        <div className="absolute -right-2 -top-2 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined" style={{ fontSize: 80 }}>done_all</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-sm">
        <span className={`text-label-caps font-black ${isEnCamino ? 'text-primary' : 'text-primary'}`}>
          #{pedido.id}
        </span>
        <span className="text-body-sm text-on-surface-variant">{timeAgo(pedido.created_at)}</span>
      </div>

      {/* Customer */}
      <h4 className="text-title-md text-on-surface mb-xs">{customerName}</h4>

      {/* Items */}
      <div className="space-y-1 mb-md">
        {(pedido.detalles ?? []).slice(0, 3).map((d) => (
          <p key={d.id} className="text-body-sm text-on-surface-variant flex justify-between">
            <span>{d.nombre_snapshot}</span>
            <span className="text-on-surface font-bold">Qty {d.cantidad}</span>
          </p>
        ))}
        {(pedido.detalles?.length ?? 0) > 3 && (
          <p className="text-body-sm text-on-surface-variant opacity-60">
            +{(pedido.detalles?.length ?? 0) - 3} más…
          </p>
        )}
      </div>

      {/* Footer */}
      {isEnCamino ? (
        <div className="flex flex-col gap-sm pt-md border-t border-dashed border-primary/30">
          <div className="flex justify-between items-center">
            <span className="text-title-md font-bold text-primary">
              ${Number(pedido.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          {nextStates.map((estado) => (
            <button
              key={estado}
              disabled={isLoading}
              onClick={() => onAvanzar(pedido.id, estado)}
              className="w-full bg-primary text-on-primary py-2 rounded-lg text-label-caps hover:bg-primary-container transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              MARCAR ENTREGADO
            </button>
          ))}
          {canCancel && (
            <button
              disabled={isLoading}
              onClick={() => onAvanzar(pedido.id, 'CANCELADO')}
              className="w-full text-error border border-error/30 py-1 rounded-lg text-label-caps hover:bg-error-container/30 transition-colors disabled:opacity-50 text-xs"
            >
              Cancelar
            </button>
          )}
        </div>
      ) : (
        <div className="flex justify-between items-center pt-md border-t border-dashed border-outline-variant">
          <span className="text-title-md font-bold text-primary">
            ${Number(pedido.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
          <div className="flex gap-xs">
            {canCancel && (
              <button
                disabled={isLoading}
                onClick={() => onAvanzar(pedido.id, 'CANCELADO')}
                className="p-2 hover:bg-error-container/30 rounded-full text-error transition-colors disabled:opacity-50"
                title="Cancelar pedido"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            )}
            {nextStates.map((estado) => (
              <button
                key={estado}
                disabled={isLoading}
                onClick={() => onAvanzar(pedido.id, estado)}
                className="p-2 hover:bg-surface-container rounded-full text-secondary transition-colors disabled:opacity-50"
                title={`Pasar a ${ESTADO_LABELS[estado]}`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
                >
                  play_arrow
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


const KanbanColumn: React.FC<{
  config: ColumnaConfig;
  pedidos: Pedido[];
  onAvanzar: (id: number, estado: EstadoPedido) => void;
  isLoading: boolean;
}> = ({ config, pedidos, onAvanzar, isLoading }) => {
  const count = pedidos.length;
  const isTerminal = config.estado === 'ENTREGADO' || config.estado === 'CANCELADO';

  return (
    <section className={`w-[300px] flex-shrink-0 flex flex-col gap-md ${config.dimmed ? 'opacity-60' : ''}`}>
      {/* Column header */}
      <div className={`flex items-center justify-between border-b-4 ${config.borderColor} pb-2 px-1`}>
        <h3 className="text-title-md flex items-center gap-2">
          <span className={`material-symbols-outlined ${config.iconClass}`}>{config.icon}</span>
          {config.label}
        </h3>
        <span className={`${config.badgeClass} px-2 py-0.5 rounded-full text-label-caps`}>
          {count.toString().padStart(2, '0')}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-md overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 220px)' }}>
        {pedidos.length === 0 ? (
          <div className="flex items-center justify-center h-24 border-2 border-dashed border-outline-variant rounded-xl">
            <p className="text-body-sm text-on-surface-variant opacity-40">Sin pedidos</p>
          </div>
        ) : (
          pedidos.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              onAvanzar={onAvanzar}
              isLoading={isLoading}
              isEntregado={isTerminal}
            />
          ))
        )}
      </div>
    </section>
  );
};


export const OrdersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: pedidos, isLoading, isError, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersService.getAll(),
    refetchInterval: 30_000,
  });

  const avanzarMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      ordersService.avanzarEstado(id, { estado_hacia: estado }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
    onError: (e) => alert('Error al cambiar estado: ' + (e instanceof Error ? e.message : 'Error desconocido')),
  });

  const handleAvanzar = (id: number, nuevoEstado: EstadoPedido) => {
    avanzarMutation.mutate({ id, estado: nuevoEstado });
  };

  // Agrupación por estado con filtro de búsqueda
  const grupos = useMemo(() => {
    const all = pedidos ?? [];
    const filtered = search.trim()
      ? all.filter(
          (p) =>
            String(p.id).includes(search) ||
            (p.usuario_nombre ?? '').toLowerCase().includes(search.toLowerCase()) ||
            (p.usuario_apellido ?? '').toLowerCase().includes(search.toLowerCase()),
        )
      : all;

    return COLUMNAS.reduce(
      (acc, col) => {
        acc[col.estado] = filtered.filter((p) => p.estado_actual === col.estado);
        return acc;
      },
      {} as Record<EstadoPedido, Pedido[]>,
    );
  }, [pedidos, search]);

  const totalActivos = useMemo(
    () =>
      (pedidos ?? []).filter(
        (p) => p.estado_actual !== 'ENTREGADO' && p.estado_actual !== 'CANCELADO',
      ).length,
    [pedidos],
  );

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—';

  return (
    /* -m-lg compensa el padding del layout para que el kanban sea full-height */
    <div className="-m-lg h-screen flex flex-col p-lg overflow-hidden animate-in fade-in duration-500">

      {/* Top Action Bar */}
      <header className="flex justify-between items-end mb-lg flex-shrink-0">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Order Dashboard</h2>
          <div className="flex items-center gap-sm mt-xs">
            <span className="flex items-center gap-xs px-2 py-1 bg-primary/10 text-primary rounded-full text-label-caps" style={{ fontSize: 10 }}>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
              LIVE FEED
            </span>
            <span className="text-body-sm text-on-surface-variant">
              {totalActivos} pedido{totalActivos !== 1 ? 's' : ''} en progreso · actualizado {lastUpdated}
            </span>
          </div>
        </div>

        <div className="flex gap-md items-center">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: 18 }}>
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar pedido o cliente…"
              className="input-field pl-9 pr-4 py-2 w-60"
            />
          </div>

          {/* Refresh manual */}
          <button
            onClick={() => refetch()}
            className="btn-icon border border-outline-variant hover:bg-surface-container text-on-surface-variant"
            title="Actualizar"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>refresh</span>
          </button>
        </div>
      </header>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center"><LoadingState /></div>
      ) : isError ? (
        <div className="flex-1 flex items-center justify-center"><ErrorState onRetry={() => refetch()} /></div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
          <div className="flex gap-lg h-full" style={{ minWidth: 'max-content' }}>
            {COLUMNAS.map((col) => (
              <KanbanColumn
                key={col.estado}
                config={col}
                pedidos={grupos[col.estado] ?? []}
                onAvanzar={handleAvanzar}
                isLoading={avanzarMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
