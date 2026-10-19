import { clearAccessToken } from '../api/axios';

export const clearAuthenticationData = () => {
  clearAccessToken();

  document.cookie.split(';').forEach((c) => {
    document.cookie = c.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
  });

  for (const key of ['user', 'token', 'refreshToken', 'auth']) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
};

/** Guest pages and the landing page never bounce to /login. */
const isPublicPath = (path: string) => path === '/' || path.startsWith('/order/') || path.startsWith('/t/');

export const handleAuthenticationError = (error: unknown) => {
  console.error('Authentication error:', error);
  clearAuthenticationData();
  const path = window.location.pathname;
  if (!isPublicPath(path) && path !== '/login') window.location.href = '/login';
};
