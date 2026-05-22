import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '../services/categories';
import { CategoriaModal } from '../components/CategoriaModal';
import { LoadingState, ErrorState, EmptyState } from '../../../shared/ui/States';
import { ImageWithFallback } from '../../../shared/ui/ImageWithFallback';
import type { Categoria } from '../types/categoria';
import { useAuthStore } from '../../../store/useAuthStore';

const CategoriaCard: React.FC<{
  categoria: Categoria;
  subcategorias: Categoria[];
  isAdmin: boolean;
  onEdit: (c: Categoria) => void;
  onDelete: (id: number) => void;
}> = ({ categoria, subcategorias, isAdmin, onEdit, onDelete }) => {
  const hasImage = !!categoria.imagen_url;

  return (
    <div className="group bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md">
      {/* Image area */}
      <div className="relative h-32 overflow-hidden bg-surface-container">
        {hasImage ? (
          <ImageWithFallback
            src={categoria.imagen_url}
            alt={categoria.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            fallbackClassName="w-full h-full bg-surface-container flex items-center justify-center"
            showFallbackText={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-container to-surface-container-high">
            <span className="material-symbols-outlined text-on-surface-variant opacity-30" style={{ fontSize: 56, fontVariationSettings: "'FILL' 1" }}>
              category
            </span>
          </div>
        )}
        {/* Gradient overlay + name */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-4 flex items-center gap-2 text-white">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            {categoria.parent_id ? 'subdirectory_arrow_right' : 'folder'}
          </span>
          <span className="text-title-md font-semibold leading-tight">{categoria.nombre}</span>
        </div>
        {/* Root badge */}
        {!categoria.parent_id && (
          <div className="absolute top-2 right-2">
            <span className="status-badge bg-white/20 text-white backdrop-blur-sm border-white/20" style={{ fontSize: 10 }}>
              Raíz
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Stats row */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <span className="text-label-caps text-on-surface-variant">SUBCATEGORÍAS</span>
            <span className="text-title-md font-semibold text-on-surface">{subcategorias.length} items</span>
          </div>
          {categoria.descripcion && (
            <p className="text-body-sm text-on-surface-variant line-clamp-1 max-w-[120px] text-right opacity-70">
              {categoria.descripcion}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-outline-variant pt-4">
          {isAdmin ? (
            <>
              <button
                onClick={() => onEdit(categoria)}
                className="flex-1 py-2 text-on-surface-variant bg-surface-container hover:bg-surface-container-high rounded-lg text-body-sm transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                Editar
              </button>
              <button
                onClick={() => onDelete(categoria.id!)}
                className="w-10 h-10 flex items-center justify-center text-error bg-error-container/20 hover:bg-error-container/40 rounded-lg transition-colors"
                title="Eliminar"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
              </button>
            </>
          ) : (
            <span className="text-label-caps text-on-surface-variant/40 py-2">Solo lectura</span>
          )}
        </div>
      </div>
    </div>
  );
};

export const CategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { hasRole } = useAuthStore();
  const isAdmin = hasRole('ADMIN');

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Categoria | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
  });

  const saveMutation = useMutation({
    mutationFn: (d: Partial<Categoria>) =>
      selected?.id ? categoriesService.update(selected.id, d) : categoriesService.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); handleClose(); },
    onError: (e) => alert('Error: ' + (e instanceof Error ? e.message : 'desconocido')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    onError: (e) => alert('Error al borrar: ' + (e instanceof Error ? e.message : 'desconocido')),
  });

  const handleOpen  = (c?: Categoria) => { if (!isAdmin) return; setSelected(c || null); setModalOpen(true); };
  const handleClose = () => { setModalOpen(false); setSelected(null); };
  const handleDelete = (id: number) => {
    if (!isAdmin) return;
    if (window.confirm('¿Eliminar esta categoría?')) deleteMutation.mutate(id);
  };

  const roots = data?.filter((c) => !c.parent_id) ?? [];
  const subs  = data?.filter((c) => !!c.parent_id) ?? [];

  const getSubcategorias = (parentId: number) =>
    (data ?? []).filter((c) => c.parent_id === parentId);

  return (
    <div className="flex flex-col gap-lg animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Gestión de Categorías</h2>
          <p className="text-body-lg text-on-surface-variant">
            Organiza y administra las agrupaciones de productos del menú.
          </p>
        </div>
        <div className="flex items-center gap-gutter">
          {/* View toggle */}
          <div className="flex border border-outline-variant rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
              title="Vista grilla"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
              title="Vista lista"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>list</span>
            </button>
          </div>

          {isAdmin && (
            <button onClick={() => handleOpen()} className="btn-primary">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_circle</span>
              Añadir Categoría
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-gutter">
        <div className="kpi-card">
          <span className="material-symbols-outlined text-primary mb-xs">category</span>
          <span className="text-label-caps text-on-surface-variant">Total Categorías</span>
          <span className="text-headline-lg font-bold text-on-surface">{data?.length ?? 0}</span>
        </div>
        <div className="kpi-card">
          <span className="material-symbols-outlined text-secondary mb-xs">folder</span>
          <span className="text-label-caps text-on-surface-variant">Categorías Raíz</span>
          <span className="text-headline-lg font-bold text-on-surface">{roots.length}</span>
        </div>
        <div className="kpi-card">
          <span className="material-symbols-outlined text-tertiary mb-xs">subdirectory_arrow_right</span>
          <span className="text-label-caps text-on-surface-variant">Subcategorías</span>
          <span className="text-headline-lg font-bold text-on-surface">{subs.length}</span>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState message="No hay categorías creadas aún." />
      ) : viewMode === 'grid' ? (
        <div className="space-y-lg">
          {/* Root categories */}
          {roots.length > 0 && (
            <section>
              <h3 className="text-title-md font-semibold text-on-surface mb-gutter flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>folder_open</span>
                Categorías Principales
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
                {roots.map((cat) => (
                  <CategoriaCard
                    key={cat.id}
                    categoria={cat}
                    subcategorias={getSubcategorias(cat.id!)}
                    isAdmin={isAdmin}
                    onEdit={handleOpen}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Subcategories */}
          {subs.length > 0 && (
            <section>
              <h3 className="text-title-md font-semibold text-on-surface mb-gutter flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 20 }}>subdirectory_arrow_right</span>
                Subcategorías
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
                {subs.map((cat) => (
                  <CategoriaCard
                    key={cat.id}
                    categoria={cat}
                    subcategorias={getSubcategorias(cat.id!)}
                    isAdmin={isAdmin}
                    onEdit={handleOpen}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* List view: tabla compacta */
        <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-outline-variant">
              <tr>
                <th className="table-th">Nombre</th>
                <th className="table-th">Tipo</th>
                <th className="table-th">Descripción</th>
                <th className="table-th text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {data.map((cat) => (
                <tr key={cat.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-outline-variant flex-shrink-0">
                        <ImageWithFallback
                          src={cat.imagen_url}
                          alt={cat.nombre}
                          className="w-full h-full object-cover"
                          fallbackClassName="w-full h-full bg-surface-container flex items-center justify-center"
                          showFallbackText={false}
                        />
                      </div>
                      <p className="text-body-sm font-semibold text-on-surface">{cat.nombre}</p>
                    </div>
                  </td>
                  <td className="table-td">
                    {cat.parent_id
                      ? <span className="status-badge bg-secondary-container text-on-secondary-container">Subcategoría</span>
                      : <span className="status-badge bg-surface-container text-on-surface-variant">Raíz</span>}
                  </td>
                  <td className="table-td">
                    <span className="text-body-sm text-on-surface-variant line-clamp-1">{cat.descripcion || '—'}</span>
                  </td>
                  <td className="table-td text-right">
                    <div className={`flex justify-end gap-1 ${isAdmin ? 'opacity-0 group-hover:opacity-100' : ''} transition-opacity`}>
                      {isAdmin ? (
                        <>
                          <button onClick={() => handleOpen(cat)} className="btn-icon hover:bg-surface-container-high text-secondary">
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>edit</span>
                          </button>
                          <button onClick={() => handleDelete(cat.id!)} className="btn-icon hover:bg-error-container/30 text-error">
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-label-caps text-on-surface-variant/40">Solo lectura</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-surface-container-low px-md py-sm border-t border-outline-variant">
            <p className="text-body-sm text-on-surface-variant">
              Mostrando <span className="font-bold">{data.length}</span> categorías
            </p>
          </div>
        </div>
      )}

      {isAdmin && (
        <CategoriaModal
          isOpen={modalOpen}
          onClose={handleClose}
          categoriaSelected={selected}
          categorias={data || []}
          onSave={(v) => saveMutation.mutate(v)}
          isLoading={saveMutation.isPending}
        />
      )}
    </div>
  );
};
