import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

// Auth
import { LoginPage } from "../features/auth/pages/LoginPage";
import { ForbiddenPage } from "../features/auth/pages/ForbiddenPage";

// Rutas protegidas — negocio
import { CategoriesPage } from "../features/categories/pages/CategoriesPage";
import { ProductsPage } from "../features/products/pages/ProductsPage";
import { ProductDetailPage } from "../features/products/pages/ProductDetailPage";
import { IngredientsPage } from "../features/ingredients/pages/IngredientsPage";

// Rutas protegidas — roles
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { UsersPage } from "../features/admin/pages/UsersPage";
import { OrdersPage } from "../features/orders/pages/OrdersPage";
import { ProfilePage } from "../features/profile/pages/ProfilePage";

import { Navbar } from "../shared/components/Navbar";

// Componente interno que inicializa auth y renderiza rutas
const RouterContent = () => {
  const { fetchCurrentUser } = useAuthStore();

  // Al montar, intenta cargar el usuario actual desde el backend
  useEffect(() => {
    fetchCurrentUser().catch(() => {
      // Si falla, el usuario simplemente no estará autenticado
      // y será redirigido al login por ProtectedRoute
    });
  }, [fetchCurrentUser]);

  return (
    <>
      <Navbar />
      <main className="pt-24 md:pt-40 px-4">
        <Routes>
          {/* ─── Públicas ─────────────────────────────────────────── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />

          {/* ─── Admin + Employee ─────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "employee"]} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/ingredients" element={<IngredientsPage />} />
          </Route>

          {/* ─── Solo admin ───────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/users" element={<UsersPage />} />
          </Route>

          {/* ─── Solo client ──────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
            <Route path="/orders" element={<OrdersPage />} />
          </Route>

          {/* ─── Cualquier usuario autenticado ────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "employee", "client"]} />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* ─── Fallback ─────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </>
  );
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <RouterContent />
    </BrowserRouter>
  );
};
