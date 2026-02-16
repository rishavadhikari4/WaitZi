import { createContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const isAuthenticated = !!user;

  const login = useCallback(async (email, password) => {
    const response = await authApi.login({ email, password });
    const { user: userData, mustChangePassword: mustChange } = response.data;
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
      setUser(null);
      setMustChangePassword(false);
      // Clear any cached authentication data
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    }
  }, []);

  const verifySession = useCallback(async () => {
    console.log('Verifying session...');
    try {
      const verifyResponse = await authApi.verifyToken();
      console.log('Session verification successful:', verifyResponse.data);
      setUser(verifyResponse.data.user || verifyResponse.data);
    } catch (error) {
      console.error('Session verification failed:', error.message, error.status);
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
