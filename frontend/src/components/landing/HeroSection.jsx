import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, ShieldCheck, Search, Star } from 'lucide-react';
import SafeImage from '../SafeImage';

const HeroSection = () => {
  return (
    <section id="discover" className="pt-12 sm:pt-16 pb-16 sm:pb-24 bg-[#F7F6F1] relative overflow-hidden text-left text-[#171A18]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headlines & Discovery Search */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-[#E7F0EB] border border-[#CDE0D5] rounded-full">
              <ShieldCheck className="w-4 h-4 text-[#173D32]" />
              <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest">
                VERIFIED COMMUNITY TELEMETRY
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#171A18] tracking-tight leading-[1.1]">
              Know where to go.<br />
              <span className="text-[#173D32]">Know who to trust.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#707873] leading-relaxed max-w-2xl font-normal">
              Discover businesses through real customer experiences and trusted community ratings. Find local stores, read verified feedback, and make better choices.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <Link
                to="/stores"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold rounded-xl text-sm transition-all shadow-xs"
              >
                <Search className="w-4 h-4" />
                <span>Explore Businesses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 bg-white hover:bg-[#F7F6F1] text-[#171A18] border border-[#E2E5DF] font-bold rounded-xl text-sm transition-all shadow-xs"
              >
                <span>For Business Owners</span>
              </Link>
            </div>

            {/* Real Database Platform Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#E2E5DF] text-xs">
              <div>
                <span className="text-2xl font-black text-[#173D32] block">3</span>
                <span className="text-[#707873] font-medium">Businesses</span>
              </div>
              <div>
                <span className="text-2xl font-black text-[#C9A24A] block">6</span>
                <span className="text-[#707873] font-medium">Ratings</span>
              </div>
              <div>
                <span className="text-2xl font-black text-[#173D32] block">9</span>
                <span className="text-[#707873] font-medium">Users</span>
              </div>
              <div>
                <span className="text-2xl font-black text-[#C9A24A] block">4.7 ★</span>
                <span className="text-[#707873] font-medium">Avg Rating</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Image with Forest Green Arch Accent & Floating Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Forest Green Background Arc Accent */}
              <div className="absolute -inset-4 bg-[#173D32] rounded-[2.5rem] rotate-2 opacity-95 shadow-xl" />

              {/* Main Store Photo Box */}
              <div className="relative z-10 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl h-[420px] bg-[#173D32]">
                <SafeImage
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80"
                  fallbackSrc="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80"
                  alt="Moonlight Coffee Co."
                  className="w-full h-full object-cover"
                  category="cafe"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                {/* Floating Rating Overlay Card */}
                <div className="absolute bottom-5 right-5 left-5 sm:left-auto sm:w-64 bg-white/95 backdrop-blur-md border border-[#E2E5DF] p-4 rounded-2xl shadow-xl space-y-1.5 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 z-20">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-[#171A18] text-sm">Moonlight Coffee Co.</h4>
                    <span className="px-2 py-0.5 bg-[#E7F0EB] text-[#173D32] font-bold text-[9px] rounded-full uppercase">Café</span>
                  </div>
                  <p className="text-[11px] text-[#707873] flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-[#9CA59E]" />
                    <span>Kolhapur, Maharashtra</span>
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-[#C9A24A] text-[#C9A24A]" />
                      <span className="font-black text-sm text-[#171A18]">4.8</span>
                    </div>
                    <span className="text-[10px] text-[#707873] font-mono">(128 reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

