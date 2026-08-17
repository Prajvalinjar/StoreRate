import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardMetrics, getPendingStores, approveStore, rejectStore } from '../api/adminService';
import { Users, Store, Star, ArrowRight, ShieldCheck, Activity, Award, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { formatStoreLocation } from '../utils/locationUtils';

const AdminDashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [pendingStores, setPendingStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Approval / Rejection Modal States
  const [approveModalStore, setApproveModalStore] = useState(null);
  const [rejectModalStore, setRejectModalStore] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsRes, pendingRes] = await Promise.all([
        getDashboardMetrics(),
        getPendingStores(),
      ]);
      if (metricsRes.status === 'success') {
        setMetrics(metricsRes.data);
      }
      if (pendingRes.status === 'success') {
        setPendingStores(pendingRes.data.stores || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleApprove = async () => {
    if (!approveModalStore) return;
    setActionLoading(true);
    setActionError('');
    try {
      const res = await approveStore(approveModalStore.id);
      if (res.status === 'success') {
        setApproveModalStore(null);
        await fetchDashboard();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve store.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModalStore) return;
    setActionLoading(true);
    setActionError('');
    try {
      const res = await rejectStore(rejectModalStore.id, rejectionReason.trim());
      if (res.status === 'success') {
        setRejectModalStore(null);
        setRejectionReason('');
        await fetchDashboard();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reject store.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

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
        <p className="text-xs text-[#707873]">Platform performance, store approvals, and operational metrics</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-[#9B2C2C] text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* KPI Operations Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-2">
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
            <p className="text-[11px] text-[#707873] mt-0.5 font-normal">Registered accounts</p>
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

        {/* Total Stores Breakdown */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider">TOTAL STORES</span>
            <div className="p-2 bg-[#E7F0EB] border border-[#CDE0D5] rounded-xl text-[#173D32]">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#173D32] tracking-tight">
              {loading ? <span className="animate-pulse">...</span> : metrics?.totalStores ?? 0}
            </div>
            <p className="text-[11px] text-[#707873] mt-0.5 font-normal">
              {metrics?.approvedStores ?? 0} Approved • {metrics?.pendingStores ?? 0} Pending
            </p>
          </div>
          <div className="pt-2 border-t border-[#E2E5DF] flex items-center justify-between text-[11px]">
            <span className="text-[#173D32] font-bold">✓ {metrics?.verifiedStores ?? 0} Verified</span>
            <span className="text-[#707873]">{metrics?.unverifiedStores ?? 0} Unverified</span>
          </div>
        </div>

        {/* Total Ratings & Written Reviews */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider">PLATFORM RATINGS</span>
            <div className="p-2 bg-[#F5E6C8] border border-[#E8D4A8] rounded-xl text-[#C9A24A]">
              <Star className="w-4 h-4 fill-[#C9A24A]" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#C9A24A] tracking-tight">
              {loading ? <span className="animate-pulse">...</span> : metrics?.totalRatings ?? 0}
            </div>
            <p className="text-[11px] text-[#707873] mt-0.5 font-normal">
              Global Platform Total ({metrics?.totalWrittenReviews ?? 0} written reviews)
            </p>
          </div>
          <div className="pt-2 border-t border-[#E2E5DF] flex items-center justify-between text-[11px]">
            <span className="text-[#707873] font-medium">Avg Score:</span>
            <span className="font-extrabold text-[#C9A24A]">{metrics?.platformAverageRating ?? '0.0'} ★</span>
          </div>
        </div>

        {/* Moderation Reports */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider">MODERATION REPORTS</span>
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-700 tracking-tight">
              {loading ? <span className="animate-pulse">...</span> : metrics?.totalReports ?? 0}
            </div>
            <p className="text-[11px] text-[#707873] mt-0.5 font-normal">
              {metrics?.pendingReportsCount ?? 0} Pending • {metrics?.resolvedReportsCount ?? 0} Resolved
            </p>
          </div>
          <div className="pt-2 border-t border-[#E2E5DF]">
            <Link
              to="/admin/reports"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#173D32] hover:underline"
            >
              <span>Review Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Category Analytics & City Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Analytics */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 shadow-xs space-y-4 text-left">
          <div className="border-b border-[#E2E5DF] pb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[#171A18] flex items-center space-x-2">
              <Award className="w-4 h-4 text-[#173D32]" />
              <span>Category Performance Breakdown</span>
            </h2>
            <span className="text-[11px] text-[#707873] font-mono">
              {metrics?.categoryAnalytics?.length ?? 0} active categories
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {metrics?.categoryAnalytics && metrics.categoryAnalytics.length > 0 ? (
              metrics.categoryAnalytics.map((cat) => (
                <div key={cat.name} className="p-3 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#171A18] text-sm block">{cat.name}</span>
                    <span className="text-[11px] text-[#707873]">
                      {cat.storeCount} {cat.storeCount === 1 ? 'store' : 'stores'} • {cat.totalRatings} {cat.totalRatings === 1 ? 'rating' : 'ratings'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-[#C9A24A] text-sm block">{cat.averageRating.toFixed(1)} ★</span>
                    <span className="text-[10px] text-[#707873]">Category Avg</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#707873] py-4 text-center">No category metrics available.</p>
            )}
          </div>
        </div>

        {/* City Analytics */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 shadow-xs space-y-4 text-left">
          <div className="border-b border-[#E2E5DF] pb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[#171A18] flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#173D32]" />
              <span>Geographic Distribution by City</span>
            </h2>
            <span className="text-[11px] text-[#707873] font-mono">
              {metrics?.cityAnalytics?.length ?? 0} locations
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {metrics?.cityAnalytics && metrics.cityAnalytics.length > 0 ? (
              metrics.cityAnalytics.map((c) => (
                <div key={c.name} className="p-3 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#171A18] text-sm block">{c.name}</span>
                    <span className="text-[11px] text-[#707873]">
                      {c.storeCount} {c.storeCount === 1 ? 'store' : 'stores'} • {c.totalRatings} {c.totalRatings === 1 ? 'rating' : 'ratings'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-[#173D32] text-sm block">{c.averageRating.toFixed(1)} ★</span>
                    <span className="text-[10px] text-[#707873]">Location Avg</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#707873] py-4 text-center">No city distribution metrics available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Pending Store Approvals Workflow Section */}
      <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 shadow-xs space-y-5">
        <div className="border-b border-[#E2E5DF] pb-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="font-display text-lg font-bold text-[#171A18] flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-700" />
              <span>Pending Store Approvals</span>
            </h2>
            <p className="text-xs text-[#707873]">Review owner store submissions before making them publicly discoverable.</p>
          </div>
          <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
            🟡 {pendingStores.length} {pendingStores.length === 1 ? 'Request' : 'Requests'}
          </span>
        </div>

        {pendingStores.length === 0 ? (
          <div className="p-8 text-center space-y-2 bg-[#F7F6F1] rounded-xl border border-[#E2E5DF]">
            <CheckCircle2 className="w-8 h-8 text-[#173D32] mx-auto" />
            <p className="font-display text-sm font-bold text-[#171A18]">All caught up!</p>
            <p className="text-xs text-[#707873]">There are currently no pending store submissions waiting for approval.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F6F1] border-b border-[#E2E5DF] text-[#707873] uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Store Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Owner</th>
                    <th className="py-3 px-4">Business Email</th>
                    <th className="py-3 px-4">Address</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E5DF] text-[#171A18]">
                  {pendingStores.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F7F6F1]/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#171A18]">{s.name}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold text-[#173D32] bg-[#E7F0EB] border border-[#CDE0D5] px-2.5 py-0.5 rounded-full">
                          {s.category || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#707873]">{s.owner?.name || 'Owner'}</td>
                      <td className="py-3 px-4 font-mono text-[#707873]">{s.email}</td>
                      <td className="py-3 px-4 text-[#707873] max-w-xs truncate">{s.address}</td>
                      <td className="py-3 px-4 text-[#707873] font-mono text-[11px]">{formatDate(s.createdAt)}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setApproveModalStore(s)}
                          className="px-3 py-1.5 bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold rounded-lg text-[11px] transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setRejectModalStore(s);
                            setRejectionReason('');
                          }}
                          className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-extrabold rounded-lg text-[11px] transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout for Pending Requests */}
            <div className="md:hidden space-y-3">
              {pendingStores.map((s) => (
                <div key={s.id} className="p-4 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-[#171A18] text-sm">{s.name}</h4>
                      <p className="text-[11px] text-[#707873]">Owner: {s.owner?.name || 'Owner'}</p>
                    </div>
                    <span className="text-[10px] font-mono text-[#707873]">{formatDate(s.createdAt)}</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-[#707873]">
                    <p><strong className="text-[#171A18]">Email:</strong> {s.email}</p>
                    <p><strong className="text-[#171A18]">Address:</strong> {s.address}</p>
                  </div>
                  <div className="flex space-x-2 pt-2 border-t border-[#E2E5DF]">
                    <button
                      onClick={() => setApproveModalStore(s)}
                      className="flex-1 py-2 bg-[#173D32] text-white font-extrabold rounded-lg text-xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setRejectModalStore(s);
                        setRejectionReason('');
                      }}
                      className="flex-1 py-2 bg-rose-50 border border-rose-200 text-rose-700 font-extrabold rounded-lg text-xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Role Distribution & Store Performance Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Role Distribution */}
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
              <span>Approved Store Performance</span>
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
                    <div className="flex items-center space-x-2">
                      <p className="font-display font-bold text-[#171A18] text-sm truncate">{store.name}</p>
                      <span className="px-2 py-0.5 bg-[#E7F0EB] text-[#173D32] border border-[#CDE0D5] text-[9px] font-bold rounded-md">
                        🟢 APPROVED
                      </span>
                    </div>
                    <p className="text-[11px] text-[#707873] truncate">{formatStoreLocation(store)}</p>
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
                No approved stores registered yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* APPROVE CONFIRMATION MODAL */}
      {approveModalStore && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E2E5DF] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-left">
            <div className="flex items-center space-x-3 text-[#173D32]">
              <div className="p-2 bg-[#E7F0EB] rounded-xl border border-[#CDE0D5]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-[#171A18]">Approve Store Listing?</h3>
                <p className="text-xs text-[#707873]">This will make the store publicly visible on StoreRate.</p>
              </div>
            </div>

            <div className="p-4 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl text-xs space-y-1">
              <p><strong className="text-[#171A18]">Store:</strong> {approveModalStore.name}</p>
              <p><strong className="text-[#171A18]">Email:</strong> {approveModalStore.email}</p>
              <p><strong className="text-[#171A18]">Address:</strong> {approveModalStore.address}</p>
            </div>

            {actionError && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                {actionError}
              </p>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setApproveModalStore(null)}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-[#F7F6F1] border border-[#E2E5DF] hover:bg-[#E2E5DF] text-[#171A18] font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {actionLoading ? 'Approving...' : 'Approve Store'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION MODAL */}
      {rejectModalStore && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E2E5DF] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-left">
            <div className="flex items-center space-x-3 text-rose-700">
              <div className="p-2 bg-rose-50 rounded-xl border border-rose-200">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-[#171A18]">Reject Store Listing?</h3>
                <p className="text-xs text-[#707873]">This store will NOT be listed on the public platform.</p>
              </div>
            </div>

            <div className="p-4 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl text-xs space-y-1">
              <p><strong className="text-[#171A18]">Store:</strong> {rejectModalStore.name}</p>
              <p><strong className="text-[#171A18]">Email:</strong> {rejectModalStore.email}</p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Business location details could not be verified."
                rows={3}
                className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl p-3 text-xs text-[#171A18] focus:outline-none focus:border-[#173D32]"
              />
            </div>

            {actionError && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                {actionError}
              </p>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setRejectModalStore(null)}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-[#F7F6F1] border border-[#E2E5DF] hover:bg-[#E2E5DF] text-[#171A18] font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Store'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
