import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicStores } from '../api/publicService';
import { 
  Utensils, ShoppingCart, Tv, Shirt, Sparkles, HeartPulse, GraduationCap, 
  Wrench, Car, Armchair, Store, Layers, ArrowRight, RefreshCw 
} from 'lucide-react';

const CATEGORIES_DEF = [
  { name: 'Restaurant', icon: Utensils, desc: 'Dining, cafes, bakeries & food spots', color: 'bg-[#E7F0EB] text-[#173D32]' },
  { name: 'Grocery', icon: ShoppingCart, desc: 'Fresh produce, supermarkets & daily essentials', color: 'bg-emerald-50 text-emerald-800' },
  { name: 'Electronics', icon: Tv, desc: 'Mobile stores, appliances & tech repair', color: 'bg-blue-50 text-blue-800' },
  { name: 'Fashion', icon: Shirt, desc: 'Clothing, footwear & apparel boutiques', color: 'bg-purple-50 text-purple-800' },
  { name: 'Beauty', icon: Sparkles, desc: 'Salons, spas, cosmetics & wellness', color: 'bg-pink-50 text-pink-800' },
  { name: 'Healthcare', icon: HeartPulse, desc: 'Pharmacies, clinics & medical stores', color: 'bg-red-50 text-red-800' },
  { name: 'Education', icon: GraduationCap, desc: 'Bookstores, coaching institutes & stationery', color: 'bg-amber-50 text-amber-900' },
  { name: 'Services', icon: Wrench, desc: 'Tailors, repair services & professional help', color: 'bg-indigo-50 text-indigo-800' },
  { name: 'Automotive', icon: Car, desc: 'Auto garages, spare parts & car care', color: 'bg-orange-50 text-orange-900' },
  { name: 'Home & Furniture', icon: Armchair, desc: 'Furniture, home decor & hardware', color: 'bg-teal-50 text-teal-800' },
  { name: 'General', icon: Store, desc: 'Multi-purpose department & local retail', color: 'bg-[#F7F6F1] text-[#171A18]' },
  { name: 'Other', icon: Layers, desc: 'Specialized local businesses & services', color: 'bg-stone-100 text-stone-800' },
];

const CategoriesPage = () => {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const response = await getPublicStores({ limit: 100 });
        if (response.status === 'success') {
          const stores = response.data.stores || [];
          const categoryMap = {};
          stores.forEach((s) => {
            const cat = s.category || 'General';
            categoryMap[cat] = (categoryMap[cat] || 0) + 1;
          });
          setCounts(categoryMap);
        }
      } catch (err) {
        console.error('Failed to load category counts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryCounts();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F6F1] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-[#171A18] text-left">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="border-b border-[#E2E5DF] pb-6 space-y-2">
          <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block border border-[#CDE0D5]">
            LOCAL BUSINESS DIRECTORY
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#171A18] tracking-tight">
            Browse Store Categories
          </h1>
          <p className="text-xs sm:text-sm text-[#707873] max-w-2xl font-normal">
            Explore verified local businesses organized by industry sector across Maharashtra cities.
          </p>
        </div>

        {/* Category Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-[#707873] flex flex-col items-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#173D32]" />
            <p className="text-xs font-medium">Loading store categories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {CATEGORIES_DEF.map((cat) => {
              const Icon = cat.icon;
              const storeCount = counts[cat.name] || 0;
              return (
                <Link
                  key={cat.name}
                  to={`/stores?category=${encodeURIComponent(cat.name)}`}
                  className="bg-white border border-[#E2E5DF] rounded-2xl p-5 hover:border-[#173D32] hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-black/5 ${cat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-[#171A18] group-hover:text-[#173D32] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-[#707873] mt-1 line-clamp-2">
                        {cat.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E2E5DF] flex items-center justify-between text-xs font-bold text-[#173D32]">
                    <span>{storeCount} {storeCount === 1 ? 'store listed' : 'stores listed'}</span>
                    <ArrowRight className="w-4 h-4 text-[#C9A24A] group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
