import React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { Producto } from '../types/producto';
import { ImageWithFallback } from '../../../shared/ui/ImageWithFallback';
import { useNavigate } from 'react-router-dom';

interface ProductTableProps {
  data: Producto[];
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onEdit?:   (producto: Producto) => void;
  onDelete?: (id: number) => void;
  onToggleDisponible?: (producto: Producto) => void;
}


const StockBadge: React.FC<{ qty?: number }> = ({ qty = 0 }) => {
  if (qty === 0)  return <span className="status-badge bg-[#fadcd5] text-on-surface-variant">Sin Stock</span>;
  if (qty < 5)    return <span className="status-badge bg-[#fde68a33] text-[#92400e]">Stock Bajo</span>;
  return               <span className="status-badge bg-[#bbf7d033] text-[#166534]">Con Stock</span>;
};

const StockBar: React.FC<{ qty?: number }> = ({ qty = 0 }) => {
  const pct = Math.min((qty / 100) * 100, 100);
  const color = qty === 0 ? '#d1d5db' : qty < 5 ? '#f59e0b' : '#b22300';
  return (
    <div className="flex flex-col gap-xs">
      <span className="text-body-sm text-on-surface">{qty} unidades</span>
      <div className="w-24 h-1.5 bg-outline-variant rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

const columnHelper = createColumnHelper<Producto>();

export const ProductTable: React.FC<ProductTableProps> = ({ data, page, totalPages, onPageChange, onEdit, onDelete, onToggleDisponible }) => {
  const navigate = useNavigate();
  const hasActions = !!(onEdit || onDelete || onToggleDisponible);

  const columns = [
    columnHelper.accessor('nombre', {
      header: 'Producto',
      cell: (info) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-outline-variant">
            <ImageWithFallback
              src={info.row.original.imagenes_url?.[0]}
              alt={info.getValue()}
              className="w-full h-full object-cover"
              fallbackClassName="w-full h-full bg-surface-container flex items-center justify-center"
              showFallbackText={false}
            />
          </div>
          <div>
            <p className="text-title-md font-semibold text-on-surface">{info.getValue()}</p>
            <p className="text-body-sm text-on-surface-variant opacity-60 line-clamp-1">
              {info.row.original.descripcion}
            </p>
          </div>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'category',
      header: 'Categoría',
      cell: (info) => (
        <div className="flex flex-wrap gap-1">
          {info.row.original.categorias?.map((c) => (
            <span key={c.id} className="text-label-caps px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant">
              {c.nombre}
            </span>
          )) ?? <span className="text-body-sm text-on-surface-variant opacity-40">—</span>}
        </div>
      ),
    }),
    columnHelper.accessor('precio_base', {
      header: 'Precio',
      cell: (info) => (
        <span className="text-title-md font-semibold text-primary">
          ${Number(info.getValue()).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </span>
      ),
    }),
    columnHelper.accessor('stock_cantidad', {
      header: 'Stock',
      cell: (info) => <StockBar qty={info.getValue()} />,
    }),
    columnHelper.accessor('disponible', {
      header: 'Estado',
      cell: (info) => <StockBadge qty={info.row.original.stock_cantidad} />,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Acciones',
      cell: (info) => (
        <div className={`flex justify-end gap-1 ${hasActions ? 'opacity-0 group-hover:opacity-100' : ''} transition-opacity`}>
          <button
            onClick={() => navigate(`/products/${info.row.original.id}`)}
            className="btn-icon hover:bg-surface-container-high text-on-surface-variant"
            title="Ver detalle"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>open_in_new</span>
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(info.row.original)}
              className="btn-icon hover:bg-surface-container-high text-secondary"
              title="Editar"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>edit</span>
            </button>
          )}
          {onToggleDisponible && (
            <button
              onClick={() => onToggleDisponible(info.row.original)}
              className="btn-icon hover:bg-surface-container-high"
              title={info.row.original.disponible ? 'Deshabilitar producto' : 'Habilitar producto'}
            >
              <span className={`material-symbols-outlined ${info.row.original.disponible ? 'text-error' : 'text-primary'}`} style={{ fontSize: 20 }}>
                {info.row.original.disponible ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(info.row.original.id!)}
              className="btn-icon hover:bg-error-container/30 text-error"
              title="Eliminar"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
            </button>
          )}
          {!hasActions && (
            <span className="text-label-caps text-on-surface-variant/40">Solo lectura</span>
          )}
        </div>
      ),
    }),
  ];

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="table-header">
            {table.getHeaderGroups()[0].headers.map((h) => (
              <th key={h.id} className="table-th">
                {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="group hover:bg-surface-container-lowest transition-colors">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="table-td">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Paginación */}
      {page && totalPages && onPageChange && totalPages > 1 && (
        <div className="bg-surface-container-low px-md py-sm border-t border-outline-variant flex items-center justify-between">
          <p className="text-body-sm text-on-surface-variant">
            Página <span className="font-bold">{page}</span> de {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="btn-icon hover:bg-surface-container-high text-on-surface-variant disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                  p === page
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="btn-icon hover:bg-surface-container-high text-on-surface-variant disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
