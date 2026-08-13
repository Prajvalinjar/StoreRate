import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Star } from 'lucide-react';
import StarRating from '../StarRating';
import SafeImage from '../SafeImage';

const FeaturedStores = () => {
  const stores = [
    {
      id: 'store-1',
      name: 'Demo StoreRate Market',
      address: 'Kolhapur, Maharashtra',
      category: 'Supermarket & Grocery',
      averageRating: 4.7,
      totalRatings: 3,
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'store-2',
      name: 'FreshMart Grocery Store',
      address: 'Main Street Market, Kolhapur',
      category: 'Grocery & Essentials',
      averageRating: 4.0,
      totalRatings: 2,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'store-3',
      name: 'City Electronics Superstore',
      address: 'Commercial Hub, Pune',
      category: 'Electronics & Tech',
      averageRating: 5.0,
      totalRatings: 1,
      image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
    },
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white border border-[#E2E5DF] rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-[#173D32]/40 transition-all duration-300 flex flex-col justify-between group text-left"
            >
              {/* Photo Box */}
              <div className="relative h-48 w-full bg-[#173D32] overflow-hidden">
                <SafeImage
                  src={store.image}
                  alt={store.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  category={store.category.includes('Grocery') ? 'grocery' : store.category.includes('Tech') ? 'electronics' : 'fashion'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <span className="absolute top-3 left-3 bg-[#173D32]/90 backdrop-blur-xs text-[#E7F0EB] text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-[#2F6654] z-10">
                  {store.category}
                </span>
              </div>

              {/* Body Box */}
              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <h3 className="font-display text-xl font-bold text-[#171A18] tracking-tight line-clamp-1 group-hover:text-[#173D32] transition-colors">
                    {store.name}
                  </h3>
                  <p className="text-xs text-[#707873] flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#9CA59E] shrink-0" />
                    <span>{store.address}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E2E5DF] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 fill-[#C9A24A] text-[#C9A24A]" />
                    <span className="text-lg font-black text-[#171A18]">{store.averageRating.toFixed(1)}</span>
                    <StarRating value={store.averageRating} readOnly size="xs" />
                  </div>
                  <span className="text-xs text-[#707873] font-mono">
                    ({store.totalRatings})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedStores;

