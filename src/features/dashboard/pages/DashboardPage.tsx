import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/useAuthStore';
import { dashboardService } from '../services/dashboard';
import { LoadingState, ErrorState } from '../../../shared/ui/States';
import { ESTADO_LABELS, ESTADO_COLORS } from '../../orders/types/pedido';
import { SalesChart } from '../components/SalesChart';
import { RevenueChart } from '../components/RevenueChart';
import { TopProductsChart } from '../components/TopProductsChart';
import { OrdersPieChart } from '../components/OrdersPieChart';
import { RecentOrdersTable } from '../components/RecentOrdersTable';
import { StockAlertPanel } from '../components/StockAlertPanel';
import {
  Package,
  ShoppingBag,
  UtensilsCrossed,
  ClipboardList,
  Users,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

// ─── KPI Card ───────────────────────────────────────────────────────────────

const KpiCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
  subValue?: string;
  onClick?: () => void;
}> = ({ icon, label, value, color, bgColor, subValue, onClick }) => (
  <button
    onClick={onClick}
    className={`kpi-card cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${onClick ? 'hover:shadow-md' : ''}`}
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor}`}>
      <div className={color}>{icon}</div>
    </div>
    <span className="text-label-caps text-on-surface-variant mt-2">{label}</span>
    <span className="text-headline-lg font-bold text-on-surface">{value}</span>
    {subValue && (
      <span className="text-[10px] text-on-surface-variant -mt-1">{subValue}</span>
    )}
  </button>
);

// ─── Badge de estado ────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ estado: string }> = ({ estado }) => {
  const colorClass = ESTADO_COLORS[estado as keyof typeof ESTADO_COLORS] ?? 'bg-surface-container text-on-surface-variant';
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${colorClass}`}>
      {ESTADO_LABELS[estado as keyof typeof ESTADO_LABELS] ?? estado}
    </span>
  );
};

// ─── Section wrapper ────────────────────────────────────────────────────────

const SectionCard: React.FC<{
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, action, children }) => (
  <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-card p-md h-full flex flex-col">
    <div className="flex justify-between items-center mb-gutter">
      <h2 className="text-title-md font-semibold text-on-surface">{title}</h2>
      {action}
    </div>
    <div className="flex-1">{children}</div>
  </section>
);

// ─── Page principal ─────────────────────────────────────────────────────────

export const DashboardPage: React.FC = () => {
  const { user, hasRole } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = hasRole('ADMIN');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', { isAdmin }],
    queryFn: () => dashboardService.getAll(isAdmin),
    refetchInterval: 30_000,
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!data) return null;

  const totalStockAlerts = data.productosStockBajo.length + data.ingredientesStockBajo.length;
  const statusKeys = Object.keys(data.pedidosPorEstado).sort();

  return (
    <div className="flex flex-col gap-lg pb-8 animate-in fade-in duration-500">

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <header className="flex flex-col gap-1">
        <h1 className="text-headline-lg font-bold text-on-surface">
          Panel de Control
        </h1>
        <p className="text-body-sm text-on-surface-variant">
          Bienvenido, <strong>{user?.nombre}</strong> —
          {isAdmin
            ? ' tenés control total del sistema.'
            : ' vista de monitoreo.'}
          {' '}· Dashboard actualizado cada 30s
        </p>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* KPI CARDS — 6 cards */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-gutter">
          <KpiCard
            icon={<ShoppingBag className="w-5 h-5" />}
            label="Productos"
            value={data.totalProductos}
            color="text-primary"
            bgColor="bg-primary/10"
            subValue={data.resumenStock.sinStock > 0 ? `${data.resumenStock.sinStock} sin stock` : undefined}
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
            icon={<TrendingUp className="w-5 h-5" />}
            label="Top Producto"
            value={data.topProductos[0]?.nombre?.length > 15 ? data.topProductos[0]?.nombre?.slice(0, 15) + '…' : data.topProductos[0]?.nombre ?? '—'}
            color="text-tertiary"
            bgColor="bg-tertiary/10"
            subValue={data.topProductos[0] ? `${data.topProductos[0].cantidad} vendidos` : undefined}
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
      {/* GRÁFICOS: PEDIDOS EN EL TIEMPO + INGRESOS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="lg:col-span-2">
          <SectionCard title="Pedidos en el Tiempo">
            <SalesChart data={data.pedidosPorDia} />
          </SectionCard>
        </div>
        <div className="lg:col-span-1">
          <SectionCard title="Ingresos">
            <RevenueChart data={data.pedidosPorDia} />
          </SectionCard>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* GRÁFICOS: ESTADOS (DONUT) + TOP PRODUCTOS (BARRAS) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <SectionCard title="Distribución de Estados">
          <OrdersPieChart data={data.pedidosPorEstado} />
        </SectionCard>

        <SectionCard title="Productos Más Vendidos">
          <TopProductsChart data={data.topProductos} />
        </SectionCard>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ESTADOS + ÓRDENES RECIENTES */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* ─── Pedidos por estado (progress bars) ──────────────────────── */}
        <SectionCard title="Pedidos por Estado">
          {statusKeys.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant italic">No hay pedidos registrados.</p>
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
            </div>
          )}
        </SectionCard>

        {/* ─── Órdenes recientes ──────────────────────────────────────── */}
        <SectionCard
          title="Órdenes Recientes"
          action={
            data.totalPedidos > 0 && (
              <button
                onClick={() => navigate('/orders')}
                className="text-label-caps text-primary font-bold hover:text-primary-container transition-colors"
              >
                Ver todas →
              </button>
            )
          }
        >
          <RecentOrdersTable orders={data.ordenesRecientes} />
        </SectionCard>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ALERTAS DE STOCK BAJO */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {totalStockAlerts > 0 && (
        <SectionCard
          title={
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-error" />
              Alertas de Stock
            </span>
          }
        >
          <StockAlertPanel
            productos={data.productosStockBajo}
            ingredientes={data.ingredientesStockBajo}
            onViewAll={() => navigate('/products')}
          />
        </SectionCard>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {user && (
        <footer className="text-label-caps text-on-surface-variant text-center pt-4 border-t border-outline-variant/50">
          Conectado como <strong>{user.email}</strong> — Roles: {user.roles.join(' · ')}
        </footer>
      )}
    </div>
  );
};
