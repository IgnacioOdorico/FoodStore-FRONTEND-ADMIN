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

export interface DashboardData {
  totalCategorias: number;
  totalProductos: number;
  totalIngredientes: number;
  totalPedidos: number;
  totalUsuarios: number | null; // null si no es admin
  pedidosPorEstado: Record<string, number>;
  ordenesRecientes: Pedido[];
  productosStockBajo: Producto[];
}

export const dashboardService = {
  getAll: async (isAdmin: boolean): Promise<DashboardData> => {
    // El endpoint de usuarios es solo ADMIN; si no es admin, no lo llamamos
    const usuariosPromise = isAdmin
      ? api.get<UserPublic[]>('/api/v1/admin/usuarios').then((r) => r.data)
      : Promise.resolve(null);

    const [categorias, productos, ingredientes, pedidosResponse, usuarios] = await Promise.all([
      api.get<Categoria[]>('/api/v1/categorias/').then((r) => r.data),
      api.get<Producto[]>('/api/v1/productos/').then((r) => r.data),
      api.get<Ingrediente[]>('/api/v1/ingredientes/').then((r) => r.data),
      api.get<{ items: Pedido[] }>('/api/v1/pedidos/admin/listado').then((r) => r.data),
      usuariosPromise,
    ]);

    const pedidos = pedidosResponse.items || [];

    // Contar pedidos por estado
    const pedidosPorEstado: Record<string, number> = {};
    pedidos.forEach((p) => {
      pedidosPorEstado[p.estado_codigo] = (pedidosPorEstado[p.estado_codigo] ?? 0) + 1;
    });

    // Últimas 5 órdenes más recientes
    const ordenesRecientes = [...pedidos]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(orden => {
        const u = usuarios?.find(user => user.id === orden.usuario_id);
        return {
          ...orden,
          usuario_nombre: u ? u.email : undefined,
        };
      });

    // Productos con stock bajo (< 10 o sin stock)
    const productosStockBajo = productos
      .filter((p) => (p.stock_cantidad ?? 0) < 10)
      .slice(0, 8);

    return {
      totalCategorias: categorias.length,
      totalProductos: productos.length,
      totalIngredientes: ingredientes.length,
      totalPedidos: pedidos.length,
      totalUsuarios: usuarios?.length ?? null,
      pedidosPorEstado,
      ordenesRecientes,
      productosStockBajo,
    };
  },
};
