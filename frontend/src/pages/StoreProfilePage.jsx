import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPublicStoreById } from '../api/publicService';
import { submitRating, updateRating, addFavorite, removeFavorite, getUserFavoriteStoreIds } from '../api/userStoreService';
import StarRating from '../components/StarRating';
import SafeImage from '../components/SafeImage';
import SkeletonLoader from '../components/SkeletonLoader';
import { 
  Star, MapPin, ArrowLeft, CheckCircle2, ShieldAlert, Award, 
  LogIn, UserCheck, Sparkles, RefreshCw, AlertCircle, Calendar, Heart, MessageSquare, SlidersHorizontal, ChevronDown 
} from 'lucide-react';

const StoreProfilePage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [store, setStore] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [userReviewText, setUserReviewText] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Rating & Review Modal state
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewInput, setReviewInput] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // Review Sorting & Pagination state
  const [reviewSort, setReviewSort] = useState('recent'); // recent, highest, lowest
  const [visibleReviewCount, setVisibleReviewCount] = useState(10);

  // Sign In Prompt Modal state
  const [signInPromptOpen, setSignInPromptOpen] = useState(false);
  const [promptMessage, setPromptMessage] = useState('Sign in to submit a rating');

  const fetchStoreDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPublicStoreById(id);
      if (response.status === 'success') {
        const storeData = response.data.store;
        setStore(storeData);

        if (isAuthenticated && user?.role === 'USER') {
          // Check existing user rating & review
          if (storeData.ratings && Array.isArray(storeData.ratings)) {
            const foundUserRating = storeData.ratings.find(
              (r) => r.userId === user.id || r.user?.id === user.id
            );
            if (foundUserRating) {
              setUserRating(foundUserRating.rating);
              setSelectedRating(foundUserRating.rating);
              setUserReviewText(foundUserRating.review || '');
              setReviewInput(foundUserRating.review || '');
            }
          }

          // Check if favorited
          try {
            const favRes = await getUserFavoriteStoreIds();
            if (favRes.status === 'success') {
              const ids = favRes.data.favoriteStoreIds || [];
              setIsSaved(ids.includes(id));
            }
          } catch {
            // Ignore favorite check error silently
          }
        }
      } else {
        setError(response.message || 'Store not found');
      }
    } catch (err) {
      console.error('Failed to fetch store details:', err);
      setError(err.response?.data?.message || 'Failed to load store profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStoreDetail();
    }
  }, [id, isAuthenticated, user]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      setPromptMessage('Sign in to save stores to your favorites');
      setSignInPromptOpen(true);
      return;
    }

    if (user?.role !== 'USER') {
      return;
    }

    setSavingFavorite(true);
    try {
      if (isSaved) {
        await removeFavorite(id);
        setIsSaved(false);
      } else {
        await addFavorite(id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setSavingFavorite(false);
    }
  };

  const handleOpenRateAction = () => {
    if (!isAuthenticated) {
      setPromptMessage('Sign in to rate & review this business and help your community');
      setSignInPromptOpen(true);
      return;
    }

    if (user?.role !== 'USER') {
      return;
    }

    setRateModalOpen(true);
    setModalError('');
    setModalSuccess('');
    setSelectedRating(userRating || 0);
    setReviewInput(userReviewText || '');
  };

  const handleCloseRateModal = () => {
    setRateModalOpen(false);
    setModalError('');
    setModalSuccess('');
    setHoverRating(0);
  };

  const handleSubmitRatingForm = async (e) => {
    e.preventDefault();
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setModalError('Please select a rating score between 1 and 5 stars');
      return;
    }

    if (reviewInput && reviewInput.length > 500) {
      setModalError('Review text cannot exceed 500 characters');
      return;
    }

    setSubmitting(true);
    setModalError('');
    setModalSuccess('');

    try {
      let response;
      const cleanReview = reviewInput.trim() ? reviewInput.trim() : null;

      if (userRating !== null && userRating !== undefined) {
        response = await updateRating(id, selectedRating, cleanReview);
      } else {
        response = await submitRating(id, selectedRating, cleanReview);
      }

      if (response.status === 'success') {
        setUserRating(selectedRating);
        setUserReviewText(cleanReview || '');
        setModalSuccess('Your rating & review have been saved successfully!');
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

  // Processed Reviews (Sorted & Filtered)
  const rawRatingsList = store?.ratings || [];
  
  const writtenReviewsCount = useMemo(() => {
    return rawRatingsList.filter((r) => r.review && r.review.trim().length > 0).length;
  }, [rawRatingsList]);

  const sortedRatings = useMemo(() => {
    const list = [...rawRatingsList];
    if (reviewSort === 'highest') {
      list.sort((a, b) => b.rating - a.rating || new Date(b.createdAt) - new Date(a.createdAt));
    } else if (reviewSort === 'lowest') {
      list.sort((a, b) => a.rating - b.rating || new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      // recent (default)
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list;
  }, [rawRatingsList, reviewSort]);

  const displayedRatings = sortedRatings.slice(0, visibleReviewCount);
  const hasMoreReviews = sortedRatings.length > visibleReviewCount;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F1] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <SkeletonLoader type="profile" />
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

  return (
    <div className="min-h-screen bg-[#F7F6F1] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-[#171A18] text-left">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back Button */}
        <div>
          <Link
            to="/stores"
            className="inline-flex items-center space-x-2 text-xs font-bold text-[#173D32] hover:text-[#2F6654] transition-colors bg-white border border-[#E2E5DF] px-4 py-2 rounded-xl shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store Discovery</span>
          </Link>
        </div>

        {/* Main Store Profile Banner */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl overflow-hidden shadow-xs p-6 sm:p-8 space-y-6">
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

            {/* Action Buttons: Save & Rate */}
            <div className="flex flex-wrap items-center gap-3 shrink-0 self-start md:self-auto">
              <button
                type="button"
                onClick={handleToggleFavorite}
                disabled={savingFavorite}
                className={`px-5 py-3 text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center space-x-2 cursor-pointer border ${
                  isSaved
                    ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-600'
                    : 'bg-white hover:bg-[#F7F6F1] text-[#173D32] border-[#E2E5DF]'
                }`}
              >
                {savingFavorite ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-white text-white' : 'text-[#C9A24A]'}`} />
                )}
                <span>{isSaved ? '♥ Saved Store' : '♡ Save Store'}</span>
              </button>

              {!isAuthenticated ? (
                <button
                  onClick={handleOpenRateAction}
                  className="px-6 py-3 bg-[#173D32] hover:bg-[#2F6654] text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
                >
                  <Star className="w-4 h-4 text-[#C9A24A] fill-[#C9A24A]" />
                  <span>Rate & Review Store</span>
                </button>
              ) : user?.role === 'USER' ? (
                <button
                  onClick={handleOpenRateAction}
                  className={`px-6 py-3 text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center space-x-2 cursor-pointer ${
                    userRating !== null && userRating !== undefined
                      ? 'bg-[#E7F0EB] hover:bg-[#D8E6DE] text-[#173D32] border border-[#CDE0D5]'
                      : 'bg-[#173D32] hover:bg-[#2F6654] text-white'
                  }`}
                >
                  <Star className="w-4 h-4 text-[#C9A24A] fill-[#C9A24A]" />
                  <span>{userRating ? `Edit Your Review (${userRating}.0 ★)` : 'Rate & Review Store'}</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Rating Telemetry Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 bg-[#F7F6F1] border border-[#E2E5DF] rounded-2xl flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-[#707873] uppercase tracking-wider block">
                  AVERAGE REPUTATION SCORE
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-black text-[#173D32]">{averageRatingNum.toFixed(1)}</span>
                  <span className="text-sm font-bold text-[#707873]">/ 5.0</span>
                </div>
              </div>
              <div className="space-y-1.5 pt-2">
                <StarRating value={averageRatingNum} readOnly size="md" />
                <p className="text-xs text-[#707873] font-normal flex flex-wrap items-center gap-1.5">
                  <span>{totalRatingsCount} {totalRatingsCount === 1 ? 'rating' : 'ratings'}</span>
                  <span>•</span>
                  <span className="font-bold text-[#173D32]">{writtenReviewsCount} written {writtenReviewsCount === 1 ? 'review' : 'reviews'}</span>
                </p>
              </div>
            </div>

            {/* Distribution Breakdown (5★–1★) */}
            <div className="md:col-span-2 p-6 bg-[#F7F6F1] border border-[#E2E5DF] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-[#707873] uppercase tracking-wider">
                  RATING DISTRIBUTION
                </span>
                <span className="text-[11px] font-bold text-[#173D32]">1.0 – 5.0 Scale</span>
              </div>

              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const item = distribution[star] || { count: 0, percentage: 0 };
                  return (
                    <div key={star} className="flex items-center space-x-3 text-xs">
                      <span className="w-8 font-bold text-[#171A18] text-right font-mono">{star} ★</span>
                      <div className="flex-1 h-2.5 bg-[#E2E5DF] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#173D32] rounded-full transition-all duration-300"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-[#707873] font-mono text-right">{item.percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E5DF] pb-4">
            <div>
              <h3 className="font-display text-xl font-bold text-[#171A18]">Customer Reviews & Feedback</h3>
              <p className="text-xs text-[#707873]">
                {totalRatingsCount} total ratings • {writtenReviewsCount} written reviews
              </p>
            </div>

            {/* Sort Selector Controls */}
            {rawRatingsList.length > 0 && (
              <div className="flex items-center space-x-2 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#173D32]" />
                <span className="text-[#707873] font-medium">Sort Reviews:</span>
                <select
                  value={reviewSort}
                  onChange={(e) => setReviewSort(e.target.value)}
                  className="py-1.5 px-3 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl text-xs font-bold text-[#173D32] focus:outline-none focus:ring-2 focus:ring-[#173D32] cursor-pointer"
                >
                  <option value="recent">Most Recent</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                </select>
              </div>
            )}
          </div>

          {displayedRatings.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedRatings.map((r, idx) => (
                  <div key={r.id || idx} className="p-5 bg-[#F7F6F1] border border-[#E2E5DF] rounded-2xl space-y-3 text-left flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <StarRating value={r.rating} readOnly size="xs" />
                        <span className="text-[11px] font-bold text-[#173D32] bg-[#E7F0EB] px-2.5 py-0.5 rounded-full border border-[#CDE0D5]">
                          {r.rating}.0 / 5.0
                        </span>
                      </div>

                      {/* Written Review Text */}
                      {r.review ? (
                        <p className="text-xs text-[#171A18] font-normal leading-relaxed bg-white/80 p-3 rounded-xl border border-[#E2E5DF] whitespace-pre-wrap">
                          "{r.review}"
                        </p>
                      ) : (
                        <p className="text-xs text-[#9CA59E] italic">No written review submitted.</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#707873] pt-2 border-t border-[#E2E5DF]/60">
                      <span className="font-bold text-[#171A18] truncate max-w-[150px]" title={r.user?.name}>
                        {r.user?.name ? r.user.name : 'Community rating'}
                      </span>
                      <div className="flex items-center space-x-2">
                        {r.user?.email?.endsWith('@storerate.local') ? (
                          <span className="text-[9px] font-bold text-[#9A7525] bg-[#F5E6C8]/60 px-2 py-0.5 rounded border border-[#E8D4A8]">
                            Sample rating
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-[#173D32] bg-[#E7F0EB] px-2 py-0.5 rounded border border-[#CDE0D5]">
                            Customer rating
                          </span>
                        )}
                        <span className="flex items-center space-x-1 font-mono text-[10px]">
                          <Calendar className="w-3 h-3 text-[#9CA59E]" />
                          <span>{new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Pagination Button */}
              {hasMoreReviews && (
                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleReviewCount((prev) => prev + 10)}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 bg-white border border-[#E2E5DF] hover:bg-[#F7F6F1] text-[#173D32] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Load More Reviews</span>
                    <ChevronDown className="w-4 h-4 text-[#C9A24A]" />
                  </button>
                </div>
              )}
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
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#173D32] hover:underline pt-1 cursor-pointer"
                >
                  <span>Rate & Review Store Now →</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Rating & Review Modal for Logged-In USER */}
      {rateModalOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseRateModal(); }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#E2E5DF] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 relative text-left">
            <div className="flex items-start justify-between border-b border-[#E2E5DF] pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest block">
                  RATE & REVIEW YOUR EXPERIENCE
                </span>
                <h3 className="font-display text-xl font-bold text-[#171A18] line-clamp-1">{store.name}</h3>
                <p className="text-xs text-[#707873] truncate">{store.address}</p>
              </div>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-[#9B2C2C] text-xs font-semibold rounded-xl">
                {modalError}
              </div>
            )}
            {modalSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitRatingForm} className="space-y-5">
              {/* Star Rating Selector */}
              <div className="space-y-3 py-2 text-center bg-[#F7F6F1] p-4 rounded-2xl border border-[#E2E5DF]">
                <label className="block text-xs font-bold text-[#171A18]">
                  1. How was your experience? (Required)
                </label>
                <div className="flex justify-center">
                  <StarRating
                    value={currentDisplayRating}
                    onChange={(val) => setSelectedRating(val)}
                    onHover={(val) => setHoverRating(val)}
                    size="lg"
                  />
                </div>
                <div className="h-6 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#9A7525] bg-[#F5E6C8] border border-[#E8D4A8] px-3.5 py-1 rounded-full">
                    {currentDisplayRating > 0
                      ? `${currentDisplayRating} ${currentDisplayRating === 1 ? 'Star' : 'Stars'} — ${getRatingLabel(currentDisplayRating)}`
                      : 'Hover or click a star to rate'}
                  </span>
                </div>
              </div>

              {/* Optional Text Area Review */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#171A18]">
                  <label htmlFor="reviewInput">2. Write a review (Optional)</label>
                  <span className={`font-mono text-[10px] ${reviewInput.length > 480 ? 'text-rose-600 font-bold' : 'text-[#707873]'}`}>
                    {reviewInput.length} / 500
                  </span>
                </div>
                <textarea
                  id="reviewInput"
                  rows={4}
                  maxLength={500}
                  value={reviewInput}
                  onChange={(e) => setReviewInput(e.target.value)}
                  placeholder="Share details of your experience, service quality, product selection, or customer care..."
                  className="w-full p-3 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl text-xs font-normal text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:ring-2 focus:ring-[#173D32] transition-all resize-none"
                />
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
                  {submitting ? 'Saving...' : userRating ? 'Update Review' : 'Submit Review'}
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
                  <h3 className="font-display text-lg font-bold text-[#171A18]">Sign in required</h3>
                  <p className="text-xs text-[#707873]">{promptMessage}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#707873] leading-relaxed">
              Create a free account or sign in to save stores to your favorites list and submit authentic ratings & written reviews.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-[#E2E5DF]">
              <button
                type="button"
                onClick={() => setSignInPromptOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 bg-white text-[#707873] border border-[#E2E5DF] rounded-xl text-xs font-semibold hover:bg-[#F7F6F1] transition-colors"
              >
                Continue Browsing
              </button>
              <button
                type="button"
                onClick={() => navigate('/login', { state: { from: { pathname: `/stores/${id}` } } })}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold rounded-xl text-xs transition-colors shadow-xs"
              >
                Sign In Now →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreProfilePage;
