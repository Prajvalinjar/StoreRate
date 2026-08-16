import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, User as UserIcon, LogOut, KeyRound, ChevronDown, Store, Shield, Star } from 'lucide-react';

const TopHeader = ({ setMobileOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const getPageInfo = () => {
    const path = location.pathname;
    if (path.startsWith('/user/stores') || path === '/user' || path === '/stores') {
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

  const getProfilePath = () => {
    if (user.role === 'ADMIN') return '/admin/profile';
    if (user.role === 'STORE_OWNER') return '/owner/profile';
    return '/user/profile';
  };

  return (
    <header className="bg-white border-b border-[#E2E5DF] sticky top-0 z-30 shadow-2xs text-[#171A18] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between h-20">
      {/* Left: Mobile Drawer Button & Page Context Header */}
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

      {/* Right: Notifications & User Profile Dropdown */}
      <div className="flex items-center space-x-3 shrink-0">
        {/* Notification Bell */}
        <button
          type="button"
          className="p-2 text-[#707873] hover:text-[#173D32] hover:bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl transition-colors relative cursor-pointer"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C9A24A] rounded-full ring-2 ring-white" />
        </button>

        {/* User Identity Pill with Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center space-x-2 bg-[#F7F6F1] hover:bg-[#E7F0EB] border border-[#E2E5DF] px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 bg-[#173D32] text-white rounded-lg flex items-center justify-center font-extrabold text-[10px] shrink-0">
              {getInitials(user.name)}
            </div>
            <span className="font-bold text-[#171A18] hidden sm:inline truncate max-w-[120px]" title={user.name}>
              {user.name}
            </span>
            <span className="text-[10px] font-extrabold text-[#C9A24A] uppercase bg-[#173D32] px-2 py-0.5 rounded text-white hidden md:inline">
              {user.role}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#707873] transition-transform duration-150 ${dropdownOpen ? 'rotate-180 text-[#173D32]' : ''}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E2E5DF] rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-[#E2E5DF] text-xs text-left">
              <div className="p-4 bg-[#F7F6F1]">
                <p className="font-bold text-[#171A18] text-xs truncate" title={user.name}>
                  {user.name}
                </p>
                <p className="text-[11px] text-[#707873] font-mono truncate" title={user.email}>
                  {user.email}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#E7F0EB] text-[#173D32] border border-[#CDE0D5]">
                  {user.role}
                </span>
              </div>

              <div className="py-1.5">
                <Link
                  to={getProfilePath()}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center space-x-2.5 px-4 py-2.5 text-[#171A18] hover:bg-[#E7F0EB] transition-colors font-semibold"
                >
                  <UserIcon className="w-4 h-4 text-[#707873]" />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/change-password"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center space-x-2.5 px-4 py-2.5 text-[#171A18] hover:bg-[#E7F0EB] transition-colors font-semibold"
                >
                  <KeyRound className="w-4 h-4 text-[#707873]" />
                  <span>Change Password</span>
                </Link>
              </div>

              <div className="py-1.5">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-rose-700 hover:bg-rose-50 transition-colors text-left font-bold cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
