import type { Role } from '../types/api';

import { http } from './axios';

export const getAllRoles = () => http.get<Role[]>('/client/roles');

export const getRole = (id: string) => http.get<Role>(`/client/roles/${id}`);

export const getPermissionCatalog = () => http.get<{ key: string; description: string }[]>('/client/roles/permissions');

export const createRole = (data: { name: string; description?: string; permissions?: string[] }) => http.post<Role>('/client/roles', data);

export const updateRole = (id: string, data: { name?: string; description?: string; permissions?: string[] }) =>
  http.patch<Role>(`/client/roles/${id}`, data);

export const deleteRole = (id: string) => http.delete<{ deletedRole: { id: string; name: string } }>(`/client/roles/${id}`);
