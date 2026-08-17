import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPublicStores, getTopRatedStores } from '../api/publicService';
import { addFavorite, removeFavorite, getUserFavoriteStoreIds } from '../api/userStoreService';
import { STORE_CATEGORIES } from '../constants/categories';
import StoreCard from '../components/StoreCard';
import SafeImage from '../components/SafeImage';
import { formatStoreLocation } from '../utils/locationUtils';
import {
  Search,
  Store,
  X,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Star,
  Award,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

const ExploreStoresPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract filter parameters from URL or use defaults
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'All';
  const minRatingParam = searchParams.get('minRating') || 'all';
  const sortParam = searchParams.get('sort') || 'recommended';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [stores, setStores] = useState([]);
  const [topRatedStores, setTopRatedStores] = useState([]);
  const [favoriteStoreIds, setFavoriteStoreIds] = useState([]);
  const [actionStoreId, setActionStoreId] = useState(null);

  const [pagination, setPagination] = useState({ page: pageParam, limit: 12, total: 0, totalPages: 1 });
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [debouncedQuery, setDebouncedQuery] = useState(queryParam);
  const [loading, setLoading] = useState(true);
  const [topRatedLoading, setTopRatedLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync search input if URL changes
  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  // Debounce search query input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Helper to update URL search parameters
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

  // Fetch user favorites if authenticated
  useEffect(() => {
    const fetchFavorites = async () => {
      if (isAuthenticated && user?.role === 'USER') {
        try {
          const res = await getUserFavoriteStoreIds();
          if (res.status === 'success') {
            setFavoriteStoreIds(res.data.favoriteStoreIds || []);
          }
        } catch {
          // Ignore failure silently
        }
      }
    };
    fetchFavorites();
  }, [isAuthenticated, user]);

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
        search: queryParam,
        category: categoryParam,
        minRating: minRatingParam,
        sort: sortParam,
        page: pageParam,
        limit: 12,
      });

      if (response.status === 'success') {
        setStores(response.data.stores || []);
        setPagination(response.data.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 });
      } else {
        setError(response.message || 'Failed to fetch stores');
      }
    } catch (err) {
      console.error('Failed to fetch stores:', err);
      setError(err.response?.data?.message || 'Unable to connect to StoreRate service.');
    } finally {
      setLoading(false);
    }
  }, [queryParam, categoryParam, minRatingParam, sortParam, pageParam]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleToggleFavorite = async (storeId, nextState) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/stores' } } });
      return;
    }

    if (user?.role !== 'USER') {
      return;
    }

    setActionStoreId(storeId);
    try {
      if (nextState) {
        await addFavorite(storeId);
        setFavoriteStoreIds((prev) => [...prev, storeId]);
      } else {
        await removeFavorite(storeId);
        setFavoriteStoreIds((prev) => prev.filter((id) => id !== storeId));
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setActionStoreId(null);
    }
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSearchParams({});
  };

  const hasActiveFilters =
    Boolean(queryParam) ||
    (categoryParam && categoryParam !== 'All') ||
    (minRatingParam && minRatingParam !== 'all') ||
    (sortParam && sortParam !== 'recommended');

  return (
    <div className="min-h-screen bg-[#F7F6F1] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-[#171A18] text-left">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="border-b border-[#E2E5DF] pb-6 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block border border-[#CDE0D5]">
              VERIFIED MERCHANTS DIRECTORY
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#171A18] tracking-tight">
            Explore Business Listings
          </h1>
          <p className="text-xs sm:text-sm text-[#707873] max-w-2xl font-normal">
            Discover trusted local stores across Maharashtra, inspect genuine customer rating distributions, and share your experience.
          </p>
        </div>

        {/* Top Rated Highlight Showcase */}
        {!hasActiveFilters && pageParam === 1 && topRatedStores.length > 0 && (
          <div className="bg-[#173D32] text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2F6654] pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-[#2F6654] border border-[#3E7D69] text-[#C9A24A] rounded-2xl">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-white">Community Top Rated Picks</h2>
                  <p className="text-xs text-[#A3C2B6] font-normal">Highly rated local businesses with verified feedback</p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-[#C9A24A] uppercase tracking-widest bg-[#235344] px-3.5 py-1.5 rounded-full border border-[#3E7D69] self-start sm:self-auto">
                TOP REPUTATION
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topRatedStores.map((store) => (
                <div key={store.id} className="bg-white text-[#171A18] rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[9px] font-extrabold text-[#173D32] uppercase tracking-wider bg-[#E7F0EB] px-2.5 py-1 rounded-md border border-[#CDE0D5]">
                      {store.category}
                    </span>
                    <h3 className="font-display font-bold text-base line-clamp-1">{store.name}</h3>
                    <p className="text-xs text-[#707873] line-clamp-1">{formatStoreLocation(store)}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#E2E5DF]">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-[#C9A24A]">
                      <Star className="w-4 h-4 fill-[#C9A24A]" />
                      <span>{Number(store.averageRating).toFixed(1)}</span>
                      <span className="text-[#707873] font-normal">({store.totalRatings})</span>
                    </div>
                    <button
                      onClick={() => navigate(`/stores/${store.id}`)}
                      className="text-xs font-extrabold text-[#173D32] hover:underline"
                    >
                      View Profile →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compact Search & Filter Toolbar */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-[#9CA59E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stores by name, address, or category..."
                className="w-full pl-10 pr-10 py-2.5 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl text-xs font-medium text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:ring-2 focus:ring-[#173D32] focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA59E] hover:text-[#171A18] p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Select */}
            <div className="md:col-span-3">
              <select
                value={categoryParam}
                onChange={(e) => updateQueryParams({ category: e.target.value, page: 1 })}
                className="w-full py-2.5 px-3 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl text-xs font-semibold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#173D32] cursor-pointer"
              >
                <option value="All">All Categories</option>
                {STORE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter Select */}
            <div className="md:col-span-3">
              <select
                value={minRatingParam}
                onChange={(e) => updateQueryParams({ minRating: e.target.value, page: 1 })}
                className="w-full py-2.5 px-3 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl text-xs font-semibold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#173D32] cursor-pointer"
              >
                <option value="all">All Rating Scores</option>
                <option value="4.5">4.5+ ★ Top Rated</option>
                <option value="4.0">4.0+ ★ High Reputation</option>
                <option value="3.5">3.5+ ★ Good</option>
                <option value="3.0">3.0+ ★ Average</option>
              </select>
            </div>
          </div>

          {/* Sorting & Filter Summary Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E2E5DF] text-xs">
            <div className="flex items-center space-x-2 text-[#707873] font-semibold">
              <SlidersHorizontal className="w-4 h-4 text-[#173D32]" />
              <span>
                {loading ? 'Searching stores...' : `${pagination.total} ${pagination.total === 1 ? 'store found' : 'stores found'}`}
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleClearAllFilters}
                  className="ml-2 text-rose-700 hover:underline font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-[#707873] font-medium hidden sm:inline">Sort By:</span>
              <select
                value={sortParam}
                onChange={(e) => updateQueryParams({ sort: e.target.value, page: 1 })}
                className="py-1.5 px-3 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl text-xs font-bold text-[#173D32] focus:outline-none focus:ring-2 focus:ring-[#173D32] cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="rating_desc">Highest Rated</option>
                <option value="ratings_count">Most Rated</option>
                <option value="newest">Newest Added</option>
                <option value="name_asc">Name A–Z</option>
                <option value="name_desc">Name Z–A</option>
              </select>
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
            <div className="w-14 h-14 bg-[#E7F0EB] text-[#173D32] rounded-2xl flex items-center justify-center mx-auto border border-[#CDE0D5]">
              <Store className="w-7 h-7" />
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
                  isSaved={favoriteStoreIds.includes(store.id)}
                  onToggleFavorite={handleToggleFavorite}
                  savingFavorite={actionStoreId === store.id}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-3 pt-4 border-t border-[#E2E5DF]">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => updateQueryParams({ page: pagination.page - 1 })}
                  className="px-4 py-2 bg-white border border-[#E2E5DF] rounded-xl text-xs font-bold text-[#171A18] disabled:opacity-40 hover:bg-[#F7F6F1] transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <span className="text-xs font-semibold text-[#707873] px-2 font-mono">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => updateQueryParams({ page: pagination.page + 1 })}
                  className="px-4 py-2 bg-white border border-[#E2E5DF] rounded-xl text-xs font-bold text-[#171A18] disabled:opacity-40 hover:bg-[#F7F6F1] transition-colors flex items-center space-x-1 cursor-pointer"
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
