import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ingredientsService } from '../services/ingredients';
import { IngredientModal } from '../components/IngredientModal';
import { LoadingState, ErrorState, EmptyState } from '../../../shared/ui/States';
import type { Ingrediente } from '../types/ingrediente';
import { useAuthStore } from '../../../store/useAuthStore';

export const IngredientsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { hasRole } = useAuthStore();
  const isAdmin = hasRole('ADMIN');

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Ingrediente | null>(null);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['ingredients'],
    queryFn: ingredientsService.getAll,
  });

  const saveMutation = useMutation({
    mutationFn: (d: Partial<Ingrediente>) =>
      selected?.id ? ingredientsService.update(selected.id, d) : ingredientsService.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      handleClose();
    },
    onError: (e) => alert('Error: ' + (e instanceof Error ? e.message : 'desconocido')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ingredientsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredients'] }),
    onError: (e) => alert('Error al borrar: ' + (e instanceof Error ? e.message : 'desconocido')),
  });

  const handleOpen  = (i?: Ingrediente) => { if (!isAdmin) return; setSelected(i || null); setModalOpen(true); };
  const handleClose = () => { setModalOpen(false); setSelected(null); };
  const handleDelete = (id: number) => {
    if (!isAdmin) return;
    if (window.confirm('¿Eliminar este ingrediente?')) deleteMutation.mutate(id);
  };

  const total     = data?.length ?? 0;
  const alergenos = data?.filter((i) => i.es_alergeno).length ?? 0;
  const seguros   = total - alergenos;

  const filtered = search.trim()
    ? (data ?? []).filter((i) => i.nombre.toLowerCase().includes(search.toLowerCase()))
    : (data ?? []);

  return (
    <div className="flex flex-col gap-lg animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Gestión de Ingredientes</h2>
          <p className="text-body-lg text-on-surface-variant">
            {isAdmin ? 'Control centralizado de suministros y alérgenos.' : 'Vista de solo lectura — rol empleado.'}
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => handleOpen()} className="btn-primary">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_circle</span>
            Añadir Ingrediente
          </button>
        )}
      </div>

      {/* Bento Grid: alert + KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        {/* Alert card */}
        <div className="md:col-span-2 bg-error-container p-md rounded-xl flex items-center gap-md border border-error/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined" style={{ fontSize: 80 }}>warning</span>
          </div>
          <div className="w-12 h-12 bg-error rounded-full flex items-center justify-center text-on-error flex-shrink-0">
            <span className="material-symbols-outlined">priority_high</span>
          </div>
          <div>
            <h3 className="text-title-md text-on-error-container font-semibold">Ingredientes Alérgenos</h3>
            <p className="text-body-sm text-on-error-container/80">
              {alergenos === 0
                ? 'No hay alérgenos registrados en el inventario.'
                : `${alergenos} ingrediente${alergenos !== 1 ? 's' : ''} marcado${alergenos !== 1 ? 's' : ''} como alérgeno. Revisá el etiquetado.`}
            </p>
          </div>
        </div>

        {/* KPI: Total */}
        <div className="kpi-card">
          <span className="material-symbols-outlined text-primary mb-xs">egg_alt</span>
          <span className="text-label-caps text-on-surface-variant">Total Ingredientes</span>
          <span className="text-headline-lg font-bold text-on-surface">{total}</span>
        </div>

        {/* KPI: Safe */}
        <div className="kpi-card">
          <span className="material-symbols-outlined text-tertiary mb-xs">check_circle</span>
          <span className="text-label-caps text-on-surface-variant">Sin Alérgenos</span>
          <span className="text-headline-lg font-bold text-on-surface">{seguros}</span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-md border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest">
          <h3 className="text-title-md font-semibold">Inventario Detallado</h3>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: 18 }}>
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar ingrediente..."
              className="input-field pl-9 py-2 text-body-sm w-52"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-lg"><LoadingState /></div>
        ) : isError ? (
          <div className="p-lg"><ErrorState onRetry={() => refetch()} /></div>
        ) : filtered.length === 0 ? (
          <div className="p-lg"><EmptyState message="No hay ingredientes registrados." /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-outline-variant">
                  <tr>
                    <th className="table-th">Nombre del Ingrediente</th>
                    <th className="table-th">Descripción</th>
                    <th className="table-th">Alérgeno</th>
                    <th className="table-th text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filtered.map((ing) => (
                    <tr key={ing.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 border border-outline-variant">
                            <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>egg_alt</span>
                          </div>
                          <div>
                            <p className="text-body-sm font-semibold text-on-surface">{ing.nombre}</p>
                            {ing.es_alergeno && (
                              <span className="status-badge bg-error-container text-on-error-container mt-0.5" style={{ fontSize: 10 }}>
                                Alérgeno
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="table-td">
                        <span className="text-body-sm text-on-surface-variant line-clamp-1">{ing.descripcion || '—'}</span>
                      </td>
                      <td className="table-td">
                        {ing.es_alergeno
                          ? <span className="status-badge bg-error-container text-on-error-container">Sí</span>
                          : <span className="status-badge bg-[#bbf7d033] text-[#166534]">No</span>}
                      </td>
                      <td className="table-td text-right">
                        <div className={`flex items-center justify-end gap-1 ${isAdmin ? 'opacity-0 group-hover:opacity-100' : ''} transition-opacity`}>
                          {isAdmin ? (
                            <>
                              <button onClick={() => handleOpen(ing)} className="btn-icon hover:bg-surface-container-high text-secondary" title="Editar">
                                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>edit</span>
                              </button>
                              <button onClick={() => handleDelete(ing.id!)} className="btn-icon hover:bg-error-container/30 text-error" title="Eliminar">
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
            </div>
            <div className="bg-surface-container-low px-md py-sm border-t border-outline-variant">
              <p className="text-body-sm text-on-surface-variant">
                Mostrando <span className="font-bold">{filtered.length}</span> de {total} ingredientes
              </p>
            </div>
          </>
        )}
      </div>

      {isAdmin && (
        <IngredientModal
          isOpen={modalOpen}
          onClose={handleClose}
          ingredientSelected={selected}
          onSave={(v) => saveMutation.mutate(v)}
          isLoading={saveMutation.isPending}
        />
      )}
    </div>
  );
};
