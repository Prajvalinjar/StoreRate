import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOwnerDashboard, createOwnerStore } from '../api/ownerService';
import StarRating from '../components/StarRating';
import { Store, Star, Users, MapPin, Mail, AlertCircle, RefreshCw, Award, TrendingUp, Sparkles, CheckCircle2, Clock, XCircle, Send, MessageSquare } from 'lucide-react';

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
        {/* Header Hero */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-2 border-b border-[#E2E5DF] pb-5">
            <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block border border-[#CDE0D5]">
              STORE OWNER ONBOARDING
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#171A18] tracking-tight">
              Your store isn't listed yet.
            </h2>
            <p className="text-xs sm:text-sm text-[#707873]">
              Submit your business to StoreRate and start building your reputation with customer ratings.
            </p>
          </div>

          {/* Visual Workflow Diagram */}
          <div className="bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-extrabold text-[#707873] uppercase tracking-wider">
              Store Owner Listing & Approval Process
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-[11px] font-bold">
              <div className="bg-white border border-[#E2E5DF] p-2.5 rounded-lg text-[#173D32]">
                1. Store Submission
              </div>
              <div className="bg-white border border-[#E2E5DF] p-2.5 rounded-lg text-[#173D32]">
                2. Admin Review
              </div>
              <div className="bg-white border border-[#E2E5DF] p-2.5 rounded-lg text-[#173D32]">
                3. Approval
              </div>
              <div className="bg-white border border-[#E2E5DF] p-2.5 rounded-lg text-[#173D32]">
                4. Public Listing
              </div>
              <div className="bg-white border border-[#E2E5DF] p-2.5 rounded-lg text-[#173D32]">
                5. Customer Ratings
              </div>
            </div>
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
                placeholder="e.g. Kolhapur Spice Kitchen"
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
                placeholder="contact@business.com"
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
                placeholder="Tarabai Park, Kolhapur, Maharashtra"
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
                <span>{submitting ? 'Submitting...' : 'Submit Store Listing →'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let writtenReviewsCount = 0;

  if (storeData && storeData.ratings) {
    storeData.ratings.forEach((r) => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++;
      }
      if (r.review && r.review.trim().length > 0) {
        writtenReviewsCount++;
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
                TOTAL RATINGS
              </span>
              <div className="flex items-baseline space-x-2 pt-1">
                <span className="text-3xl font-black text-[#171A18] tracking-tight leading-none">{storeData.totalRatings}</span>
                <span className="text-xs text-[#707873]">
                  {storeData.totalRatings === 1 ? 'rating' : 'ratings'}
                </span>
              </div>
            </div>

            {/* Written Reviews Count Block */}
            <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">
                WRITTEN REVIEWS
              </span>
              <div className="flex items-baseline space-x-2 pt-1">
                <span className="text-3xl font-black text-[#173D32] tracking-tight leading-none">
                  {writtenReviewsCount}
                </span>
                <span className="text-xs text-[#707873]">written feedback</span>
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

          {/* Customer Feedback Insights */}
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
                    Your store maintains an average score of <strong className="text-[#C9A24A]">{Number(storeData.averageRating).toFixed(1)}/5.0</strong> from {storeData.totalRatings} customer ratings.
                  </p>
                </div>

                <div className="bg-white/80 p-3.5 rounded-xl border border-[#CDE0D5] space-y-1">
                  <p className="font-bold text-[#171A18]">Written Reviews</p>
                  <p className="text-[#707873]">
                    <strong className="text-[#173D32]">{writtenReviewsCount}</strong> customers submitted detailed written feedback reviews.
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
        </div>
      )}

      {/* Tab 2: Customer Ratings & Written Reviews List */}
      {activeTab === 'ratings' && (
        <div className="bg-white border border-[#E2E5DF] rounded-2xl shadow-xs overflow-hidden space-y-4 p-6">
          <div className="border-b border-[#E2E5DF] pb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-[#171A18] flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#173D32]" />
              <span>Customer Ratings & Written Reviews ({storeData.totalRatings})</span>
            </h3>
            <span className="text-xs text-[#707873] font-mono">
              {writtenReviewsCount} written feedback reviews
            </span>
          </div>

          {storeData.ratings.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <p className="font-display text-base font-bold text-[#171A18]">NO RATINGS SUBMITTED</p>
              <p className="text-xs text-[#707873]">This store hasn't received any customer ratings yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {storeData.ratings.map((r) => (
                <div key={r.id} className="p-5 bg-[#F7F6F1] border border-[#E2E5DF] rounded-2xl space-y-3 text-left flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 bg-[#173D32] text-white rounded-lg flex items-center justify-center font-black text-xs shrink-0">
                          {getInitials(r.userName)}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-[#171A18]">{r.userName}</p>
                          <span className="text-[10px] text-[#707873] font-mono">{formatDate(r.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-xs font-extrabold text-[#C9A24A] bg-white px-2.5 py-1 rounded-full border border-[#E2E5DF]">
                        <Star className="w-3.5 h-3.5 fill-[#C9A24A]" />
                        <span>{r.rating}.0</span>
                      </div>
                    </div>

                    {/* Customer Written Review Text */}
                    {r.review ? (
                      <p className="text-xs text-[#171A18] font-normal leading-relaxed bg-white p-3 rounded-xl border border-[#E2E5DF] whitespace-pre-wrap">
                        "{r.review}"
                      </p>
                    ) : (
                      <p className="text-xs text-[#9CA59E] italic">No written review provided.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboardPage;
