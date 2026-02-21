import { createContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth';
import { setAccessToken, clearAccessToken } from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const isAuthenticated = !!user;

  const login = useCallback(async (email, password) => {
    const response = await authApi.login({ email, password });
    const { user: userData, accessToken, mustChangePassword: mustChange } = response.data;
    // Store access token in memory for Authorization header fallback
    if (accessToken) {
      setAccessToken(accessToken);
    }
    setUser(userData);
    setMustChangePassword(mustChange || false);
    return { user: userData, mustChangePassword: mustChange };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      clearAccessToken();
      setUser(null);
      setMustChangePassword(false);
      // Clear any cached authentication data
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    }
  }, []);

  const verifySession = useCallback(async () => {
    try {
      const verifyResponse = await authApi.verifyToken();
      setUser(verifyResponse.data.user || verifyResponse.data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    mustChangePassword,
    login,
    logout,
    setUser,
    setMustChangePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
