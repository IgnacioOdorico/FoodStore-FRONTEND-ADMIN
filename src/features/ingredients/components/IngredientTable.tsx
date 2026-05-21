import React from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { Ingrediente } from '../types/ingrediente';

interface IngredientTableProps {
  data: Ingrediente[];
  onEdit?:   (ingrediente: Ingrediente) => void;
  onDelete?: (id: number) => void;
}

const columnHelper = createColumnHelper<Ingrediente>();

export const IngredientTable: React.FC<IngredientTableProps> = ({ data, onEdit, onDelete }) => {
  const isAdmin = !!(onEdit && onDelete);

  const columns = [
    columnHelper.accessor('nombre', {
      header: 'Ingredient',
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 border border-outline-variant">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>egg_alt</span>
          </div>
          <div>
            <p className="text-body-sm font-semibold text-on-surface">{info.getValue()}</p>
            {info.row.original.es_alergeno && (
              <span className="status-badge bg-[#ffdad6] text-[#93000a] mt-0.5" style={{ fontSize: 10 }}>
                Allergen
              </span>
            )}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('descripcion', {
      header: 'Description',
      cell: (info) => <span className="text-body-sm text-on-surface-variant line-clamp-1">{info.getValue() || '—'}</span>,
    }),
    columnHelper.accessor('es_alergeno', {
      header: 'Allergen',
      cell: (info) => info.getValue()
        ? <span className="status-badge bg-[#ffdad6] text-[#93000a]">Yes</span>
        : <span className="status-badge bg-[#bbf7d033] text-[#166534]">No</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className={`flex justify-end gap-1 ${isAdmin ? 'opacity-0 group-hover:opacity-100' : ''} transition-opacity`}>
          {isAdmin ? (
            <>
              <button onClick={() => onEdit!(info.row.original)}
                className="btn-icon hover:bg-surface-container-high text-secondary" title="Edit">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>edit</span>
              </button>
              <button onClick={() => onDelete!(info.row.original.id!)}
                className="btn-icon hover:bg-error-container/30 text-error" title="Delete">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
              </button>
            </>
          ) : (
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
              <th key={h.id} className="table-th">{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="group hover:bg-surface-container-lowest transition-colors">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="table-td">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="bg-surface-container-low px-md py-sm border-t border-outline-variant">
        <p className="text-body-sm text-on-surface-variant">Showing <span className="font-bold">{data.length}</span> ingredients</p>
      </div>
    </div>
  );
};
