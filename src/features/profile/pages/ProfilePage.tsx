import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/useAuthStore';
import { api } from '../../../shared/services/api';
import type { IUser } from '../../../shared/types/auth.types';

const ROL_LABEL: Record<string, string> = {
  ADMIN:   'Administrador',
  STOCK:   'Gestor de Stock',
  PEDIDOS: 'Cajero',
  CLIENT:  'Cliente',
};

export const ProfilePage: React.FC = () => {
  const { user, fetchUser } = useAuthStore();

  const [form, setForm] = useState({
    nombre:   user?.nombre   ?? '',
    apellido: user?.apellido ?? '',
    email:    user?.email    ?? '',
    celular:  user?.celular  ?? '',
  });
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        nombre:   user.nombre,
        apellido: user.apellido,
        email:    user.email,
        celular:  user.celular ?? '',
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<IUser>) =>
      api.patch<IUser>('/api/v1/auth/me', data).then((r) => r.data),
    onSuccess: () => {
      fetchUser();
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (e) => toast.error('Error al guardar: ' + (e instanceof Error ? e.message : 'desconocido')),
  });

  const handleChange = (key: keyof typeof form, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setDirty(true);
    setSaved(false);
  };

  const handleDiscard = () => {
    if (user) {
      setForm({ nombre: user.nombre, apellido: user.apellido, email: user.email, celular: user.celular ?? '' });
    }
    setDirty(false);
  };

  const handleSave = () => updateMutation.mutate(form);

  const initials = user
    ? `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase()
    : '??';

  const mainRole = user?.roles[0] ?? 'CLIENT';

  return (
    <div className="flex flex-col gap-lg animate-in fade-in duration-500">

      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Mi Perfil</h2>
          <p className="text-body-lg text-on-surface-variant">
            Administrá tu cuenta y preferencias personales.
          </p>
        </div>
        <div className="flex gap-md">
          {dirty && (
            <button onClick={handleDiscard} className="btn-secondary">
              Descartar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!dirty || updateMutation.isPending}
            className="btn-primary disabled:opacity-50"
          >
            {updateMutation.isPending ? (
              <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>
            ) : saved ? (
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
            )}
            {saved ? '¡Guardado!' : 'Guardar Cambios'}
          </button>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-gutter">

        {/* Avatar Card*/}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl p-md border border-outline-variant shadow-sm flex flex-col items-center justify-center text-center gap-md">
          {/* Avatar circle */}
          <div className="relative group cursor-pointer">
            <div className="w-36 h-36 rounded-full bg-primary-fixed border-4 border-primary/20 flex items-center justify-center overflow-hidden">
              <span className="text-headline-lg font-bold text-on-primary-fixed" style={{ fontSize: 48 }}>
                {initials}
              </span>
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-on-surface/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 36 }}>photo_camera</span>
            </div>
          </div>

          {/* Name y email */}
          <div>
            <h3 className="text-title-md font-semibold text-on-surface">
              {user?.nombre} {user?.apellido}
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-1">{user?.email}</p>
          </div>

          {/* Role badge */}
          <span className="status-badge bg-primary/10 text-primary border border-primary/20 text-label-caps">
            {ROL_LABEL[mainRole] ?? mainRole}
          </span>

          {/* All roles if multiple */}
          {(user?.roles.length ?? 0) > 1 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {user?.roles.slice(1).map((r) => (
                <span key={r} className="status-badge bg-surface-container text-on-surface-variant" style={{ fontSize: 10 }}>
                  {ROL_LABEL[r] ?? r}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="w-full border-t border-outline-variant pt-md flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_today</span>
              Desde {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) : '—'}
            </div>
            {user?.celular && (
              <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>phone</span>
                {user.celular}
              </div>
            )}
          </div>
        </div>

        {/* Personal Info Card */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl p-md border border-outline-variant shadow-sm">
          <div className="flex items-center gap-2 mb-md pb-md border-b border-outline-variant">
            <span className="material-symbols-outlined text-primary">person_edit</span>
            <h3 className="text-title-md font-semibold">Información Personal</h3>
          </div>

          <div className="flex flex-col gap-md">
            {/* Nombre / Apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-1">
                <label className="text-label-caps text-on-surface-variant">Nombre</label>
                <input
                  className="input-field"
                  value={form.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  placeholder="Tu nombre"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-caps text-on-surface-variant">Apellido</label>
                <input
                  className="input-field"
                  value={form.apellido}
                  onChange={(e) => handleChange('apellido', e.target.value)}
                  placeholder="Tu apellido"
                />
              </div>
            </div>

            {/* Email / Celular */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-1">
                <label className="text-label-caps text-on-surface-variant">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="tu@email.com"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-caps text-on-surface-variant">Celular</label>
                <input
                  className="input-field"
                  value={form.celular}
                  onChange={(e) => handleChange('celular', e.target.value)}
                  placeholder="+54 9 11 ..."
                />
              </div>
            </div>

            {/* Rol — read only */}
            <div className="flex flex-col gap-1">
              <label className="text-label-caps text-on-surface-variant">Rol del sistema</label>
              <div className="input-field bg-surface-variant/30 flex items-center justify-between cursor-not-allowed">
                <span className="text-on-surface-variant">
                  {user?.roles.map((r) => ROL_LABEL[r] ?? r).join(', ')}
                </span>
                <span className="material-symbols-outlined text-on-surface-variant/50" style={{ fontSize: 16 }}>lock</span>
              </div>
              <p className="text-body-sm text-on-surface-variant opacity-60" style={{ fontSize: 11 }}>
                Campo de solo lectura. Contactá al administrador para modificar tu rol.
              </p>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="col-span-12 md:col-span-6 bg-surface-container rounded-xl p-md border border-outline-variant shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary">verified_user</span>
            </div>
            <div>
              <h4 className="text-title-md font-semibold text-on-surface">Seguridad de la cuenta</h4>
              <p className="text-body-sm text-on-surface-variant">Sesión activa con cookie httpOnly</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant/40" style={{ fontSize: 20 }}>chevron_right</span>
        </div>

        {/* Recent Activity Card */}
        <div className="col-span-12 md:col-span-6 bg-[#cce5ff] rounded-xl p-md border border-outline-variant shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-tertiary-container/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-tertiary-container">history</span>
            </div>
            <div>
              <h4 className="text-title-md font-semibold text-on-tertiary-fixed">Actividad Reciente</h4>
              <p className="text-body-sm text-on-tertiary-fixed-variant">Última sesión activa</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-on-tertiary-fixed/40" style={{ fontSize: 20 }}>chevron_right</span>
        </div>
      </div>
    </div>
  );
};
