import type { ChooseOrganization, LoginResult, User } from '../types/api';

import { http } from './axios';

export const login = (credentials: { email: string; password: string; organizationId?: string }) =>
  http.post<LoginResult | ChooseOrganization>('/auth/login', credentials);

export const refreshToken = () => http.post<{ accessToken: string; refreshToken: string; expiresIn: string }>('/auth/refresh-token');

export const verifyToken = () => http.get<{ user: User; isNearExpiry: boolean }>('/auth/verify');

export const logout = () => http.post<undefined>('/auth/logout');
