import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F0D] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-brand-green border-t-transparent animate-spin"></div>
          <span className="text-xs tracking-widest uppercase text-text-secondary font-bold">Authenticating MechX Session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to permitted dashboard based on actual role
    switch (user.role) {
      case 'ADMIN': return <Navigate to="/admin" replace />;
      case 'SERVICE_CENTER_MANAGER': return <Navigate to="/manager" replace />;
      case 'MECHANIC': return <Navigate to="/mechanic" replace />;
      default: return <Navigate to="/customer" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
