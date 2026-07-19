import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LogoLoader from '../components/ui/LogoLoader';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LogoLoader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role?.name)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
