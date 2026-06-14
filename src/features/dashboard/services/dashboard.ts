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
    // El endpoint de usuarios es solo ADMIN; si no es admin, no lo llamamos
    const usuariosPromise = isAdmin
      ? api.get<UserPublic[]>('/api/v1/admin/usuarios').then((r) => r.data)
      : Promise.resolve(null);

    const [categorias, productosResponse, ingredientes, pedidosResponse, usuarios] = await Promise.all([
      api.get<Categoria[]>('/api/v1/categorias/').then((r) => r.data),
      api.get<{ items: Producto[]; total: number }>('/api/v1/productos/?size=100').then((r) => r.data),
      api.get<Ingrediente[]>('/api/v1/ingredientes/').then((r) => r.data),
      api.get<{ items: Pedido[]; total: number }>('/api/v1/pedidos/admin/listado?size=100').then((r) => r.data),
      usuariosPromise,
    ]);

    const productos = productosResponse.items || [];
    const pedidos = pedidosResponse.items || [];

    // ─── Pedidos por estado ────────────────────────────────────────────────
    const pedidosPorEstado: Record<string, number> = {};
    const pedidosPorFormaPago: Record<string, number> = {};
    pedidos.forEach((p) => {
      pedidosPorEstado[p.estado_codigo] = (pedidosPorEstado[p.estado_codigo] ?? 0) + 1;
      pedidosPorFormaPago[p.forma_pago_codigo] = (pedidosPorFormaPago[p.forma_pago_codigo] ?? 0) + 1;
    });

    // ─── Pedidos por día (para el timeline) ───────────────────────────────
    const agrupadosPorDia: Record<string, { cantidad: number; ingresos: number }> = {};
    pedidos.forEach((p) => {
      const dia = new Date(p.created_at).toISOString().split('T')[0];
      if (!agrupadosPorDia[dia]) agrupadosPorDia[dia] = { cantidad: 0, ingresos: 0 };
      agrupadosPorDia[dia].cantidad += 1;
      agrupadosPorDia[dia].ingresos += p.total;
    });
    const pedidosPorDia: PedidoPorDia[] = Object.entries(agrupadosPorDia)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, datos]) => {
        const d = new Date(fecha);
        const fechaLabel = d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
        return { fecha, fechaLabel, ...datos };
      });

    // ─── Top productos más vendidos ───────────────────────────────────────
    const conteoProductos: Record<string, { nombre: string; cantidad: number; ingresos: number }> = {};
    pedidos.forEach((p) => {
      (p.detalles ?? []).forEach((d) => {
        if (!conteoProductos[d.nombre_snapshot]) {
          conteoProductos[d.nombre_snapshot] = { nombre: d.nombre_snapshot, cantidad: 0, ingresos: 0 };
        }
        conteoProductos[d.nombre_snapshot].cantidad += d.cantidad;
        conteoProductos[d.nombre_snapshot].ingresos += d.subtotal_snap;
      });
    });
    const topProductos: TopProducto[] = Object.values(conteoProductos)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);

    // ─── Productos por categoría ──────────────────────────────────────────
    const productosConCategoria = productos.map((p) => ({
      nombre: p.nombre,
      categorias: (p.categorias ?? []).map((c) => c.nombre),
    }));

    // ─── Resumen de stock ─────────────────────────────────────────────────
    const resumenStock: ResumenStock = {
      bajo: productos.filter((p) => (p.stock_cantidad ?? 0) > 0 && (p.stock_cantidad ?? 0) < 10).length,
      sinStock: productos.filter((p) => (p.stock_cantidad ?? 0) === 0 && p.disponible).length,
      normal: productos.filter((p) => (p.stock_cantidad ?? 10) >= 10).length,
      total: productos.length,
    };

    // ─── Últimas 8 órdenes más recientes ──────────────────────────────────
    const ordenesRecientes = [...pedidos]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8)
      .map(orden => {
        const u = usuarios?.find(user => user.id === orden.usuario_id);
        return {
          ...orden,
          usuario_nombre: u ? `${u.nombre} ${u.apellido}`.trim() || u.email : undefined,
        };
      });

    // ─── Productos con stock bajo ─────────────────────────────────────────
    const productosStockBajo = productos
      .filter((p) => (p.stock_cantidad ?? 0) < 10)
      .slice(0, 8);

    // ─── Ingredientes con stock bajo ──────────────────────────────────────
    const ingredientesStockBajo = (ingredientes ?? [])
      .filter((i) => (i.stock_cantidad ?? 0) > 0 && (i.stock_cantidad ?? 0) < 10)
      .slice(0, 8);

    return {
      totalCategorias: categorias.length,
      totalProductos: productosResponse.total ?? productos.length,
      totalIngredientes: ingredientes.length,
      totalPedidos: pedidosResponse.total ?? pedidos.length,
      totalUsuarios: usuarios?.length ?? null,
      pedidosPorEstado,
      pedidosPorFormaPago,
      ordenesRecientes,
      productosStockBajo,
      ingredientesStockBajo,
      pedidosPorDia,
      topProductos,
      productosConCategoria,
      resumenStock,
    };
  },
};
