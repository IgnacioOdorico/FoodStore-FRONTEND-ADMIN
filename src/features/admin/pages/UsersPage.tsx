import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/users';
import { LoadingState, ErrorState, EmptyState } from '../../../shared/ui/States';
import { Modal } from '../../../shared/ui/Modal';
import type { Usuario, CreateUsuarioDto, UpdateUsuarioDto } from '../types/usuario';
import type { IRole } from '../../../shared/types/auth.types';

const EMPLOYEE_ROLES: IRole[] = ['ADMIN', 'STOCK', 'PEDIDOS'];

const isEmployee = (u: Usuario) => u.roles.some((r) => EMPLOYEE_ROLES.includes(r));
const isClient = (u: Usuario) => u.roles.includes('CLIENT') && !isEmployee(u);

const ROL_LABEL: Record<IRole, string> = {
  ADMIN: 'Admin',
  STOCK: 'Stock',
  PEDIDOS: 'Cajero',
  CLIENT: 'Cliente',
};

const ROL_BADGE: Record<IRole, string> = {
  ADMIN: 'bg-primary-fixed text-on-primary-fixed',
  STOCK: 'bg-[#cce5ff] text-[#001e31]',
  PEDIDOS: 'bg-secondary-container text-on-secondary-container',
  CLIENT: 'bg-surface-container text-on-surface-variant',
};

function getInitials(u: Usuario) {
  return `${u.nombre.charAt(0)}${u.apellido.charAt(0)}`.toUpperCase();
}

// Confirm Modal 
type ConfirmAction = { type: 'deactivate' | 'reactivate'; user: Usuario };

