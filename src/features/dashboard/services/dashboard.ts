import { api } from '../../../shared/services/api';
import type { Categoria } from '../../categories/types/categoria';
import type { Ingrediente } from '../../ingredients/types/ingrediente';
import type { Producto } from '../../products/types/producto';
import type { Pedido } from '../../orders/types/pedido';

export interface UserPublic {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  roles: string[];
  activo: boolean;
  created_at: string;
}

export interface PedidoPorDia {
  fecha: string;
  fechaLabel: string;
  cantidad: number;
  ingresos: number;
}

export interface TopProducto {
  nombre: string;
  cantidad: number;
  ingresos: number;
}

export interface ResumenStock {
  bajo: number;
  sinStock: number;
  normal: number;
  total: number;
}

export interface DashboardData {
  totalCategorias: number;
  totalProductos: number;
  totalIngredientes: number;
  totalPedidos: number;
  totalUsuarios: number | null; // null si no es admin
  pedidosPorEstado: Record<string, number>;
  pedidosPorFormaPago: Record<string, number>;
  ordenesRecientes: Pedido[];
  productosStockBajo: Producto[];
  ingredientesStockBajo: Ingrediente[];
  pedidosPorDia: PedidoPorDia[];
  topProductos: TopProducto[];
  productosConCategoria: { nombre: string; categorias: string[] }[];
  resumenStock: ResumenStock;
}

export const dashboardService = {
  getAll: async (isAdmin: boolean): Promise<DashboardData> => {
    const data = await api.get<DashboardData>('/api/v1/estadisticas/dashboard').then((r) => r.data);
    return data;
  },
};
