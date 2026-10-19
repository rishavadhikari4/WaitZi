/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';

import * as authApi from '../api/auth';
import { clearAccessToken, setAccessToken } from '../api/axios';
import type { ChooseOrganization, User } from '../types/api';
import { reconnectSocket } from '../utils/socket';

export type LoginOutcome =
  | { kind: 'signed-in'; user: User; mustChangePassword: boolean }
  | { kind: 'choose-organization'; organizations: ChooseOrganization['organizations'] };

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mustChangePassword: boolean;
  /** Pass organizationId when the account works at more than one restaurant. */
  login: (email: string, password: string, organizationId?: string) => Promise<LoginOutcome>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setMustChangePassword: (value: boolean) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const login = useCallback(async (email: string, password: string, organizationId?: string): Promise<LoginOutcome> => {
    const response = await authApi.login({ email, password, ...(organizationId && { organizationId }) });
    const data = response.data;
    if ('requiresOrganization' in data) return { kind: 'choose-organization', organizations: data.organizations };

    if (data.accessToken) setAccessToken(data.accessToken);
    setUser(data.user);
    setMustChangePassword(data.mustChangePassword || false);
    // The socket connected before login as a guest; reconnect as this staff member.
    reconnectSocket();
    return { kind: 'signed-in', user: data.user, mustChangePassword: data.mustChangePassword };
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
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      reconnectSocket();
    }
  }, []);

  const verifySession = useCallback(async () => {
    try {
      const res = await authApi.verifyToken();
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void verifySession();
  }, [verifySession]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    mustChangePassword,
    login,
    logout,
    setUser,
    setMustChangePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
