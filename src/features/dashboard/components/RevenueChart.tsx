import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { PedidoPorDia } from '../services/dashboard';

interface Props {
  data: PedidoPorDia[];
}

const formatCurrency = (value: number) =>
  `$${value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-outline-variant shadow-card p-3">
      <p className="text-label-caps text-on-surface-variant mb-1">{label}</p>
      <p className="text-body-sm font-bold text-tertiary">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
};

export const RevenueChart: React.FC<Props> = ({ data }) => {
  const total = data.reduce((acc, d) => acc + Number(d.ingresos), 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-body-sm text-on-surface-variant italic">
        Sin ingresos registrados
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-headline-lg font-bold text-on-surface">
          {formatCurrency(total)}
        </span>
        <span className="text-label-caps text-on-surface-variant">total</span>
      </div>
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 10 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#006192" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#006192" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5beb5" opacity={0.3} />
            <XAxis
              dataKey="fechaLabel"
              tick={{ fontSize: 11, fill: '#5c403a' }}
              tickLine={false}
              axisLine={{ stroke: '#e5beb5', opacity: 0.5 }}
            />
            <YAxis
              width={65}
              tick={{ fontSize: 11, fill: '#5c403a' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${Math.round(v).toLocaleString('es-AR')}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="ingresos"
              stroke="#006192"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={{ r: 2, fill: '#006192', strokeWidth: 0 }}
              activeDot={{ r: 4, fill: '#007bb8', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
