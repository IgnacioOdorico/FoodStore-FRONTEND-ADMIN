import type { IRole } from '../../../shared/types/auth.types';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  celular?: string | null;
  roles: IRole[];
  activo?: boolean;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CreateUsuarioDto {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  celular?: string;
  roles: IRole[];
}

export interface UpdateUsuarioDto {
  nombre?: string;
  apellido?: string;
  celular?: string;
}
