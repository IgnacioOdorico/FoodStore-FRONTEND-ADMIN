import type { Categoria } from "../../categories/types/categoria";
import type { Ingrediente } from "../../ingredients/types/ingrediente";

export interface IngredienteReceta extends Ingrediente {
    cantidad: number;
    es_removible: boolean;
}

export interface Producto {
    id?: number;
    nombre: string;
    descripcion?: string;
    precio_base: number;
    imagenes_url?: string[];
    stock_cantidad?: number;
    disponible: boolean;

    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;

    // Relaciones
    categorias?: (Categoria & { es_principal?: boolean })[];
    ingredientes?: IngredienteReceta[];
    // Payload de escritura (no viene en GET, solo en POST/PUT)
    categoria_ids?: number[];
    ingredientes_receta?: { id: number; cantidad: number; es_removible: boolean }[];
}
