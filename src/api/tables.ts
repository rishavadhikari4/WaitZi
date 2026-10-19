import type { DiningTable, TableStatus } from '../types/api';

import { http } from './axios';

export interface TableInput {
  tableNumber?: number;
  capacity?: number;
  status?: TableStatus;
  assignedWaiter?: string | null;
  branchId?: string;
}

export const getAllTables = (params?: Record<string, unknown>) => http.get<DiningTable[]>('/client/tables', { params });

export const getTable = (id: string) => http.get<DiningTable>(`/client/tables/${id}`);

export const createTable = (data: TableInput) => http.post<DiningTable>('/client/tables', data);

export const updateTable = (id: string, data: TableInput) => http.put<DiningTable>(`/client/tables/${id}`, data);

export const updateTableStatus = (id: string, data: { status: TableStatus }) => http.patch<DiningTable>(`/client/tables/${id}/status`, data);

export const clearTable = (id: string) => http.patch<DiningTable>(`/client/tables/${id}/clear`);

export const deleteTable = (id: string) => http.delete<{ deletedTable: { id: string; tableNumber: number } }>(`/client/tables/${id}`);
