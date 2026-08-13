import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Star } from 'lucide-react';

const LandingFooter = () => {
  return (
    <footer className="bg-[#0F2B23] text-[#A3C2B6] pt-16 pb-12 border-t border-[#1D4A3D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="p-2 bg-[#173D32] border border-[#2F6654] rounded-xl text-[#C9A24A]">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-extrabold text-white tracking-tight">
                Store<span className="text-[#C9A24A]">Rate</span>
              </span>
            </Link>
            <p className="text-xs text-[#D0E2DB] leading-relaxed">
              Discover. Evaluate. Rate.
            </p>
            <p className="text-[11px] text-[#A3C2B6]">
              The community platform for authentic business ratings and reputation telemetry.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Product</h4>
            <ul className="space-y-2 text-[#D0E2DB]">
              <li>
                <a href="#discover" className="hover:text-[#C9A24A] transition-colors">
                  Discover Stores
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#C9A24A] transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Business Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">For Businesses</h4>
            <ul className="space-y-2 text-[#D0E2DB]">
              <li>
                <a href="#for-businesses" className="hover:text-[#C9A24A] transition-colors">
                  Store Owner Portal
                </a>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#C9A24A] transition-colors">
                  Register Your Store
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Account Access</h4>
            <ul className="space-y-2 text-[#D0E2DB]">
              <li>
                <Link to="/login" className="hover:text-[#C9A24A] transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#C9A24A] transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Rights */}
        <div className="pt-8 border-t border-[#1D4A3D] flex flex-col sm:flex-row items-center justify-between text-xs text-[#A3C2B6] space-y-3 sm:space-y-0">
          <p>© 2026 StoreRate. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-[11px]">
            <span className="hover:text-white cursor-pointer">Privacy</span>
            <span className="hover:text-white cursor-pointer">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
