import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPublicStoreById } from '../api/publicService';
import { submitRating, updateRating, getMyRatings } from '../api/userStoreService';
import StarRating from '../components/StarRating';
import {
  MapPin,
  Star,
  ArrowLeft,
  Store,
  RefreshCw,
  AlertCircle,
  Calendar,
  X,
  CheckCircle2,
  Edit3,
  LogIn,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

const StoreProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authenticated user rating state
  const [userRating, setUserRating] = useState(null);

  // Modals & form state
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [signInPromptOpen, setSignInPromptOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // Fetch public store profile details
  const fetchStoreDetail = useCallback(async () => {
    try {
      const response = await getPublicStoreById(id);
      if (response.status === 'success') {
        setStore(response.data.store);
      }
    } catch (err) {
      console.error('Failed to fetch store profile:', err);
      setError(err.response?.data?.message || 'The requested store profile could not be found.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch logged-in user's existing rating for this store if role is USER
  const fetchUserRating = useCallback(async () => {
    if (isAuthenticated && user?.role === 'USER') {
      try {
        const response = await getMyRatings();
        if (response.status === 'success' && Array.isArray(response.data.ratings)) {
          const match = response.data.ratings.find((r) => r.store?.id === id);
          if (match) {
            setUserRating(match.rating);
          } else {
            setUserRating(null);
          }
        }
      } catch (err) {
        console.error('Failed to check existing user rating:', err);
      }
    }
  }, [id, isAuthenticated, user]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchStoreDetail();
    fetchUserRating();
  }, [fetchStoreDetail, fetchUserRating]);

  // Keyboard accessibility for modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setRateModalOpen(false);
        setSignInPromptOpen(false);
      }
    };
    if (rateModalOpen || signInPromptOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [rateModalOpen, signInPromptOpen]);

  const handleOpenRateAction = () => {
    if (!isAuthenticated) {
      setSignInPromptOpen(true);
      return;
    }

    if (user?.role !== 'USER') {
      return;
    }

    setSelectedRating(userRating || 0);
    setHoverRating(0);
    setModalError('');
    setModalSuccess('');
    setRateModalOpen(true);
  };

  const handleCloseRateModal = () => {
    setRateModalOpen(false);
    setSelectedRating(0);
    setHoverRating(0);
    setModalError('');
    setModalSuccess('');
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setModalError('Please select a rating between 1 and 5 stars');
      return;
    }

    setSubmitting(true);
    setModalError('');
    setModalSuccess('');

    try {
      let response;
      if (userRating) {
        response = await updateRating(id, selectedRating);
      } else {
        response = await submitRating(id, selectedRating);
      }

      if (response.status === 'success') {
        setUserRating(selectedRating);
        setModalSuccess('Your rating has been saved successfully!');
        
        // Refresh live stats & distribution immediately
        await fetchStoreDetail();
        
        setTimeout(() => {
          handleCloseRateModal();
        }, 800);
      }
    } catch (err) {
      console.error('Failed to submit rating:', err);
      setModalError(err.response?.data?.message || 'Failed to save rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (rating) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select rating';
    }
  };

  const currentDisplayRating = hoverRating || selectedRating;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F1] py-12 px-4 sm:px-6 lg:px-8 text-[#171A18]">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-4 bg-[#E7F0EB] rounded w-32 animate-pulse" />
          <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 sm:p-8 space-y-6 animate-pulse">
            <div className="space-y-3">
              <div className="h-8 bg-[#E7F0EB] rounded w-2/3" />
              <div className="h-4 bg-[#E7F0EB] rounded w-1/3" />
            </div>
            <div className="h-20 bg-[#E7F0EB] rounded-xl w-full" />
            <div className="h-48 bg-[#E7F0EB] rounded-xl w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-[#F7F6F1] py-16 px-4">
        <div className="max-w-md mx-auto bg-white border border-[#E2E5DF] rounded-2xl p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-rose-50 text-[#9B2C2C] rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-[#171A18]">Store Not Found</h3>
            <p className="text-xs text-[#707873] font-normal">
              {error || "The store you're looking for doesn't exist or may have been removed."}
            </p>
          </div>
          <Link
            to="/stores"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#173D32] text-white text-xs font-extrabold rounded-xl hover:bg-[#2F6654] transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore Stores</span>
          </Link>
        </div>
      </div>
    );
  }

  if (store.status && store.status !== 'APPROVED') {
    const isPending = store.status === 'PENDING';
    return (
      <div className="min-h-screen bg-[#F7F6F1] py-16 px-4">
        <div className="max-w-md mx-auto bg-white border border-[#E2E5DF] rounded-2xl p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-amber-50 text-amber-800 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-[#171A18]">Store Not Available</h3>
            <p className="text-xs text-[#707873] font-normal">
              {isPending
                ? 'This store is currently awaiting administrator approval.'
                : 'This store is not currently listed on StoreRate.'}
            </p>
          </div>
          <Link
            to="/stores"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#173D32] text-white text-xs font-extrabold rounded-xl hover:bg-[#2F6654] transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Explore Stores</span>
          </Link>
        </div>
      </div>
    );
  }

  const averageRatingNum = Number(store.averageRating || store.stats?.averageRating || 0);
  const totalRatingsCount = Number(store.totalRatings || store.stats?.totalRatings || 0);
  const distribution = store.distribution || {
    5: { count: 0, percentage: 0 },
    4: { count: 0, percentage: 0 },
    3: { count: 0, percentage: 0 },
    2: { count: 0, percentage: 0 },
    1: { count: 0, percentage: 0 },
  };
  const recentRatingsList = store.recentRatings || store.ratings || [];

  return (
    <div className="min-h-screen bg-[#F7F6F1] py-8 px-4 sm:px-6 lg:px-8 text-[#171A18]">
      <div className="max-w-4xl mx-auto space-y-6 text-left">
        {/* Navigation Breadcrumb */}
        <Link
          to="/stores"
          className="inline-flex items-center space-x-2 text-xs font-bold text-[#173D32] hover:text-[#2F6654] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Stores</span>
        </Link>

        {/* Main Store Profile Banner */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl overflow-hidden shadow-xs p-6 sm:p-8 space-y-6">
          {/* Store Cover Header Image */}
          <div className="relative h-56 sm:h-64 w-full bg-[#173D32] overflow-hidden -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-6">
            <SafeImage
              src={store.imageUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80'}
              alt={store.name}
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white z-10">
              <span className="text-[10px] font-extrabold text-[#C9A24A] uppercase tracking-widest bg-[#173D32]/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#3E7D69]">
                🏪 {store.category || 'General'}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#E2E5DF] pb-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block border border-[#CDE0D5]">
                  VERIFIED BUSINESS PROFILE
                </span>
                <span className="text-[10px] font-extrabold text-[#C9A24A] uppercase tracking-widest bg-[#F5E6C8] px-3.5 py-1.5 rounded-full inline-block border border-[#E8D4A8]">
                  🏪 {store.category || 'General'}
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#171A18] tracking-tight">
                {store.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#707873] flex items-center space-x-1.5 font-normal">
                <MapPin className="w-4 h-4 text-[#9CA59E] shrink-0" />
                <span>{store.address}</span>
              </p>
            </div>

            {/* Primary Action Button / Status Badge */}
            <div className="shrink-0 self-start md:self-auto">
              {!isAuthenticated ? (
                <button
                  onClick={handleOpenRateAction}
                  className="px-6 py-3 bg-[#173D32] hover:bg-[#2F6654] text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
                >
                  <Star className="w-4 h-4 text-[#C9A24A] fill-[#C9A24A]" />
                  <span>Rate This Store</span>
                </button>
              ) : user?.role === 'USER' ? (
                <button
                  onClick={handleOpenRateAction}
                  className={`px-6 py-3 text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center space-x-2 cursor-pointer ${
                    userRating
                      ? 'bg-[#E7F0EB] hover:bg-[#D8E6DE] text-[#173D32] border border-[#CDE0D5]'
                      : 'bg-[#173D32] hover:bg-[#2F6654] text-white'
                  }`}
                >
                  <Edit3 className="w-4 h-4 text-[#C9A24A]" />
                  <span>
                    {userRating ? `Your Rating: ${userRating}.0 ★ (Update)` : 'Rate This Store'}
                  </span>
                </button>
              ) : (
                <div className="px-4 py-2 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl text-xs text-[#707873] font-medium">
                  Logged in as <span className="font-bold text-[#171A18]">{user.role}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rating Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Average Rating Score Card */}
            <div className="bg-[#F7F6F1] border border-[#E2E5DF] rounded-2xl p-6 flex flex-col justify-between space-y-3 text-center md:text-left">
              <span className="text-[10px] font-extrabold text-[#707873] uppercase tracking-wider">
                COMMUNITY REPUTATION
              </span>
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2 justify-center md:justify-start">
                  <span className="font-display text-4xl sm:text-5xl font-black text-[#171A18]">
                    {averageRatingNum > 0 ? averageRatingNum.toFixed(1) : '0.0'}
                  </span>
                  <span className="text-sm font-bold text-[#707873]">/ 5.0</span>
                </div>
                <div className="flex justify-center md:justify-start">
                  <StarRating value={averageRatingNum} readOnly size="md" />
                </div>
              </div>
              <p className="text-xs text-[#707873]">
                Based on <span className="font-bold text-[#171A18]">{totalRatingsCount}</span> customer ratings
              </p>
            </div>

            {/* Rating Distribution Breakdown */}
            <div className="md:col-span-2 bg-[#F7F6F1] border border-[#E2E5DF] rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-[#707873] uppercase tracking-wider">
                  RATING DISTRIBUTION
                </span>
                <span className="text-[11px] font-mono font-bold text-[#173D32]">
                  {totalRatingsCount} TOTAL
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const item = distribution[star] || { count: 0, percentage: 0 };
                  return (
                    <div key={star} className="flex items-center space-x-3 text-xs font-semibold">
                      <div className="w-8 flex items-center space-x-1 shrink-0 text-[#171A18]">
                        <span>{star}</span>
                        <Star className="w-3 h-3 text-[#C9A24A] fill-[#C9A24A]" />
                      </div>
                      <div className="flex-1 h-3 bg-white border border-[#E2E5DF] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#C9A24A] to-[#173D32] rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <div className="w-16 text-right font-mono text-[11px] text-[#707873] shrink-0">
                        <span>{item.percentage}%</span>
                        <span className="text-[10px] text-[#9CA59E] ml-1">({item.count})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Customer Ratings Activity Feed */}
          <div className="space-y-4 pt-4 border-t border-[#E2E5DF]">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#171A18] tracking-tight uppercase">
                Customer Ratings
              </h3>
              <span className="text-xs text-[#707873] font-medium">Verified submissions</span>
            </div>

            {recentRatingsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recentRatingsList.map((r, idx) => (
                  <div key={r.id || idx} className="p-4 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <StarRating value={r.rating} readOnly size="xs" />
                      <span className="text-[11px] font-bold text-[#173D32] bg-[#E7F0EB] px-2.5 py-0.5 rounded-full border border-[#CDE0D5]">
                        {r.rating}.0 / 5.0
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#707873] pt-1">
                      <span>Customer rating</span>
                      <span className="flex items-center space-x-1 font-mono">
                        <Calendar className="w-3 h-3 text-[#9CA59E]" />
                        <span>{new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-[#F7F6F1] border border-[#E2E5DF] rounded-2xl text-center space-y-2">
                <Sparkles className="w-6 h-6 text-[#C9A24A] mx-auto" />
                <h4 className="font-bold text-sm text-[#171A18]">No ratings yet</h4>
                <p className="text-xs text-[#707873] max-w-xs mx-auto">
                  Be the first customer to rate {store.name} and share your feedback with the community.
                </p>
                {(!isAuthenticated || user?.role === 'USER') && (
                  <button
                    onClick={handleOpenRateAction}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#173D32] hover:underline pt-1"
                  >
                    <span>Rate this store now →</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Rating Modal for Logged-In USER */}
      {rateModalOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseRateModal(); }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#E2E5DF] rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 relative text-left">
            <div className="flex items-start justify-between border-b border-[#E2E5DF] pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest block">
                  RATE YOUR EXPERIENCE
                </span>
                <h3 className="font-display text-xl font-bold text-[#171A18] line-clamp-1">{store.name}</h3>
                <p className="text-xs text-[#707873] truncate">{store.address}</p>
              </div>
              <button
                onClick={handleCloseRateModal}
                className="text-[#707873] hover:text-[#171A18] p-1 rounded-lg hover:bg-[#F7F6F1] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-[#9B2C2C] text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-[#173D32] text-xs">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRatingSubmit} className="space-y-5 text-center">
              <div className="space-y-3 py-4 bg-[#F7F6F1] p-5 rounded-2xl border border-[#E2E5DF]">
                <p className="text-[11px] font-bold text-[#707873] uppercase tracking-wider">
                  {currentDisplayRating > 0
                    ? `Selected rating: ${currentDisplayRating}.0`
                    : 'Select rating (1 to 5 stars)'}
                </p>

                <div className="flex justify-center py-1">
                  <StarRating
                    value={selectedRating}
                    onChange={setSelectedRating}
                    onHover={setHoverRating}
                    size="xl"
                  />
                </div>

                <div className="min-h-[1.5rem] flex items-center justify-center">
                  <span className="text-xs font-bold text-[#C9A24A] uppercase tracking-wider bg-[#F5E6C8]/60 border border-[#E8D4A8] px-3.5 py-1 rounded-full">
                    {currentDisplayRating > 0
                      ? `${currentDisplayRating} ${currentDisplayRating === 1 ? 'Star' : 'Stars'} — ${getRatingLabel(currentDisplayRating)}`
                      : 'Hover or click a star to rate'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-[#E2E5DF]">
                <button
                  type="button"
                  onClick={handleCloseRateModal}
                  className="px-4 py-2.5 bg-white text-[#707873] border border-[#E2E5DF] rounded-xl text-xs font-semibold hover:bg-[#F7F6F1] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedRating}
                  className="px-6 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold rounded-xl text-xs disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
                >
                  {submitting ? 'Saving...' : userRating ? 'Update Rating' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sign In Prompt Modal for Unauthenticated Visitors */}
      {signInPromptOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setSignInPromptOpen(false); }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#E2E5DF] rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 text-left">
            <div className="flex items-start justify-between border-b border-[#E2E5DF] pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-[#E7F0EB] border border-[#CDE0D5] text-[#173D32] rounded-xl">
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#171A18]">Sign in to rate</h3>
                  <p className="text-xs text-[#707873]">Authentication required</p>
                </div>
              </div>
              <button
                onClick={() => setSignInPromptOpen(false)}
                className="text-[#707873] hover:text-[#171A18] p-1 rounded-lg hover:bg-[#F7F6F1] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#707873] leading-relaxed font-normal">
              Sign in to your StoreRate account to rate <span className="font-bold text-[#171A18]">{store.name}</span> and contribute to community reputation.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-[#E2E5DF]">
              <button
                type="button"
                onClick={() => setSignInPromptOpen(false)}
                className="px-4 py-2.5 bg-white text-[#707873] border border-[#E2E5DF] rounded-xl text-xs font-semibold hover:bg-[#F7F6F1] transition-colors"
              >
                Continue Browsing
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold rounded-xl text-xs transition-colors shadow-xs cursor-pointer flex items-center space-x-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreProfilePage;
