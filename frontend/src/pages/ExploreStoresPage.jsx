import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPublicStores, getTopRatedStores } from '../api/publicService';
import { STORE_CATEGORIES } from '../constants/categories';
import StoreCard from '../components/StoreCard';
import {
  Search,
  Store,
  X,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Star,
  Award,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

const ExploreStoresPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract filter parameters from URL or use defaults
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'All';
  const minRatingParam = searchParams.get('minRating') || 'all';
  const sortParam = searchParams.get('sort') || 'recommended';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [stores, setStores] = useState([]);
  const [topRatedStores, setTopRatedStores] = useState([]);
  const [pagination, setPagination] = useState({ page: pageParam, limit: 12, total: 0, totalPages: 1 });
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [debouncedQuery, setDebouncedQuery] = useState(queryParam);
  const [loading, setLoading] = useState(true);
  const [topRatedLoading, setTopRatedLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce search query input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL search parameters whenever filter states change
  const updateQueryParams = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (!val || val === 'All' || val === 'all' || val === 'recommended' || (key === 'page' && val === 1)) {
        updated.delete(key);
      } else {
        updated.set(key, val);
      }
    });
    setSearchParams(updated);
  };

  // Sync debounced search query to URL
  useEffect(() => {
    if (debouncedQuery !== queryParam) {
      updateQueryParams({ q: debouncedQuery, page: 1 });
    }
  }, [debouncedQuery]);

  // Fetch top-rated showcase stores
  useEffect(() => {
    const fetchTopStores = async () => {
      setTopRatedLoading(true);
      try {
        const response = await getTopRatedStores(3);
        if (response.status === 'success') {
          setTopRatedStores(response.data.stores || []);
        }
      } catch (err) {
        console.error('Failed to fetch top rated stores:', err);
      } finally {
        setTopRatedLoading(false);
      }
    };
    fetchTopStores();
  }, []);

  // Fetch stores based on active filters
  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPublicStores({
        q: queryParam,
        category: categoryParam,
        minRating: minRatingParam === 'all' ? null : minRatingParam,
        sort: sortParam,
        page: pageParam,
        limit: 12,
      });

      if (response.status === 'success') {
        setStores(response.data.stores || []);
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
  }, [queryParam, categoryParam, minRatingParam, sortParam, pageParam]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleCategorySelect = (selectedCat) => {
    updateQueryParams({ category: selectedCat, page: 1 });
  };

  const handleRatingFilterChange = (minRat) => {
    updateQueryParams({ minRating: minRat, page: 1 });
  };

  const handleSortChange = (newSort) => {
    updateQueryParams({ sort: newSort, page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      updateQueryParams({ page: newPage });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    queryParam ||
    (categoryParam && categoryParam !== 'All') ||
    (minRatingParam && minRatingParam !== 'all') ||
    (sortParam && sortParam !== 'recommended')
  );

  return (
    <div className="min-h-screen bg-[#F7F6F1] py-8 px-4 sm:px-6 lg:px-8 text-[#171A18] text-left">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="border-b border-[#E2E5DF] pb-6">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block border border-[#CDE0D5]">
              INTELLIGENT STORE DISCOVERY
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#171A18] tracking-tight">
              Explore Stores
            </h1>
            <p className="text-xs sm:text-sm text-[#707873] max-w-2xl font-normal">
              Discover verified businesses, filter by category & rating score, and explore community recommendations.
            </p>
          </div>
        </div>

        {/* Top Rated Stores Featured Section (if no query filters active) */}
        {!hasActiveFilters && topRatedStores.length > 0 && (
          <div className="bg-gradient-to-r from-[#173D32] to-[#2F6654] rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#3E7D69] pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#2F6654] border border-[#3E7D69] rounded-full text-[10px] font-extrabold text-[#C9A24A] uppercase tracking-widest">
                  <Award className="w-3.5 h-3.5" />
                  <span>COMMUNITY HIGHLIGHTS</span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Top Rated Stores
                </h2>
                <p className="text-xs text-[#D0E2DB]">Highest rated businesses verified by community consumer reviews.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-[#171A18]">
              {topRatedStores.map((store) => (
                <StoreCard
                  key={`top-${store.id}`}
                  store={store}
                  onViewStore={() => navigate(`/stores/${store.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Compact Discovery Filter Toolbar */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
          {/* ROW 1: Search + Category + Rating */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-6 relative flex items-center">
              <Search className="w-4 h-4 text-[#707873] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stores, categories, locations..."
                className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32] focus:ring-1 focus:ring-[#173D32]/20 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setDebouncedQuery('');
                    updateQueryParams({ q: '' });
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#707873] hover:text-[#171A18] p-1 transition-colors cursor-pointer"
                  aria-label="Clear search input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Dropdown (SINGLE CATEGORY SELECTOR) */}
            <div className="md:col-span-3">
              <select
                value={categoryParam}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#171A18] focus:outline-none focus:border-[#173D32] cursor-pointer"
              >
                <option value="All">All Categories</option>
                {STORE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Rating Dropdown */}
            <div className="md:col-span-3">
              <select
                value={minRatingParam}
                onChange={(e) => handleRatingFilterChange(e.target.value)}
                className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#171A18] focus:outline-none focus:border-[#173D32] cursor-pointer"
              >
                <option value="all">All Ratings</option>
                <option value="4.5">4.5+ ★</option>
                <option value="4">4.0+ ★</option>
                <option value="3.5">3.5+ ★</option>
                <option value="3">3.0+ ★</option>
                <option value="2">2.0+ ★</option>
              </select>
            </div>
          </div>

          {/* ROW 2: Result Count + Sort Dropdown + Clear Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E2E5DF] text-xs">
            {/* Result Count */}
            <div className="text-xs font-extrabold text-[#173D32] flex items-center space-x-2">
              <Store className="w-4 h-4 text-[#C9A24A]" />
              <span>{pagination.total} {pagination.total === 1 ? 'store found' : 'stores found'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
              {/* Sort Dropdown */}
              <div className="flex items-center space-x-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#707873]" />
                <select
                  value={sortParam}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#171A18] focus:outline-none focus:border-[#173D32] cursor-pointer"
                >
                  <option value="recommended">Recommended</option>
                  <option value="newest_added">Newest Added</option>
                  <option value="highest_rated">Highest Rated</option>
                  <option value="most_rated">Most Rated</option>
                  <option value="name_asc">Name A–Z</option>
                  <option value="name_desc">Name Z–A</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearAllFilters}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-extrabold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
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
              onClick={fetchStores}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#173D32] text-white text-xs font-bold rounded-xl hover:bg-[#2F6654] transition-colors cursor-pointer"
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
                {hasActiveFilters
                  ? 'No approved stores match your selected search terms or filters.'
                  : 'No stores are currently registered on the platform.'}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#173D32] text-white text-xs font-bold rounded-xl hover:bg-[#2F6654] transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear All Filters</span>
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
                  className="px-3.5 py-2 bg-white border border-[#E2E5DF] rounded-xl text-xs font-semibold text-[#171A18] hover:bg-[#F7F6F1] disabled:opacity-40 disabled:hover:bg-white flex items-center space-x-1 cursor-pointer"
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
                  className="px-3.5 py-2 bg-white border border-[#E2E5DF] rounded-xl text-xs font-semibold text-[#171A18] hover:bg-[#F7F6F1] disabled:opacity-40 disabled:hover:bg-white flex items-center space-x-1 cursor-pointer"
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
