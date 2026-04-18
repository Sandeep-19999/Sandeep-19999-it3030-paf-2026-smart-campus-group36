import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="page-center">Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}
