import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  showFallbackText?: boolean;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  alt, 
  className = 'w-full h-full object-cover',
  fallbackClassName = 'w-full h-full bg-gradient-to-br from-cocoa/20 to-brand/20',
  showFallbackText = true
}) => {
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (hasError || !src) {
    return (
      <div className={`flex items-center justify-center ${fallbackClassName}`}>
        <div className="flex flex-col items-center gap-2">
          <ImageIcon className="w-8 h-8 text-cocoa/40" />
          {showFallbackText && (
            <span className="text-[10px] text-cocoa/40 font-black uppercase italic text-center">
              Sin Imagen
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={() => setHasError(true)}
    />
  );
};
