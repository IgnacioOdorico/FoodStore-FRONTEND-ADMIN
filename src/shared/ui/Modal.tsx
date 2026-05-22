import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  footer,
  maxWidth = 'md' 
}) => {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
        onClick={onClose} 
      />
      
      <div className={`relative w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] flex flex-col rounded-2xl overflow-hidden bg-surface shadow-modal border border-outline-variant animate-in fade-in zoom-in-95 duration-200`}>
        
        <div className="flex justify-between items-center p-md bg-primary shrink-0">
          <h2 className="text-title-md font-semibold text-white">
            {title}
          </h2>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-md w-full">
          {children}
        </div>

        {footer && (
          <div className="border-t border-outline-variant p-md shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
