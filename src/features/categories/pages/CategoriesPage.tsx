import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '../services/categories';
import { CategoriaTable } from '../components/CategoriaTable';
import { CategoriaModal } from '../components/CategoriaModal';
import { LoadingState, ErrorState, EmptyState } from '../../../shared/ui/States';
import type { Categoria } from '../types/categoria';
import { useAuthStore } from '../../../store/useAuthStore';

export const CategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { hasRole } = useAuthStore();
  const isAdmin = hasRole('ADMIN');

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected]   = useState<Categoria | null>(null);

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

  const roots = data?.filter((c) => !c.parent_id).length ?? 0;
  const subs  = (data?.length ?? 0) - roots;

  return (
    <div className="flex flex-col gap-lg animate-in fade-in duration-500">

      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Categories</h2>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {isAdmin ? 'Manage product categories and subcategories.' : 'Read-only view — staff role.'}
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => handleOpen()} className="btn-primary">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
            Add Category
          </button>
        )}
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-gutter">
        <div className="kpi-card">
          <span className="material-symbols-outlined text-primary mb-xs">category</span>
          <span className="text-label-caps text-on-surface-variant">Total Categories</span>
          <span className="text-headline-lg font-bold text-on-surface">{data?.length ?? 0}</span>
        </div>
        <div className="kpi-card">
          <span className="material-symbols-outlined text-secondary mb-xs">folder</span>
          <span className="text-label-caps text-on-surface-variant">Root Categories</span>
          <span className="text-headline-lg font-bold text-on-surface">{roots}</span>
        </div>
        <div className="kpi-card">
          <span className="material-symbols-outlined text-tertiary mb-xs">subdirectory_arrow_right</span>
          <span className="text-label-caps text-on-surface-variant">Subcategories</span>
          <span className="text-headline-lg font-bold text-on-surface">{subs}</span>
        </div>
      </div>

      {/* Table */}
      {isLoading ? <LoadingState />
        : isError ? <ErrorState onRetry={() => refetch()} />
        : data && data.length > 0
          ? <CategoriaTable data={data} onEdit={isAdmin ? handleOpen : undefined} onDelete={isAdmin ? handleDelete : undefined} />
          : <EmptyState message="No categories created yet." />}

      {isAdmin && (
        <CategoriaModal
          isOpen={modalOpen} onClose={handleClose} categoriaSelected={selected}
          categorias={data || []} onSave={(v) => saveMutation.mutate(v)} isLoading={saveMutation.isPending}
        />
      )}
    </div>
  );
};
