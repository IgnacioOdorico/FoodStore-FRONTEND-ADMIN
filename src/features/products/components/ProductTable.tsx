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
  onEdit?:   (producto: Producto) => void;
  onDelete?: (id: number) => void;
}


const StockBadge: React.FC<{ qty?: number }> = ({ qty = 0 }) => {
  if (qty === 0)  return <span className="status-badge bg-[#fadcd5] text-on-surface-variant">Out of Stock</span>;
  if (qty < 5)    return <span className="status-badge bg-[#fde68a33] text-[#92400e]">Low Stock</span>;
  return               <span className="status-badge bg-[#bbf7d033] text-[#166534]">In Stock</span>;
};

const StockBar: React.FC<{ qty?: number }> = ({ qty = 0 }) => {
  const pct = Math.min((qty / 100) * 100, 100);
  const color = qty === 0 ? '#d1d5db' : qty < 5 ? '#f59e0b' : '#b22300';
  return (
    <div className="flex flex-col gap-xs">
      <span className="text-body-sm text-on-surface">{qty} units</span>
      <div className="w-24 h-1.5 bg-outline-variant rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

const columnHelper = createColumnHelper<Producto>();

export const ProductTable: React.FC<ProductTableProps> = ({ data, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const isAdmin  = !!(onEdit && onDelete);

  const columns = [
    columnHelper.accessor('nombre', {
      header: 'Product',
      cell: (info) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-outline-variant">
            <ImageWithFallback
              src={info.row.original.imagen_url}
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
      header: 'Category',
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
      header: 'Price',
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
      header: 'Status',
      cell: (info) => <StockBadge qty={info.row.original.stock_cantidad} />,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className={`flex justify-end gap-1 ${isAdmin ? 'opacity-0 group-hover:opacity-100' : ''} transition-opacity`}>
          <button
            onClick={() => navigate(`/products/${info.row.original.id}`)}
            className="btn-icon hover:bg-surface-container-high text-on-surface-variant"
            title="View detail"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>open_in_new</span>
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => onEdit!(info.row.original)}
                className="btn-icon hover:bg-surface-container-high text-secondary"
                title="Edit"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>edit</span>
              </button>
              <button
                onClick={() => onDelete!(info.row.original.id!)}
                className="btn-icon hover:bg-error-container/30 text-error"
                title="Delete"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
              </button>
            </>
          )}
          {!isAdmin && (
            <span className="text-label-caps text-on-surface-variant/40">Read-only</span>
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
      {/* Pagination placeholder */}
      <div className="bg-surface-container-low px-md py-sm border-t border-outline-variant flex items-center justify-between">
        <p className="text-body-sm text-on-surface-variant">
          Showing <span className="font-bold">{data.length}</span> products
        </p>
      </div>
    </div>
  );
};
