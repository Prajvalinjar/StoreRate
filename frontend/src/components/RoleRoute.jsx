import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying role authorization...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // ProtectedRoute will handle redirect
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">403 - Access Forbidden</h2>
          <p className="text-sm text-slate-400">
            Your role (<span className="text-indigo-400 font-semibold">{user.role}</span>) does not have permission to view this resource.
          </p>
          <div className="pt-2">
            <p className="text-xs text-slate-500">Allowed Roles: {allowedRoles.join(', ')}</p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleRoute;
