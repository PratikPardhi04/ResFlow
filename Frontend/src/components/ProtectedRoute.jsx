import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute() {
  const { token, user, fetchUser, isLoading } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      fetchUser();
    }
  }, [token, user, fetchUser]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading && !user) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-accent">Loading...</div>;
  }

  return <Outlet />;
}
