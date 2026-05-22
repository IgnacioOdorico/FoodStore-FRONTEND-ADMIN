import React, { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import type { Producto } from '../types/producto';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Modal } from '../../../shared/ui/Modal';
import { X } from 'lucide-react';

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
  const form = useForm({
    defaultValues: {
      nombre: productoSelected?.nombre ?? '',
      descripcion: productoSelected?.descripcion ?? '',
      precio_base: productoSelected?.precio_base ?? 0,
      stock_cantidad: productoSelected?.stock_cantidad ?? 0,
      imagen_url: productoSelected?.imagen_url ?? '',
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
        imagen_url: value.imagen_url,
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
        imagen_url: productoSelected?.imagen_url ?? '',
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
      title={productoSelected ? 'Editar Producto' : 'Nuevo Producto'}
      maxWidth="2xl"
      footer={
        <div className="flex justify-end gap-3">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form.Field
            name="nombre"
            validators={{ onChange: ({ value }) => !value ? 'Requerido' : undefined }}
            children={(field) => (
              <Input label="Nombre" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} error={field.state.meta.errors?.[0]?.toString()} />
            )}
          />

          <form.Field
            name="precio_base"
            validators={{ onChange: ({ value }) => value <= 0 ? 'Debe ser mayor a 0' : undefined }}
            children={(field) => (
              <Input label="Precio base ($)" type="number" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(Number(e.target.value))} error={field.state.meta.errors?.[0]?.toString()} />
            )}
          />
        </div>

        <form.Field
          name="stock_cantidad"
          validators={{ onChange: ({ value }) => value < 0 ? 'No puede ser negativo' : undefined }}
          children={(field) => (
            <Input
              label="Stock en almacén (unidades)"
              type="number"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              error={field.state.meta.errors?.[0]?.toString()}
            />
          )}
        />

        <form.Field
          name="imagen_url"
          children={(field) => (
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-black text-cocoa uppercase tracking-widest italic">URL de Imagen (Ej: Cloudinary, Imgur)</label>
              
               {/* Previa de imagen */}
               {field.state.value && (
                 <div className="relative w-full h-40 rounded-lg border-2 border-cocoa/20 overflow-hidden bg-canvas/30">
                   <img 
                     src={field.state.value} 
                     alt="Preview" 
                     className="w-full h-full object-cover"
                   />
                   <button
                     type="button"
                     onClick={() => {
                       field.handleChange('');
                     }}
                     className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                   >
                     <X className="w-4 h-4 text-white" />
                   </button>
                 </div>
               )}
               
               {/* Input URL */}
               <Input
                 label={field.state.value ? 'Cambiar URL de Imagen' : 'Pegar URL de Imagen'}
                 type="url"
                 placeholder="https://ejemplo.com/imagen.jpg"
                 value={field.state.value}
                 onChange={(e) => {
                   field.handleChange(e.target.value);
                 }}
                 onBlur={field.handleBlur}
               />
              <p className="text-[10px] text-cocoa/50 italic">💡 Tip: Sube tu imagen a Cloudinary, Imgur o similar y pega la URL aquí</p>
            </div>
          )}
        />

        <form.Field
          name="descripcion"
          children={(field) => (
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-black text-cocoa uppercase tracking-widest italic">Descripción</label>
              <textarea className="input-field min-h-[60px]" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
            </div>
          )}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categorías Multi-select */}
          <form.Field
            name="categoria_ids"
            validators={{
              onChange: ({ value }) => !value || value.length === 0 ? 'Debe seleccionar al menos una categoría' : undefined
            }}
            children={(field) => (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-black text-cocoa uppercase tracking-widest italic">Categorías</label>
                  {field.state.meta.errors?.[0] && (
                    <span className="text-[9px] text-red-400 font-black uppercase tracking-tighter">{field.state.meta.errors[0].toString()}</span>
                  )}
                </div>
                <div className={`flex flex-wrap gap-2 p-3 bg-canvas/30 rounded-xl border-2 min-h-[100px] shadow-inner ${field.state.meta.errors?.[0] ? 'border-red-500/30' : 'border-cocoa/20'}`}>
                  {categorias.map(cat => (
                    <label key={cat.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 cursor-pointer transition-all ${field.state.value.includes(cat.id!) ? 'bg-brand text-white border-brand shadow-md scale-105' : 'bg-canvas/50 text-brand-active/70 border-cocoa/10 hover:border-cocoa/40'}`}>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={field.state.value.includes(cat.id!)}
                        onChange={(e) => {
                          const val = e.target.checked 
                            ? [...field.state.value, cat.id!]
                            : field.state.value.filter(id => id !== cat.id);
                          field.handleChange(val);
                        }}
                      />
                      <span className="text-[10px] font-black uppercase tracking-tighter italic">{cat.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          />

          {/* Ingredientes Multi-select con cantidad */}
          <form.Field
            name="ingredientes_receta"
            children={(field) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-black text-cocoa uppercase tracking-widest italic">Ingredientes</label>
                <div className="flex flex-col gap-2 p-3 bg-canvas/30 rounded-xl border-2 border-cocoa/20 max-h-[300px] overflow-y-auto shadow-inner">
                  {ingredientes.map(ing => {
                    const selected = field.state.value.find(i => i.id === ing.id);
                    return (
                      <div key={ing.id} className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all ${selected ? 'bg-cocoa/20 border-cocoa' : 'bg-canvas/50 border-cocoa/10'}`}>
                        <input
                          type="checkbox"
                          className="w-4 h-4 cursor-pointer"
                          checked={!!selected}
                          onChange={(e) => {
                            const val = e.target.checked 
                              ? [...field.state.value, { id: ing.id!, cantidad: 1, es_removible: false }]
                              : field.state.value.filter(i => i.id !== ing.id);
                            field.handleChange(val);
                          }}
                        />
                        <span className="text-[10px] font-black uppercase tracking-tighter italic flex-1">{ing.nombre}</span>
                        {selected && (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              className="w-12 input-field text-xs"
                              placeholder="Cant."
                              value={selected.cantidad}
                              onChange={(e) => {
                                const updated = field.state.value.map(i => 
                                  i.id === ing.id 
                                    ? { ...i, cantidad: Number(e.target.value) || 1 }
                                    : i
                                );
                                field.handleChange(updated);
                              }}
                            />
                            <label className="flex items-center gap-1 cursor-pointer text-[9px]">
                              <input
                                type="checkbox"
                                className="w-3 h-3"
                                checked={selected.es_removible}
                                onChange={(e) => {
                                  const updated = field.state.value.map(i => 
                                    i.id === ing.id 
                                      ? { ...i, es_removible: e.target.checked }
                                      : i
                                  );
                                  field.handleChange(updated);
                                }}
                              />
                              <span>Removible</span>
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

        <form.Field
          name="disponible"
          children={(field) => (
            <label className="flex items-center gap-3 cursor-pointer w-fit p-3 bg-brand/10 rounded-xl border-2 border-brand/20">
              <input type="checkbox" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} className="w-5 h-5 text-brand rounded border-2 border-brand/20 bg-white/10 focus:ring-brand cursor-pointer" />
              <span className="text-sm font-black text-brand-active uppercase tracking-widest italic">Producto habilitado para la venta</span>
            </label>
          )}
        />
      </form>
    </Modal>
  );
};