const ConfirmModal: React.FC<{
  action: ConfirmAction | null;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}> = ({ action, onConfirm, onClose, isLoading }) => {
  if (!action) return null;

  const isDeactivate = action.type === 'deactivate';
  const fullName = `${action.user.nombre} ${action.user.apellido}`;

  const config = isDeactivate
    ? {
      icon: 'person_off',
      iconBg: 'bg-error-container',
      iconColor: 'text-error',
      title: 'Desactivar cuenta',
      description: 'El empleado perderá acceso al portal inmediatamente. Podrás reactivar la cuenta en cualquier momento.',
      confirmLabel: 'Desactivar',
      confirmClass: 'bg-error text-on-error hover:bg-error/90',
    }
    : {
      icon: 'person_check',
      iconBg: 'bg-secondary-container',
      iconColor: 'text-secondary',
      title: 'Reactivar cuenta',
      description: 'El empleado recuperará el acceso al portal con sus permisos anteriores.',
      confirmLabel: 'Reactivar',
      confirmClass: 'bg-secondary text-on-secondary hover:bg-secondary/90',
    };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-surface rounded-2xl shadow-modal border border-outline-variant overflow-hidden" style={{ width: '100%', maxWidth: 420 }}>
        {/* Body */}
        <div className="p-lg flex flex-col items-center text-center gap-md">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-full ${config.iconBg} flex items-center justify-center`}>
            <span className={`material-symbols-outlined ${config.iconColor}`} style={{ fontSize: 32 }}>
              {config.icon}
            </span>
          </div>

          {/* Texts */}
          <div className="flex flex-col gap-xs">
            <h3 className="text-title-lg font-bold text-on-surface">{config.title}</h3>
            <p className="text-body-sm text-on-surface-variant">
              ¿Estás segura de que querés{' '}
              <span className="font-semibold text-on-surface">{isDeactivate ? 'desactivar' : 'reactivar'}</span>{' '}
              la cuenta de{' '}
              <span className="font-semibold text-on-surface">{fullName}</span>?
            </p>
          </div>

          {/* Info card */}
          <div className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-md py-sm text-left">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-on-surface-variant mt-0.5" style={{ fontSize: 16 }}>info</span>
              <p className="text-body-sm text-on-surface-variant">{config.description}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-outline-variant px-lg py-md flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-label-lg font-semibold transition-colors disabled:opacity-50 ${config.confirmClass}`}
          >
            {isLoading
              ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>
              : <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{config.icon}</span>
            }
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// Crear Modal 
const CreateEmployeeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (d: CreateUsuarioDto) => void;
  isLoading: boolean;
  error: Error | null;
  clearError: () => void;
}> = ({ isOpen, onClose, onSave, isLoading, error, clearError }) => {
  const [form, setForm] = useState<CreateUsuarioDto>({
    nombre: '', apellido: '', email: '', password: '', celular: '', roles: ['STOCK'],
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => { e.preventDefault(); onSave(form); };
  const set = (key: keyof CreateUsuarioDto, val: string | IRole[]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (error) clearError();
  };

  // Reseteamos el form cuando se abre o cierra
  React.useEffect(() => {
    if (!isOpen) {
      setForm({ nombre: '', apellido: '', email: '', password: '', celular: '', roles: ['STOCK'] });
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Empleado"
      maxWidth="2xl"
      footer={
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button type="submit" form="employee-form" disabled={isLoading} className="btn-primary disabled:opacity-50">
            {isLoading
              ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>
              : <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
            }
            Crear Empleado
          </button>
        </div>
      }
    >
      <form id="employee-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-label-caps text-on-surface-variant">Nombre</label>
            <input required className="input-field" value={form.nombre}
              onChange={(e) => set('nombre', e.target.value)} placeholder="Juan" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps text-on-surface-variant">Apellido</label>
            <input required className="input-field" value={form.apellido}
              onChange={(e) => set('apellido', e.target.value)} placeholder="García" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-label-caps text-on-surface-variant">Email</label>
          <input required type="email" className="input-field" value={form.email}
            onChange={(e) => set('email', e.target.value)} placeholder="juan@foodstore.com" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-label-caps text-on-surface-variant">Contraseña</label>
          <input required type="password" className="input-field" value={form.password}
            onChange={(e) => set('password', e.target.value)} placeholder="••••••••" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-label-caps text-on-surface-variant">Celular</label>
          <input className="input-field" value={form.celular ?? ''}
            onChange={(e) => set('celular', e.target.value)} placeholder="+54 9 11 1234-5678" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-label-caps text-on-surface-variant">Rol</label>
          <select className="input-field" value={form.roles[0]}
            onChange={(e) => set('roles', [e.target.value as IRole])}>
            <option value="ADMIN">Admin</option>
            <option value="STOCK">Stock</option>
            <option value="PEDIDOS">Cajero (Pedidos)</option>
          </select>
        </div>

        {error && (
          <div className="mt-2 px-4 py-3 bg-error-container rounded-lg border border-error/20 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
            <span className="material-symbols-outlined text-error flex-shrink-0" style={{ fontSize: 18 }}>error</span>
            <p className="text-body-sm text-on-error-container font-semibold">
              {error.message || 'Error al crear empleado'}
            </p>
          </div>
        )}
      </form>
    </Modal>
  );
};

// Edit Modal Empleado 
const EditEmployeeModal: React.FC<{
  user: Usuario | null;
  onClose: () => void;
  onSave: (id: number, d: UpdateUsuarioDto) => void;
  isLoading: boolean;
  error: Error | null;
  clearError: () => void;
}> = ({ user, onClose, onSave, isLoading, error, clearError }) => {
  const [form, setForm] = useState<UpdateUsuarioDto>({
    nombre: '', apellido: '', celular: '', email: '', roles: ['STOCK'],
  });

  React.useEffect(() => {
    if (user) {
      const empRoles = user.roles.filter((r) => EMPLOYEE_ROLES.includes(r)) as IRole[];
      setForm({
        nombre: user.nombre,
        apellido: user.apellido,
        celular: user.celular ?? '',
        email: user.email,
        roles: empRoles.length > 0 ? empRoles : ['STOCK'],
      });
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => { e.preventDefault(); onSave(user.id, form); };

  const handleChange = (key: keyof UpdateUsuarioDto, value: any) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (error) clearError();
  };

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={onClose} />


      <div className="relative w-full" style={{ maxWidth: 560 }}>
        <div className="bg-surface rounded-2xl border border-outline-variant shadow-modal flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-lg py-md bg-primary shrink-0">
            <h2 className="text-title-md font-semibold text-white">Editar Empleado</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>
          </div>

          {/* Body */}
          <form id="edit-employee-form" onSubmit={handleSubmit} className="p-lg flex flex-col gap-md overflow-y-auto">

            {/* Avatar */}
            <div className="flex items-center gap-md p-md bg-surface-container-low rounded-xl border border-outline-variant">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0">
                <span className="text-title-md font-bold text-on-primary-fixed">{getInitials(user)}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-body-sm font-semibold text-on-surface">{user.nombre} {user.apellido}</p>
                <p className="text-body-sm text-on-surface-variant truncate">{user.email}</p>
              </div>
            </div>

            {/* Nombre + Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-label-caps text-on-surface-variant">Nombre</label>
                <input
                  required
                  className="input-field"
                  value={form.nombre ?? ''}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-caps text-on-surface-variant">Apellido</label>
                <input
                  required
                  className="input-field"
                  value={form.apellido ?? ''}
                  onChange={(e) => handleChange('apellido', e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-label-caps text-on-surface-variant">Email</label>
              <input
                required
                type="email"
                className="input-field"
                value={form.email ?? ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="empleado@foodstore.com"
              />
            </div>

            {/* Celular */}
            <div className="flex flex-col gap-1">
              <label className="text-label-caps text-on-surface-variant">Celular</label>
              <input
                className="input-field"
                value={form.celular ?? ''}
                onChange={(e) => handleChange('celular', e.target.value)}
                placeholder="+54 9 11 1234-5678"
              />
            </div>

            {/* Rol */}
            <div className="flex flex-col gap-1">
              <label className="text-label-caps text-on-surface-variant">Rol</label>
              <select
                className="input-field"
                value={form.roles?.[0] ?? 'STOCK'}
                onChange={(e) => handleChange('roles', [e.target.value as IRole])}
              >
                <option value="ADMIN">Admin</option>
                <option value="STOCK">Stock</option>
                <option value="PEDIDOS">Cajero (Pedidos)</option>
              </select>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Cambiar el rol afecta los permisos de acceso de forma inmediata.
              </p>
            </div>

            {error && (
              <div className="mt-2 px-4 py-3 bg-error-container rounded-lg border border-error/20 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                <span className="material-symbols-outlined text-error flex-shrink-0" style={{ fontSize: 18 }}>error</span>
                <p className="text-body-sm text-on-error-container font-semibold">
                  {error.message || 'Error al actualizar empleado'}
                </p>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="border-t border-outline-variant px-lg py-md flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button
              type="submit"
              form="edit-employee-form"
              disabled={isLoading}
              className="btn-primary disabled:opacity-50"
            >
              {isLoading
                ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>
                : <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
              }
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Page 
export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'employees' | 'customers'>('employees');
  const [selectedRol, setSelectedRol] = useState<IRole | ''>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-users', selectedRol],
    queryFn: () => usersService.getAll(selectedRol || undefined),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-users'] });

  const createMutation = useMutation({
    mutationFn: usersService.create,
    onSuccess: () => { invalidate(); setCreateOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUsuarioDto }) =>
      usersService.update(id, data),
    onSuccess: () => { invalidate(); setEditUser(null); },
  });

  const reactivateMutation = useMutation({
    mutationFn: usersService.reactivar,
    onSuccess: () => { invalidate(); setConfirmAction(null); },
    onError: (e) => alert('Error al reactivar: ' + (e instanceof Error ? e.message : 'desconocido')),
  });

  const deleteMutation = useMutation({
    mutationFn: usersService.delete,
    onSuccess: () => { invalidate(); setConfirmAction(null); },
    onError: (e) => alert('Error al desactivar: ' + (e instanceof Error ? e.message : 'desconocido')),
  });

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'deactivate') deleteMutation.mutate(confirmAction.user.id);
    else reactivateMutation.mutate(confirmAction.user.id);
  };

  const employees = (data ?? []).filter(isEmployee);
  const clients = (data ?? []).filter(isClient);
  const activeEmployees = employees.filter((u) => !u.deleted_at);
  const inactiveEmployees = employees.filter((u) => !!u.deleted_at);
  const confirmLoading = deleteMutation.isPending || reactivateMutation.isPending;

  return (
    <div className="flex flex-col gap-lg animate-in fade-in duration-500">

      {/* Header */}
      <div>
        <h2 className="text-headline-lg font-bold text-on-surface">Gestión de Usuarios</h2>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Administrá el acceso del personal y visualizá la actividad de los clientes.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        <div className="kpi-card">
          <span className="material-symbols-outlined text-primary mb-xs">group</span>
          <span className="text-label-caps text-on-surface-variant">Total Usuarios</span>
          <span className="text-headline-lg font-bold text-on-surface">{data?.length ?? 0}</span>
        </div>
        <div className="kpi-card">
          <span className="material-symbols-outlined text-secondary mb-xs">badge</span>
          <span className="text-label-caps text-on-surface-variant">Empleados Activos</span>
          <span className="text-headline-lg font-bold text-on-surface">{activeEmployees.length}</span>
        </div>
        <div className={`kpi-card ${inactiveEmployees.length > 0 ? 'border-error/30' : ''}`}>
          <span className={`material-symbols-outlined mb-xs ${inactiveEmployees.length > 0 ? 'text-error' : 'text-on-surface-variant'}`}>
            person_off
          </span>
          <span className="text-label-caps text-on-surface-variant">Inactivos</span>
          <span className={`text-headline-lg font-bold ${inactiveEmployees.length > 0 ? 'text-error' : 'text-on-surface'}`}>
            {inactiveEmployees.length}
          </span>
        </div>
        <div className="kpi-card">
          <span className="material-symbols-outlined text-tertiary mb-xs">person</span>
          <span className="text-label-caps text-on-surface-variant">Clientes</span>
          <span className="text-headline-lg font-bold text-on-surface">{clients.length}</span>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-outline-variant gap-lg">
        {(['employees', 'customers'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-base text-title-md font-semibold transition-all relative ${tab === t
              ? 'text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary'
              : 'text-on-surface-variant hover:text-on-surface'
              }`}
          >
            {t === 'employees' ? 'Empleados' : 'Clientes'}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : tab === 'employees' ? (
        <div className="flex flex-col gap-md">
          <div className="flex justify-between items-center bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/50 shadow-sm">
            <div className="flex items-center gap-2 bg-surface px-3 py-2 rounded-xl border border-outline-variant focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 20 }}>filter_list</span>
              <select
                className="bg-transparent border-none outline-none text-body-sm text-on-surface font-semibold cursor-pointer w-[170px]"
                value={selectedRol}
                onChange={(e) => setSelectedRol(e.target.value as IRole | '')}
              >
                <option value="">Todos los Empleados</option>
                <option value="ADMIN">Administrador</option>
                <option value="STOCK">Stock</option>
                <option value="PEDIDOS">Cajero (Pedidos)</option>
              </select>
            </div>
            <button onClick={() => setCreateOpen(true)} className="btn-primary shadow-sm hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
              Añadir Empleado
            </button>
          </div>

          {employees.length === 0 ? (
            <EmptyState message="No hay empleados registrados." />
          ) : (
            <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    <th className="table-th">Nombre</th>
                    <th className="table-th">Rol</th>
                    <th className="table-th">Email</th>
                    <th className="table-th">Estado</th>
                    <th className="table-th text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {employees.map((u) => {
                    const inactive = !!u.deleted_at;
                    return (
                      <tr
                        key={u.id}
                        className={`group transition-colors ${inactive
                          ? 'opacity-60 bg-surface-container-lowest/50'
                          : 'hover:bg-surface-container-lowest'
                          }`}
                      >
                        {/* Nombre con avatar */}
                        <td className="table-td">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border border-outline-variant ${inactive ? 'bg-surface-container' : 'bg-primary-fixed'
                              }`}>
                              <span className={`text-label-caps font-bold ${inactive ? 'text-on-surface-variant' : 'text-on-primary-fixed'
                                }`}>{getInitials(u)}</span>
                            </div>
                            <p className="text-body-sm font-semibold text-on-surface">
                              {u.nombre} {u.apellido}
                            </p>
                          </div>
                        </td>

                        {/* Roles */}
                        <td className="table-td">
                          <div className="flex flex-wrap gap-1">
                            {u.roles.filter((r) => EMPLOYEE_ROLES.includes(r)).map((r) => (
                              <span key={r} className={`status-badge ${ROL_BADGE[r]}`}>{ROL_LABEL[r]}</span>
                            ))}
                          </div>
                        </td>

                        {/* Email */}
                        <td className="table-td">
                          <span className="text-body-sm text-on-surface-variant">{u.email}</span>
                        </td>

                        {/* Estado */}
                        <td className="table-td">
                          {inactive ? (
                            <span className="status-badge bg-error-container/60 text-on-error-container">Inactivo</span>
                          ) : (
                            <span className="status-badge bg-[#cce5ff] text-[#001e31]">Activo</span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="table-td text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {inactive ? (
                              <button
                                onClick={() => setConfirmAction({ type: 'reactivate', user: u })}
                                className="btn-icon hover:bg-secondary-container text-secondary"
                                title="Reactivar cuenta"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person_check</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditUser(u)}
                                  className="btn-icon hover:bg-surface-container text-on-surface-variant"
                                  title="Editar empleado"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>edit</span>
                                </button>
                                <button
                                  onClick={() => setConfirmAction({ type: 'deactivate', user: u })}
                                  className="btn-icon hover:bg-error-container/30 text-error"
                                  title="Desactivar cuenta"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person_off</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Tabla clientes */
        <div className="flex flex-col gap-md">
          {clients.length === 0 ? (
            <EmptyState message="No hay clientes registrados." />
          ) : (
            <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    <th className="table-th">Nombre</th>
                    <th className="table-th">Email</th>
                    <th className="table-th">Fecha Registro</th>
                    <th className="table-th">Celular</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {clients.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 border border-outline-variant">
                            <span className="text-label-caps font-bold text-on-surface-variant">{getInitials(u)}</span>
                          </div>
                          <p className="text-body-sm font-semibold text-on-surface">
                            {u.nombre} {u.apellido}
                          </p>
                        </div>
                      </td>
                      <td className="table-td">
                        <span className="text-body-sm text-on-surface-variant">{u.email}</span>
                      </td>
                      <td className="table-td">
                        <span className="text-body-sm text-on-surface">
                          {new Date(u.created_at).toLocaleDateString('es-AR')}
                        </span>
                      </td>
                      <td className="table-td">
                        <span className="text-body-sm text-on-surface-variant">{u.celular || '—'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <CreateEmployeeModal
        isOpen={createOpen}
        onClose={() => { setCreateOpen(false); createMutation.reset(); }}
        onSave={(d) => createMutation.mutate(d)}
        isLoading={createMutation.isPending}
        error={createMutation.error}
        clearError={createMutation.reset}
      />

      <EditEmployeeModal
        user={editUser}
        onClose={() => { setEditUser(null); updateMutation.reset(); }}
        onSave={(id, d) => updateMutation.mutate({ id, data: d })}
        isLoading={updateMutation.isPending}
        error={updateMutation.error}
        clearError={updateMutation.reset}
      />

      <ConfirmModal
        action={confirmAction}
        onConfirm={handleConfirm}
        onClose={() => setConfirmAction(null)}
        isLoading={confirmLoading}
      />
    </div>
  );
};
