import React from 'react';
import { useQueries } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/useAuthStore';
import { dashboardService } from '../services/dashboard';
import { LoadingState, ErrorState } from '../../../shared/ui/States';
import { ESTADO_LABELS, ESTADO_COLORS } from '../../orders/types/pedido';
import { SalesChart } from '../components/SalesChart';
import { RevenueChart } from '../components/RevenueChart';
import { TopProductsChart } from '../components/TopProductsChart';
import { OrdersPieChart } from '../components/OrdersPieChart';
import {
  TrendingUp,
  DollarSign,
  Activity,
  Calendar,
} from 'lucide-react';

const KpiCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
}> = ({ icon, label, value, color, bgColor }) => (
  <div className="kpi-card transition-all duration-200">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor}`}>
      <div className={color}>{icon}</div>
    </div>
    <span className="text-label-caps text-on-surface-variant mt-2">{label}</span>
    <span className="text-headline-lg font-bold text-on-surface">{value}</span>
  </div>
);

const StatusBadge: React.FC<{ estado: string }> = ({ estado }) => {
  const colorClass = ESTADO_COLORS[estado as keyof typeof ESTADO_COLORS] ?? 'bg-surface-container text-on-surface-variant';
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${colorClass}`}>
      {ESTADO_LABELS[estado as keyof typeof ESTADO_LABELS] ?? estado}
    </span>
  );
};

const SectionCard: React.FC<{
  title: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}> = ({ title, children, headerAction }) => (
  <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-card p-md h-full flex flex-col">
    <div className="flex justify-between items-center mb-gutter">
      <h2 className="text-title-md font-semibold text-on-surface">{title}</h2>
      {headerAction && <div>{headerAction}</div>}
    </div>
    <div className="flex-1">{children}</div>
  </section>
);

const formatCurrency = (value: number) =>
  `$${value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [agrupacion, setAgrupacion] = React.useState<string>('dia');

  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const desdeStr = thirtyDaysAgo.toISOString().split('T')[0];
  const hastaStr = today.toISOString().split('T')[0];

  const results = useQueries({
    queries: [
      { queryKey: ['dashboard-resumen'], queryFn: dashboardService.getResumen, refetchInterval: 30000 },
      { queryKey: ['dashboard-ventas', desdeStr, hastaStr, agrupacion], queryFn: () => dashboardService.getVentas(desdeStr, hastaStr, agrupacion), refetchInterval: 30000 },
      { queryKey: ['dashboard-productos-top'], queryFn: () => dashboardService.getProductosTop(10), refetchInterval: 30000 },
      { queryKey: ['dashboard-pedidos-estado'], queryFn: dashboardService.getPedidosPorEstado, refetchInterval: 30000 },
    ],
  });

  const isLoading = results.some((q) => q.isLoading);
  const isError = results.some((q) => q.isError);

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => results.forEach(q => q.refetch())} />;
  
  if (results.some((q) => !q.data)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <LoadingState />
        <p className="text-on-surface-variant text-sm">Esperando que carguen todos los datos...</p>
      </div>
    );
  }

  const [resumenQuery, ventasQuery, topQuery, estadosQuery] = results;
  const resumen = resumenQuery.data!;
  const ventas = ventasQuery.data?.items || [];
  const topProductos = topQuery.data?.items || [];
  const pedidosEstado = estadosQuery.data?.items || {};

  const statusKeys = Object.keys(pedidosEstado).sort();
  const totalPedidosEstado = Object.values(pedidosEstado).reduce((a: any, b: any) => a + b, 0);

  const mappedVentas = ventas.map(v => ({
    ...v,
    fechaLabel: v.fecha ? v.fecha.split('-').reverse().slice(0, 2).join('/') : '?'
  }));

  return (
    <div className="flex flex-col gap-lg pb-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-1">
        <h1 className="text-headline-lg font-bold text-on-surface">Panel de Control</h1>
        <p className="text-body-sm text-on-surface-variant">
          Bienvenido, <strong>{user?.nombre}</strong> — Vista de monitoreo administrativo. · Actualizado cada 30s
        </p>
      </header>

      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          <KpiCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Ventas de Hoy"
            value={formatCurrency(resumen.ventas_hoy)}
            color="text-primary"
            bgColor="bg-primary/10"
          />
          <KpiCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Ticket Promedio"
            value={formatCurrency(resumen.ticket_promedio)}
            color="text-secondary"
            bgColor="bg-secondary/10"
          />
          <KpiCard
            icon={<Activity className="w-5 h-5" />}
            label="Pedidos Activos"
            value={resumen.pedidos_activos}
            color="text-tertiary"
            bgColor="bg-tertiary/10"
          />
          <KpiCard
            icon={<Calendar className="w-5 h-5" />}
            label="Mes Actual"
            value={formatCurrency(resumen.mes_actual)}
            color="text-primary"
            bgColor="bg-primary/10"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="lg:col-span-2">
          <SectionCard 
            title="Pedidos en el Tiempo"
            headerAction={
              <select 
                value={agrupacion} 
                onChange={(e) => setAgrupacion(e.target.value)}
                className="bg-surface-container text-body-sm text-on-surface px-3 py-1.5 rounded-lg border border-outline focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
              >
                <option value="dia">Diario</option>
                <option value="semana">Semanal</option>
                <option value="mes">Mensual</option>
              </select>
            }
          >
            <SalesChart data={mappedVentas as any} />
          </SectionCard>
        </div>
        <div className="lg:col-span-1">
          <SectionCard title="Ingresos">
            <RevenueChart data={mappedVentas as any} />
          </SectionCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <SectionCard title="Distribución de Estados">
          <OrdersPieChart data={pedidosEstado} />
        </SectionCard>
        <SectionCard title="Productos Más Vendidos">
          <TopProductsChart data={topProductos as any} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <SectionCard title="Pedidos por Estado">
          {statusKeys.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant italic">No hay pedidos registrados.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {statusKeys.map((estado) => {
                const count = pedidosEstado[estado];
                const porcentaje = totalPedidosEstado > 0 ? Math.round((count / totalPedidosEstado) * 100) : 0;
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
      </div>

      {user && (
        <footer className="text-label-caps text-on-surface-variant text-center pt-4 border-t border-outline-variant/50">
          Conectado como <strong>{user.email}</strong> — Roles: {user.roles.join(' · ')}
        </footer>
      )}
    </div>
  );
};
