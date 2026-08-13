import React, { useState, useEffect } from 'react';
import { getStores, submitRating, updateRating } from '../api/userStoreService';
import StoreCard from '../components/StoreCard';
import StarRating from '../components/StarRating';
import { Search, Store, X, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

const UserStoresPage = () => {
  const [stores, setStores] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Rating Modal State
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const fetchStores = async (q = activeSearch) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (q && q.trim()) {
        params.q = q.trim();
      }
      const response = await getStores(params);
      if (response.status === 'success') {
        setStores(response.data.stores);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch store listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores(activeSearch);
  }, [activeSearch]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedStore) {
        handleCloseModal();
      }
    };
    if (selectedStore) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedStore]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
  };

  const handleOpenRateModal = (store) => {
    setSelectedStore(store);
    setSelectedRating(store.userRating || 0);
    setHoverRating(0);
    setModalError('');
    setModalSuccess('');
  };

  const handleCloseModal = () => {
    setSelectedStore(null);
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
      if (selectedStore.userRating) {
        response = await updateRating(selectedStore.id, selectedRating);
      } else {
        response = await submitRating(selectedStore.id, selectedRating);
      }

      if (response.status === 'success') {
        setModalSuccess('Rating saved successfully!');
        setTimeout(() => {
          handleCloseModal();
          fetchStores(activeSearch);
        }, 700);
      }
    } catch (err) {
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
      default: return 'Select your rating';
    }
  };

  const currentDisplayRating = hoverRating || selectedRating;

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 text-[#171A18]">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2E5DF] pb-6 text-left">
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block">
            CONSUMER DISCOVERY PORTAL
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#171A18] tracking-tight">
            Find a store worth rating.
          </h1>
          <p className="text-xs sm:text-sm text-[#707873] max-w-2xl font-normal">
            Explore local businesses, see what others think, and share your experience.
          </p>
        </div>

        {!loading && (
          <div className="text-[11px] font-bold tracking-wider uppercase text-[#173D32] bg-white border border-[#E2E5DF] px-4 py-2 rounded-xl shrink-0 shadow-xs self-start md:self-auto">
            <span>{stores.length} {stores.length === 1 ? 'STORE AVAILABLE' : 'STORES AVAILABLE'}</span>
          </div>
        )}
      </div>

      {/* Sleek Search Area */}
      <form onSubmit={handleSearchSubmit} className="bg-white border border-[#E2E5DF] rounded-2xl p-2 sm:p-2.5 flex items-center gap-2 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#707873] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stores by name or location (e.g. Kolhapur, Electronics)..."
            className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32] focus:ring-1 focus:ring-[#173D32]/20 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#707873] hover:text-[#171A18] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold rounded-xl text-xs sm:text-sm transition-colors shrink-0 shadow-xs"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-[#9B2C2C] text-xs sm:text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Store Grid */}
      {loading ? (
        <div className="py-24 text-center text-[#707873] flex flex-col items-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#173D32]" />
          <p className="text-xs font-medium">Loading store directory...</p>
        </div>
      ) : stores.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 bg-[#E7F0EB] text-[#173D32] rounded-2xl flex items-center justify-center mx-auto border border-[#CDE0D5]">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-[#171A18]">NO STORES FOUND</h3>
          <p className="text-xs text-[#707873] max-w-sm mx-auto font-normal">
            {activeSearch ? `Try another store name or location. No matches for "${activeSearch}".` : 'No stores are currently registered on the platform.'}
          </p>
          {activeSearch && (
            <button
              onClick={handleClearSearch}
              className="inline-flex items-center space-x-1 text-xs text-[#173D32] hover:underline font-bold pt-1"
            >
              <span>Clear search filter</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} onRate={handleOpenRateModal} />
          ))}
        </div>
      )}

      {/* Interactive Rating Modal */}
      {selectedStore && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#E2E5DF] rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 relative text-left">
            <div className="flex items-start justify-between border-b border-[#E2E5DF] pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest block">
                  RATE YOUR EXPERIENCE
                </span>
                <h3 className="font-display text-xl font-bold text-[#171A18] line-clamp-1">{selectedStore.name}</h3>
                <p className="text-xs text-[#707873] truncate">{selectedStore.address}</p>
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
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 bg-white text-[#707873] border border-[#E2E5DF] rounded-xl text-xs font-semibold hover:bg-[#F7F6F1] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedRating}
                  className="px-6 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold rounded-xl text-xs disabled:opacity-40 transition-colors shadow-xs"
                >
                  {submitting
                    ? 'Saving...'
                    : selectedStore.userRating
                    ? 'Update Rating'
                    : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStoresPage;
