import React, { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import type { Categoria } from '../types/categoria';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Modal } from '../../../shared/ui/Modal';
import { X } from 'lucide-react';

interface CategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Categoria>) => void;
  categoriaSelected: Categoria | null;
  categorias: Categoria[];
  isLoading?: boolean;
}

export const CategoriaModal: React.FC<CategoriaModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  categoriaSelected,
  categorias,
  isLoading 
}) => {
  const form = useForm({
    defaultValues: {
      nombre: categoriaSelected?.nombre ?? '',
      descripcion: categoriaSelected?.descripcion ?? '',
      imagen_url: categoriaSelected?.imagen_url ?? '',
      parent_id: categoriaSelected?.parent_id ?? null,
    },
    onSubmit: async ({ value }) => {
      onSave(value as Partial<Categoria>);
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        nombre: categoriaSelected?.nombre ?? '',
        descripcion: categoriaSelected?.descripcion ?? '',
        imagen_url: categoriaSelected?.imagen_url ?? '',
        parent_id: categoriaSelected?.parent_id ?? null,
      });
    }
  }, [categoriaSelected, isOpen, form]);

  const possibleParents = categorias.filter(c => c.id !== categoriaSelected?.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoriaSelected ? 'Editar Categoría' : 'Nueva Categoría'}
      maxWidth="md"
    >
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) => !value ? 'El nombre es obligatorio' : undefined
          }}
          children={(field) => (
            <Input
              label="Nombre"
              placeholder="Ej: Pizzas"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.errors?.[0]?.toString()}
            />
          )}
        />

        <form.Field
          name="imagen_url"
          children={(field) => (
            <div className="flex flex-col gap-1.5">
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
          name="parent_id"
          children={(field) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-black text-cocoa uppercase tracking-widest italic">Categoría Padre (Opcional)</label>
              <select
                className="input-field"
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="" className="bg-brand text-white">Ninguna (Raíz)</option>
                {possibleParents.map(c => (
                  <option key={c.id} value={c.id} className="bg-brand text-white">{c.nombre}</option>
                ))}
              </select>
            </div>
          )}
        />

        <form.Field
          name="descripcion"
          children={(field) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-black text-cocoa uppercase tracking-widest italic">Descripción</label>
              <textarea
                className="input-field min-h-[80px]"
                placeholder="Describe la categoría..."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        />

        <div className="flex justify-end gap-3 mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {categoriaSelected ? 'Actualizar' : 'Crear'} Categoría
          </Button>
        </div>
      </form>
    </Modal>
  );
};
