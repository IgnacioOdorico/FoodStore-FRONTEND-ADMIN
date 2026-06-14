import React from 'react';
import {
  LineChart,
  Line,
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-outline-variant shadow-card p-3">
      <p className="text-label-caps text-on-surface-variant mb-1">{label}</p>
      <p className="text-body-sm font-bold text-primary">
        {payload[0].value} pedido{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

export const SalesChart: React.FC<Props> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-body-sm text-on-surface-variant italic">
        Sin datos de pedidos para mostrar
      </div>
    );
  }

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5beb5" opacity={0.3} />
          <XAxis
            dataKey="fechaLabel"
            tick={{ fontSize: 11, fill: '#5c403a' }}
            tickLine={false}
            axisLine={{ stroke: '#e5beb5', opacity: 0.5 }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#5c403a' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="cantidad"
            stroke="#b22300"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#b22300', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#da3711', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
