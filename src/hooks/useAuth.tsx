
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth as useAuthContext } from '@/context/AuthContext';

type ProtectedRouteOptions = {
  requiredRole?: 'issuer' | 'officer' | null;
  redirectTo?: string;
};

export const useAuth = () => {
  return useAuthContext();
};

export const useProtectedRoute = (options: ProtectedRouteOptions = {}) => {
  const { requiredRole = null, redirectTo = '/' } = options;
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo);
      return;
    }

    if (!isLoading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
      navigate(redirectTo);
      return;
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo, requiredRole, user?.role]);

  return { user, isAuthenticated, isLoading };
};
