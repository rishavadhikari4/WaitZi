import { clearAccessToken } from '../api/axios';

// Authentication utility functions
export const clearAuthenticationData = () => {
  // Clear in-memory access token
  clearAccessToken();

  // Clear all authentication-related cookies
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });

  // Clear storage
  const authKeys = ['user', 'token', 'refreshToken', 'auth'];
  authKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

export const handleAuthenticationError = (error) => {
  console.error('Authentication error:', error);
  clearAuthenticationData();

  // Don't redirect if on public ordering pages or already on login
  const isPublicPage = window.location.pathname.startsWith('/order/');
  if (!isPublicPage && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};
