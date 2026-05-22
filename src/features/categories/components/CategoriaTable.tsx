import React, { useMemo } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { Categoria } from '../types/categoria';
import { ImageWithFallback } from '../../../shared/ui/ImageWithFallback';

interface CategoriaTableProps {
  data: Categoria[];
  onEdit?:   (categoria: Categoria) => void;
  onDelete?: (id: number) => void;
}

const columnHelper = createColumnHelper<Categoria & { depth: number }>();

export const CategoriaTable: React.FC<CategoriaTableProps> = ({ data, onEdit, onDelete }) => {
  const isAdmin = !!(onEdit && onDelete);

  const flattenedData = useMemo(() => {
    const visited = new Set<number>();
    const flatten = (cats: Categoria[], parentId: number | null = null, depth = 0): (Categoria & { depth: number })[] => {
      if (depth > 10) return [];
      return cats
        .filter((c) => c.parent_id === parentId)
        .reduce((acc, cat) => {
          if (visited.has(cat.id!)) return acc;
          visited.add(cat.id!);
          return [...acc, { ...cat, depth }, ...flatten(cats, cat.id!, depth + 1)];
        }, [] as (Categoria & { depth: number })[]);
    };
    return flatten(data);
  }, [data]);

  const columns = [
    columnHelper.accessor('imagen_url', {
      header: 'Imagen',
      cell: (info) => (
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-outline-variant flex-shrink-0">
          <ImageWithFallback
            src={info.getValue()}
            alt="Categoría"
            className="w-full h-full object-cover"
            fallbackClassName="w-full h-full bg-surface-container flex items-center justify-center"
            showFallbackText={false}
          />
        </div>
      ),
    }),
    columnHelper.accessor('nombre', {
      header: 'Nombre',
      cell: (info) => {
        const depth = info.row.original.depth;
        return (
          <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 20}px` }}>
            {depth > 0 && <span className="text-on-surface-variant opacity-40">└─</span>}
            <p className="text-body-sm font-semibold text-on-surface">{info.getValue()}</p>
            {depth === 0 && (
              <span className="status-badge bg-surface-container text-on-surface-variant" style={{ fontSize: 10 }}>Raíz</span>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor('descripcion', {
      header: 'Descripción',
      cell: (info) => <span className="text-body-sm text-on-surface-variant line-clamp-1">{info.getValue() || '—'}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Acciones',
      cell: (info) => (
        <div className={`flex justify-end gap-1 ${isAdmin ? 'opacity-0 group-hover:opacity-100' : ''} transition-opacity`}>
          {isAdmin ? (
            <>
              <button onClick={() => onEdit!(info.row.original)}
                className="btn-icon hover:bg-surface-container-high text-secondary" title="Editar">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>edit</span>
              </button>
              <button onClick={() => onDelete!(info.row.original.id!)}
                className="btn-icon hover:bg-error-container/30 text-error" title="Eliminar">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
              </button>
            </>
          ) : (
            <span className="text-label-caps text-on-surface-variant/40">Solo lectura</span>
          )}
        </div>
      ),
    }),
  ];

  const table = useReactTable({ data: flattenedData, columns, getCoreRowModel: getCoreRowModel() });

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
        <p className="text-body-sm text-on-surface-variant">Mostrando <span className="font-bold">{flattenedData.length}</span> categorías</p>
      </div>
    </div>
  );
};
