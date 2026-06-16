import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '../services/orders';
import { usersService } from '../../admin/services/users';
import type { Usuario } from '../../admin/types/usuario';
import { useAuthStore } from '../../../store/useAuthStore';

import {
  type EstadoPedido,
  type Pedido,
  ESTADO_LABELS,
  TRANSICIONES_VALIDAS,
} from '../types/pedido';
import { LoadingState, ErrorState } from '../../../shared/ui/States';
import { Skeleton } from '../../../shared/ui/Skeleton';
import { Modal } from '../../../shared/ui/Modal';

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
  if (m < 1) return 'ahora';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const PedidoCard: React.FC<{
  pedido: Pedido;
  onAvanzar: (id: number, nuevoEstado: EstadoPedido) => void;
  onViewDetail?: (pedido: Pedido) => void;
  isLoading: boolean;
  isEntregado?: boolean;
  isCancelado?: boolean;
  usuarios?: Usuario[];
}> = ({ pedido, onAvanzar, onViewDetail, isLoading, isEntregado, isCancelado, usuarios }) => {
  const transiciones = TRANSICIONES_VALIDAS[pedido.estado_codigo];
  const nextStates = transiciones.filter((e) => e !== 'CANCELADO');
  const canCancel = transiciones.includes('CANCELADO');

  const u = usuarios?.find(user => user.id === pedido.usuario_id);
  const customerName = u ? u.email : `Usuario #${pedido.usuario_id}`;

  if (isEntregado) {
    return (
      <div className="bg-surface-container-low p-md rounded-xl border border-outline-variant grayscale">
        <div className="flex justify-between items-start mb-sm">
          <span className="text-label-caps text-on-surface-variant">#{pedido.id}</span>
          <span className="text-body-sm text-on-surface-variant">{timeAgo(pedido.created_at)}</span>
        </div>
        <div className="mb-xs">
          <h4 className="text-title-md text-on-surface-variant">{customerName}</h4>
          {pedido.direccion ? (
            <div className="flex items-start gap-1 text-on-surface-variant/80 mt-1">
              <span className="material-symbols-outlined text-[14px]">local_shipping</span>
              <span className="text-[12px] leading-tight">
                {pedido.direccion.linea1} {pedido.direccion.linea2 ? `, ${pedido.direccion.linea2}` : ''}<br />
                <span className="opacity-80">{pedido.direccion.ciudad}</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-on-surface-variant/80 mt-1 text-[12px]">
              <span className="material-symbols-outlined text-[14px]">storefront</span>
              Retiro en local
            </div>
          )}
        </div>
        <div className="flex justify-between items-center pt-md border-t border-dashed border-outline-variant">
          <span className="text-title-md font-bold">
            ${Number(pedido.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
          <div className="flex gap-2 items-center">
            {onViewDetail && (
              <button
                onClick={() => onViewDetail(pedido)}
                className="flex items-center gap-1 text-label-caps text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>info</span>
                Ver detalle
              </button>
            )}
            <span className="material-symbols-outlined text-secondary">check_circle</span>
          </div>
        </div>
      </div>
    );
  }

  if (isCancelado) {
    const cancelEntry = pedido.historial?.find(h => h.estado_hacia === 'CANCELADO');
    return (
      <div className="bg-surface-container-low p-md rounded-xl border border-error/20 grayscale opacity-70 hover:opacity-90 transition-opacity">
        <div className="flex justify-between items-start mb-sm">
          <span className="text-label-caps text-on-surface-variant">#{pedido.id}</span>
          <span className="text-body-sm text-on-surface-variant">{timeAgo(pedido.created_at)}</span>
        </div>
        <div className="mb-xs">
          <h4 className="text-title-md text-on-surface-variant">{customerName}</h4>
          {pedido.direccion ? (
            <div className="flex items-start gap-1 text-on-surface-variant/80 mt-1">
              <span className="material-symbols-outlined text-[14px]">local_shipping</span>
              <span className="text-[12px] leading-tight">
                {pedido.direccion.linea1} {pedido.direccion.linea2 ? `, ${pedido.direccion.linea2}` : ''}<br />
                <span className="opacity-80">{pedido.direccion.ciudad}</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-on-surface-variant/80 mt-1 text-[12px]">
              <span className="material-symbols-outlined text-[14px]">storefront</span>
              Retiro en local
            </div>
          )}
        </div>
        {cancelEntry?.motivo && (
          <p className="text-body-sm text-error/70 mb-md line-clamp-2 italic">"{cancelEntry.motivo}"</p>
        )}
        <div className="flex justify-between items-center pt-md border-t border-dashed border-error/10">
          <span className="text-title-md font-bold text-on-surface-variant">
            ${Number(pedido.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
          {onViewDetail && (
            <button
              onClick={() => onViewDetail(pedido)}
              className="flex items-center gap-1 text-label-caps text-error/70 hover:text-error transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>info</span>
              Ver detalle
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white p-md rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow group"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-sm">
        <span className="text-label-caps font-black text-primary">
          #{pedido.id}
        </span>
        <span className="text-body-sm text-on-surface-variant">{timeAgo(pedido.created_at)}</span>
      </div>

      {/* Cliente */}
      <div className="mb-sm">
        <h4 className="text-title-md text-on-surface">{customerName}</h4>
        {pedido.direccion ? (
          <div className="flex items-start gap-1 text-on-surface-variant mt-1 bg-surface-container-low p-2 rounded-lg border border-outline-variant/30">
            <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">local_shipping</span>
            <span className="text-body-sm leading-tight">
              <span className="font-medium text-on-surface">Envío a domicilio</span><br />
              {pedido.direccion.linea1} {pedido.direccion.linea2 ? `, ${pedido.direccion.linea2}` : ''}<br />
              <span className="text-xs opacity-80">{pedido.direccion.ciudad}</span>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-on-surface-variant mt-1 bg-surface-container-low p-2 rounded-lg border border-outline-variant/30">
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            <span className="text-body-sm font-medium">Retiro en local</span>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="space-y-1 mb-md">
        {(pedido.detalles ?? []).slice(0, 3).map((d) => (
          <p key={d.id} className="text-body-sm text-on-surface-variant flex justify-between">
            <span>{d.nombre_snapshot}</span>
            <span className="text-on-surface font-bold">Cant. {d.cantidad}</span>
          </p>
        ))}
        {(pedido.detalles?.length ?? 0) > 3 && (
          <p className="text-body-sm text-on-surface-variant opacity-60">
            +{(pedido.detalles?.length ?? 0) - 3} más…
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-md border-t border-dashed border-outline-variant">
        <span className="text-title-md font-bold text-primary">
          ${Number(pedido.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </span>
        <div className="flex gap-xs">
          {onViewDetail && (
            <button
              onClick={() => onViewDetail(pedido)}
              className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors"
              title="Ver detalle"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>info</span>
            </button>
          )}
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
    </div>
  );
};


const KanbanColumn: React.FC<{
  config: ColumnaConfig;
  pedidos: Pedido[];
  onAvanzar: (id: number, estado: EstadoPedido) => void;
  onViewDetail?: (pedido: Pedido) => void;
  isLoading: boolean;
  usuarios?: Usuario[];
}> = ({ config, pedidos, onAvanzar, onViewDetail, isLoading, usuarios }) => {
  const count = pedidos.length;
  const isTerminal = config.estado === 'ENTREGADO' || config.estado === 'CANCELADO';
  const isCancel = config.estado === 'CANCELADO';

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
              onViewDetail={onViewDetail}
              isLoading={isLoading}
              isEntregado={config.estado === 'ENTREGADO'}
              isCancelado={config.estado === 'CANCELADO'}
              usuarios={usuarios}
            />
          ))
        )}
      </div>
    </section>
  );
};


export const OrdersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { hasRole } = useAuthStore();
  const isAdmin = hasRole('ADMIN');
  const [search, setSearch] = useState('');




  const { data: pedidos, isLoading, isError, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersService.getAll(),
    refetchInterval: 60_000, // fallback por si el WS se cae
  });

  const { data: usuarios } = useQuery({
    queryKey: ['usuarios'],
    queryFn: usersService.getAll,
    enabled: isAdmin,
    retry: false,
  });

  // Estado del modal de cancelación
  const [cancelTarget, setCancelTarget] = useState<{ id: number; estado: EstadoPedido } | null>(null);
  const [cancelMotivo, setCancelMotivo] = useState('');

  // Estado del modal de detalle de pedido cancelado
  const [detailTarget, setDetailTarget] = useState<Pedido | null>(null);

  const avanzarMutation = useMutation({
    mutationFn: ({ id, estado, motivo }: { id: number; estado: EstadoPedido; motivo?: string }) =>
      ordersService.avanzarEstado(id, { estado_hacia: estado, motivo }),
    onMutate: async ({ id, estado }) => {
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      const previous = queryClient.getQueryData<Pedido[]>(['orders']);
      queryClient.setQueryData<Pedido[]>(['orders'], (old) =>
        old?.map((p) => (p.id === id ? { ...p, estado_codigo: estado } : p)) ?? []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['orders'], context.previous);
      }
      toast.error('Error al cambiar estado: ' + (_err instanceof Error ? _err.message : 'Error desconocido'));
    },
    onSuccess: () => {
      setCancelTarget(null);
      setCancelMotivo('');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const handleAvanzar = (id: number, nuevoEstado: EstadoPedido) => {
    // Si es cancelación, abrimos modal para pedir el motivo
    if (nuevoEstado === 'CANCELADO') {
      setCancelTarget({ id, estado: nuevoEstado });
      setCancelMotivo('');
      return;
    }
    avanzarMutation.mutate({ id, estado: nuevoEstado });
  };

  const handleCancelConfirm = () => {
    if (!cancelTarget) return;
    avanzarMutation.mutate({
      id: cancelTarget.id,
      estado: 'CANCELADO',
      motivo: cancelMotivo,
    });
  };

  // Agrupación por estado con filtro de búsqueda
  const grupos = useMemo(() => {
    const all = pedidos ?? [];
    const filtered = search.trim()
      ? all.filter((p) => String(p.id).includes(search))
      : all;

    return COLUMNAS.reduce(
      (acc, col) => {
        acc[col.estado] = filtered.filter((p) => p.estado_codigo === col.estado);
        return acc;
      },
      {} as Record<EstadoPedido, Pedido[]>,
    );
  }, [pedidos, search]);

  const totalActivos = useMemo(
    () =>
      (pedidos ?? []).filter(
        (p) => p.estado_codigo !== 'ENTREGADO' && p.estado_codigo !== 'CANCELADO',
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
          <h2 className="text-headline-lg font-bold text-on-surface">Tablero de Pedidos</h2>
          <div className="flex items-center gap-sm mt-xs">
            <span className="flex items-center gap-xs px-2 py-1 bg-primary/10 text-primary rounded-full text-label-caps" style={{ fontSize: 10 }}>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
              EN VIVO
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
        <div className="flex-1 flex gap-lg overflow-x-auto pb-4">
          {COLUMNAS.map((col) => (
            <section key={col.estado} className="w-[300px] flex-shrink-0 flex flex-col gap-md">
              <Skeleton className="h-8 w-full" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </section>
          ))}
        </div>
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
                onViewDetail={setDetailTarget}
                isLoading={avanzarMutation.isPending}
                usuarios={usuarios}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal de cancelación */}
      <Modal
        isOpen={cancelTarget !== null}
        onClose={() => { setCancelTarget(null); setCancelMotivo(''); }}
        title="Cancelar Pedido"
        maxWidth="2xl"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setCancelTarget(null); setCancelMotivo(''); }}
              className="btn-secondary"
            >
              Volver
            </button>
            <button
              onClick={handleCancelConfirm}
              disabled={!cancelMotivo.trim() || avanzarMutation.isPending}
              className="btn-danger disabled:opacity-50"
            >
              {avanzarMutation.isPending ? 'Cancelando...' : 'Confirmar Cancelación'}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-6 w-full overflow-x-hidden">
          <p className="text-body-sm text-on-surface-variant leading-relaxed">
            ¿Estás seguro de que querés cancelar el pedido <strong className="text-on-surface">#{cancelTarget?.id}</strong>?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-label-caps text-on-surface-variant">
              Motivo de cancelación <span className="text-error">*</span>
            </label>
            <textarea
              value={cancelMotivo}
              onChange={(e) => setCancelMotivo(e.target.value)}
              placeholder="Ej: Cliente solicitó cancelación, producto agotado..."
              className="input-field min-h-[100px] resize-none w-full"
              autoFocus
            />
          </div>
        </div>
      </Modal>

      {/* Modal de detalle de pedido */}
      <Modal
        isOpen={detailTarget !== null}
        onClose={() => setDetailTarget(null)}
        title={detailTarget ? `Pedido #${detailTarget.id} — ${ESTADO_LABELS[detailTarget.estado_codigo as EstadoPedido] || detailTarget.estado_codigo}` : ''}
        maxWidth="2xl"
        footer={
          <div className="flex justify-end">
            <button onClick={() => setDetailTarget(null)} className="btn-secondary">
              Cerrar
            </button>
          </div>
        }
      >
        {detailTarget && (
          <div className="flex flex-col gap-6 w-full overflow-x-hidden">
            {/* Info del cliente */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-label-caps text-on-surface-variant">Cliente</span>
                <span className="text-body-sm font-semibold text-on-surface">
                  {(() => {
                    const u = usuarios?.find(user => user.id === detailTarget.usuario_id);
                    return u ? u.email : `Usuario #${detailTarget.usuario_id}`;
                  })()}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-label-caps text-on-surface-variant">Fecha</span>
                <span className="text-body-sm font-semibold text-on-surface">
                  {new Date(detailTarget.created_at).toLocaleDateString('es-AR', {
                    day: '2-digit', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Motivo de cancelación */}
            {(() => {
              const entry = detailTarget.historial?.find(h => h.estado_hacia === 'CANCELADO');
              if (!entry?.motivo) return null;
              return (
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <span className="text-label-caps text-error/70 block mb-1">Motivo de cancelación</span>
                  <p className="text-body-sm text-error font-medium">{entry.motivo}</p>
                </div>
              );
            })()}

            {/* Items del pedido */}
            <div>
              <span className="text-label-caps text-on-surface-variant block mb-3">Productos</span>
              <div className="divide-y divide-outline-variant/50 border border-outline-variant/50 rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-surface-container text-label-caps text-on-surface-variant">
                  <span className="col-span-6">Producto</span>
                  <span className="col-span-2 text-center">Cant.</span>
                  <span className="col-span-2 text-right">Precio</span>
                  <span className="col-span-2 text-right">Subtotal</span>
                </div>
                {detailTarget.detalles.map((d) => (
                  <div key={d.id} className="grid grid-cols-12 gap-2 px-4 py-3 text-body-sm">
                    <span className="col-span-6 text-on-surface font-medium">{d.nombre_snapshot}</span>
                    <span className="col-span-2 text-center text-on-surface-variant">{d.cantidad}</span>
                    <span className="col-span-2 text-right text-on-surface-variant">
                      ${Number(d.precio_snapshot).toLocaleString('es-AR')}
                    </span>
                    <span className="col-span-2 text-right text-on-surface font-bold">
                      ${Number(d.subtotal_snap).toLocaleString('es-AR')}
                    </span>
                  </div>
                ))}
                <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-surface-container border-t border-outline-variant/50">
                  <span className="col-span-10 text-right text-body-sm font-bold text-on-surface">Total</span>
                  <span className="col-span-2 text-right text-title-md font-bold text-primary">
                    ${Number(detailTarget.total).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Historial de estados */}
            {detailTarget.historial && detailTarget.historial.length > 0 && (
              <div>
                <span className="text-label-caps text-on-surface-variant block mb-3">Historial de estados</span>
                <div className="space-y-2">
                  {detailTarget.historial.map((h) => (
                    <div key={h.id} className="flex items-start gap-3 p-3 bg-surface-container-low rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${h.estado_hacia === 'CANCELADO' ? 'bg-error' : 'bg-primary'
                        }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-body-sm font-semibold text-on-surface">
                            {ESTADO_LABELS[h.estado_hacia as EstadoPedido] ?? h.estado_hacia}
                          </span>
                          <span className="text-xs text-on-surface-variant">
                            {new Date(h.created_at).toLocaleTimeString('es-AR', {
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {h.motivo && (
                          <p className="text-xs text-on-surface-variant mt-0.5 italic">"{h.motivo}"</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
