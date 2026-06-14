import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ESTADO_LABELS } from '../../orders/types/pedido';

interface Props {
  data: Record<string, number>;
}

interface PieItem {
  name: string;
  value: number;
  color: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDIENTE: '#ba1a1a',
  CONFIRMADO: '#565e74',
  EN_PREP: '#006192',
  ENTREGADO: '#5c403a',
  CANCELADO: '#e5beb5',
};

const STATUS_BG: Record<string, string> = {
  PENDIENTE: 'bg-error',
  CONFIRMADO: 'bg-secondary',
  EN_PREP: 'bg-tertiary',
  ENTREGADO: 'bg-[#5c403a]',
  CANCELADO: 'bg-outline-variant',
};

const formatCurrency = (value: number) =>
  `$${value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

const CustomTooltipContent = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload as PieItem;
  return (
    <div className="bg-white rounded-xl border border-outline-variant shadow-card p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2.5 h-2.5 rounded-full ${STATUS_BG[item.name] ?? 'bg-surface-variant'}`} />
        <span className="text-label-caps text-on-surface-variant">{item.name}</span>
      </div>
      <p className="text-body-sm font-bold text-on-surface">
        {item.value} pedido{item.value !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

const renderLegend = (props: any) => {
  const { payload } = props;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[11px] text-on-surface-variant font-medium">
            {entry.payload?.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export const OrdersPieChart: React.FC<Props> = ({ data }) => {
  const entries = Object.entries(data);
  const total = entries.reduce((acc, [, v]) => acc + v, 0);

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px] text-body-sm text-on-surface-variant italic">
        Sin pedidos registrados
      </div>
    );
  }

  // Ordenar por el orden del FSM
  const statusOrder = ['PENDIENTE', 'CONFIRMADO', 'EN_PREP', 'ENTREGADO', 'CANCELADO'];
  const pieData: PieItem[] = statusOrder
    .filter((key) => data[key] > 0)
    .map((key) => ({
      name: key,
      value: data[key],
      color: STATUS_COLORS[key] ?? '#e5beb5',
    }));

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-headline-lg font-bold text-on-surface">{total}</span>
        <span className="text-label-caps text-on-surface-variant">total</span>
      </div>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltipContent />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
