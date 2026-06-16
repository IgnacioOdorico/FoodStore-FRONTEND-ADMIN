import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './router/AppRouter';
import { useAuthStore } from './store/useAuthStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Shell de inicialización: intenta restaurar la sesión desde la cookie
 * antes de renderizar el router. Mientras no se resuelva, muestra un
 * spinner centrado para que ProtectedRoute nunca vea un user: null falso.
 */
function AppShell() {
  const { initialized, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-button">
            <span className="material-symbols-outlined text-on-primary animate-spin" style={{ fontSize: 28 }}>
              progress_activity
            </span>
          </div>
          <p className="text-body-sm text-on-surface-variant">Verificando sesión…</p>
        </div>
      </div>
    );
  }

  return <AppRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
