import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserFavorites, removeFavorite } from '../api/userStoreService';
import StoreCard from '../components/StoreCard';
import { Heart, Compass, RefreshCw, AlertCircle } from 'lucide-react';

const MyFavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStoreId, setActionStoreId] = useState(null);

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserFavorites();
      if (response.status === 'success') {
        setFavorites(response.data.favorites || []);
      }
    } catch (err) {
      console.error('Failed to fetch user favorites:', err);
      setError(err.response?.data?.message || 'Failed to load your saved stores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (storeId) => {
    setActionStoreId(storeId);
    try {
      await removeFavorite(storeId);
      setFavorites((prev) => prev.filter((item) => item.id !== storeId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    } finally {
      setActionStoreId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-[#707873] space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#173D32]" />
        <p className="text-xs font-medium">Loading your saved stores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 text-[#171A18] text-left">
      {/* Header Banner */}
      <div className="border-b border-[#E2E5DF] pb-6 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block border border-[#CDE0D5]">
            SAVED BOOKMARKS
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#171A18] tracking-tight">
          Saved Stores ({favorites.length})
        </h1>
        <p className="text-xs sm:text-sm text-[#707873] max-w-2xl font-normal">
          Keep track of local businesses you want to revisit or rate later.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-[#9B2C2C] text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {favorites.length === 0 ? (
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-10 text-center space-y-4 shadow-xs max-w-md mx-auto my-8">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
            <Heart className="w-7 h-7 fill-rose-500" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-[#171A18]">No saved stores yet</h3>
            <p className="text-xs text-[#707873] font-normal">
              Save businesses you want to discover again by clicking the ♡ heart icon on store cards.
            </p>
          </div>
          <Link
            to="/stores"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-[#173D32] hover:bg-[#2F6654] text-white text-xs font-extrabold rounded-xl transition-colors shadow-xs"
          >
            <Compass className="w-4 h-4 text-[#C9A24A]" />
            <span>Explore Stores Now →</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              isSaved={true}
              onToggleFavorite={() => handleRemoveFavorite(store.id)}
              savingFavorite={actionStoreId === store.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFavoritesPage;
