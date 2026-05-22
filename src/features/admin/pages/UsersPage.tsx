import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/users';
import { LoadingState, ErrorState, EmptyState } from '../../../shared/ui/States';
import type { Usuario, CreateUsuarioDto } from '../types/usuario';
import type { IRole } from '../../../shared/types/auth.types';

const EMPLOYEE_ROLES: IRole[] = ['ADMIN', 'STOCK', 'PEDIDOS'];
const CLIENT_ROLES:   IRole[] = ['CLIENT'];

const isEmployee = (u: Usuario) => u.roles.some((r) => EMPLOYEE_ROLES.includes(r));
const isClient   = (u: Usuario) => u.roles.includes('CLIENT') && !isEmployee(u);

const ROL_LABEL: Record<IRole, string> = {
  ADMIN:   'Admin',
  STOCK:   'Stock',
  PEDIDOS: 'Cajero',
  CLIENT:  'Cliente',
};

const ROL_BADGE: Record<IRole, string> = {
  ADMIN:   'bg-primary-fixed text-on-primary-fixed',
  STOCK:   'bg-[#cce5ff] text-[#001e31]',
  PEDIDOS: 'bg-secondary-container text-on-secondary-container',
  CLIENT:  'bg-surface-container text-on-surface-variant',
};

function getInitials(u: Usuario) {
  return `${u.nombre.charAt(0)}${u.apellido.charAt(0)}`.toUpperCase();
}

const CreateEmployeeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (d: CreateUsuarioDto) => void;
  isLoading: boolean;
}> = ({ isOpen, onClose, onSave, isLoading }) => {
  const [form, setForm] = useState<CreateUsuarioDto>({
    nombre: '', apellido: '', email: '', password: '', celular: '', roles: ['STOCK'],
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const set = (key: keyof CreateUsuarioDto, val: string | IRole[]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-modal w-full max-w-md border border-outline-variant animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-md border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person_add</span>
            <h2 className="text-title-md font-semibold text-on-surface">Nuevo Empleado</h2>
          </div>
          <button onClick={onClose} className="btn-icon text-on-surface-variant">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-md flex flex-col gap-md">
          <div className="grid grid-cols-2 gap-gutter">
            <div className="flex flex-col gap-1">
              <label className="text-label-caps text-on-surface-variant">Nombre</label>
              <input required className="input-field" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Juan" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-label-caps text-on-surface-variant">Apellido</label>
              <input required className="input-field" value={form.apellido} onChange={(e) => set('apellido', e.target.value)} placeholder="García" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-label-caps text-on-surface-variant">Email</label>
            <input required type="email" className="input-field" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="juan@foodstore.com" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-label-caps text-on-surface-variant">Contraseña</label>
            <input required type="password" className="input-field" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••••" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-label-caps text-on-surface-variant">Rol</label>
            <select
              className="input-field"
              value={form.roles[0]}
              onChange={(e) => set('roles', [e.target.value as IRole])}
            >
              <option value="ADMIN">Admin</option>
              <option value="STOCK">Stock</option>
              <option value="PEDIDOS">Cajero (Pedidos)</option>
            </select>
          </div>

          <div className="flex justify-end gap-gutter mt-sm">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isLoading} className="btn-primary disabled:opacity-50">
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
              )}
              Crear Empleado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'employees' | 'customers'>('employees');
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: usersService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: usersService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setModalOpen(false); },
    onError: (e) => alert('Error: ' + (e instanceof Error ? e.message : 'desconocido')),
  });

  const deleteMutation = useMutation({
    mutationFn: usersService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
    onError: (e) => alert('Error al eliminar: ' + (e instanceof Error ? e.message : 'desconocido')),
  });

  const handleDelete = (id: number, nombre: string) => {
    if (window.confirm(`¿Eliminar a ${nombre}?`)) deleteMutation.mutate(id);
  };

  const employees = (data ?? []).filter(isEmployee);
  const clients   = (data ?? []).filter(isClient);

  return (
    <div className="flex flex-col gap-lg animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Gestión de Usuarios</h2>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Administrá el acceso del personal y visualizá la actividad de los clientes.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-gutter">
        <div className="kpi-card">
          <span className="material-symbols-outlined text-primary mb-xs">group</span>
          <span className="text-label-caps text-on-surface-variant">Total Usuarios</span>
          <span className="text-headline-lg font-bold text-on-surface">{data?.length ?? 0}</span>
        </div>
        <div className="kpi-card">
          <span className="material-symbols-outlined text-secondary mb-xs">badge</span>
          <span className="text-label-caps text-on-surface-variant">Empleados</span>
          <span className="text-headline-lg font-bold text-on-surface">{employees.length}</span>
        </div>
        <div className="kpi-card">
          <span className="material-symbols-outlined text-tertiary mb-xs">person</span>
          <span className="text-label-caps text-on-surface-variant">Clientes</span>
          <span className="text-headline-lg font-bold text-on-surface">{clients.length}</span>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-outline-variant gap-lg">
        <button
          onClick={() => setTab('employees')}
          className={`pb-base text-title-md font-semibold transition-all relative ${
            tab === 'employees'
              ? 'text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Empleados
        </button>
        <button
          onClick={() => setTab('customers')}
          className={`pb-base text-title-md font-semibold transition-all relative ${
            tab === 'customers'
              ? 'text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Clientes
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : tab === 'employees' ? (
        <div className="flex flex-col gap-md">
          {/* Action bar */}
          <div className="flex justify-end">
            <button onClick={() => setModalOpen(true)} className="btn-primary">
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
                  {employees.map((u) => (
                    <tr key={u.id} className="group hover:bg-surface-container-lowest transition-colors">
                      {/* Nombre con avatar */}
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0 border border-outline-variant">
                            <span className="text-label-caps font-bold text-on-primary-fixed">{getInitials(u)}</span>
                          </div>
                          <p className="text-body-sm font-semibold text-on-surface">
                            {u.nombre} {u.apellido}
                          </p>
                        </div>
                      </td>

                      {/* Rol(es) */}
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
                        {u.deleted_at ? (
                          <span className="status-badge bg-surface-container-highest text-on-surface-variant">Inactivo</span>
                        ) : (
                          <span className="status-badge bg-[#cce5ff] text-[#001e31]">Activo</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="table-td text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDelete(u.id, `${u.nombre} ${u.apellido}`)}
                            className="btn-icon hover:bg-error-container/30 text-error"
                            title="Eliminar"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Customers tab */
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
                    <th className="table-th text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {clients.map((u) => (
                    <tr key={u.id} className="group hover:bg-surface-container-lowest transition-colors">
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
                      <td className="table-td text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDelete(u.id, `${u.nombre} ${u.apellido}`)}
                            className="btn-icon hover:bg-error-container/30 text-error"
                            title="Eliminar"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Employee Modal */}
      <CreateEmployeeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(d) => createMutation.mutate(d)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
};
