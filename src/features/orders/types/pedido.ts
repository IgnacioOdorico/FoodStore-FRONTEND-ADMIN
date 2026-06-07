export type EstadoPedido =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'EN_PREP'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO';

export const TRANSICIONES_VALIDAS: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE:  ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO: ['EN_PREP',    'CANCELADO'],
  EN_PREP:    ['EN_CAMINO'],
  EN_CAMINO:  ['ENTREGADO'],
  ENTREGADO:  [],
  CANCELADO:  [],
};

export const ESTADO_LABELS: Record<EstadoPedido, string> = {
  PENDIENTE:  'Pendiente',
  CONFIRMADO: 'Confirmado',
  EN_PREP:    'En preparación',
  EN_CAMINO:  'En camino',
  ENTREGADO:  'Entregado',
  CANCELADO:  'Cancelado',
};

export const ESTADO_COLORS: Record<EstadoPedido, string> = {
  PENDIENTE:  'bg-error-container text-on-error-container',
  CONFIRMADO: 'bg-secondary-container text-on-secondary-container',
  EN_PREP:    'bg-[#cce5ff] text-[#001e31]',
  EN_CAMINO:  'bg-primary-fixed text-on-primary-fixed',
  ENTREGADO:  'bg-surface-container text-on-surface-variant',
  CANCELADO:  'bg-error-container/50 text-on-error-container',
};

export interface DetallePedido {
  pedido_id: number;
  producto_id: number;
  nombre_snapshot: string;
  precio_snapshot: number;
  cantidad: number;
  subtotal_snap: number;
  personalizacion?: number[];
  created_at: string;
}

export interface AvanzarEstadoRequest {
  estado_hacia: EstadoPedido;
  motivo?: string;
}

export interface HistorialEstado {
  id: number;
  estado_desde: string | null;
  estado_hacia: string;
  usuario_id: number | null;
  motivo: string | null;
  created_at: string;
}

export interface Pedido {
  id: number;
  usuario_id: number;
  usuario_nombre?: string;
  estado_codigo: EstadoPedido;
  forma_pago_codigo: string;
  subtotal: number;
  descuento: number;
  costo_envio: number;
  total: number;
  notas?: string | null;
  detalles: DetallePedido[];
  historial?: HistorialEstado[];
  direccion_id?: number | null;
  direccion?: {
    alias?: string | null;
    linea1: string;
    linea2?: string | null;
    ciudad: string;
    provincia?: string | null;
  } | null;
  created_at: string;
  updated_at: string;
}
