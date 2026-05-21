import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ingredientsService } from '../services/ingredients';
import { IngredientTable } from '../components/IngredientTable';
import { IngredientModal } from '../components/IngredientModal';
import { LoadingState, ErrorState, EmptyState } from '../../../shared/ui/States';
import type { Ingrediente } from '../types/ingrediente';
import { useAuthStore } from '../../../store/useAuthStore';

export const IngredientsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { hasRole } = useAuthStore();
  const isAdmin = hasRole('ADMIN');

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected]   = useState<Ingrediente | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['ingredients'],
    queryFn: ingredientsService.getAll,
  });

  const saveMutation = useMutation({
    mutationFn: (d: Partial<Ingrediente>) =>
      selected?.id ? ingredientsService.update(selected.id, d) : ingredientsService.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ingredients'] }); handleClose(); },
    onError: (e) => alert('Error: ' + (e instanceof Error ? e.message : 'desconocido')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ingredientsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredients'] }),
  });

  const handleOpen  = (i?: Ingrediente) => { if (!isAdmin) return; setSelected(i || null); setModalOpen(true); };
  const handleClose = () => { setModalOpen(false); setSelected(null); };
  const handleDelete = (id: number) => {
    if (!isAdmin) return;
    if (window.confirm('¿Eliminar este ingrediente?')) deleteMutation.mutate(id);
  };

  const total    = data?.length ?? 0;
  const alergenos = data?.filter((i) => i.es_alergeno).length ?? 0;

  return (
    <div className="flex flex-col gap-lg animate-in fade-in duration-500">

      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Ingredients</h2>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {isAdmin ? 'Manage raw materials and allergen flags.' : 'Read-only view — staff role.'}
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => handleOpen()} className="btn-primary">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
            Add Ingredient
          </button>
        )}
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-gutter">
        <div className="kpi-card">
          <span className="material-symbols-outlined text-primary mb-xs">egg_alt</span>
          <span className="text-label-caps text-on-surface-variant">Total Ingredients</span>
          <span className="text-headline-lg font-bold text-on-surface">{total}</span>
        </div>
        <div className="kpi-card">
          <span className="material-symbols-outlined text-error mb-xs">warning</span>
          <span className="text-label-caps text-on-surface-variant">Allergens</span>
          <span className="text-headline-lg font-bold text-on-surface">{alergenos}</span>
        </div>
        <div className="kpi-card">
          <span className="material-symbols-outlined text-secondary mb-xs">check_circle</span>
          <span className="text-label-caps text-on-surface-variant">Safe Ingredients</span>
          <span className="text-headline-lg font-bold text-on-surface">{total - alergenos}</span>
        </div>
      </div>

      {/* Table */}
      {isLoading ? <LoadingState />
        : isError ? <ErrorState onRetry={() => refetch()} />
        : data && data.length > 0
          ? <IngredientTable data={data} onEdit={isAdmin ? handleOpen : undefined} onDelete={isAdmin ? handleDelete : undefined} />
          : <EmptyState message="No ingredients registered yet." />}

      {isAdmin && (
        <IngredientModal
          isOpen={modalOpen} onClose={handleClose} ingredientSelected={selected}
          onSave={(v) => saveMutation.mutate(v)} isLoading={saveMutation.isPending}
        />
      )}
    </div>
  );
};
