import { http } from './axios';

export const forgotPassword = (email: string) => http.post<undefined>('/auth/forgot-password', { email });

export const resetPassword = (data: { token: string; newPassword: string; confirmPassword: string }) =>
  http.post<undefined>('/auth/reset-password', data);

export const changePassword = (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
  http.post<undefined>('/auth/change-password', data);

export const validateResetToken = (token: string) =>
  http.get<{ email: string; expiresAt: string; timeRemaining: number }>(`/auth/reset-password/${token}`);

export const generateTempPassword = (userId: string) =>
  http.post<{ temporaryPassword: string; email: string; mustChangePassword: boolean }>(`/client/users/${userId}/reset-password`);
