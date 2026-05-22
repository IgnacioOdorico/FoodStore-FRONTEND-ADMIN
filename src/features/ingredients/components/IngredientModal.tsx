import React, { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import type { Ingrediente } from '../types/ingrediente';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Modal } from '../../../shared/ui/Modal';

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Ingrediente>) => void;
  ingredientSelected: Ingrediente | null;
  isLoading?: boolean;
}

export const IngredientModal: React.FC<IngredientModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  ingredientSelected,
  isLoading 
}) => {
  const form = useForm({
    defaultValues: {
      nombre: ingredientSelected?.nombre ?? '',
      descripcion: ingredientSelected?.descripcion ?? '',
      es_alergeno: ingredientSelected?.es_alergeno ?? false,
    },
    onSubmit: async ({ value }) => {
      onSave(value as Partial<Ingrediente>);
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        nombre: ingredientSelected?.nombre ?? '',
        descripcion: ingredientSelected?.descripcion ?? '',
        es_alergeno: ingredientSelected?.es_alergeno ?? false,
      });
    }
  }, [ingredientSelected, isOpen, form]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ingredientSelected ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
      maxWidth="2xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isLoading} form="ingredient-form">{ingredientSelected ? 'Actualizar' : 'Crear'} Ingrediente</Button>
        </div>
      }
    >
      <form 
        id="ingredient-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-6 w-full overflow-x-hidden"
      >
        <form.Field
          name="nombre"
          validators={{ onChange: ({ value }) => !value ? 'Requerido' : undefined }}
          children={(field) => (
            <Input 
              label="Nombre del Ingrediente" 
              placeholder="Ej: Muzzarella"
              value={field.state.value} 
              onBlur={field.handleBlur} 
              onChange={(e) => field.handleChange(e.target.value)} 
              error={field.state.meta.errors?.[0]?.toString()} 
            />
          )}
        />

        <form.Field
          name="descripcion"
          children={(field) => (
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-label-caps text-on-surface-variant">Descripción</label>
              <textarea
                className="input-field min-h-[80px]"
                placeholder="Describe el ingrediente..."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        />

        <form.Field
          name="es_alergeno"
          children={(field) => (
            <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border-2 border-red-500/20">
              <input
                type="checkbox"
                id="es_alergeno"
                className="w-5 h-5 rounded border-2 border-white/20 bg-white/10 text-red-500 focus:ring-red-500 cursor-pointer"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
              />
              <label htmlFor="es_alergeno" className="text-sm font-semibold text-error cursor-pointer">
                ¿Es un alérgeno? (Ej: Lácteos, Gluten, Maní)
              </label>
            </div>
           )}
         />

      </form>
    </Modal>
  );
};
