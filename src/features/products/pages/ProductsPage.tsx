import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '../services/products';
import { ProductTable } from '../components/ProductTable';
import { ProductModal } from '../components/ProductModal';
import { LoadingState, ErrorState, EmptyState } from '../../../shared/ui/States';
import type { Producto } from '../types/producto';
import { categoriesService } from '../../categories/services/categories';
import { ingredientsService } from '../../ingredients/services/ingredients';
import { useAuthStore } from '../../../store/useAuthStore';

export const ProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { hasRole } = useAuthStore();
  const isAdmin = hasRole('ADMIN');
  const isStock = hasRole('STOCK');
  const canEdit = isAdmin || isStock;

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected]   = useState<Producto | null>(null);

  const { data: products, isLoading, isError, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: productsService.getAll,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
    enabled: isAdmin,
  });

  const { data: ingredients } = useQuery({
    queryKey: ['ingredients'],
    queryFn: ingredientsService.getAll,
    enabled: isAdmin,
  });

  const saveMutation = useMutation({
    mutationFn: (data: Partial<Producto>) =>
      selected?.id ? productsService.update(selected.id, data) : productsService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); handleClose(); },
    onError: (e) => alert('Error: ' + (e instanceof Error ? e.message : 'desconocido')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    onError: (e) => alert('Error al eliminar: ' + (e instanceof Error ? e.message : 'desconocido')),
  });

  const toggleDisponibleMutation = useMutation({
    mutationFn: ({ id, disponible }: { id: number; disponible: boolean }) =>
      productsService.patchDisponibilidad(id, disponible),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    onError: (e) => alert('Error al cambiar disponibilidad: ' + (e instanceof Error ? e.message : 'desconocido')),
  });

  const handleOpen  = (p?: Producto) => { if (!canEdit) return; setSelected(p || null); setModalOpen(true); };
  const handleClose = () => { setModalOpen(false); setSelected(null); };
  const handleDelete = (id: number) => {
    if (!isAdmin) return;
    if (window.confirm('¿Eliminar este producto?')) deleteMutation.mutate(id);
  };

  const safeProducts = products ?? [];
  const total      = safeProducts.length;
  const lowStock   = safeProducts.filter((p) => (p.stock_cantidad ?? 0) > 0 && (p.stock_cantidad ?? 0) < 5).length;
  const outOfStock = safeProducts.filter((p) => (p.stock_cantidad ?? 0) === 0).length;
  const available  = safeProducts.filter((p) => p.disponible).length;

  return (
    <div className="flex flex-col gap-lg animate-in fade-in duration-500">

      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Gestión de Productos</h2>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {isAdmin ? 'Gestiona tu inventario, precios y niveles de stock.' : isStock ? 'Gestión de stock y disponibilidad.' : 'Vista de solo lectura.'}
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => handleOpen()} className="btn-primary">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
            Agregar Nuevo Producto
          </button>
        )}
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        <div className="kpi-card">
          <span className="material-symbols-outlined text-primary mb-xs">inventory</span>
          <span className="text-label-caps text-on-surface-variant">Productos Totales</span>
          <span className="text-headline-lg font-bold text-on-surface">{total}</span>
        </div>
        <div className="kpi-card">
          <span className="material-symbols-outlined text-tertiary mb-xs">warning</span>
          <span className="text-label-caps text-on-surface-variant">Stock Bajo</span>
          <span className="text-headline-lg font-bold text-on-surface">{lowStock}</span>
        </div>
        <div className="kpi-card">
          <span className="material-symbols-outlined text-error mb-xs">remove_shopping_cart</span>
          <span className="text-label-caps text-on-surface-variant">Sin Stock</span>
          <span className="text-headline-lg font-bold text-on-surface">{outOfStock}</span>
        </div>
        <div className="kpi-card">
          <span className="material-symbols-outlined text-primary mb-xs">check_circle</span>
          <span className="text-label-caps text-on-surface-variant">Disponibles</span>
          <span className="text-headline-lg font-bold text-on-surface">{available}</span>
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : products && products.length > 0 ? (
        <ProductTable
          data={products}
          onEdit={canEdit ? handleOpen : undefined}
          onDelete={isAdmin ? handleDelete : undefined}
          onToggleDisponible={canEdit ? (p) => toggleDisponibleMutation.mutate({ id: p.id!, disponible: !p.disponible }) : undefined}
        />
      ) : (
        <EmptyState message="Aún no hay productos registrados." />
      )}

      {canEdit && (
        <ProductModal
          isOpen={modalOpen}
          onClose={handleClose}
          productoSelected={selected}
          categorias={categories || []}
          ingredientes={ingredients || []}
          onSave={(val) => saveMutation.mutate(val)}
          isLoading={saveMutation.isPending}
        />
      )}
    </div>
  );
};
