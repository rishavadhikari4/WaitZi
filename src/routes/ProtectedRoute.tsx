import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import LogoLoader from '../components/ui/LogoLoader';
import useAuth from '../hooks/useAuth';
import { canAny, type Permission } from '../utils/permissions';

/**
 * Signed-in staff only. With `perms`, the user needs at least one of them
 * (the server enforces the same permissions on the API).
 */
export default function ProtectedRoute({ perms, children }: { perms?: Permission[]; children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LogoLoader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (perms && !canAny(user, perms)) return <Navigate to="/unauthorized" replace />;

  return children;
}
