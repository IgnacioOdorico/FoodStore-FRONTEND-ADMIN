import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useWsStore } from '../../store/wsStore';
import { useUiStore } from '../../store/uiStore';


const NavItem: React.FC<{ to: string; icon: string; label: string; onClick?: () => void }> = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      isActive ? 'nav-item-active' : 'nav-item'
    }
  >
    <span className="material-symbols-outlined">{icon}</span>
    <span>{label}</span>
  </NavLink>
);

export const Sidebar: React.FC = () => {
  const { user, logout, hasRole } = useAuthStore();
  const isConnected = useWsStore((s) => s.isConnected);
  const { isSidebarOpen, toggleSidebar } = useUiStore();
  const navigate = useNavigate();

  if (!user) return null;

  const closeSidebar = () => {
    if (window.innerWidth < 768) toggleSidebar();
  };

  const handleLogout = () => {
    logout();
    closeSidebar();
    navigate('/login');
  };

  const initials = `${user.nombre?.[0] ?? ''}${user.apellido?.[0] ?? ''}`.toUpperCase();

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="px-md mb-xl">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '18px' }}>restaurant</span>
          </div>
          <h1 className="text-headline-lg font-bold text-primary leading-none">FoodStore</h1>
        </div>
        <p className="text-label-caps text-on-surface-variant opacity-70 pl-10">Portal de Gestión</p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1">

        {/* Solo ADMIN: usuarios */}
        {hasRole('ADMIN') && (
          <>
            <NavItem to="/dashboard" icon="dashboard" label="Panel de Control" onClick={closeSidebar} />
            <NavItem to="/admin/users" icon="manage_accounts" label="Usuarios" onClick={closeSidebar} />
          </>
        )}

        {/* ADMIN + STOCK + PEDIDOS: catálogo */}
        {hasRole('ADMIN', 'STOCK', 'PEDIDOS') && (
          <>
            <NavItem to="/products" icon="inventory_2" label="Productos" onClick={closeSidebar} />
            <NavItem to="/categories" icon="category" label="Categorías" onClick={closeSidebar} />
            <NavItem to="/ingredients" icon="egg_alt" label="Ingredientes" onClick={closeSidebar} />
          </>
        )}

        {/* ADMIN + PEDIDOS: gestión de pedidos */}
        {hasRole('ADMIN', 'PEDIDOS') && (
          <NavItem to="/orders" icon="shopping_cart" label="Pedidos" onClick={closeSidebar} />
        )}

      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-outline-variant pt-md space-y-1">
        <NavItem to="/profile" icon="person" label="Perfil" onClick={closeSidebar} />
        <button
          onClick={handleLogout}
          className="nav-item w-full text-left text-error hover:bg-error-container/30"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Cerrar sesión</span>
        </button>
      </div>

      {/* Badge estado de conexión WebSocket */}
      <div className="hidden px-md py-sm">
        <div className={`flex items-center gap-2 px-sm py-xs rounded-lg text-[11px] font-semibold ${isConnected
            ? 'bg-green-500/10 text-green-600'
            : 'bg-red-500/10 text-red-500'
          }`}>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
          {isConnected ? 'En tiempo real' : 'Sin conexión en tiempo real'}
        </div>
      </div>

      {/* User info */}
      <div className="px-md py-md flex items-center gap-3 border-t border-outline-variant mt-2">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-on-primary font-bold text-sm">
          {initials}
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-label-caps text-on-surface font-bold truncate">
            {user.nombre} {user.apellido}
          </p>
          <p className="text-[10px] text-primary uppercase tracking-widest font-bold truncate">
            {user.roles.join(' · ')}
          </p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Hamburger button (mobile) */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 bg-surface-container-low border border-outline-variant rounded-lg flex items-center justify-center shadow-md hover:bg-surface-container transition-colors"
        aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        <span className="material-symbols-outlined text-on-surface-variant">
          {isSidebarOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          h-screen fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant flex flex-col py-md space-y-xs z-50
          transition-transform duration-300 ease-in-out
          w-[240px]
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:w-[240px]
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
