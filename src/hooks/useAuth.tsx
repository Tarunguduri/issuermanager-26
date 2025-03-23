
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth as useAuthContext } from '@/context/AuthContext';
import { UserRole } from '@/services/auth-service';

type ProtectedRouteOptions = {
  requiredRole?: UserRole;
  redirectTo?: string;
};

export const useAuth = () => {
  const context = useAuthContext();
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useProtectedRoute = (options: ProtectedRouteOptions = {}) => {
  const { requiredRole = null, redirectTo = '/' } = options;
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if the authentication state is stable (not loading)
    // and we're sure the user is not authenticated
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate(redirectTo);
      } else if (requiredRole && user?.role !== requiredRole) {
        navigate(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo, requiredRole, user?.role]);

  return { user, isAuthenticated, isLoading };
};
