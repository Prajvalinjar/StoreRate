import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Star, Shield, Store, User as UserIcon, LogOut, Compass } from 'lucide-react';

const TopHeader = ({ setMobileOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const getPageInfo = () => {
    const path = location.pathname;
    if (path.startsWith('/user/stores') || path === '/user') {
      return { title: 'Explore Stores', subtitle: 'Find places people genuinely recommend.' };
    }
    if (path.startsWith('/user/ratings')) {
      return { title: 'My Rating History', subtitle: 'Review and manage your submitted business ratings.' };
    }
    if (path.startsWith('/user/profile')) {
      return { title: 'My Profile', subtitle: 'Manage your StoreRate account credentials & preferences.' };
    }
    if (path.startsWith('/owner/profile')) {
      return { title: 'Store Profile', subtitle: 'Manage business details, categories, and public information.' };
    }
    if (path.startsWith('/owner')) {
      return { title: 'Owner Dashboard', subtitle: 'Business overview and reputation performance.' };
    }
    if (path.startsWith('/admin/users')) {
      return { title: 'User Management', subtitle: 'Manage customer & store owner accounts across the platform.' };
    }
    if (path.startsWith('/admin/stores')) {
      return { title: 'Store Directory Management', subtitle: 'Audit and govern listed businesses.' };
    }
    if (path.startsWith('/admin/profile')) {
      return { title: 'Admin Profile', subtitle: 'System administrator account settings.' };
    }
    if (path.startsWith('/admin')) {
      return { title: 'Admin Operations Console', subtitle: 'Platform governance, pending approvals & moderation.' };
    }
    return { title: 'StoreRate Portal', subtitle: 'Reputation & discovery management.' };
  };

  const { title, subtitle } = getPageInfo();

  const getInitials = (name) => {
    if (!name) return 'SR';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-[#E2E5DF] sticky top-0 z-30 shadow-2xs text-[#171A18] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Context Title */}
      <div className="flex items-center space-x-3.5 min-w-0">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 text-[#707873] hover:text-[#171A18] hover:bg-[#F7F6F1] rounded-xl transition-colors shrink-0 cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 text-left">
          <h1 className="font-display text-lg sm:text-xl font-bold text-[#171A18] tracking-tight truncate">
            {title}
          </h1>
          <p className="text-xs text-[#707873] hidden sm:block truncate font-normal">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center space-x-3 shrink-0">
        <Link
          to="/stores"
          className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#E7F0EB] text-[#173D32] border border-[#CDE0D5] hover:bg-[#D8E6DE] text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-[#C9A24A]" />
          <span>Browse Stores</span>
        </Link>

        {/* User Mini Avatar Pill */}
        <div className="flex items-center space-x-2 bg-[#F7F6F1] border border-[#E2E5DF] px-3 py-1.5 rounded-xl text-xs">
          <div className="w-6 h-6 bg-[#173D32] text-white rounded-lg flex items-center justify-center font-extrabold text-[10px] shrink-0">
            {getInitials(user.name)}
          </div>
          <span className="font-bold text-[#171A18] hidden sm:inline truncate max-w-[100px]" title={user.name}>
            {user.name}
          </span>
          <span className="text-[10px] font-extrabold text-[#C9A24A] uppercase bg-[#173D32] px-2 py-0.5 rounded text-white">
            {user.role}
          </span>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
