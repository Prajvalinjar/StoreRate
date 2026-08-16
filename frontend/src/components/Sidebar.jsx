import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Store, Star, Compass, User as UserIcon, Shield, LayoutDashboard, 
  TrendingUp, CircleHelp, LogOut, ExternalLink, Users, Clock, ChevronRight
} from 'lucide-react';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'SR';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  // Exact single-active-state route matcher
  const isItemActive = (key) => {
    const path = location.pathname;
    const search = location.search;

    if (user.role === 'USER') {
      if (key === 'overview') return path === '/user/stores' || path === '/user';
      if (key === 'explore') return path === '/stores';
      if (key === 'ratings') return path === '/user/ratings';
      if (key === 'profile') return path === '/user/profile';
    }

    if (user.role === 'STORE_OWNER') {
      if (key === 'overview') return path === '/owner';
      if (key === 'store') return path === '/owner/profile';
      if (key === 'profile') return path === '/owner/profile';
    }

    if (user.role === 'ADMIN') {
      if (key === 'overview') return path === '/admin' && !search.includes('pending');
      if (key === 'users') return path.startsWith('/admin/users');
      if (key === 'stores') return path.startsWith('/admin/stores');
      if (key === 'approvals') return path === '/admin' && search.includes('pending');
      if (key === 'profile') return path === '/admin/profile';
    }

    return false;
  };

  const getNavItems = () => {
    switch (user.role) {
      case 'USER':
        return [
          { key: 'overview', label: 'Overview', path: '/user/stores', icon: LayoutDashboard },
          { key: 'explore', label: 'Explore Stores', path: '/stores', icon: Compass },
          { key: 'ratings', label: 'My Ratings', path: '/user/ratings', icon: Star },
          { key: 'profile', label: 'My Profile', path: '/user/profile', icon: UserIcon },
        ];
      case 'STORE_OWNER':
        return [
          { key: 'overview', label: 'Overview & Analytics', path: '/owner', icon: LayoutDashboard },
          { key: 'store', label: 'My Store Details', path: '/owner/profile', icon: Store },
          { key: 'profile', label: 'My Owner Profile', path: '/owner/profile', icon: UserIcon },
        ];
      case 'ADMIN':
        return [
          { key: 'overview', label: 'Overview', path: '/admin', icon: LayoutDashboard },
          { key: 'users', label: 'Users Management', path: '/admin/users', icon: Users },
          { key: 'stores', label: 'Stores Management', path: '/admin/stores', icon: Store },
          { key: 'approvals', label: 'Pending Approvals', path: '/admin?tab=pending', icon: Clock },
          { key: 'profile', label: 'Admin Profile', path: '/admin/profile', icon: UserIcon },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-[#173D32] border-r border-[#123027] text-white w-64 sm:w-72 shrink-0 p-5 select-none">
      <div className="space-y-6">
        {/* Brand Logo Header */}
        <Link to="/" className="flex items-center space-x-3 group pt-1">
          <div className="relative p-2 bg-[#2F6654] border border-[#3E7D69] rounded-xl text-[#C9A24A] shrink-0">
            <Store className="w-5 h-5 text-white" />
            <Star className="w-2.5 h-2.5 text-[#C9A24A] fill-[#C9A24A] absolute -top-0.5 -right-0.5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display text-xl font-extrabold text-white tracking-tight leading-none">
              Store<span className="text-[#C9A24A]">Rate</span>
            </span>
            <span className="text-[9px] font-bold text-[#A3C2B6] uppercase tracking-widest mt-0.5">
              REPUTATION PLATFORM
            </span>
          </div>
        </Link>

        {/* User Identity Card */}
        <div className="p-3.5 bg-[#235344]/80 border border-[#3E7D69] rounded-2xl flex items-center space-x-3 text-left">
          <div className="w-9 h-9 bg-[#C9A24A] text-[#173D32] rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-xs text-white truncate" title={user.name}>
              {user.name}
            </p>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-[#173D32] text-[#C9A24A] border border-[#2F6654]">
              {user.role}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="space-y-1 pt-2 text-left">
          <p className="text-[10px] font-extrabold text-[#A3C2B6] uppercase tracking-widest px-3 mb-2">
            MAIN NAVIGATION
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.key);
            return (
              <Link
                key={item.key}
                to={item.path}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  active
                    ? 'bg-[#2F6654] text-white border border-[#3E7D69] shadow-xs font-extrabold'
                    : 'text-[#D0E2DB] hover:text-white hover:bg-[#235344]/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#C9A24A]' : 'text-[#A3C2B6]'}`} />
                  <span>{item.label}</span>
                </div>
                {active && <ChevronRight className="w-3.5 h-3.5 text-[#C9A24A]" />}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Controls Anchored at Bottom */}
      <div className="space-y-2 pt-4 border-t border-[#123027] text-left">
        <Link
          to="/"
          onClick={() => setMobileOpen && setMobileOpen(false)}
          className="flex items-center space-x-3 px-3.5 py-2 text-xs font-semibold text-[#D0E2DB] hover:text-white hover:bg-[#235344]/60 rounded-xl transition-colors"
        >
          <CircleHelp className="w-4 h-4 text-[#A3C2B6] shrink-0" />
          <span>How It Works / Help</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 text-xs font-bold text-rose-300 hover:text-rose-100 hover:bg-rose-900/40 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-800"
        >
          <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed 100vh Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Out Drawer Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex-1 max-w-xs w-full bg-[#173D32] shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
