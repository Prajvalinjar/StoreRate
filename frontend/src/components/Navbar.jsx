import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, LogOut, KeyRound, User as UserIcon, Shield, Star, Compass, ChevronDown, Award, Menu, X, ArrowRight, Layers, BarChart3, Users } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        setMobileMenuOpen(false);
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
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setMenuOpen(false);
    setMobileMenuOpen(false);
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

  return (
    <nav className="bg-[#173D32] border-b border-[#123027] sticky top-0 z-50 shadow-xs text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left: Brand Identity Logo */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="relative p-2 bg-[#2F6654] border border-[#3E7D69] rounded-xl text-[#C9A24A]">
                <Store className="w-5 h-5 text-white" />
                <Star className="w-2.5 h-2.5 text-[#C9A24A] fill-[#C9A24A] absolute -top-0.5 -right-0.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-none">
                  Store<span className="text-[#C9A24A]">Rate</span>
                </span>
                <span className="text-[9px] font-bold text-[#A3C2B6] uppercase tracking-widest mt-0.5">
                  REPUTATION PLATFORM
                </span>
              </div>
            </Link>

            {/* Desktop Center Navigation Links */}
            <div className="hidden lg:flex items-center space-x-6 text-xs font-semibold text-[#D0E2DB]">
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <Link to="/stores" className="hover:text-white transition-colors">
                Explore Stores
              </Link>

              {/* Role-Specific Navigation Links */}
              {!isAuthenticated ? (
                <>
                  <Link to="/stores?category=All" className="hover:text-white transition-colors">
                    Categories
                  </Link>
                  <a href="/#how-it-works" className="hover:text-white transition-colors">
                    How It Works
                  </a>
                  <a href="/#about" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </>
              ) : user?.role === 'USER' ? (
                <>
                  <Link to="/stores" className="hover:text-white transition-colors">
                    Categories
                  </Link>
                  <Link to="/user/ratings" className="hover:text-white transition-colors flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 text-[#C9A24A] fill-[#C9A24A]" />
                    <span>My Ratings</span>
                  </Link>
                </>
              ) : user?.role === 'STORE_OWNER' ? (
                <>
                  <Link to="/owner" className="hover:text-white transition-colors flex items-center space-x-1">
                    <Store className="w-3.5 h-3.5 text-[#C9A24A]" />
                    <span>My Store</span>
                  </Link>
                  <Link to="/owner" className="hover:text-white transition-colors flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5 text-[#C9A24A]" />
                    <span>Ratings</span>
                  </Link>
                  <Link to="/owner" className="hover:text-white transition-colors flex items-center space-x-1">
                    <BarChart3 className="w-3.5 h-3.5 text-[#C9A24A]" />
                    <span>Analytics</span>
                  </Link>
                </>
              ) : user?.role === 'ADMIN' ? (
                <>
                  <Link to="/admin" className="hover:text-white transition-colors flex items-center space-x-1">
                    <Shield className="w-3.5 h-3.5 text-[#C9A24A]" />
                    <span>Overview</span>
                  </Link>
                  <Link to="/admin/users" className="hover:text-white transition-colors flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-[#C9A24A]" />
                    <span>Users</span>
                  </Link>
                  <Link to="/admin/stores" className="hover:text-white transition-colors flex items-center space-x-1">
                    <Store className="w-3.5 h-3.5 text-[#C9A24A]" />
                    <span>Stores</span>
                  </Link>
                </>
              ) : null}
            </div>
          </div>

          {/* Right Action / Profile Dropdown */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center space-x-2.5 px-3 py-2 bg-[#235344] hover:bg-[#2F6654] border border-[#3E7D69] rounded-xl text-xs transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#C9A24A] cursor-pointer"
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
                    <span className="text-[10px] text-[#A3C2B6] font-medium uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#D0E2DB] transition-transform duration-150 ${menuOpen ? 'rotate-180 text-[#C9A24A]' : ''}`} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-64 sm:w-72 max-w-[calc(100vw-2rem)] bg-white border border-[#E2E5DF] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-[#E2E5DF] text-xs text-[#171A18]">
                    {/* Account Header */}
                    <div className="p-4 bg-[#F7F6F1] flex items-start space-x-3">
                      <div className="w-10 h-10 bg-[#173D32] text-white rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs">
                        {getInitials(user.name)}
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5 text-left">
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

                    {/* Role-Aware Navigation Links */}
                    <div className="py-1.5 text-left">
                      <Link
                        to={getProfilePath()}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-[#2D322E] hover:text-[#173D32] hover:bg-[#E7F0EB] transition-colors font-semibold text-xs"
                      >
                        <UserIcon className="w-4 h-4 text-[#707873] shrink-0" />
                        <span>My Profile</span>
                      </Link>

                      {user.role === 'USER' && (
                        <Link
                          to="/user/ratings"
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-[#2D322E] hover:text-[#173D32] hover:bg-[#E7F0EB] transition-colors font-semibold text-xs"
                        >
                          <Star className="w-4 h-4 text-[#C9A24A] fill-[#C9A24A] shrink-0" />
                          <span>Rating History</span>
                        </Link>
                      )}

                      {user.role === 'STORE_OWNER' && (
                        <Link
                          to="/owner"
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-[#2D322E] hover:text-[#173D32] hover:bg-[#E7F0EB] transition-colors font-semibold text-xs"
                        >
                          <Store className="w-4 h-4 text-[#C9A24A] shrink-0" />
                          <span>Store Management</span>
                        </Link>
                      )}

                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-[#2D322E] hover:text-[#173D32] hover:bg-[#E7F0EB] transition-colors font-semibold text-xs"
                        >
                          <Shield className="w-4 h-4 text-[#C9A24A] shrink-0" />
                          <span>Admin Console</span>
                        </Link>
                      )}

                      <Link
                        to="/change-password"
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-[#2D322E] hover:text-[#173D32] hover:bg-[#E7F0EB] transition-colors font-semibold text-xs"
                      >
                        <KeyRound className="w-4 h-4 text-[#707873] shrink-0" />
                        <span>Change Password</span>
                      </Link>
                    </div>

                    {/* Logout Option */}
                    <div className="py-1.5 text-left">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-[#9B2C2C] hover:bg-rose-50 transition-colors text-left font-semibold text-xs cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2 text-xs">
                <Link
                  to="/login"
                  className="text-[#D0E2DB] hover:text-white px-4 py-2 rounded-xl hover:bg-[#235344] transition-colors font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-[#C9A24A] hover:bg-[#B59039] text-[#173D32] font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Mobile Navigation Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#D0E2DB] hover:text-white focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#123027] border-b border-[#0F2B23] px-4 pt-3 pb-6 space-y-4 text-xs font-medium text-[#D0E2DB] text-left">
          <div className="flex flex-col space-y-2 pt-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 hover:bg-[#173D32] rounded-xl transition-colors font-semibold"
            >
              Home
            </Link>
            <Link
              to="/stores"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 hover:bg-[#173D32] rounded-xl transition-colors font-semibold"
            >
              Explore Stores
            </Link>

            {isAuthenticated && user?.role === 'USER' && (
              <Link
                to="/user/ratings"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 hover:bg-[#173D32] rounded-xl transition-colors font-semibold flex items-center space-x-2"
              >
                <Star className="w-4 h-4 text-[#C9A24A] fill-[#C9A24A]" />
                <span>My Ratings</span>
              </Link>
            )}

            {isAuthenticated && user?.role === 'STORE_OWNER' && (
              <Link
                to="/owner"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 hover:bg-[#173D32] rounded-xl transition-colors font-semibold flex items-center space-x-2"
              >
                <Store className="w-4 h-4 text-[#C9A24A]" />
                <span>My Store Dashboard</span>
              </Link>
            )}

            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 hover:bg-[#173D32] rounded-xl transition-colors font-semibold flex items-center space-x-2"
              >
                <Shield className="w-4 h-4 text-[#C9A24A]" />
                <span>Admin Operations Console</span>
              </Link>
            )}
          </div>

          <div className="pt-4 border-t border-[#1D4A3D] flex flex-col space-y-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-center px-4 py-3 bg-rose-900/40 text-rose-200 border border-rose-800 font-extrabold rounded-xl"
              >
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 bg-[#173D32] text-white font-semibold rounded-xl border border-[#2F6654]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-3 bg-[#C9A24A] text-[#173D32] font-extrabold rounded-xl"
                >
                  Get Started →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
