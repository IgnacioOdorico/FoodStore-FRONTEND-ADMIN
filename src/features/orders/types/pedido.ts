export type EstadoPedido =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'EN_PREP'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO';

// Transiciones válidas según el backend
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
  id: number;
  producto_id: number;
  /** Snapshot inmutable del nombre al momento de la compra */
  nombre_snapshot: string;
  /** Snapshot inmutable del precio al momento de la compra */
  precio_unitario_snapshot: number;
  cantidad: number;
  subtotal: number;
}

export interface HistorialEstado {
  id: number;
  estado: EstadoPedido;
  observacion?: string;
  created_at: string;
}

export interface Pedido {
  id: number;
  usuario_id: number;
  usuario_nombre?: string;
  usuario_apellido?: string;
  estado_actual: EstadoPedido;
  total: number;
  forma_pago?: string;
  detalles: DetallePedido[];
  historial?: HistorialEstado[];
  created_at: string;
  updated_at: string;
}
