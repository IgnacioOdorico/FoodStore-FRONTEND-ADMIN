import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

/**
 * ESTO ES UN COMPONENTE REUTILIZABLE: Lo creamos para no tener que 
 * copiar y pegar el código del fondo oscuro y el encabezado en cada modal.
 * Así mantengo la consistencia visual en toda la app.
 */
export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  footer,
  maxWidth = 'md' 
}) => {
  // Si el modal no está abierto, no renderizo NADA.
  if (!isOpen) return null;

  // Clases dinámicas para manejar distintos anchos (el de productos es más ancho que el de categorías)
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    // 'fixed inset-0' ocupa toda la pantalla y el z-50 lo pone por encima de todo.
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      {/* OVERLAY: Es el fondo oscuro con el efecto de blur. Al hacer click, se cierra el modal. */}
      <div 
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(17,24,39,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={onClose} 
      />
      
      {/* CONTENEDOR: El 'card' principal con sombra y bordes Cocoa. Flexbox para manejar layout vertical */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '1.5rem', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', backgroundColor: '#6B4226', borderBottom: '2px solid rgba(107,66,38,0.2)', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '-0.05em', fontStyle: 'italic' }}>
            {title}
          </h2>
          <button 
            onClick={onClose} 
            style={{ color: 'rgba(255,255,255,0.4)', padding: '0.25rem', borderRadius: '0.5rem', flexShrink: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>

        {/* CONTENIDO */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '2rem 1.5rem', width: '100%' }}>
          {children}
        </div>

        {/* FOOTER */}
        {footer && (
          <div style={{ borderTop: '2px solid rgba(107,66,38,0.2)', padding: '1rem 1.5rem', flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
