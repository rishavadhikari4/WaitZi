import type { User } from '../types/api';

import { http, multipart } from './axios';

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  number: string;
  address: string;
  password: string;
  confirmPassword?: string;
  role: string;
}

export const getProfile = () => http.get<User>('/client/users/profile');

export const updateProfile = (formData: FormData) => http.put<User>('/client/users/profile', formData, multipart);

export const updatePassword = (id: string, data: { currentPassword: string; newPassword: string }) =>
  http.patch<undefined>(`/client/users/${id}/password`, data);

export const getAllUsers = (params?: Record<string, unknown>) => http.get<User[]>('/client/users', { params });

export const getUsersByRole = (roleId: string) => http.get<User[]>(`/client/users/role/${roleId}`);

export const getUser = (id: string) => http.get<User>(`/client/users/${id}`);

/** Staff accounts are created inside the current organization. */
export const createUser = (data: CreateUserInput) => http.post<User>('/client/users', data);

export const updateUser = (id: string, formData: FormData) => http.put<User>(`/client/users/${id}`, formData, multipart);

export const updateUserStatus = (id: string, data: { status: 'Active' | 'Inactive' }) => http.patch<User>(`/client/users/${id}/status`, data);

export const deleteUser = (id: string) =>
  http.delete<{ deletedUser: { id: string; name: string; email: string }; accountDeleted: boolean }>(`/client/users/${id}`);
