import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsService } from '../services/products';
import { ImageWithFallback } from '../../../shared/ui/ImageWithFallback';
import { LoadingState, ErrorState } from '../../../shared/ui/States';
import { Button } from '../../../shared/ui/Button';
import { ArrowLeft, Info, Tags, AlertTriangle } from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsService.getById(Number(id)),
    enabled: !!id, // Solo se ejecuta si el ID existe.
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message="No se pudo cargar el producto." />;
  if (!product) return <ErrorState message="El producto no existe." />;

  return (
    <div className="max-w-6xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Button 
        variant="secondary" 
        onClick={() => navigate(-1)} 
        className="mb-8 group border-2 border-cocoa/10 hover:border-cocoa/40"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Volver al listado
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        <div className="relative group">
          <div className="absolute -inset-4 bg-cocoa/10 rounded-[3rem] blur-2xl group-hover:bg-cocoa/20 transition-all duration-700" />
          <div className="relative aspect-square rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl">
            <ImageWithFallback
              src={product.imagenes_url?.[0]}
              alt={product.nombre}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              fallbackClassName="w-full h-full bg-gradient-to-br from-cocoa/20 to-brand/20"
              showFallbackText={true}
            />
          
            {!product.disponible && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <span className="bg-red-600 text-white px-8 py-3 rounded-full font-black uppercase italic tracking-widest shadow-2xl border-2 border-white/20">
                  No Disponible
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-8 py-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-brand/10 text-brand text-[10px] font-black uppercase italic tracking-widest px-3 py-1 rounded-full border border-brand/20">
                Premium Product
              </span>
              {product.ingredientes?.some(ing => ing.es_alergeno) && (
                <span className="bg-red-600 text-white text-[10px] font-black uppercase italic tracking-widest px-3 py-1 rounded-full border border-red-700 shadow-lg flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3" /> Contiene Alérgenos
                </span>
              )}
            </div>
            <h1 className="text-6xl font-black text-brand-active uppercase italic tracking-tighter leading-none mb-4">
              {product.nombre}
            </h1>
            <p className="text-cocoa font-bold text-lg italic leading-relaxed opacity-80">
              {product.descripcion || 'Una receta artesanal guardada bajo llave por generaciones.'}
            </p>
          </div>

          <div className="flex items-center gap-6 p-6 bg-white/50 backdrop-blur-md rounded-[2rem] border-2 border-cocoa/10 shadow-lg">
            <div className="flex flex-col">
              <span className="text-cocoa/60 text-[10px] font-black uppercase tracking-widest italic mb-1">Precio Unitario</span>
              <span className="text-5xl font-black text-brand-active italic tracking-tighter">
                ${product.precio_base.toLocaleString()}
              </span>
            </div>
            <div className="w-px h-12 bg-cocoa/10" />
            <div className="flex flex-col">
              <span className="text-cocoa/60 text-[10px] font-black uppercase tracking-widest italic mb-1">Estado</span>
              <span className={`text-sm font-black uppercase italic ${product.disponible ? 'text-green-600' : 'text-red-600'}`}>
                {product.disponible ? 'Disponible' : 'No Disponible'}
              </span>
            </div>
            {product.stock_cantidad !== undefined && (
              <>
                <div className="w-px h-12 bg-cocoa/10" />
                <div className="flex flex-col">
                  <span className="text-cocoa/60 text-[10px] font-black uppercase tracking-widest italic mb-1">Stock</span>
                  <span className={`text-sm font-black uppercase italic ${
                    product.stock_cantidad === 0 ? 'text-red-600' : product.stock_cantidad < 5 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {product.stock_cantidad} u.
                  </span>
                </div>
              </>
            )}
          </div>

          {product.categorias && product.categorias.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="flex items-center gap-2 text-cocoa/40 text-[10px] font-black uppercase tracking-widest italic">
                <Tags className="w-3 h-3" /> Categorías Relacionadas
              </span>
              <div className="flex flex-wrap gap-2">
                {product.categorias.map(cat => (
                  <span key={cat.id} className="bg-brand text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-widest shadow-md">
                    {cat.nombre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.ingredientes && product.ingredientes.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="flex items-center gap-2 text-cocoa/40 text-[10px] font-black uppercase tracking-widest italic">
                <Info className="w-3 h-3" /> Ingredientes de esta receta
              </span>
              <div className="grid grid-cols-2 gap-3">
                {product.ingredientes.map(ing => (
                  <div 
                    key={ing.id} 
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-colors group ${
                      ing.es_alergeno 
                        ? 'bg-red-50 border-red-200 hover:border-red-400' 
                        : 'bg-canvas border-cocoa/10 hover:border-cocoa/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                        ing.es_alergeno ? 'bg-red-600 text-white' : 'bg-pistachio text-olive'
                      }`}>
                        {ing.nombre[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs font-black uppercase italic tracking-tighter ${
                          ing.es_alergeno ? 'text-red-700' : 'text-cocoa'
                        }`}>
                          {ing.nombre}
                        </span>
                        {ing.cantidad > 0 && (
                          <span className="text-[8px] font-bold text-cocoa/50">
                            {ing.cantidad}{ing.unidad_medida_simbolo ? ` ${ing.unidad_medida_simbolo}` : ''}
                          </span>
                        )}
                        {ing.es_alergeno && (
                          <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Alérgeno</span>
                        )}
                      </div>
                    </div>
                    {!ing.es_removible && (
                      <span className="text-[8px] font-black text-cocoa/30 uppercase italic">No Removible</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
