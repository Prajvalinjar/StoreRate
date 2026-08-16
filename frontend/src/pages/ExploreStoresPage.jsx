import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicStores } from '../api/publicService';
import StoreCard from '../components/StoreCard';
import { Search, Store, X, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const ExploreStoresPage = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchStores = useCallback(async (q = debouncedQuery, page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPublicStores({ q, page, limit: 12 });
      if (response.status === 'success') {
        setStores(response.data.stores);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch public stores:', err);
      setError(err.response?.data?.message || 'Unable to load stores. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    fetchStores(debouncedQuery, 1);
  }, [debouncedQuery, fetchStores]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchStores(debouncedQuery, newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
  };

  return (
    <div className="min-h-screen bg-[#F7F6F1] py-8 px-4 sm:px-6 lg:px-8 text-[#171A18]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2E5DF] pb-6 text-left">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block border border-[#CDE0D5]">
              BUSINESS DISCOVERY
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#171A18] tracking-tight">
              Explore Stores
            </h1>
            <p className="text-xs sm:text-sm text-[#707873] max-w-2xl font-normal">
              Discover businesses and see what customers think.
            </p>
          </div>

          {!loading && (
            <div className="text-[11px] font-bold tracking-wider uppercase text-[#173D32] bg-white border border-[#E2E5DF] px-4 py-2 rounded-xl shrink-0 shadow-xs self-start md:self-auto">
              <span>{pagination.total} {pagination.total === 1 ? 'STORE FOUND' : 'STORES FOUND'}</span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-2.5 shadow-sm">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#707873] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stores by name or location (e.g. Kolhapur, Market)..."
              className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl py-3 pl-10 pr-10 text-xs sm:text-sm text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32] focus:ring-1 focus:ring-[#173D32]/20 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#707873] hover:text-[#171A18] p-1 transition-colors"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-[#9B2C2C] space-y-3 text-center">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center mx-auto text-[#9B2C2C]">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm">Unable to load stores</h3>
            <p className="text-xs text-rose-700">{error}</p>
            <button
              onClick={() => fetchStores(debouncedQuery, pagination.page)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#173D32] text-white text-xs font-bold rounded-xl hover:bg-[#2F6654] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* Loading Skeleton Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-[#E2E5DF] rounded-2xl p-5 space-y-4 animate-pulse">
                <div className="h-40 bg-[#E7F0EB] rounded-xl w-full" />
                <div className="space-y-2">
                  <div className="h-5 bg-[#E7F0EB] rounded w-3/4" />
                  <div className="h-3 bg-[#E7F0EB] rounded w-1/2" />
                </div>
                <div className="h-10 bg-[#E7F0EB] rounded-xl w-full pt-2" />
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-[#E2E5DF] rounded-2xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 bg-[#E7F0EB] text-[#173D32] rounded-2xl flex items-center justify-center mx-auto border border-[#CDE0D5]">
              <Store className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-[#171A18]">No stores found</h3>
              <p className="text-xs text-[#707873] max-w-sm mx-auto font-normal">
                {debouncedQuery
                  ? `Try searching for another business or location. No matches found for "${debouncedQuery}".`
                  : 'No stores are currently registered on the platform.'}
              </p>
            </div>
            {debouncedQuery && (
              <button
                onClick={handleClearSearch}
                className="inline-flex items-center space-x-1 px-4 py-2 bg-[#173D32] text-white text-xs font-bold rounded-xl hover:bg-[#2F6654] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Search</span>
              </button>
            )}
          </div>
        ) : (
          /* Store Grid */
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onViewStore={() => navigate(`/stores/${store.id}`)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-3 pt-4 border-t border-[#E2E5DF]">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3.5 py-2 bg-white border border-[#E2E5DF] rounded-xl text-xs font-semibold text-[#171A18] hover:bg-[#F7F6F1] disabled:opacity-40 disabled:hover:bg-white flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <span className="text-xs font-bold text-[#707873]">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3.5 py-2 bg-white border border-[#E2E5DF] rounded-xl text-xs font-semibold text-[#171A18] hover:bg-[#F7F6F1] disabled:opacity-40 disabled:hover:bg-white flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreStoresPage;
