import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyRatings, getStores, getUserFavorites } from '../api/userStoreService';
import StoreCard from '../components/StoreCard';
import { formatStoreLocation } from '../utils/locationUtils';
import { 
  Compass, Star, Heart, CheckCircle2, ArrowRight, Store, MapPin, 
  Sparkles, RefreshCw, Award 
} from 'lucide-react';

const UserOverviewPage = () => {
  const { user } = useAuth();
  const [ratingsList, setRatingsList] = useState([]);
  const [favoritesList, setFavoritesList] = useState([]);
  const [topStores, setTopStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      setLoading(true);
      try {
        const [ratingsRes, storesRes, favRes] = await Promise.all([
          getMyRatings().catch(() => ({ status: 'error', data: { ratings: [] } })),
          getStores({ sort: 'rating_desc', limit: 4 }).catch(() => ({ status: 'error', data: { stores: [] } })),
          getUserFavorites().catch(() => ({ status: 'error', data: { favorites: [] } })),
        ]);

        if (ratingsRes.status === 'success') {
          setRatingsList(ratingsRes.data.ratings || []);
        }
        if (storesRes.status === 'success') {
          setTopStores(storesRes.data.stores || []);
        }
        if (favRes.status === 'success') {
          setFavoritesList(favRes.data.favorites || []);
        }
      } catch (err) {
        console.error('Failed to load user overview telemetry:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const totalRated = ratingsList.length;
  const favoritesCount = favoritesList.length;
  const avgGiven = totalRated > 0
    ? Number((ratingsList.reduce((acc, r) => acc + r.rating, 0) / totalRated).toFixed(1))
    : 0.0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 text-[#171A18] text-left">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-[#173D32] to-[#2F6654] rounded-3xl p-6 sm:p-8 md:p-10 text-white space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Store className="w-80 h-80 text-white" />
        </div>

        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#2F6654] border border-[#3E7D69] rounded-full text-[10px] font-extrabold text-[#C9A24A] uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CUSTOMER PORTAL</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            {getGreeting()}, {user?.name || 'Valued Customer'} 👋
          </h1>

          <p className="text-xs sm:text-sm text-[#D0E2DB] font-normal leading-relaxed">
            Discover trusted local businesses, share your experience, and track your ratings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 relative z-10">
          <Link
            to="/stores"
            className="px-6 py-3 bg-[#C9A24A] hover:bg-[#B59039] text-[#173D32] font-extrabold rounded-xl text-xs flex items-center space-x-2 transition-all shadow-xs"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Stores →</span>
          </Link>

          <Link
            to="/user/favorites"
            className="px-6 py-3 bg-[#235344] hover:bg-[#2F6654] text-white border border-[#3E7D69] font-bold rounded-xl text-xs flex items-center space-x-2 transition-all"
          >
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            <span>View Saved Stores ({favoritesCount})</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-[#707873] uppercase tracking-wider">
              Stores Rated
            </span>
            <div className="p-2 bg-[#E7F0EB] text-[#173D32] rounded-xl border border-[#CDE0D5]">
              <Star className="w-4 h-4 text-[#C9A24A] fill-[#C9A24A]" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#173D32]">{loading ? '-' : totalRated}</div>
            <p className="text-[11px] text-[#707873] mt-0.5">Total reviews submitted</p>
          </div>
        </div>

        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-[#707873] uppercase tracking-wider">
              Avg Rating Given
            </span>
            <div className="p-2 bg-[#F5E6C8]/60 text-[#9A7525] rounded-xl border border-[#E8D4A8]">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#C9A24A]">
              {loading ? '-' : totalRated > 0 ? `${avgGiven} ★` : 'No ratings'}
            </div>
            <p className="text-[11px] text-[#707873] mt-0.5">Your average score</p>
          </div>
        </div>

        <Link
          to="/user/favorites"
          className="bg-white border border-[#E2E5DF] hover:border-[#173D32] rounded-2xl p-5 shadow-xs space-y-2 flex flex-col justify-between transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-[#707873] uppercase tracking-wider group-hover:text-[#173D32]">
              Saved Stores
            </span>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#171A18] group-hover:text-[#173D32]">
              {loading ? '-' : favoritesCount}
            </div>
            <p className="text-[11px] text-[#707873] mt-0.5">Saved store bookmarks</p>
          </div>
        </Link>

        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-[#707873] uppercase tracking-wider">
              Account Status
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-sm font-black text-[#173D32] flex items-center space-x-1.5 pt-2">
              <span>Verified Customer</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
            <p className="text-[11px] text-[#707873] mt-0.5">Active member profile</p>
          </div>
        </div>
      </div>

      {/* Recent Ratings Section */}
      <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E2E5DF] pb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-[#171A18]">Recent Ratings</h2>
            <p className="text-xs text-[#707873]">Your latest feedback contributions stored in database</p>
          </div>
          {totalRated > 0 && (
            <Link to="/user/ratings" className="text-xs font-extrabold text-[#173D32] hover:underline flex items-center space-x-1">
              <span>View History</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C9A24A]" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-[#707873] flex flex-col items-center space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#173D32]" />
            <span className="text-xs">Loading recent ratings...</span>
          </div>
        ) : ratingsList.length === 0 ? (
          <div className="py-10 bg-[#F7F6F1] rounded-2xl border border-[#E2E5DF] text-center space-y-3 p-6">
            <div className="w-12 h-12 bg-white text-[#C9A24A] rounded-2xl flex items-center justify-center mx-auto border border-[#E2E5DF]">
              <Star className="w-6 h-6 fill-[#C9A24A]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-[#171A18]">You haven't rated any stores yet.</h3>
              <p className="text-xs text-[#707873] max-w-sm mx-auto font-normal">
                Discover your favorite local places and share your experience to help the community.
              </p>
            </div>
            <Link
              to="/stores"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Stores →</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ratingsList.slice(0, 4).map((item) => (
              <div key={item.id} className="p-4 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl flex items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <h4 className="font-bold text-sm text-[#171A18] truncate">{item.store.name}</h4>
                  <p className="text-xs text-[#707873] truncate flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-[#9CA59E] shrink-0" />
                    <span>{formatStoreLocation(item.store)}</span>
                  </p>
                  <div className="flex items-center space-x-1 text-xs font-bold text-[#C9A24A]">
                    <span>Your rating: {item.rating}.0 ★</span>
                  </div>
                </div>
                <Link
                  to={`/stores/${item.store.id}`}
                  className="px-3 py-2 bg-white border border-[#E2E5DF] hover:bg-[#E7F0EB] text-[#173D32] text-xs font-bold rounded-xl shrink-0 transition-colors"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Rated Stores Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-[#E2E5DF] pb-4">
          <div>
            <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block border border-[#CDE0D5] mb-1">
              COMMUNITY TOP PICKS
            </span>
            <h2 className="font-display text-2xl font-bold text-[#171A18]">Top Rated Stores Near You</h2>
          </div>
          <Link to="/stores" className="text-xs font-extrabold text-[#173D32] hover:underline flex items-center space-x-1">
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C9A24A]" />
          </Link>
        </div>

        {topStores.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOverviewPage;
