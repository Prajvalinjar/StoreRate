import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Mail, Calendar, KeyRound, CheckCircle2 } from 'lucide-react';

const AdminProfilePage = () => {
  const { user } = useAuth();

  if (!user) return null;

  const getInitials = (name) => {
    if (!name) return 'SA';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'August 2026';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'August 2026';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 text-[#171A18] text-left">
      {/* Header Profile Identity */}
      <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5">
        <div className="w-16 h-16 bg-[#171A18] text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-xs border border-[#333835]">
          {getInitials(user.name)}
        </div>
        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-[#171A18] tracking-tight">{user.name}</h1>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold border border-[#333835] bg-[#171A18] text-white uppercase tracking-wide self-center sm:self-auto">
              ADMINISTRATOR
            </span>
          </div>
          <p className="text-xs text-[#707873] font-mono">{user.email}</p>
        </div>
      </div>

      {/* Information Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-[#E2E5DF] pb-3 flex items-center space-x-2">
            <User className="w-4 h-4 text-[#173D32]" />
            <h2 className="text-xs font-bold text-[#171A18] uppercase tracking-wider">Administrator Details</h2>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block mb-0.5">
                Full Name
              </span>
              <p className="font-bold text-[#171A18]">{user.name}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block mb-0.5">
                Email Address
              </span>
              <p className="font-mono text-[#171A18]">{user.email}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block mb-0.5">
                Role Authority
              </span>
              <p className="font-bold text-[#171A18]">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Account System Info */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-[#E2E5DF] pb-3 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-[#173D32]" />
            <h2 className="text-xs font-bold text-[#171A18] uppercase tracking-wider">System Status</h2>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block mb-0.5">
                Account Status
              </span>
              <div className="flex items-center space-x-1.5 text-[#173D32] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block mb-0.5">
                Member Since
              </span>
              <div className="flex items-center space-x-1.5 text-[#171A18]">
                <Calendar className="w-3.5 h-3.5 text-[#9CA59E]" />
                <span>Member since {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Security */}
      <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="border-b border-[#E2E5DF] pb-3 flex items-center space-x-2">
          <KeyRound className="w-4 h-4 text-[#173D32]" />
          <h2 className="text-xs font-bold text-[#171A18] uppercase tracking-wider">Account Security</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block mb-0.5">
              Password
            </span>
            <p className="font-mono text-[#707873]">••••••••••••</p>
          </div>

          <Link
            to="/change-password"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#F7F6F1] hover:bg-[#E7F0EB] text-[#173D32] font-bold rounded-xl text-xs transition-colors border border-[#E2E5DF] self-start sm:self-auto"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#173D32]" />
            <span>Change Password</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
