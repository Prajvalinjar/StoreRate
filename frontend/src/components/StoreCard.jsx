import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Edit3, Star, Store, Sparkles, Heart, RefreshCw } from 'lucide-react';
import StarRating from './StarRating';
import SafeImage from './SafeImage';

const STORE_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    category: 'Café & Coffee',
  },
  {
    url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80',
    category: 'Bookstore & Stationery',
  },
  {
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    category: 'Fresh Grocery',
  },
  {
    url: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
    category: 'Electronics Tech',
  },
  {
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    category: 'Boutique Apparel',
  },
  {
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    category: 'Artisan Bakery',
  },
];

const getStoreVisual = (storeId, storeName) => {
  let hash = 0;
  const str = (storeId || '') + (storeName || '');
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % STORE_IMAGES.length;
  return STORE_IMAGES[index];
};

const StoreCard = ({ store, onRate, isSaved = false, onToggleFavorite, savingFavorite = false }) => {
  const { id, name, address, averageRating, totalRatings, userRating } = store;
  const visual = getStoreVisual(id, name);

  // Rating percentage position on 1-5 scale
  const ratingPercent = totalRatings > 0
    ? Math.min(Math.max(((averageRating - 1) / 4) * 100, 0), 100)
    : 0;

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(id, !isSaved);
    }
  };

  return (
    <div className="bg-white border border-[#E2E5DF] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between hover:border-[#173D32]/40 hover:shadow-xl transition-all duration-300 group">
      {/* Store Header Image */}
      <div className="relative h-44 w-full bg-[#173D32] overflow-hidden">
        <SafeImage
          src={store.imageUrl || visual.url}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
        
        {/* Category Pill & Verified Badge */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5 z-10">
          <span className="bg-[#173D32]/90 backdrop-blur-xs text-[#E7F0EB] text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-[#2F6654]">
            {store.category || visual.category}
          </span>
          {store.isVerified === true && (
            <span className="bg-[#C9A24A]/90 backdrop-blur-xs text-[#173D32] text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full border border-amber-300">
              ✓ Verified Business
            </span>
          )}
        </div>

        {/* Favorite Save Button */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={handleFavoriteClick}
            disabled={savingFavorite}
            className={`absolute top-3 right-3 z-20 p-2 rounded-xl border backdrop-blur-xs transition-all duration-200 cursor-pointer ${
              isSaved
                ? 'bg-rose-500 text-white border-rose-600 shadow-md'
                : 'bg-black/40 hover:bg-black/60 text-white border-white/20'
            }`}
            aria-label={isSaved ? 'Remove from saved stores' : 'Save store'}
            title={isSaved ? 'Saved store' : 'Save store'}
          >
            {savingFavorite ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className={`w-4 h-4 transition-transform ${isSaved ? 'fill-white text-white scale-110' : ''}`} />
            )}
          </button>
        )}

        {/* Rating Floating Badge */}
        {totalRatings > 0 && (
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-md flex items-center space-x-1.5 border border-[#E2E5DF]">
            <Star className="w-3.5 h-3.5 fill-[#C9A24A] text-[#C9A24A]" />
            <span className="font-black text-sm text-[#171A18]">{Number(averageRating).toFixed(1)}</span>
            <span className="text-[10px] text-[#707873] font-medium">({totalRatings})</span>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/stores/${id}`} className="hover:underline">
              <h3 className="font-display text-xl font-bold text-[#171A18] tracking-tight line-clamp-1 group-hover:text-[#173D32] transition-colors">
                {name}
              </h3>
            </Link>
          </div>
          <p className="text-xs text-[#707873] flex items-center space-x-1.5 font-normal">
            <MapPin className="w-3.5 h-3.5 text-[#9CA59E] shrink-0" />
            <span className="truncate">{address}</span>
          </p>
        </div>

        {/* Overall Rating Scale */}
        <div className="space-y-3 pt-3 border-t border-[#E2E5DF]">
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#707873] mb-1">
              <span>Community Consensus</span>
              <span className="font-mono text-[#173D32]">5.0 Scale</span>
            </div>

            {totalRatings > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl font-black text-[#C9A24A] tracking-tight leading-none">
                    {Number(averageRating).toFixed(1)}
                  </span>
                  <div className="flex flex-col justify-center">
                    <StarRating value={averageRating} readOnly size="sm" />
                    <span className="text-[11px] text-[#707873] font-medium mt-0.5">
                      {totalRatings} {totalRatings === 1 ? 'community rating' : 'community ratings'}
                    </span>
                  </div>
                </div>

                {/* Visual 1–5 Scale Bar */}
                <div className="pt-1 px-0.5 space-y-1">
                  <div className="relative w-full h-1.5 bg-[#E7F0EB] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#C9A24A] to-[#173D32] rounded-full transition-all duration-300"
                      style={{ width: `${ratingPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-[#9CA59E] font-mono px-0.5">
                    <span>1.0</span>
                    <span>3.0</span>
                    <span>5.0</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 py-2 text-[#707873] text-xs bg-[#F7F6F1] px-3 py-1.5 rounded-lg border border-[#E2E5DF]">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A24A]" />
                <span className="italic">Be the first to review this business</span>
              </div>
            )}
          </div>

          {/* User's Rating Status Tag */}
          {userRating !== undefined && (
            <div className="text-xs flex items-center justify-between text-[#171A18] bg-[#F7F6F1] px-3.5 py-2 rounded-xl border border-[#E2E5DF]">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#707873]">Your Rating</span>
              {userRating ? (
                <div className="flex items-center space-x-1.5">
                  <StarRating value={userRating} readOnly size="sm" />
                  <span className="font-extrabold text-[#C9A24A] text-xs">{userRating}.0</span>
                </div>
              ) : (
                <span className="text-[#9CA59E] text-[11px] italic">Not submitted</span>
              )}
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="pt-1 flex items-center space-x-2">
          {onRate ? (
            <button
              onClick={() => onRate(store)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition-all duration-150 cursor-pointer ${
                userRating
                  ? 'bg-[#E7F0EB] hover:bg-[#D8E6DE] text-[#173D32] border border-[#CDE0D5]'
                  : 'bg-[#173D32] hover:bg-[#2F6654] text-white shadow-xs active:scale-[0.99]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{userRating ? 'Update Your Rating' : 'Rate Business'}</span>
            </button>
          ) : (
            <Link
              to={`/stores/${id}`}
              className="w-full py-2.5 px-4 bg-[#173D32] hover:bg-[#2F6654] text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition-all duration-150 shadow-xs cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-[#C9A24A]" />
              <span>View Store</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreCard;
