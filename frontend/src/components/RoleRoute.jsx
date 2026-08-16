import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, RefreshCw, Compass } from 'lucide-react';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F6F1] flex flex-col items-center justify-center p-6 text-[#707873] space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#173D32]" />
        <span className="text-xs font-medium">Verifying role authorization...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // ProtectedRoute will handle redirect
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#F7F6F1] text-[#171A18] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white border border-[#E2E5DF] rounded-2xl p-8 space-y-5 shadow-xs">
          <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-[#9B2C2C] rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-[#9B2C2C] uppercase tracking-widest bg-rose-100/60 px-3.5 py-1.5 rounded-full inline-block border border-rose-200">
              403 - ACCESS FORBIDDEN
            </span>
            <h2 className="font-display text-xl font-bold text-[#171A18]">Restricted Role Resource</h2>
            <p className="text-xs text-[#707873]">
              Your account role (<span className="text-[#173D32] font-bold">{user.role}</span>) does not have permission to access this portal page.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/stores"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white text-xs font-extrabold rounded-xl transition-colors shadow-xs"
            >
              <Compass className="w-4 h-4 text-[#C9A24A]" />
              <span>Back to Store Discovery</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleRoute;
