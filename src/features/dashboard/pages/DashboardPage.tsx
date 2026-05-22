import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/useAuthStore';
import { dashboardService } from '../services/dashboard';
import { LoadingState, ErrorState } from '../../../shared/ui/States';
import { ESTADO_LABELS, ESTADO_COLORS } from '../../orders/types/pedido';
import { Package, ShoppingBag, UtensilsCrossed, ClipboardList, Users, Search } from 'lucide-react';

// ─── Iconos para cada sección ───────────────────────────────────────────────

const KpiCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
  onClick?: () => void;
}> = ({ icon, label, value, color, bgColor, onClick }) => (
  <button
    onClick={onClick}
    className={`kpi-card cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${onClick ? 'hover:shadow-md' : ''}`}
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor}`}>
      <div className={color}>{icon}</div>
    </div>
    <span className="text-label-caps text-on-surface-variant mt-2">{label}</span>
    <span className="text-headline-lg font-bold text-on-surface">{value}</span>
  </button>
);

// ─── Badge de estado de pedido ──────────────────────────────────────────────

const StatusBadge: React.FC<{ estado: string }> = ({ estado }) => {
  const colorClass = ESTADO_COLORS[estado as keyof typeof ESTADO_COLORS] ?? 'bg-surface-container text-on-surface-variant';
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${colorClass}`}>
      {ESTADO_LABELS[estado as keyof typeof ESTADO_LABELS] ?? estado}
    </span>
  );
};

// ─── Page principal ─────────────────────────────────────────────────────────

export const DashboardPage: React.FC = () => {
  const { user, hasRole } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = hasRole('ADMIN');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', { isAdmin }],
    queryFn: () => dashboardService.getAll(isAdmin),
    refetchInterval: 30_000, // refresca cada 30s
  });

  // ── Estado de carga ──────────────────────────────────────────────────────

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!data) return null;

  const statusKeys = Object.keys(data.pedidosPorEstado).sort();

  return (
    <div className="flex flex-col gap-lg pb-8">

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <header className="flex flex-col gap-1">
        <h1 className="text-headline-lg font-bold text-on-surface">
          Bienvenido, {user?.nombre}
        </h1>
        <p className="text-body-sm text-on-surface-variant">
          {isAdmin
            ? 'Tenés control total del sistema.'
            : 'Panel de monitoreo — vista de solo lectura.'}
        </p>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* KPI CARDS — 5 cards responsivos */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <h2 className="text-title-md font-semibold text-on-surface mb-gutter">
          Resumen del Sistema
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-gutter">
          <KpiCard
            icon={<ShoppingBag className="w-5 h-5" />}
            label="Productos"
            value={data.totalProductos}
            color="text-primary"
            bgColor="bg-primary/10"
            onClick={() => navigate('/products')}
          />
          <KpiCard
            icon={<Package className="w-5 h-5" />}
            label="Categorías"
            value={data.totalCategorias}
            color="text-secondary"
            bgColor="bg-secondary/10"
            onClick={() => navigate('/categories')}
          />
          <KpiCard
            icon={<UtensilsCrossed className="w-5 h-5" />}
            label="Ingredientes"
            value={data.totalIngredientes}
            color="text-tertiary"
            bgColor="bg-tertiary/10"
            onClick={() => navigate('/ingredients')}
          />
          <KpiCard
            icon={<ClipboardList className="w-5 h-5" />}
            label="Pedidos"
            value={data.totalPedidos}
            color="text-primary"
            bgColor="bg-primary/10"
            onClick={() => navigate('/orders')}
          />
          <KpiCard
            icon={<Users className="w-5 h-5" />}
            label="Usuarios"
            value={data.totalUsuarios !== null ? data.totalUsuarios : '—'}
            color="text-secondary"
            bgColor="bg-secondary/10"
            onClick={isAdmin ? () => navigate('/admin/users') : undefined}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ORDENES POR ESTADO + ORDENES RECIENTES en grid de 2 columnas */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">

        {/* ─── Pedidos por estado ─────────────────────────────────────── */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-card p-md">
          <h2 className="text-title-md font-semibold text-on-surface mb-gutter">
            Pedidos por Estado
          </h2>

          {statusKeys.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant italic">
              No hay pedidos registrados.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {statusKeys.map((estado) => {
                const count = data.pedidosPorEstado[estado];
                const total = data.totalPedidos;
                const porcentaje = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={estado} className="flex items-center gap-3">
                    <StatusBadge estado={estado} />
                    <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-primary"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                    <span className="text-body-sm font-bold text-on-surface min-w-[3ch] text-right">
                      {count}
                    </span>
                    <span className="text-label-caps text-on-surface-variant min-w-[4ch]">
                      {porcentaje}%
                    </span>
                  </div>
                );
              })}
              <p className="text-label-caps text-on-surface-variant mt-2 text-right">
                {data.totalPedidos} pedido{data.totalPedidos !== 1 ? 's' : ''} en total
              </p>
            </div>
          )}
        </section>

        {/* ─── Órdenes recientes ──────────────────────────────────────── */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-card p-md">
          <div className="flex justify-between items-center mb-gutter">
            <h2 className="text-title-md font-semibold text-on-surface">
              Órdenes Recientes
            </h2>
            {data.totalPedidos > 0 && (
              <button
                onClick={() => navigate('/orders')}
                className="text-label-caps text-primary font-bold hover:text-primary-container transition-colors"
              >
                Ver todas →
              </button>
            )}
          </div>

          {data.ordenesRecientes.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant italic">
              No hay órdenes registradas.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-outline-variant/50">
              {data.ordenesRecientes.map((orden) => (
                <div
                  key={orden.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-col">
                    <span className="text-body-sm font-semibold text-on-surface">
                      #{orden.id} — {orden.usuario_nombre ?? `Usuario #${orden.usuario_id}`}
                    </span>
                    <span className="text-label-caps text-on-surface-variant">
                      {new Date(orden.created_at).toLocaleDateString('es-AR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-body-sm font-bold text-on-surface">
                      ${orden.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                    <StatusBadge estado={orden.estado_actual} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PRODUCTOS CON STOCK BAJO */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {data.productosStockBajo.length > 0 && (
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-card p-md">
          <div className="flex justify-between items-center mb-gutter">
            <h2 className="text-title-md font-semibold text-on-surface">
              ⚠️ Productos con Stock Bajo
            </h2>
            <button
              onClick={() => navigate('/products')}
              className="text-label-caps text-primary font-bold hover:text-primary-container transition-colors"
            >
              Ver inventario →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {data.productosStockBajo.map((producto) => (
              <div
                key={producto.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-red-500/20 bg-red-500/5"
              >
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <Search className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-semibold text-on-surface truncate">
                    {producto.nombre}
                  </p>
                  <p className="text-label-caps text-red-500 font-bold">
                    {producto.stock_cantidad ?? 0} unidades
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FOOTER INFO */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {user && (
        <footer className="text-label-caps text-on-surface-variant text-center pt-4 border-t border-outline-variant/50">
          Conectado como <strong>{user.email}</strong> — Roles: {user.roles.join(', ')}
        </footer>
      )}
    </div>
  );
};
