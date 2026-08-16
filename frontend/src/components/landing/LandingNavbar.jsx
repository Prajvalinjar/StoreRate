import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Store, Star, Menu, X, ArrowRight } from 'lucide-react';

const LandingNavbar = () => {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-[#173D32] border-b border-[#123027] text-white sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Subtitle */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative p-2 bg-[#2F6654] border border-[#3E7D69] rounded-xl text-[#C9A24A]">
              <Store className="w-5 h-5 text-white" />
              <Star className="w-2.5 h-2.5 text-[#C9A24A] fill-[#C9A24A] absolute -top-0.5 -right-0.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-none">
                Store<span className="text-[#C9A24A]">Rate</span>
              </span>
              <span className="text-[9px] font-bold text-[#A3C2B6] uppercase tracking-widest mt-0.5">
                BUSINESS DISCOVERY & RATINGS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 text-xs font-semibold text-[#D0E2DB]">
            <Link to="/stores" className="hover:text-white transition-colors">
              Explore Stores
            </Link>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#for-businesses" className="hover:text-white transition-colors">
              For Businesses
            </a>
            <a href="#about" className="hover:text-white transition-colors">
              About Us
            </a>
          </div>

          {/* Right Action CTAs */}
          <div className="hidden md:flex items-center space-x-3 text-xs font-bold">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#C9A24A] hover:bg-[#B59039] text-[#173D32] font-extrabold rounded-xl transition-all shadow-xs"
              >
                <span>Go to Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-[#D0E2DB] hover:text-white font-semibold transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-[#C9A24A] hover:bg-[#B59039] text-[#173D32] font-extrabold rounded-xl transition-all shadow-xs"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#D0E2DB] hover:text-white focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#123027] border-b border-[#0F2B23] px-4 pt-3 pb-6 space-y-4 text-xs font-medium text-[#D0E2DB]">
          <div className="flex flex-col space-y-3 pt-2">
            <a
              href="#discover"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 hover:bg-[#173D32] rounded-lg transition-colors"
            >
              Discover Stores
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 hover:bg-[#173D32] rounded-lg transition-colors"
            >
              How It Works
            </a>
            <a
              href="#for-businesses"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 hover:bg-[#173D32] rounded-lg transition-colors"
            >
              For Businesses
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 hover:bg-[#173D32] rounded-lg transition-colors"
            >
              About Us
            </a>
          </div>

          <div className="pt-4 border-t border-[#1D4A3D] flex flex-col space-y-2">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-3 bg-[#C9A24A] text-[#173D32] font-extrabold rounded-xl"
              >
                Go to Portal →
              </Link>
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

export default LandingNavbar;
