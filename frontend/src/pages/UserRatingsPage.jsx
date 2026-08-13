import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyRatings, updateRating } from '../api/userStoreService';
import StarRating from '../components/StarRating';
import { Star, MapPin, Edit3, X, AlertCircle, CheckCircle2, RefreshCw, Compass, Heart } from 'lucide-react';

const UserRatingsPage = () => {
  const [ratingsList, setRatingsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Rating Modal State
  const [selectedRatingObj, setSelectedRatingObj] = useState(null);
  const [selectedScore, setSelectedScore] = useState(0);
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
        setRatingsList(response.data.ratings);
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
    setHoverScore(0);
    setModalError('');
    setModalSuccess('');
  };

  const handleCloseModal = () => {
    setSelectedRatingObj(null);
    setSelectedScore(0);
    setHoverScore(0);
    setModalError('');
    setModalSuccess('');
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedScore || selectedScore < 1 || selectedScore > 5) {
      setModalError('Please select a rating between 1 and 5 stars');
      return;
    }

    setSubmitting(true);
    setModalError('');
    setModalSuccess('');

    try {
      const response = await updateRating(selectedRatingObj.store.id, selectedScore);
      if (response.status === 'success') {
        setModalSuccess('Rating updated successfully!');
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

  const highestRating = ratingsList.length > 0 ? Math.max(...ratingsList.map(r => r.rating)) : 0;
  const lowestRating = ratingsList.length > 0 ? Math.min(...ratingsList.map(r => r.rating)) : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 text-[#171A18]">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2E5DF] pb-6 text-left">
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block">
            PERSONAL CONTRIBUTION
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#171A18] tracking-tight">
            Your Store Journey
          </h1>
          <p className="text-xs sm:text-sm text-[#707873]">
            Track and update all the ratings you have shared with the community.
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
              Businesses Rated
            </span>
            <div className="text-3xl font-black text-[#173D32]">{ratingsList.length}</div>
          </div>

          <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">
              Average Given
            </span>
            <div className="text-3xl font-black text-[#C9A24A]">{averageGiven.toFixed(1)}</div>
          </div>

          <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">
              Highest Score
            </span>
            <div className="text-3xl font-black text-[#173D32]">{highestRating}.0</div>
          </div>

          <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">
              Lowest Score
            </span>
            <div className="text-3xl font-black text-[#707873]">{lowestRating}.0</div>
          </div>
        </div>
      )}

      {/* Ratings History List */}
      {loading ? (
        <div className="py-24 text-center text-[#707873] flex flex-col items-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#173D32]" />
          <p className="text-xs font-medium">Loading your rating history...</p>
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
              to="/user/stores"
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
                <h3 className="font-display text-xl font-bold text-[#171A18] tracking-tight line-clamp-1">
                  {item.store.name}
                </h3>
                <p className="text-xs text-[#707873] flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#9CA59E] shrink-0" />
                  <span className="truncate">{item.store.address}</span>
                </p>
              </div>

              {/* Rating Information */}
              <div className="space-y-3 pt-3 border-t border-[#E2E5DF]">
                {/* Your Rating Display */}
                <div className="bg-[#F7F6F1] p-3.5 rounded-xl border border-[#E2E5DF] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#707873] block mb-0.5">
                      Your Rating
                    </span>
                    <div className="flex items-center space-x-2">
                      <StarRating value={item.rating} readOnly size="sm" />
                      <span className="font-extrabold text-[#C9A24A] text-sm">{item.rating}.0</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#707873] uppercase tracking-wider block mb-0.5">
                      Rated Date
                    </span>
                    <span className="text-xs text-[#171A18] font-mono">
                      {formatDate(item.updatedAt || item.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Overall Store Rating Reference */}
                <div className="flex items-center justify-between text-xs text-[#707873] px-1">
                  <span className="text-[11px]">Overall Store Average:</span>
                  <span className="font-bold text-[#171A18]">
                    {Number(item.store.averageRating).toFixed(1)} ★ ({item.store.totalRatings} {item.store.totalRatings === 1 ? 'rating' : 'ratings'})
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-1">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="w-full py-2.5 px-4 bg-[#E7F0EB] hover:bg-[#D8E6DE] text-[#173D32] border border-[#CDE0D5] rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update Rating</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Community Thank You Callout */}
      {!loading && ratingsList.length > 0 && (
        <div className="bg-[#E7F0EB] border border-[#CDE0D5] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white text-[#173D32] rounded-xl border border-[#CDE0D5] shrink-0">
              <Heart className="w-5 h-5 fill-[#173D32]" />
            </div>
            <div>
              <h4 className="font-display text-base font-bold text-[#171A18]">Thank you for your feedback!</h4>
              <p className="text-xs text-[#707873]">Your ratings help fellow community members make better decisions.</p>
            </div>
          </div>
          <Link
            to="/user/stores"
            className="px-5 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white font-bold rounded-xl text-xs shrink-0 transition-colors"
          >
            Rate More Stores
          </Link>
        </div>
      )}

      {/* Interactive Update Rating Modal */}
      {selectedRatingObj && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E5DF] rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 relative text-left">
            <div className="flex items-start justify-between border-b border-[#E2E5DF] pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest block">
                  UPDATE YOUR RATING
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

            <form onSubmit={handleRatingSubmit} className="space-y-5 text-center">
              <div className="space-y-3 py-4 bg-[#F7F6F1] p-5 rounded-2xl border border-[#E2E5DF]">
                <p className="text-[11px] font-bold text-[#707873] uppercase tracking-wider">
                  {currentDisplayScore > 0
                    ? `Selected rating: ${currentDisplayScore}.0`
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
                  <span className="text-xs font-bold text-[#C9A24A] uppercase tracking-wider bg-[#F5E6C8]/60 border border-[#E8D4A8] px-3.5 py-1 rounded-full">
                    {currentDisplayScore > 0
                      ? `${currentDisplayScore} ${currentDisplayScore === 1 ? 'Star' : 'Stars'} — ${getRatingLabel(currentDisplayScore)}`
                      : 'Hover or click a star to rate'}
                  </span>
                </div>
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
                  className="px-6 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold rounded-xl text-xs disabled:opacity-40 transition-colors shadow-xs"
                >
                  {submitting ? 'Saving...' : 'Update Rating'}
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
