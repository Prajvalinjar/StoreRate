import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Store, Shield, User as UserIcon, Menu, X } from 'lucide-react';

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/admin', label: 'Console Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'User Operations', icon: Users },
    { to: '/admin/stores', label: 'Store Operations', icon: Store },
    { to: '/admin/profile', label: 'Admin Profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F7F6F1] flex flex-col md:flex-row text-[#171A18]">
      {/* Sidebar / Mobile Collapsible Header */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-[#E2E5DF] p-4 sm:p-5 shrink-0 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 px-3.5 py-2.5 bg-[#E7F0EB] border border-[#CDE0D5] rounded-xl text-[#173D32] flex-1 md:flex-none">
            <Shield className="w-4 h-4 text-[#173D32] shrink-0" />
            <span className="font-extrabold text-[11px] uppercase tracking-wider text-[#173D32]">Operations Console</span>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden ml-3 p-2 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl text-[#173D32] hover:bg-[#E7F0EB] transition-colors"
            aria-label="Toggle admin navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items (Visible on md+, or when mobileOpen on mobile) */}
        <nav className={`mt-4 md:mt-6 space-y-1.5 ${mobileOpen ? 'block' : 'hidden md:block'}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-[#173D32] text-white shadow-xs'
                      : 'text-[#707873] hover:text-[#171A18] hover:bg-[#F7F6F1]'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden text-left">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
