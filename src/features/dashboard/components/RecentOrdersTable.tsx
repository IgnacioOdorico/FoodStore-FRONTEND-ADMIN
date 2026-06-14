import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ESTADO_LABELS, ESTADO_COLORS } from '../../orders/types/pedido';
import type { Pedido } from '../../orders/types/pedido';

interface Props {
  orders: Pedido[];
}

const formatCurrency = (value: number) =>
  `$${value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffHours = (now.getTime() - d.getTime()) / 3_600_000;

  if (diffHours < 1) {
    const mins = Math.floor(diffHours * 60);
    return `hace ${mins} min${mins !== 1 ? '' : ''}`;
  }
  if (diffHours < 24) {
    const h = Math.floor(diffHours);
    return `hace ${h}h`;
  }
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const RecentOrdersTable: React.FC<Props> = ({ orders }) => {
  const navigate = useNavigate();

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-body-sm text-on-surface-variant italic">
        No hay órdenes recientes
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full">
        <thead>
          <tr className="table-header">
            <th className="table-th text-left">N°</th>
            <th className="table-th text-left">Cliente</th>
            <th className="table-th text-left hidden sm:table-cell">Fecha</th>
            <th className="table-th text-left">Estado</th>
            <th className="table-th text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="table-row cursor-pointer hover:bg-surface-container-lowest transition-colors"
              onClick={() => navigate('/orders')}
            >
              <td className="table-td font-bold text-primary">#{order.id}</td>
              <td className="table-td">
                <span className="text-on-surface font-medium">
                  {order.usuario_nombre ?? `Usuario #${order.usuario_id}`}
                </span>
              </td>
              <td className="table-td text-on-surface-variant hidden sm:table-cell">
                {formatDate(order.created_at)}
              </td>
              <td className="table-td">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    ESTADO_COLORS[order.estado_codigo] ?? 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {ESTADO_LABELS[order.estado_codigo] ?? order.estado_codigo}
                </span>
              </td>
              <td className="table-td text-right font-bold text-on-surface">
                {formatCurrency(order.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
