import type { Availability, MenuItem } from '../types/api';

import { http, multipart } from './axios';

export const getAllMenuItems = (params?: Record<string, unknown>) => http.get<MenuItem[]>('/client/menu', { params });

export const getStaffMenuItem = (id: string) => http.get<MenuItem>(`/client/menu/${id}`);

export const createMenuItem = (formData: FormData) => http.post<MenuItem>('/client/menu', formData, multipart);

export const updateMenuItem = (id: string, formData: FormData) => http.put<MenuItem>(`/client/menu/${id}`, formData, multipart);

export const updateMenuAvailability = (id: string, availabilityStatus: Availability) =>
  http.patch<MenuItem>(`/client/menu/${id}/availability`, { availabilityStatus });

export const deleteMenuItem = (id: string) => http.delete<{ deletedItem: { id: string; name: string } }>(`/client/menu/${id}`);
