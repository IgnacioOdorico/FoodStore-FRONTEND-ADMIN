import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useWsStore } from '../../store/wsStore';


const NavItem: React.FC<{ to: string; icon: string; label: string }> = ({ to, icon, label }) => (
  <NavLink
    to={to}
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
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = `${user.nombre?.[0] ?? ''}${user.apellido?.[0] ?? ''}`.toUpperCase();

  return (
    <aside className="w-[240px] h-screen fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant flex flex-col py-md space-y-xs z-50">

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
            <NavItem to="/dashboard" icon="dashboard" label="Panel de Control" />
            <NavItem to="/admin/users" icon="manage_accounts" label="Usuarios" />
          </>
        )}

        {/* ADMIN + STOCK + PEDIDOS: catálogo */}
        {hasRole('ADMIN', 'STOCK', 'PEDIDOS') && (
          <>
            <NavItem to="/products" icon="inventory_2" label="Productos" />
            <NavItem to="/categories" icon="category" label="Categorías" />
            <NavItem to="/ingredients" icon="egg_alt" label="Ingredientes" />
          </>
        )}

        {/* ADMIN + PEDIDOS: gestión de pedidos */}
        {hasRole('ADMIN', 'PEDIDOS') && (
          <NavItem to="/orders" icon="shopping_cart" label="Pedidos" />
        )}

      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-outline-variant pt-md space-y-1">
        <NavItem to="/profile" icon="person" label="Perfil" />
        <button
          onClick={handleLogout}
          className="nav-item w-full text-left text-error hover:bg-error-container/30"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Cerrar sesión</span>
        </button>
      </div>

      {/* Badge estado de conexión WebSocket */}
      <div className="px-md py-sm">
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
    </aside>
  );
};
