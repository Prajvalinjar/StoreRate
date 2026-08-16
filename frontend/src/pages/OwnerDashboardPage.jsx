import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOwnerDashboard, createOwnerStore } from '../api/ownerService';
import StarRating from '../components/StarRating';
import { Store, Star, Users, MapPin, Mail, AlertCircle, RefreshCw, Award, TrendingUp, Sparkles, CheckCircle2, Clock, XCircle, Send } from 'lucide-react';

const OwnerDashboardPage = () => {
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Form state for creating a store
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('General');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOwnerDashboard();
      if (response.status === 'success') {
        setStoreData(response.data.store);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load store owner dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !address.trim()) {
      setFormError('Please fill out store name, business email, address, and category.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      const response = await createOwnerStore({
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        category,
      });

      if (response.status === 'success') {
        setFormSuccess('Store listing submitted successfully! Awaiting administrator approval.');
        await fetchDashboard();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit store listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'CU';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#F7F6F1] flex flex-col items-center justify-center p-6 text-[#707873] space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#173D32]" />
        <p className="text-xs font-medium">Loading store reputation portal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-left">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-[#9B2C2C] text-xs sm:text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-left">
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-2 border-b border-[#E2E5DF] pb-5">
            <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block border border-[#CDE0D5]">
              STORE REGISTRATION WORKFLOW
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#171A18] tracking-tight">
              Submit Your Store Listing
            </h2>
            <p className="text-xs sm:text-sm text-[#707873]">
              Register your business details below. Store listings undergo administrator review before becoming publicly visible on StoreRate.
            </p>
          </div>

          {formError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-[#9B2C2C] text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[#173D32] text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleCreateStore} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider">
                Store / Business Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Electronics & Appliances"
                className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32] focus:ring-1 focus:ring-[#173D32]/20"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider">
                Business Contact Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@apexelectronics.com"
                className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32] focus:ring-1 focus:ring-[#173D32]/20"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider">
                Store Location / Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Commercial Street, Pune, Maharashtra"
                className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32] focus:ring-1 focus:ring-[#173D32]/20"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider">
                Store Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#171A18] focus:outline-none focus:border-[#173D32]"
                required
              >
                <option value="General">General</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Grocery">Grocery</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Beauty">Beauty</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Services">Services</option>
                <option value="Automotive">Automotive</option>
                <option value="Home & Furniture">Home & Furniture</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="pt-3 border-t border-[#E2E5DF]">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Store for Approval'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (storeData && storeData.ratings) {
    storeData.ratings.forEach((r) => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++;
      }
    });
  }

  const fiveStarPercentage = storeData.totalRatings > 0
    ? Math.round(((distribution[5] || 0) / storeData.totalRatings) * 100)
    : 0;

  const fourOrFiveStarPercent = storeData.totalRatings > 0
    ? Math.round((((distribution[5] || 0) + (distribution[4] || 0)) / storeData.totalRatings) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 text-[#171A18] text-left">
      {/* Approval Status Banner */}
      {storeData.status === 'PENDING' && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-900 shadow-xs">
          <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <span className="font-extrabold uppercase tracking-wider text-[10px] bg-amber-200/80 px-2.5 py-0.5 rounded-md inline-block text-amber-900">
              🟡 Pending Approval
            </span>
            <h3 className="font-bold text-sm text-amber-950">Store Listing Awaiting Administrator Review</h3>
            <p className="text-amber-800">
              Your store has been submitted and is currently waiting for administrator approval. Once approved, your listing will become publicly searchable on StoreRate.
            </p>
          </div>
        </div>
      )}

      {storeData.status === 'APPROVED' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-[#173D32] shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-[#173D32] shrink-0" />
          <div className="text-xs">
            <span className="font-extrabold uppercase tracking-wider text-[10px] bg-[#E7F0EB] px-2.5 py-0.5 rounded-md inline-block text-[#173D32]">
              🟢 Approved & Live
            </span>
            <span className="ml-2 font-medium">Your store is publicly listed on StoreRate and open for ratings.</span>
          </div>
        </div>
      )}

      {storeData.status === 'REJECTED' && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-[#9B2C2C] shadow-xs">
          <XCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <span className="font-extrabold uppercase tracking-wider text-[10px] bg-rose-200/80 px-2.5 py-0.5 rounded-md inline-block text-rose-900">
              🔴 Listing Rejected
            </span>
            <h3 className="font-bold text-sm text-rose-950">Store Listing Not Approved</h3>
            <p className="text-rose-800">
              Your store listing was not approved. {storeData.rejectionReason && <strong>Reason: {storeData.rejectionReason}</strong>}
            </p>
          </div>
        </div>
      )}

      {/* 1. Store Identity Header */}
      <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E5DF] pb-5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1 rounded-full inline-block border border-[#CDE0D5]">
                BUSINESS INTELLIGENCE PORTAL
              </span>
              <span className="text-[10px] font-extrabold text-[#C9A24A] uppercase tracking-widest bg-[#F5E6C8] px-3 py-1 rounded-full inline-block border border-[#E8D4A8]">
                🏪 {storeData.category || 'General'}
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#171A18] tracking-tight">{storeData.name}</h1>
            <p className="text-xs text-[#707873]">Monitor customer feedback telemetry and business reputation metrics.</p>
          </div>

          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#E7F0EB] border border-[#CDE0D5] text-[#173D32] rounded-xl text-xs font-extrabold shrink-0 self-start sm:self-auto">
            <Award className="w-4 h-4 text-[#C9A24A]" />
            <span>Reputation Management</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div className="flex items-center space-x-2 text-[#707873]">
            <Mail className="w-4 h-4 text-[#9CA59E] shrink-0" />
            <span className="font-mono text-[#171A18]">{storeData.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-[#707873]">
            <MapPin className="w-4 h-4 text-[#9CA59E] shrink-0" />
            <span className="truncate text-[#171A18]">{storeData.address}</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 pt-2 border-t border-[#E2E5DF] text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#173D32] text-white shadow-xs'
                : 'text-[#707873] hover:text-[#171A18] hover:bg-[#F7F6F1]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('ratings')}
            className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'ratings'
                ? 'bg-[#173D32] text-white shadow-xs'
                : 'text-[#707873] hover:text-[#171A18] hover:bg-[#F7F6F1]'
            }`}
          >
            Customer Ratings ({storeData.totalRatings})
          </button>
          <Link
            to="/owner/profile"
            className="px-4 py-2 rounded-xl text-[#707873] hover:text-[#171A18] hover:bg-[#F7F6F1] transition-colors"
          >
            Store Profile
          </Link>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Analytics (4 KPI Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Average Rating Block */}
            <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">
                AVERAGE RATING
              </span>
              <div className="flex items-baseline space-x-2.5 pt-1">
                {storeData.averageRating !== null && storeData.averageRating !== undefined ? (
                  <>
                    <span className="text-3xl font-black text-[#C9A24A] tracking-tight leading-none">
                      {Number(storeData.averageRating).toFixed(1)}
                    </span>
                    <div className="space-y-0.5">
                      <StarRating value={storeData.averageRating} readOnly size="sm" />
                      <span className="text-[10px] text-[#707873] block font-mono">5.0 benchmark</span>
                    </div>
                  </>
                ) : (
                  <span className="text-base font-semibold text-[#707873] italic">No ratings yet</span>
                )}
              </div>
            </div>

            {/* Total Ratings Block */}
            <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">
                TOTAL REVIEWS
              </span>
              <div className="flex items-baseline space-x-2 pt-1">
                <span className="text-3xl font-black text-[#171A18] tracking-tight leading-none">{storeData.totalRatings}</span>
                <span className="text-xs text-[#707873]">
                  {storeData.totalRatings === 1 ? 'submission' : 'submissions'}
                </span>
              </div>
            </div>

            {/* 5-Star Ratio Block */}
            <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">
                5-STAR RATINGS
              </span>
              <div className="flex items-baseline space-x-2 pt-1">
                <span className="text-3xl font-black text-[#173D32] tracking-tight leading-none">
                  {fiveStarPercentage}%
                </span>
                <span className="text-xs text-[#707873]">top score ratio</span>
              </div>
            </div>

            {/* High Rating Ratio (4-5 Star) */}
            <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">
                POSITIVE REVIEWS
              </span>
              <div className="flex items-baseline space-x-2 pt-1">
                <span className="text-3xl font-black text-[#173D32] tracking-tight leading-none">
                  {fourOrFiveStarPercent}%
                </span>
                <span className="text-xs text-[#707873]">4★ & 5★ score</span>
              </div>
            </div>
          </div>

          {/* Mathematically Verified Store Reputation Insights Card */}
          <div className="bg-[#E7F0EB] border border-[#CDE0D5] rounded-2xl p-6 shadow-xs space-y-3 text-left">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#C9A24A]" />
              <h2 className="font-display text-base font-bold text-[#171A18]">Store Reputation Telemetry</h2>
            </div>

            {storeData.totalRatings > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#173D32] pt-1">
                <div className="bg-white/80 p-3.5 rounded-xl border border-[#CDE0D5] space-y-1">
                  <p className="font-bold text-[#171A18]">Overall Rating Score</p>
                  <p className="text-[#707873]">
                    Your store maintains an average score of <strong className="text-[#C9A24A]">{Number(storeData.averageRating).toFixed(1)}/5.0</strong> from {storeData.totalRatings} customer submissions.
                  </p>
                </div>

                <div className="bg-white/80 p-3.5 rounded-xl border border-[#CDE0D5] space-y-1">
                  <p className="font-bold text-[#171A18]">Top Rating Performance</p>
                  <p className="text-[#707873]">
                    <strong className="text-[#173D32]">{fiveStarPercentage}%</strong> of all submitted reviews awarded your business a 5-star rating ({distribution[5]} ratings).
                  </p>
                </div>

                <div className="bg-white/80 p-3.5 rounded-xl border border-[#CDE0D5] space-y-1">
                  <p className="font-bold text-[#171A18]">Customer Satisfaction</p>
                  <p className="text-[#707873]">
                    <strong className="text-[#173D32]">{fourOrFiveStarPercent}%</strong> of customers left a positive rating of 4 or 5 stars for your store.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#707873]">
                Your store does not have customer ratings yet. Reputation insights will update automatically as ratings are submitted by community members.
              </p>
            )}
          </div>

          {/* Rating Distribution Analytics & Rating Trend Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rating Distribution Bar Chart */}
            <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 shadow-xs space-y-5">
              <div className="border-b border-[#E2E5DF] pb-4 flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-[#171A18] flex items-center space-x-2">
                  <Star className="w-4 h-4 text-[#C9A24A] fill-[#C9A24A]" />
                  <span>Rating Breakdown</span>
                </h2>
                <span className="text-[11px] text-[#707873] font-mono">
                  {storeData.totalRatings} total {storeData.totalRatings === 1 ? 'submission' : 'submissions'}
                </span>
              </div>

              {storeData.totalRatings === 0 ? (
                <div className="p-8 text-center text-xs text-[#707873]">
                  No customer ratings submitted yet.
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {[5, 4, 3, 2, 1].map((starNum) => {
                    const count = distribution[starNum] || 0;
                    const percent = storeData.totalRatings > 0 ? Math.round((count / storeData.totalRatings) * 100) : 0;

                    return (
                      <div key={starNum} className="flex items-center space-x-3 text-xs">
                        <span className="w-8 font-bold text-[#171A18] flex items-center space-x-1 shrink-0">
                          <span>{starNum}</span>
                          <span className="text-[#C9A24A]">★</span>
                        </span>

                        <div className="flex-1 bg-[#F7F6F1] border border-[#E2E5DF] rounded-full h-3 overflow-hidden p-0.5">
                          <div
                            className="bg-[#173D32] h-full rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <span className="w-16 text-right text-[#707873] font-mono text-[11px] shrink-0">
                          {count} ({percent}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Rating Activity & Trend Module */}
            <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 text-left">
              <div className="border-b border-[#E2E5DF] pb-4 flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-[#171A18] flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-[#173D32]" />
                  <span>Rating Trend Timeline</span>
                </h2>
                <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider bg-[#E7F0EB] px-2.5 py-1 rounded-full text-[#173D32]">
                  {storeData.totalRatings} {storeData.totalRatings === 1 ? 'Point' : 'Points'}
                </span>
              </div>

              {storeData.ratings && storeData.ratings.length > 0 ? (
                <div className="space-y-4">
                  {/* SVG Line Chart for 1, 2, 3+ Ratings */}
                  <div className="relative w-full h-44 bg-[#F7F6F1] rounded-xl border border-[#E2E5DF] p-4 flex flex-col justify-between">
                    <div className="absolute inset-x-4 top-4 bottom-8 flex flex-col justify-between opacity-30 pointer-events-none">
                      <div className="border-b border-dashed border-[#707873] w-full text-[9px] text-[#707873]">5.0 ★</div>
                      <div className="border-b border-dashed border-[#707873] w-full text-[9px] text-[#707873]">3.0 ★</div>
                      <div className="border-b border-dashed border-[#707873] w-full text-[9px] text-[#707873]">1.0 ★</div>
                    </div>

                    {/* Chart SVG */}
                    <svg className="w-full h-28 overflow-visible relative z-10">
                      {(() => {
                        const sortedRatings = [...storeData.ratings].reverse(); // oldest to newest
                        const count = sortedRatings.length;
                        const width = 100; // percent width
                        const points = sortedRatings.map((r, idx) => {
                          const x = count === 1 ? 50 : (idx / (count - 1)) * 80 + 10;
                          // 5 -> top (y=10), 1 -> bottom (y=90)
                          const y = 90 - ((r.rating - 1) / 4) * 80;
                          return { x, y, rating: r.rating, date: formatDate(r.createdAt), user: r.userName };
                        });

                        const pathString = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}%`).join(' ');

                        return (
                          <>
                            {count > 1 && (
                              <path
                                d={pathString}
                                fill="none"
                                stroke="#173D32"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            )}
                            {points.map((p, idx) => (
                              <g key={idx}>
                                <circle
                                  cx={`${p.x}%`}
                                  cy={`${p.y}%`}
                                  r="6"
                                  className="fill-[#C9A24A] stroke-white stroke-2 shadow-xs"
                                />
                                <text
                                  x={`${p.x}%`}
                                  y={`${p.y - 12}%`}
                                  textAnchor="middle"
                                  className="text-[10px] font-extrabold fill-[#173D32]"
                                >
                                  {p.rating}.0 ★
                                </text>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>

                    {/* X-Axis Date Labels */}
                    <div className="flex justify-between items-center text-[10px] text-[#707873] font-mono px-2 z-10 pt-1 border-t border-[#E2E5DF]">
                      {(() => {
                        const sortedRatings = [...storeData.ratings].reverse();
                        if (sortedRatings.length === 1) {
                          return <span className="w-full text-center">{formatDate(sortedRatings[0].createdAt)}</span>;
                        }
                        return sortedRatings.map((r, idx) => (
                          <span key={idx} className="truncate max-w-[80px]">
                            {formatDate(r.createdAt)}
                          </span>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 px-4 text-center space-y-2 bg-[#F7F6F1] rounded-xl border border-[#E2E5DF]">
                  <TrendingUp className="w-8 h-8 text-[#9CA59E] mx-auto stroke-1" />
                  <p className="font-display text-sm font-bold text-[#171A18]">No customer ratings yet</p>
                  <p className="text-xs text-[#707873] max-w-xs mx-auto font-normal">
                    Rating trend points will plot automatically as customer reviews are submitted.
                  </p>
                </div>
              )}

              <div className="text-[11px] text-[#707873] flex justify-between items-center pt-1 border-t border-[#E2E5DF]">
                <span>Total Rating Submissions: <strong className="text-[#171A18]">{storeData.totalRatings}</strong></span>
                <span>5.0 Benchmark Scale</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Customer Ratings (Responsive Table / Mobile Cards) */}
      {activeTab === 'ratings' && (
        <div className="bg-white border border-[#E2E5DF] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E2E5DF] flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-[#171A18] flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#173D32]" />
              <span>Customer Rating Submissions ({storeData.totalRatings})</span>
            </h3>
          </div>

          {storeData.ratings.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <p className="font-display text-base font-bold text-[#171A18]">NO RATINGS SUBMITTED</p>
              <p className="text-xs text-[#707873]">This store hasn't received any customer ratings yet.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F6F1] border-b border-[#E2E5DF] text-[#707873] uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Customer</th>
                      <th className="py-4 px-6">Customer Email</th>
                      <th className="py-4 px-6">Rating</th>
                      <th className="py-4 px-6 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E5DF] text-[#171A18]">
                    {storeData.ratings.map((r) => (
                      <tr key={r.id} className="hover:bg-[#F7F6F1] transition-colors">
                        <td className="py-4 px-6 font-bold text-[#171A18] flex items-center space-x-3">
                          <div className="w-7 h-7 bg-[#173D32] text-white rounded-lg flex items-center justify-center font-black text-[10px] shrink-0">
                            {getInitials(r.userName)}
                          </div>
                          <span>{r.userName}</span>
                        </td>
                        <td className="py-4 px-6 font-mono text-[#707873]">{r.userEmail}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <StarRating value={r.rating} readOnly size="sm" />
                            <span className="font-extrabold text-[#C9A24A] text-xs">{r.rating}.0</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right text-[#707873] font-mono text-[11px]">
                          {formatDate(r.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden divide-y divide-[#E2E5DF]">
                {storeData.ratings.map((r) => (
                  <div key={r.id} className="p-4 space-y-2 text-xs text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 bg-[#173D32] text-white rounded-lg flex items-center justify-center font-black text-xs shrink-0">
                          {getInitials(r.userName)}
                        </div>
                        <div>
                          <p className="font-bold text-[#171A18]">{r.userName}</p>
                          <p className="text-[10px] text-[#707873] font-mono">{r.userEmail}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#707873] font-mono">{formatDate(r.createdAt)}</span>
                    </div>

                    <div className="flex items-center justify-between bg-[#F7F6F1] p-2.5 rounded-xl border border-[#E2E5DF]">
                      <span className="text-[10px] uppercase font-bold text-[#707873]">Score</span>
                      <div className="flex items-center space-x-1.5">
                        <StarRating value={r.rating} readOnly size="sm" />
                        <span className="font-extrabold text-[#C9A24A]">{r.rating}.0</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboardPage;
