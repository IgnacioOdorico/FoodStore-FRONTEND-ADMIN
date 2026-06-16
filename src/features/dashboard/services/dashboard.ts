import { api } from '../../../shared/services/api';

export interface ResumenResponse {
  ventas_hoy: number;
  ticket_promedio: number;
  pedidos_activos: number;
  mes_actual: number;
}

export interface VentasPeriodoItem {
  fecha: string;
  ingresos: number;
  cantidad: number;
}

export type PedidoPorDia = VentasPeriodoItem & { fechaLabel?: string };

export interface VentasPeriodoResponse {
  items: VentasPeriodoItem[];
}

export interface ProductoTopItem {
  nombre: string;
  cantidad: number;
  ingresos: number;
}

export type TopProducto = ProductoTopItem;

export interface ProductosTopResponse {
  items: ProductoTopItem[];
}

export interface PedidosEstadoResponse {
  items: Record<string, number>;
}

export interface IngresosItem {
  forma_pago_codigo: string;
  ingresos: number;
}

export interface IngresosResponse {
  items: IngresosItem[];
  total: number;
}

export const dashboardService = {
  getResumen: async (): Promise<ResumenResponse> => {
    return api.get<ResumenResponse>('/api/v1/estadisticas/resumen').then((r) => r.data);
  },

  getVentas: async (desde: string, hasta: string, agrupacion: string = 'dia'): Promise<VentasPeriodoResponse> => {
    return api.get<VentasPeriodoResponse>(`/api/v1/estadisticas/ventas?desde=${desde}&hasta=${hasta}&agrupacion=${agrupacion}`).then((r) => r.data);
  },

  getProductosTop: async (limit: number = 10): Promise<ProductosTopResponse> => {
    return api.get<ProductosTopResponse>(`/api/v1/estadisticas/productos-top?limit=${limit}`).then((r) => r.data);
  },

  getPedidosPorEstado: async (): Promise<PedidosEstadoResponse> => {
    return api.get<PedidosEstadoResponse>('/api/v1/estadisticas/pedidos-por-estado').then((r) => r.data);
  },

  getIngresos: async (desde: string, hasta: string): Promise<IngresosResponse> => {
    return api.get<IngresosResponse>(`/api/v1/estadisticas/ingresos?desde=${desde}&hasta=${hasta}`).then((r) => r.data);
  },
};
