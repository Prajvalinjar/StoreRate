import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, LogOut, KeyRound, User as UserIcon, Shield, Star, Compass, ChevronDown, Award } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'SR';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-[#171A18] text-white border-[#333835]';
      case 'STORE_OWNER':
        return 'bg-[#F5E6C8] text-[#9A7525] border-[#E8D4A8]';
      case 'USER':
      default:
        return 'bg-[#E7F0EB] text-[#173D32] border-[#CDE0D5]';
    }
  };

  const getProfilePath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/profile';
    if (user.role === 'STORE_OWNER') return '/owner/profile';
    return '/user/profile';
  };

  const getHomeLink = () => {
    if (!isAuthenticated || !user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'USER') return '/user/stores';
    return '/owner';
  };

  return (
    <nav className="bg-[#173D32] border-b border-[#123027] sticky top-0 z-50 shadow-xs text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Identity & Contextual Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link to={getHomeLink()} className="flex items-center space-x-2.5 group">
              <div className="relative p-2 bg-[#2F6654] border border-[#3E7D69] rounded-lg text-[#C9A24A]">
                <Store className="w-5 h-5 text-white" />
                <Star className="w-2.5 h-2.5 text-[#C9A24A] fill-[#C9A24A] absolute -top-0.5 -right-0.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-extrabold text-white tracking-tight leading-none">
                  Store<span className="text-[#C9A24A]">Rate</span>
                </span>
                <span className="text-[9px] font-bold text-[#A3C2B6] uppercase tracking-widest mt-0.5">
                  REPUTATION PLATFORM
                </span>
              </div>
            </Link>

            {isAuthenticated && user && (
              <div className="hidden md:flex items-center space-x-1.5 text-xs font-semibold">
                {user.role === 'USER' && (
                  <>
                    <Link
                      to="/user/stores"
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                        location.pathname === '/user/stores'
                          ? 'text-white bg-[#2F6654] border border-[#3E7D69]'
                          : 'text-[#D0E2DB] hover:text-white hover:bg-[#235344]'
                      }`}
                    >
                      <Compass className="w-4 h-4 text-[#C9A24A]" />
                      <span>Discover Stores</span>
                    </Link>
                    <Link
                      to="/user/ratings"
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                        location.pathname === '/user/ratings'
                          ? 'text-white bg-[#2F6654] border border-[#3E7D69]'
                          : 'text-[#D0E2DB] hover:text-white hover:bg-[#235344]'
                      }`}
                    >
                      <Star className="w-4 h-4 text-[#C9A24A] fill-[#C9A24A]" />
                      <span>My Ratings</span>
                    </Link>
                  </>
                )}
                {user.role === 'STORE_OWNER' && (
                  <Link
                    to="/owner"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                      location.pathname === '/owner'
                        ? 'text-white bg-[#2F6654] border border-[#3E7D69]'
                        : 'text-[#D0E2DB] hover:text-white hover:bg-[#235344]'
                    }`}
                  >
                    <Award className="w-4 h-4 text-[#C9A24A]" />
                    <span>Reputation Dashboard</span>
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                      location.pathname.startsWith('/admin') && location.pathname !== '/admin/profile'
                        ? 'text-white bg-[#2F6654] border border-[#3E7D69]'
                        : 'text-[#D0E2DB] hover:text-white hover:bg-[#235344]'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-[#C9A24A]" />
                    <span>Operations Console</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right: Account Dropdown Menu */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center space-x-2.5 px-3 py-1.5 bg-[#235344] hover:bg-[#2F6654] border border-[#3E7D69] rounded-xl text-xs transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#C9A24A] cursor-pointer"
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                  aria-label="Account menu"
                >
                  <div className="w-7 h-7 bg-[#C9A24A] rounded-lg flex items-center justify-center font-extrabold text-[11px] text-[#173D32] shrink-0 shadow-xs">
                    {getInitials(user.name)}
                  </div>
                  <div className="flex flex-col text-left hidden sm:flex">
                    <span className="font-bold text-white truncate max-w-[120px]" title={user.name}>
                      {user.name}
                    </span>
                    <span className="text-[10px] text-[#A3C2B6] font-medium">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#D0E2DB] transition-transform duration-150 ${menuOpen ? 'rotate-180 text-[#C9A24A]' : ''}`} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-64 sm:w-72 max-w-[calc(100vw-2rem)] bg-white border border-[#E2E5DF] rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-[#E2E5DF] text-xs text-[#171A18]">
                    {/* Account Header */}
                    <div className="p-4 bg-[#F7F6F1] flex items-start space-x-3">
                      <div className="w-10 h-10 bg-[#173D32] text-white rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs">
                        {getInitials(user.name)}
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="font-bold text-[#171A18] text-xs truncate" title={user.name}>
                          {user.name}
                        </p>
                        <p className="text-[11px] text-[#707873] font-mono truncate" title={user.email}>
                          {user.email}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </div>

                    {/* Role-Aware Navigation Items */}
                    <div className="py-1.5">
                      {/* Mobile-Only Main Page Shortcuts */}
                      <div className="md:hidden border-b border-[#E2E5DF] pb-1.5 mb-1.5 space-y-0.5">
                        {user.role === 'USER' && (
                          <>
                            <Link
                              to="/user/stores"
                              className="flex items-center space-x-2.5 px-4 py-2.5 text-[#2D322E] hover:text-[#173D32] hover:bg-[#E7F0EB] transition-colors font-semibold text-xs"
                            >
                              <Compass className="w-4 h-4 text-[#C9A24A] shrink-0" />
                              <span>Discover Stores</span>
                            </Link>
                          </>
                        )}
                        {user.role === 'STORE_OWNER' && (
                          <Link
                            to="/owner"
                            className="flex items-center space-x-2.5 px-4 py-2.5 text-[#2D322E] hover:text-[#173D32] hover:bg-[#E7F0EB] transition-colors font-semibold text-xs"
                          >
                            <Award className="w-4 h-4 text-[#C9A24A] shrink-0" />
                            <span>Reputation Dashboard</span>
                          </Link>
                        )}
                        {user.role === 'ADMIN' && (
                          <Link
                            to="/admin"
                            className="flex items-center space-x-2.5 px-4 py-2.5 text-[#2D322E] hover:text-[#173D32] hover:bg-[#E7F0EB] transition-colors font-semibold text-xs"
                          >
                            <Shield className="w-4 h-4 text-[#C9A24A] shrink-0" />
                            <span>Operations Console</span>
                          </Link>
                        )}
                      </div>

                      <Link
                        to={getProfilePath()}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-[#2D322E] hover:text-[#173D32] hover:bg-[#E7F0EB] transition-colors font-medium text-xs"
                      >
                        <UserIcon className="w-4 h-4 text-[#707873] shrink-0" />
                        <span>Profile</span>
                      </Link>

                      {user.role === 'USER' && (
                        <Link
                          to="/user/ratings"
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-[#2D322E] hover:text-[#173D32] hover:bg-[#E7F0EB] transition-colors font-medium text-xs"
                        >
                          <Star className="w-4 h-4 text-[#C9A24A] fill-[#C9A24A] shrink-0" />
                          <span>My Ratings</span>
                        </Link>
                      )}

                      <Link
                        to="/change-password"
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-[#2D322E] hover:text-[#173D32] hover:bg-[#E7F0EB] transition-colors font-medium text-xs"
                      >
                        <KeyRound className="w-4 h-4 text-[#707873] shrink-0" />
                        <span>Change Password</span>
                      </Link>
                    </div>

                    {/* Account Action: Logout */}
                    <div className="py-1.5">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-[#9B2C2C] hover:bg-rose-50 transition-colors text-left font-semibold text-xs"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-xs">
                <Link
                  to="/login"
                  className="text-[#D0E2DB] hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#235344] transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-[#C9A24A] hover:bg-[#B59039] text-[#173D32] font-extrabold px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
