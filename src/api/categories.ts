import type { Category } from '../types/api';

import { http, multipart } from './axios';

export const getCategories = (params?: Record<string, unknown>) => http.get<Category[]>('/client/categories', { params });

export const getCategory = (id: string) => http.get<Category>(`/client/categories/${id}`);

export const createCategory = (formData: FormData) => http.post<Category>('/client/categories', formData, multipart);

export const updateCategory = (id: string, formData: FormData) => http.put<Category>(`/client/categories/${id}`, formData, multipart);

export const deleteCategory = (id: string) => http.delete<{ deletedCategory: { id: string; name: string } }>(`/client/categories/${id}`);
