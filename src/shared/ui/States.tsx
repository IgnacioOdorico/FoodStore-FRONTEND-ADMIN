import React from 'react';

export const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-4 animate-in fade-in duration-500">
    <span className="material-symbols-outlined text-primary animate-spin" style={{ fontSize: 48 }}>
      progress_activity
    </span>
    <p className="text-body-sm text-on-surface-variant">Cargando...</p>
  </div>
);

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({
  message = 'Error al conectar con el servidor.',
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4 bg-error-container/30 rounded-xl border border-error/20">
    <span className="material-symbols-outlined text-error" style={{ fontSize: 48 }}>error</span>
    <div className="text-center">
      <h3 className="text-title-md text-error">Algo salió mal</h3>
      <p className="text-body-sm text-on-surface-variant mt-1">{message}</p>
    </div>
    {onRetry && (
      <button onClick={onRetry} className="btn-primary mt-2">
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
        Reintentar
      </button>
    )}
  </div>
);

export const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4 border-2 border-dashed border-outline-variant rounded-xl">
    <span className="material-symbols-outlined text-on-surface-variant opacity-30" style={{ fontSize: 56 }}>
      inbox
    </span>
    <p className="text-body-sm text-on-surface-variant opacity-60">{message}</p>
  </div>
);
