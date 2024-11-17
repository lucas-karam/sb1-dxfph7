import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermission?: keyof User['permissions'];
}

export function ProtectedRoute({ children, allowedRoles, requiredPermission }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermission && user && !user.permissions[requiredPermission]) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}