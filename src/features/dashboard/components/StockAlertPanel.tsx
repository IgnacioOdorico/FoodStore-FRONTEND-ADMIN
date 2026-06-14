import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Egg } from 'lucide-react';
import type { Producto } from '../../products/types/producto';
import type { Ingrediente } from '../../ingredients/types/ingrediente';

interface Props {
  productos: Producto[];
  ingredientes: Ingrediente[];
  onViewAll: () => void;
}

export const StockAlertPanel: React.FC<Props> = ({ productos, ingredientes, onViewAll }) => {
  const navigate = useNavigate();
  const totalAlerts = productos.length + ingredientes.length;

  if (totalAlerts === 0) {
    return (
      <div className="flex items-center justify-center h-[120px] text-body-sm text-on-surface-variant italic">
        Todo en orden — no hay faltantes de stock
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Contador */}
      <div className="flex items-center justify-between">
        <p className="text-body-sm text-on-surface-variant">
          <strong className="text-error">{totalAlerts}</strong> alerta{totalAlerts !== 1 ? 's' : ''} activa{totalAlerts !== 1 ? 's' : ''}
        </p>
        <button
          onClick={onViewAll}
          className="text-label-caps text-primary font-bold hover:text-primary-container transition-colors"
        >
          Ver inventario →
        </button>
      </div>

      {/* Lista */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
        {/* Productos con stock bajo */}
        {productos.map((p) => (
          <div
            key={`prod-${p.id}`}
            className="flex items-center gap-3 p-3 rounded-lg border border-red-500/20 bg-red-500/5 cursor-pointer hover:bg-red-500/10 transition-colors"
            onClick={() => navigate('/products')}
          >
            <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-semibold text-on-surface truncate">{p.nombre}</p>
              <p className="text-label-caps text-red-500 font-bold">
                {p.stock_cantidad ?? 0} unidad{p.stock_cantidad !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>
        ))}

        {/* Ingredientes con stock bajo */}
        {ingredientes.map((i) => (
          <div
            key={`ing-${i.id}`}
            className="flex items-center gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 cursor-pointer hover:bg-amber-500/10 transition-colors"
            onClick={() => navigate('/ingredients')}
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Egg className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-semibold text-on-surface truncate">{i.nombre}</p>
              <p className="text-label-caps text-amber-600 font-bold">
                {i.stock_cantidad ?? 0} unidad{i.stock_cantidad !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
