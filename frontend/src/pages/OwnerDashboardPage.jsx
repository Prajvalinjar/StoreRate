import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getOwnerDashboard, createOwnerStore, postOwnerReply, deleteOwnerReply } from '../api/ownerService';
import StarRating from '../components/StarRating';
import AIReviewInsightsCard from '../components/AIReviewInsightsCard';
import { formatStoreLocation } from '../utils/locationUtils';
import { Store, Star, Users, MapPin, Mail, AlertCircle, RefreshCw, Award, TrendingUp, Sparkles, CheckCircle2, Clock, XCircle, Send, MessageSquare, CornerDownRight, Edit3, Trash2, ExternalLink } from 'lucide-react';

const OwnerDashboardPage = () => {
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = ['overview', 'ratings', 'analytics'].includes(tabParam) ? tabParam : 'overview';

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  // Form state for creating a store
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('General');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Reply Modal State
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [targetRating, setTargetRating] = useState(null);
  const [replyInput, setReplyInput] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [replySuccess, setReplySuccess] = useState('');

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

  const handleOpenReplyModal = (ratingObj) => {
    setTargetRating(ratingObj);
    setReplyInput(ratingObj.ownerReply || '');
    setReplyError('');
    setReplySuccess('');
    setReplyModalOpen(true);
  };

  const handleCloseReplyModal = () => {
    setReplyModalOpen(false);
    setTargetRating(null);
    setReplyInput('');
    setReplyError('');
    setReplySuccess('');
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!targetRating) return;

    if (!replyInput.trim()) {
      setReplyError('Response text cannot be empty');
      return;
    }

    if (replyInput.length > 500) {
      setReplyError('Response text cannot exceed 500 characters');
      return;
    }

    setReplySubmitting(true);
    setReplyError('');
    setReplySuccess('');

    try {
      const res = await postOwnerReply(targetRating.id, replyInput.trim());
      if (res.status === 'success') {
        setReplySuccess('Your response has been published successfully!');
        await fetchDashboard();
        setTimeout(() => {
          handleCloseReplyModal();
        }, 700);
      }
    } catch (err) {
      setReplyError(err.response?.data?.message || 'Failed to post reply. Please try again.');
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleDeleteReply = async (ratingId) => {
    if (!window.confirm('Delete your public response to this customer review?')) return;

    try {
      await deleteOwnerReply(ratingId);
      await fetchDashboard();
    } catch (err) {
      console.error('Failed to delete reply:', err);
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
      <div className="max-w-5xl mx-auto p-6 text-left space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-[#9B2C2C] text-xs sm:text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
        <button
          onClick={fetchDashboard}
          className="px-5 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold rounded-xl text-xs flex items-center space-x-2 transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading Dashboard</span>
        </button>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-left">
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

          <div className="bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-extrabold text-[#707873] uppercase tracking-wider">
              Store Owner Listing & Approval Process
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-[11px] font-bold">
              <div className="bg-white border border-[#E2E5DF] p-2.5 rounded-lg text-[#173D32]">1. Submission</div>
              <div className="bg-white border border-[#E2E5DF] p-2.5 rounded-lg text-[#173D32]">2. Review</div>
              <div className="bg-white border border-[#E2E5DF] p-2.5 rounded-lg text-[#173D32]">3. Approval</div>
              <div className="bg-white border border-[#E2E5DF] p-2.5 rounded-lg text-[#173D32]">4. Public Listing</div>
              <div className="bg-white border border-[#E2E5DF] p-2.5 rounded-lg text-[#173D32]">5. Customer Ratings</div>
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
              <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider">Store / Business Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kolhapur Spice Kitchen"
                className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider">Business Contact Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@business.com"
                className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider">Store Location / Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Tarabai Park, Kolhapur, Maharashtra"
                className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider">Store Category</label>
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
  let ownerRepliesCount = 0;

  if (storeData && storeData.ratings) {
    storeData.ratings.forEach((r) => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++;
      }
      if (r.review && r.review.trim().length > 0) {
        writtenReviewsCount++;
      }
      if (r.ownerReply && r.ownerReply.trim().length > 0) {
        ownerRepliesCount++;
      }
    });
  }

  const responseRate = writtenReviewsCount > 0
    ? Math.round((ownerRepliesCount / writtenReviewsCount) * 100)
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
            <span className="ml-2 font-medium">Your store is publicly listed on StoreRate and open for ratings & responses.</span>
          </div>
        </div>
      )}

      {/* Store Identity Header */}
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
            <p className="text-xs text-[#707873]">Monitor customer feedback telemetry, post public owner responses, and manage reputation.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
            <Link
              to={`/stores/${storeData.id}`}
              className="px-3.5 py-2 bg-[#F7F6F1] hover:bg-[#E7F0EB] text-[#173D32] border border-[#E2E5DF] rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#173D32]" />
              <span>View Public Store</span>
            </Link>
            <Link
              to="/owner/store"
              className="px-3.5 py-2 bg-[#173D32] hover:bg-[#2F6654] text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#C9A24A]" />
              <span>Edit Store Profile</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div className="flex items-center space-x-2 text-[#707873]">
            <Mail className="w-4 h-4 text-[#9CA59E] shrink-0" />
            <span className="font-mono text-[#171A18]">{storeData.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-[#707873]">
            <MapPin className="w-4 h-4 text-[#9CA59E] shrink-0" />
            <span className="truncate text-[#171A18]">{formatStoreLocation(storeData)}</span>
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
          {/* SECTION B — KEY PERFORMANCE INDICATORS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Primary Highlight Metric: Average Rating */}
            <div className="lg:col-span-4 bg-[#173D32] text-white border border-[#123027] rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-[#C9A24A] uppercase tracking-widest bg-[#235344] px-3 py-1 rounded-full border border-[#3E7D69]">
                  PRIMARY REPUTATION KPI
                </span>
                <Award className="w-5 h-5 text-[#C9A24A]" />
              </div>

              <div className="space-y-1">
                {storeData.averageRating !== null && storeData.averageRating !== undefined ? (
                  <div className="flex items-baseline space-x-3">
                    <span className="text-4xl sm:text-5xl font-black text-[#C9A24A] tracking-tight">
                      {Number(storeData.averageRating).toFixed(1)}
                    </span>
                    <div className="space-y-1">
                      <StarRating value={storeData.averageRating} readOnly size="sm" />
                      <span className="text-[11px] text-[#A3C2B6] font-mono block">5.0 Scale Benchmark</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-lg font-semibold text-[#A3C2B6] italic">No ratings submitted yet</span>
                )}
              </div>

              <div className="pt-3 border-t border-[#2F6654] text-xs text-[#D0E2DB]">
                <span>Based on <strong>{storeData.totalRatings}</strong> customer ratings</span>
              </div>
            </div>

            {/* Supporting Compact Metrics Grid */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">Total Ratings</span>
                <div>
                  <span className="text-3xl font-black text-[#171A18] tracking-tight">{storeData.totalRatings}</span>
                  <p className="text-[11px] text-[#707873] mt-0.5 font-normal">Ratings submitted</p>
                </div>
              </div>

              <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">Written Reviews</span>
                <div>
                  <span className="text-3xl font-black text-[#171A18] tracking-tight">{writtenReviewsCount}</span>
                  <p className="text-[11px] text-[#707873] mt-0.5 font-normal">Customer reviews</p>
                </div>
              </div>

              <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">Owner Replies</span>
                <div>
                  <span className="text-3xl font-black text-[#173D32] tracking-tight">{ownerRepliesCount}</span>
                  <p className="text-[11px] text-[#707873] mt-0.5 font-normal">Public responses</p>
                </div>
              </div>

              <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">Response Rate</span>
                <div>
                  <span className="text-3xl font-black text-[#C9A24A] tracking-tight">{responseRate}%</span>
                  <p className="text-[11px] text-[#707873] mt-0.5 font-normal">Review response rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION C & D — RATING DISTRIBUTION & RESPONSE ANALYTICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rating Distribution Horizontal Bars */}
            <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E5DF] pb-3">
                <h3 className="font-display text-base font-bold text-[#171A18] flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-[#173D32]" />
                  <span>Rating Breakdown</span>
                </h3>
                <span className="text-xs text-[#707873] font-mono">
                  {storeData.totalRatings} total {storeData.totalRatings === 1 ? 'rating' : 'ratings'}
                </span>
              </div>

              {storeData.totalRatings > 0 ? (
                <div className="space-y-2.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = distribution[star] || 0;
                    const pct = storeData.totalRatings > 0 ? Math.round((count / storeData.totalRatings) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center space-x-3 text-xs">
                        <span className="w-10 font-bold text-[#171A18] flex items-center space-x-1 shrink-0 font-mono">
                          <span>{star}</span>
                          <Star className="w-3 h-3 fill-[#C9A24A] text-[#C9A24A]" />
                        </span>
                        <div className="flex-1 h-2 bg-[#E7F0EB] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#C9A24A] to-[#173D32] rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-12 text-right font-mono font-bold text-[#171A18] shrink-0">{pct}%</span>
                        <span className="w-10 text-right text-[11px] text-[#707873] font-mono shrink-0">({count})</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center space-y-1 bg-[#F7F6F1] rounded-xl border border-[#E2E5DF]">
                  <p className="text-xs font-bold text-[#171A18]">No customer ratings yet</p>
                  <p className="text-[11px] text-[#707873]">Your rating distribution will appear here after customers review your store.</p>
                </div>
              )}
            </div>

            {/* Response Analytics Breakdown */}
            <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E5DF] pb-3">
                <h3 className="font-display text-base font-bold text-[#171A18] flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-[#173D32]" />
                  <span>Response Analytics</span>
                </h3>
                <span className="text-xs font-mono font-bold text-[#173D32] bg-[#E7F0EB] px-2.5 py-0.5 rounded-full border border-[#CDE0D5]">
                  {responseRate}% Response Rate
                </span>
              </div>

              {writtenReviewsCount > 0 ? (
                <div className="grid grid-cols-2 gap-3 text-center text-xs">
                  <div className="p-3 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">Written Reviews</span>
                    <span className="text-2xl font-black text-[#171A18]">{writtenReviewsCount}</span>
                  </div>
                  <div className="p-3 bg-[#E7F0EB] border border-[#CDE0D5] rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-[#173D32] uppercase tracking-wider block">Replies Published</span>
                    <span className="text-2xl font-black text-[#173D32]">{ownerRepliesCount}</span>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Awaiting Response</span>
                    <span className="text-2xl font-black text-amber-900">{Math.max(0, writtenReviewsCount - ownerRepliesCount)}</span>
                  </div>
                  <div className="p-3 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">Satisfaction</span>
                    <span className="text-2xl font-black text-[#C9A24A]">{fourOrFiveStarPercent}%</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center space-y-1 bg-[#F7F6F1] rounded-xl border border-[#E2E5DF]">
                  <p className="text-xs font-bold text-[#171A18]">No written reviews yet</p>
                  <p className="text-[11px] text-[#707873]">Response metrics will calculate automatically as written customer reviews arrive.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Customer Intelligence Card */}
          <AIReviewInsightsCard aiInsights={storeData.aiInsights} title="AI Customer Intelligence" />
        </div>
      )}

      {/* Tab 2: Customer Ratings & Owner Response Management */}
      {activeTab === 'ratings' && (
        <div className="bg-white border border-[#E2E5DF] rounded-2xl shadow-xs overflow-hidden space-y-4 p-6">
          <div className="border-b border-[#E2E5DF] pb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-[#171A18] flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#173D32]" />
              <span>Customer Ratings & Owner Response Management ({storeData.totalRatings})</span>
            </h3>
            <span className="text-xs text-[#707873] font-mono">
              {ownerRepliesCount} / {writtenReviewsCount} responses published
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
                      <div className="space-y-1.5">
                        <p className="text-xs text-[#171A18] font-normal leading-relaxed bg-white p-3 rounded-xl border border-[#E2E5DF] whitespace-pre-wrap">
                          "{r.review}"
                        </p>
                        {r.aiTag && (
                          <div className="flex items-center space-x-1.5 text-[10px]">
                            <span className="font-mono text-[#707873] uppercase font-bold">AI Tag:</span>
                            <span className={`px-2 py-0.5 rounded font-bold border ${
                              r.aiTag.sentiment === 'POSITIVE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              r.aiTag.sentiment === 'NEGATIVE' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                              'bg-slate-50 text-slate-700 border-slate-200'
                            }`}>
                              {r.aiTag.sentiment} · {r.aiTag.theme}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-[#9CA59E] italic">No written review provided.</p>
                    )}

                    {/* Published Owner Reply */}
                    {r.ownerReply && (
                      <div className="mt-3 p-3.5 bg-[#E7F0EB] border border-[#CDE0D5] rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-wider flex items-center space-x-1">
                            <CornerDownRight className="w-3 h-3 text-[#C9A24A]" />
                            <span>Your Store Owner Response</span>
                          </span>
                          {r.ownerReplyAt && (
                            <span className="text-[9px] text-[#707873] font-mono">
                              {formatDate(r.ownerReplyAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#173D32] font-medium leading-relaxed italic bg-white/90 p-2.5 rounded-lg border border-[#CDE0D5] whitespace-pre-wrap">
                          "{r.ownerReply}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Owner Response Actions */}
                  <div className="pt-2 border-t border-[#E2E5DF] flex items-center justify-end space-x-2">
                    {r.ownerReply ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenReplyModal(r)}
                          className="px-3 py-1.5 bg-white hover:bg-[#E7F0EB] text-[#173D32] border border-[#E2E5DF] rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Response</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReply(r.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenReplyModal(r)}
                        className="px-4 py-2 bg-[#173D32] hover:bg-[#2F6654] text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#C9A24A]" />
                        <span>Reply to Customer</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Store Owner Reply Modal */}
      {replyModalOpen && targetRating && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseReplyModal(); }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#E2E5DF] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 text-left">
            <div className="flex items-start justify-between border-b border-[#E2E5DF] pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest block">
                  PUBLIC STORE OWNER RESPONSE
                </span>
                <h3 className="font-display text-lg font-bold text-[#171A18]">
                  Reply to {targetRating.userName}'s review
                </h3>
                <p className="text-xs text-[#707873]">
                  Customer Rating: {targetRating.rating}.0 ★
                </p>
              </div>
            </div>

            {replyError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-[#9B2C2C] text-xs font-semibold rounded-xl">
                {replyError}
              </div>
            )}
            {replySuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{replySuccess}</span>
              </div>
            )}

            <form onSubmit={handleReplySubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#171A18]">
                  <label htmlFor="ownerReplyText">Your public response</label>
                  <span className={`font-mono text-[10px] ${replyInput.length > 480 ? 'text-rose-600 font-bold' : 'text-[#707873]'}`}>
                    {replyInput.length} / 500
                  </span>
                </div>
                <textarea
                  id="ownerReplyText"
                  rows={4}
                  maxLength={500}
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder="Thank the customer for visiting, address their feedback, or invite them back..."
                  className="w-full p-3 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl text-xs font-normal text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:ring-2 focus:ring-[#173D32] resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-[#E2E5DF]">
                <button
                  type="button"
                  onClick={handleCloseReplyModal}
                  className="px-4 py-2.5 bg-white text-[#707873] border border-[#E2E5DF] rounded-xl text-xs font-semibold hover:bg-[#F7F6F1] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replySubmitting || !replyInput.trim()}
                  className="px-6 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold rounded-xl text-xs disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
                >
                  {replySubmitting ? 'Publishing...' : targetRating.ownerReply ? 'Update Response' : 'Post Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboardPage;
