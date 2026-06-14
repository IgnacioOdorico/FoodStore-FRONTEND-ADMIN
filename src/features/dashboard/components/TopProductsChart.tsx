import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TopProducto } from '../services/dashboard';

interface Props {
  data: TopProducto[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload as TopProducto;
  return (
    <div className="bg-white rounded-xl border border-outline-variant shadow-card p-3">
      <p className="text-body-sm font-bold text-on-surface mb-1">{label}</p>
      <p className="text-body-sm text-primary">
        {payload[0].value} vendido{payload[0].value !== 1 ? 's' : ''}
      </p>
      <p className="text-body-sm text-tertiary">
        ${item.ingresos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
};

const CHART_COLORS = ['#b22300', '#da3711', '#565e74', '#006192', '#8b1900', '#3f465c', '#004b72', '#5c403a', '#b22300', '#565e74'];

export const TopProductsChart: React.FC<Props> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-body-sm text-on-surface-variant italic">
        Sin ventas registradas
      </div>
    );
  }

  // Limitar a 8 items para legibilidad
  const chartData = data.slice(0, 8);
  // Revertir para que el más vendido quede arriba en la barra horizontal
  const sortedData = [...chartData].reverse();

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 4, left: 100 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5beb5"
            opacity={0.3}
            horizontal={false}
          />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#5c403a' }} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="nombre"
            tick={{ fontSize: 12, fill: '#281814', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            width={95}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="cantidad"
            radius={[0, 6, 6, 0]}
            barSize={20}
          >
            {sortedData.map((_, index) => (
              <rect key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
