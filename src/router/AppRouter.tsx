import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

// Auth
import { LoginPage } from "../features/auth/pages/LoginPage";
import { ForbiddenPage } from "../features/auth/pages/ForbiddenPage";

// Catálogo
import { CategoriesPage } from "../features/categories/pages/CategoriesPage";
import { ProductsPage } from "../features/products/pages/ProductsPage";
import { ProductDetailPage } from "../features/products/pages/ProductDetailPage";
import { IngredientsPage } from "../features/ingredients/pages/IngredientsPage";

// Roles específicos
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { UsersPage } from "../features/admin/pages/UsersPage";
import { OrdersPage } from "../features/orders/pages/OrdersPage";
import { ProfilePage } from "../features/profile/pages/ProfilePage";

import { Sidebar } from "../shared/components/Sidebar";
import { useAdminOrdersFeed } from "../hooks/useAdminOrdersFeed";
import { useAuthStore } from "../store/useAuthStore";

// ── Rutas sin sidebar 
const PUBLIC_PATHS = ["/login", "/forbidden"];

const Layout = () => {
  const location = useLocation();
  const isPublic = PUBLIC_PATHS.some((p) => location.pathname.startsWith(p));
  const user = useAuthStore((s) => s.user);

  useAdminOrdersFeed(!!user && !isPublic);

  return (
    <div className="flex min-h-screen bg-background">
      {!isPublic && <Sidebar />}

      <main
        className={
          isPublic
            ? "flex-1"
            : "flex-1 md:ml-[240px] ml-0 p-lg min-h-screen overflow-y-auto"
        }
      >
        {/* Spacer for hamburger button on mobile */}
        {!isPublic && <div className="h-12 md:hidden" />}

        <Routes>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />

          <Route element={<ProtectedRoute allowedRoles={["ADMIN", "STOCK", "PEDIDOS"]} />}>
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/ingredients" element={<IngredientsPage />} />
          </Route>


          <Route element={<ProtectedRoute allowedRoles={["ADMIN", "PEDIDOS"]} />}>
            <Route path="/orders" element={<OrdersPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN", "STOCK", "PEDIDOS"]} />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export const AppRouter = () => (
  <BrowserRouter>
    <Layout />
  </BrowserRouter>
);
