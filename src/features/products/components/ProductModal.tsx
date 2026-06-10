import React, { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import type { Producto } from '../types/producto';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Modal } from '../../../shared/ui/Modal';
import { X } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import UploadModal from '../../../shared/components/cloudinary/UploadModal';

import type { Categoria } from '../../categories/types/categoria';
import type { Ingrediente } from '../../ingredients/types/ingrediente';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Producto>) => void;
  productoSelected: Producto | null;
  categorias: Categoria[];
  ingredientes: Ingrediente[];
  isLoading?: boolean;
}

export const ProductModal: React.FC<ProductModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  productoSelected,
  categorias,
  ingredientes,
  isLoading 
}) => {
  const { hasRole } = useAuthStore();
  const isStockOnly = hasRole('STOCK') && !hasRole('ADMIN');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      nombre: productoSelected?.nombre ?? '',
      descripcion: productoSelected?.descripcion ?? '',
      precio_base: productoSelected?.precio_base ?? 0,
      stock_cantidad: productoSelected?.stock_cantidad ?? 0,
      imagenes_url: productoSelected?.imagenes_url ?? [],
      disponible: productoSelected?.disponible ?? true,
      categoria_ids: productoSelected?.categorias?.map(c => c.id!) ?? [],
      ingredientes_receta: productoSelected?.ingredientes?.map(i => ({
        id: i.id!,
        cantidad: i.cantidad ?? 1,
        es_removible: i.es_removible ?? false,
      })) ?? [],
    },
    onSubmit: async ({ value }) => {
      onSave({
        nombre: value.nombre,
        descripcion: value.descripcion,
        precio_base: Number(value.precio_base),
        stock_cantidad: Number(value.stock_cantidad),
        imagenes_url: value.imagenes_url,
        disponible: value.disponible,
        categoria_ids: value.categoria_ids,
        ingredientes_receta: value.ingredientes_receta,
      } as Partial<Producto>);
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        nombre: productoSelected?.nombre ?? '',
        descripcion: productoSelected?.descripcion ?? '',
        precio_base: productoSelected?.precio_base ?? 0,
        stock_cantidad: productoSelected?.stock_cantidad ?? 0,
        imagenes_url: productoSelected?.imagenes_url ?? [],
        disponible: productoSelected?.disponible ?? true,
        categoria_ids: productoSelected?.categorias?.map(c => c.id!) ?? [],
        ingredientes_receta: productoSelected?.ingredientes?.map(i => ({
          id: i.id!,
          cantidad: i.cantidad ?? 1,
          es_removible: i.es_removible ?? false,
        })) ?? [],
      });
    }
  }, [productoSelected, isOpen, form]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isStockOnly ? 'Actualizar Stock y Disponibilidad' : productoSelected ? 'Editar Producto' : 'Nuevo Producto'}
      maxWidth="4xl"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isLoading} form="product-form">{productoSelected ? 'Actualizar' : 'Crear'} Producto</Button>
        </div>
      }
    >
      <form 
        id="product-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-6 w-full overflow-x-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="flex flex-col gap-5 p-5 bg-surface-variant/20 rounded-xl border border-outline-variant/50 shadow-sm">
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Información Básica</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form.Field
                  name="nombre"
                  validators={{ onChange: ({ value }) => !value ? 'Requerido' : undefined }}
                  children={(field) => (
                    <Input label="Nombre" disabled={isStockOnly} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} error={field.state.meta.errors?.[0]?.toString()} />
                  )}
                />
                <form.Field
                  name="precio_base"
                  validators={{ onChange: ({ value }) => value <= 0 ? 'Debe ser mayor a 0' : undefined }}
                  children={(field) => (
                    <Input label="Precio base ($)" type="number" disabled={isStockOnly} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(Number(e.target.value))} error={field.state.meta.errors?.[0]?.toString()} />
                  )}
                />
              </div>

              <form.Field
                name="stock_cantidad"
                validators={{ onChange: ({ value }) => value < 0 ? 'No negativo' : undefined }}
                children={(field) => (
                  <Input label="Stock disponible (unidades)" type="number" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(Number(e.target.value))} error={field.state.meta.errors?.[0]?.toString()} />
                )}
              />

              <form.Field
                name="imagenes_url"
                children={(field) => (
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-label-caps text-on-surface-variant">Imágenes (Opcional)</label>
                     {field.state.value && field.state.value.length > 0 && (
                       <div className="grid grid-cols-2 gap-2 mb-2">
                         {field.state.value.map((url: string, index: number) => (
                           <div key={index} className="relative w-full h-32 rounded-lg border border-outline-variant overflow-hidden bg-surface-variant/30">
                             <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                             {!isStockOnly && (
                               <button type="button" onClick={() => {
                                 const newUrls = [...field.state.value];
                                 newUrls.splice(index, 1);
                                 field.handleChange(newUrls);
                               }} className="absolute top-2 right-2 p-1.5 bg-error rounded-lg hover:bg-error/80 transition-colors shadow-sm">
                                 <X className="w-4 h-4 text-white" />
                               </button>
                             )}
                           </div>
                         ))}
                       </div>
                     )}
                     {!isStockOnly && (
                       <div className="flex gap-2 items-center">
                         <Button type="button" variant="secondary" onClick={() => setIsUploadModalOpen(true)}>
                           Subir Imágenes
                         </Button>
                         <Input 
                           placeholder="O pegar URL y presionar Enter" 
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') {
                               e.preventDefault();
                               const input = e.target as HTMLInputElement;
                               if (input.value) {
                                 field.handleChange([...field.state.value, input.value]);
                                 input.value = '';
                               }
                             }
                           }} 
                         />
                       </div>
                     )}
                     {isUploadModalOpen && (
                       <UploadModal
                         onClose={() => setIsUploadModalOpen(false)}
                         onUploadComplete={(responses) => {
                           if (responses && responses.length > 0) {
                             const newUrls = responses.map(r => r.secure_url);
                             field.handleChange([...field.state.value, ...newUrls]);
                           }
                         }}
                       />
                     )}
                  </div>
                )}
              />

              <form.Field
                name="descripcion"
                children={(field) => (
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-label-caps text-on-surface-variant">Descripción</label>
                    <textarea disabled={isStockOnly} className="input-field min-h-[80px]" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                  </div>
                )}
              />

              <form.Field
                name="disponible"
                children={(field) => (
                  <label className={`mt-2 flex justify-between items-center p-4 rounded-xl border transition-all cursor-pointer ${field.state.value ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-surface-variant/30 border-outline-variant/50'}`}>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-on-surface">Disponible para la venta</span>
                      <span className="text-xs text-on-surface-variant mt-0.5">Mostrar este producto en la tienda web</span>
                    </div>
                    <div className={`relative w-12 h-6 rounded-full transition-colors ${field.state.value ? 'bg-primary' : 'bg-outline-variant'}`}>
                      <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${field.state.value ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                    <input type="checkbox" className="hidden" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} />
                  </label>
                )}
              />
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-5">
            
            <form.Field
              name="categoria_ids"
              validators={{ onChange: ({ value }) => !value || value.length === 0 ? 'Mínimo 1 categoría' : undefined }}
              children={(field) => (
                <div className={`flex flex-col gap-3 p-5 bg-surface-variant/20 rounded-xl border border-outline-variant/50 shadow-sm ${isStockOnly ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Categorías</h3>
                    {field.state.meta.errors?.[0] && <span className="text-[10px] text-error font-bold uppercase">{field.state.meta.errors[0].toString()}</span>}
                  </div>
                  <div className={`flex flex-wrap gap-2 p-3 bg-surface rounded-lg border shadow-inner ${field.state.meta.errors?.[0] ? 'border-error/50' : 'border-outline-variant/30'}`}>
                    {categorias.map(cat => (
                      <label key={cat.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${field.state.value.includes(cat.id!) ? 'bg-primary text-white border-primary shadow-sm' : 'bg-surface text-on-surface-variant border-outline-variant/40 hover:border-outline-variant'}`}>
                        <input type="checkbox" className="hidden" checked={field.state.value.includes(cat.id!)} onChange={(e) => {
                          const val = e.target.checked ? [...field.state.value, cat.id!] : field.state.value.filter(id => id !== cat.id);
                          field.handleChange(val);
                        }} />
                        {cat.nombre}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            />

            <form.Field
              name="ingredientes_receta"
              children={(field) => (
                <div className={`flex flex-col gap-3 p-5 bg-surface-variant/20 rounded-xl border border-outline-variant/50 shadow-sm flex-1 ${isStockOnly ? 'opacity-50 pointer-events-none' : ''}`}>
                  <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Receta (Ingredientes)</h3>
                  <div className="flex flex-col gap-3 p-3 pr-4 bg-surface rounded-lg border border-outline-variant/30 flex-1 min-h-[250px] max-h-[400px] overflow-y-auto shadow-inner custom-scrollbar">
                    {ingredientes.map(ing => {
                      const selected = field.state.value.find(i => i.id === ing.id);
                      return (
                        <div key={ing.id} className={`flex flex-col gap-2 p-4 rounded-xl border transition-all ${selected ? 'bg-primary/5 border-primary/20 shadow-md scale-[1.01]' : 'bg-surface border-outline-variant/30 hover:border-outline-variant/60'}`}>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <div className={`w-5 h-5 flex items-center justify-center rounded border transition-colors ${selected ? 'bg-primary border-primary' : 'border-outline-variant bg-surface'}`}>
                              {selected && <div className="w-2 h-2 bg-white rounded-sm" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={!!selected} onChange={(e) => {
                              const val = e.target.checked ? [...field.state.value, { id: ing.id!, cantidad: 1, es_removible: false }] : field.state.value.filter(i => i.id !== ing.id);
                              field.handleChange(val);
                            }} />
                            <span className={`text-sm font-bold flex-1 ${selected ? 'text-primary' : 'text-on-surface-variant'}`}>{ing.nombre}</span>
                          </label>
                          
                          {selected && (
                            <div className="flex items-center gap-4 pl-8 mt-2 border-t border-primary/10 pt-4 pb-1">
                              <div className="flex flex-col flex-1 gap-1.5">
                                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Cantidad</span>
                                <input type="number" min="0.1" step="0.1" className="input-field text-xs py-1.5 px-3 h-9 bg-white" placeholder="Cant." value={selected.cantidad} onChange={(e) => {
                                  const updated = field.state.value.map(i => i.id === ing.id ? { ...i, cantidad: Number(e.target.value) || 1 } : i);
                                  field.handleChange(updated);
                                }} />
                              </div>
                              <label className="flex flex-col flex-1 gap-1.5 cursor-pointer">
                                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">¿Removible?</span>
                                <div className="flex items-center gap-2 h-9">
                                  <div className={`relative w-10 h-5 rounded-full transition-colors ${selected.es_removible ? 'bg-primary' : 'bg-outline-variant'}`}>
                                    <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${selected.es_removible ? 'translate-x-5' : 'translate-x-0'} shadow-sm`} />
                                  </div>
                                  <span className="text-xs font-semibold text-on-surface-variant">{selected.es_removible ? 'Sí' : 'No'}</span>
                                  <input type="checkbox" className="hidden" checked={selected.es_removible} onChange={(e) => {
                                    const updated = field.state.value.map(i => i.id === ing.id ? { ...i, es_removible: e.target.checked } : i);
                                    field.handleChange(updated);
                                  }} />
                                </div>
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            />

          </div>
        </div>
      </form>
    </Modal>
  );
};
