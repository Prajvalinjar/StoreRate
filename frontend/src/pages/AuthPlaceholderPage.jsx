import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, ShieldCheck, Mail, MapPin, KeyRound, LogOut, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthPlaceholderPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F7F6F1] text-[#171A18] p-6 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-white border border-[#E2E5DF] rounded-2xl p-8 sm:p-10 shadow-xs space-y-6 text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E5DF] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-[#E7F0EB] border border-[#CDE0D5] rounded-2xl text-[#173D32]">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-[#171A18]">Authenticated Session</h1>
              <p className="text-xs text-[#707873]">StoreRate User Account & Role Telemetry</p>
            </div>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#E7F0EB] text-[#173D32] border border-[#CDE0D5] space-x-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Session Active</span>
          </span>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#707873] flex items-center space-x-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#173D32]" />
              <span>Full Name</span>
            </p>
            <p className="text-base font-bold text-[#171A18] truncate">{user?.name}</p>
          </div>

          <div className="p-4 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#707873] flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#173D32]" />
              <span>Assigned Role</span>
            </p>
            <div className="flex items-center space-x-2 pt-0.5">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#E7F0EB] text-[#173D32] border border-[#CDE0D5] uppercase tracking-wide">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#707873] flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-[#9CA59E]" />
              <span>Email Address</span>
            </p>
            <p className="text-xs font-mono text-[#171A18] font-semibold truncate">{user?.email}</p>
          </div>

          <div className="p-4 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#707873] flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#9CA59E]" />
              <span>Address</span>
            </p>
            <p className="text-xs text-[#171A18] font-semibold truncate">{user?.address}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            to="/change-password"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#F7F6F1] hover:bg-[#E7F0EB] text-[#173D32] rounded-xl text-xs font-bold transition-colors border border-[#E2E5DF]"
          >
            <KeyRound className="w-4 h-4" />
            <span>Change Password</span>
          </Link>

          <button
            onClick={logout}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-[#9B2C2C] border border-rose-200 rounded-xl text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="text-center text-xs text-[#707873] pt-3 border-t border-[#E2E5DF]">
          StoreRate Platform • Business Discovery & Rating Telemetry
        </div>
      </div>
    </div>
  );
};

export default AuthPlaceholderPage;
