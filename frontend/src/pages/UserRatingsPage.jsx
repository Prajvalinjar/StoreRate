import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyRatings, updateRating } from '../api/userStoreService';
import StarRating from '../components/StarRating';
import { formatStoreLocation } from '../utils/locationUtils';
import { Star, MapPin, Edit3, X, AlertCircle, CheckCircle2, RefreshCw, Compass, Heart, MessageSquare } from 'lucide-react';

const UserRatingsPage = () => {
  const [ratingsList, setRatingsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Rating & Review Modal State
  const [selectedRatingObj, setSelectedRatingObj] = useState(null);
  const [selectedScore, setSelectedScore] = useState(0);
  const [reviewInput, setReviewInput] = useState('');
  const [hoverScore, setHoverScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const fetchMyRatings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyRatings();
      if (response.status === 'success') {
        setRatingsList(response.data.ratings || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your rating history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRatings();
  }, []);

  const handleOpenModal = (ratingItem) => {
    setSelectedRatingObj(ratingItem);
    setSelectedScore(ratingItem.rating);
    setReviewInput(ratingItem.review || '');
    setHoverScore(0);
    setModalError('');
    setModalSuccess('');
  };

  const handleCloseModal = () => {
    setSelectedRatingObj(null);
    setSelectedScore(0);
    setReviewInput('');
    setHoverScore(0);
    setModalError('');
    setModalSuccess('');
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedScore || selectedScore < 1 || selectedScore > 5) {
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
      const cleanReview = reviewInput.trim() ? reviewInput.trim() : null;
      const response = await updateRating(selectedRatingObj.store.id, selectedScore, cleanReview);
      if (response.status === 'success') {
        setModalSuccess('Your rating & review have been updated successfully!');
        setTimeout(() => {
          handleCloseModal();
          fetchMyRatings();
        }, 700);
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update rating. Please try again.');
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

  const currentDisplayScore = hoverScore || selectedScore;

  const averageGiven = ratingsList.length > 0
    ? Number((ratingsList.reduce((acc, r) => acc + r.rating, 0) / ratingsList.length).toFixed(1))
    : 0;

  const writtenCount = ratingsList.filter((r) => r.review && r.review.trim().length > 0).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 text-[#171A18]">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2E5DF] pb-6 text-left">
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block border border-[#CDE0D5]">
            PERSONAL CONTRIBUTION
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#171A18] tracking-tight">
            My Ratings & Written Reviews
          </h1>
          <p className="text-xs sm:text-sm text-[#707873]">
            Track and update all the ratings and reviews you have shared with the community.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-[#9B2C2C] text-xs sm:text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      {!loading && ratingsList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
          <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">
              Stores Rated
            </span>
            <div className="text-3xl font-black text-[#173D32]">{ratingsList.length}</div>
          </div>

          <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">
              Avg Score Given
            </span>
            <div className="text-3xl font-black text-[#C9A24A]">{averageGiven.toFixed(1)} ★</div>
          </div>

          <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">
              Written Reviews
            </span>
            <div className="text-3xl font-black text-[#173D32]">{writtenCount}</div>
          </div>

          <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">
              Account Status
            </span>
            <div className="text-sm font-black text-[#173D32] pt-2 flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified User</span>
            </div>
          </div>
        </div>
      )}

      {/* Ratings History List */}
      {loading ? (
        <div className="py-24 text-center text-[#707873] flex flex-col items-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#173D32]" />
          <p className="text-xs font-medium">Loading your ratings and reviews history...</p>
        </div>
      ) : ratingsList.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-[#E7F0EB] text-[#173D32] rounded-2xl flex items-center justify-center mx-auto border border-[#CDE0D5]">
            <Star className="w-6 h-6 fill-[#C9A24A] text-[#C9A24A]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-[#171A18]">NO RATINGS YET</h3>
            <p className="text-xs text-[#707873] max-w-sm mx-auto font-normal">
              You haven't rated any stores yet. Discover businesses to share your experience.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/stores"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold rounded-xl text-xs transition-colors shadow-xs"
            >
              <Compass className="w-4 h-4" />
              <span>Discover Stores</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {ratingsList.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#E2E5DF] rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#C4CBC0] hover:shadow-md transition-all duration-200"
            >
              {/* Store Identity */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Link to={`/stores/${item.store.id}`} className="font-display text-xl font-bold text-[#171A18] tracking-tight hover:text-[#173D32] truncate">
                    {item.store.name}
                  </Link>
                  <span className="text-[10px] font-extrabold text-[#173D32] bg-[#E7F0EB] px-2.5 py-0.5 rounded-full border border-[#CDE0D5] shrink-0">
                    {item.rating}.0 ★
                  </span>
                </div>
                <p className="text-xs text-[#707873] flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#9CA59E] shrink-0" />
                  <span className="truncate">{formatStoreLocation(item.store)}</span>
                </p>
              </div>

              {/* Rating & Review Content */}
              <div className="space-y-3 pt-3 border-t border-[#E2E5DF]">
                <div className="bg-[#F7F6F1] p-3.5 rounded-xl border border-[#E2E5DF] space-y-2">
                  <div className="flex items-center justify-between">
                    <StarRating value={item.rating} readOnly size="xs" />
                    <span className="text-[10px] text-[#707873] font-mono">
                      {formatDate(item.updatedAt || item.createdAt)}
                    </span>
                  </div>

                  {/* Review Text Body */}
                  {item.review ? (
                    <p className="text-xs text-[#171A18] font-normal leading-relaxed bg-white p-3 rounded-lg border border-[#E2E5DF] whitespace-pre-wrap">
                      "{item.review}"
                    </p>
                  ) : (
                    <p className="text-xs text-[#9CA59E] italic">No written review submitted.</p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-1">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="w-full py-2.5 px-4 bg-[#E7F0EB] hover:bg-[#D8E6DE] text-[#173D32] border border-[#CDE0D5] rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Rating & Written Review</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Update Rating & Review Modal */}
      {selectedRatingObj && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E5DF] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 relative text-left">
            <div className="flex items-start justify-between border-b border-[#E2E5DF] pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest block">
                  UPDATE RATING & REVIEW
                </span>
                <h3 className="font-display text-xl font-bold text-[#171A18] line-clamp-1">{selectedRatingObj.store.name}</h3>
                <p className="text-xs text-[#707873] truncate">{selectedRatingObj.store.address}</p>
              </div>
              <button
                onClick={handleCloseModal}
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

            <form onSubmit={handleRatingSubmit} className="space-y-5">
              <div className="space-y-3 py-3 bg-[#F7F6F1] p-4 rounded-2xl border border-[#E2E5DF] text-center">
                <p className="text-[11px] font-bold text-[#707873] uppercase tracking-wider">
                  {currentDisplayScore > 0
                    ? `Selected rating: ${currentDisplayScore}.0 ★`
                    : 'Select rating (1 to 5 stars)'}
                </p>

                <div className="flex justify-center py-1">
                  <StarRating
                    value={selectedScore}
                    onChange={setSelectedScore}
                    onHover={setHoverScore}
                    size="xl"
                  />
                </div>

                <div className="min-h-[1.5rem] flex items-center justify-center">
                  <span className="text-xs font-bold text-[#9A7525] uppercase tracking-wider bg-[#F5E6C8] border border-[#E8D4A8] px-3.5 py-1 rounded-full">
                    {currentDisplayScore > 0
                      ? `${currentDisplayScore} ${currentDisplayScore === 1 ? 'Star' : 'Stars'} — ${getRatingLabel(currentDisplayScore)}`
                      : 'Hover or click a star to rate'}
                  </span>
                </div>
              </div>

              {/* Review Text Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#171A18]">
                  <label htmlFor="userRatingsReviewInput">Edit written review (Optional)</label>
                  <span className={`font-mono text-[10px] ${reviewInput.length > 480 ? 'text-rose-600 font-bold' : 'text-[#707873]'}`}>
                    {reviewInput.length} / 500
                  </span>
                </div>
                <textarea
                  id="userRatingsReviewInput"
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
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 bg-white text-[#707873] border border-[#E2E5DF] rounded-xl text-xs font-semibold hover:bg-[#F7F6F1] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedScore}
                  className="px-6 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold rounded-xl text-xs disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Update Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRatingsPage;
