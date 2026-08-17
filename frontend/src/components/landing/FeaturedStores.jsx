import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTopRatedStores } from '../../api/publicService';
import StoreCard from '../StoreCard';
import { ArrowRight, Store, RefreshCw } from 'lucide-react';

const FeaturedStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTopStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTopRatedStores(3);
      if (response.status === 'success') {
        setStores(response.data?.stores || []);
      } else {
        setError('Unable to load featured businesses.');
      }
    } catch (err) {
      console.error('Failed to fetch top featured stores:', err);
      setError('Unable to connect to StoreRate service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopStores();
  }, []);

  return (
    <section className="py-16 sm:py-24 bg-[#F7F6F1] border-t border-[#E2E5DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 text-left">
            <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block border border-[#CDE0D5]">
              COMMUNITY DIRECTORY
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#171A18] tracking-tight">
              Top Rated Businesses
            </h2>
            <p className="text-sm text-[#707873] max-w-xl font-normal">
              High quality local stores evaluated by real customers in our community.
            </p>
          </div>

          <Link
            to="/stores"
            className="inline-flex items-center space-x-2 text-xs font-bold text-[#173D32] hover:text-[#2F6654] transition-colors self-start md:self-auto"
          >
            <span>Explore all businesses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Store Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-[#E2E5DF] rounded-2xl p-5 space-y-4 animate-pulse">
                <div className="h-44 bg-[#E7F0EB] rounded-xl w-full" />
                <div className="space-y-2">
                  <div className="h-5 bg-[#E7F0EB] rounded w-3/4" />
                  <div className="h-3 bg-[#E7F0EB] rounded w-1/2" />
                </div>
                <div className="h-10 bg-[#E7F0EB] rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border border-[#E2E5DF] rounded-2xl p-12 text-center space-y-3 shadow-xs">
            <Store className="w-8 h-8 text-rose-600 mx-auto" />
            <p className="font-display text-base font-bold text-[#171A18]">{error}</p>
            <button
              type="button"
              onClick={fetchTopStores}
              className="inline-flex items-center space-x-2 text-xs font-bold text-[#173D32] hover:text-[#2F6654] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        ) : stores.length === 0 ? (
          <div className="bg-white border border-[#E2E5DF] rounded-2xl p-12 text-center space-y-3 shadow-xs">
            <Store className="w-8 h-8 text-[#173D32] mx-auto" />
            <p className="font-display text-base font-bold text-[#171A18]">No featured stores available</p>
            <p className="text-xs text-[#707873]">Store listings will appear here once approved by administrators.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedStores;

