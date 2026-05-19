import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

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

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="pt-24 md:pt-40 px-4">
        <Routes>
          {/* ─── Públicas ─────────────────────────────────────────── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />

          {/* ─── Admin + Stock + Pedidos ──────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN", "STOCK", "PEDIDOS"]} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/ingredients" element={<IngredientsPage />} />
          </Route>

          {/* ─── Solo admin ───────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin/users" element={<UsersPage />} />
          </Route>

          {/* ─── Solo client ──────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={["CLIENT"]} />}>
            <Route path="/orders" element={<OrdersPage />} />
          </Route>

          {/* ─── Cualquier usuario autenticado ────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN", "STOCK", "PEDIDOS", "CLIENT"]} />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* ─── Fallback ─────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};
