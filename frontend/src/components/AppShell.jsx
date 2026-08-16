import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

const AppShell = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F6F1] flex text-[#171A18] selection:bg-[#173D32] selection:text-white">
      {/* Role-Aware Left Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area with Top Header */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopHeader setMobileOpen={setMobileOpen} />
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
