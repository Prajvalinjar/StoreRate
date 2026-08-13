import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Lock, Users } from 'lucide-react';

const FinalCTA = () => {
  return (
    <section className="py-16 sm:py-24 bg-[#F7F6F1] border-t border-[#E2E5DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Testimonials Callout */}
        <div className="bg-white border border-[#E2E5DF] rounded-3xl p-8 sm:p-10 shadow-xs flex flex-col md:flex-row items-center gap-8 text-left">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
            alt="Priya S."
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#173D32] shrink-0"
          />
          <div className="space-y-2 flex-1">
            <span className="text-[10px] font-extrabold text-[#707873] uppercase tracking-wider block">WHAT PEOPLE ARE SAYING</span>
            <p className="font-display text-lg sm:text-xl font-bold text-[#171A18] italic">
              "StoreRate helps me find the best local places based on real experiences. Highly recommended!"
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <span className="text-[#C9A24A] font-bold text-sm">★★★★★</span>
              <span className="text-xs font-bold text-[#171A18]">— Priya S., Verified Local Contributor</span>
            </div>
          </div>
        </div>

        {/* Forest Green Callout Card */}
        <div className="bg-[#173D32] text-white rounded-3xl p-8 sm:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-3 text-left">
            <span className="text-[10px] font-extrabold text-[#C9A24A] uppercase tracking-widest bg-[#2F6654] px-3.5 py-1 rounded-full border border-[#3E7D69] inline-block">
              READY TO DISCOVER BETTER BUSINESSES?
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Real reviews. Real experiences. Real trust.
            </h2>
            <p className="text-xs sm:text-sm text-[#D0E2DB] max-w-xl">
              Join community members rating local businesses with confidence.
            </p>
          </div>

          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <Link
              to="/stores"
              className="px-8 py-4 bg-white hover:bg-[#F7F6F1] text-[#173D32] font-black rounded-xl text-sm transition-all shadow-md inline-flex items-center space-x-2"
            >
              <span>Start Exploring</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Trust Badges Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-center">
          <div className="flex items-center justify-center space-x-3 text-xs text-[#171A18] font-bold">
            <div className="p-2.5 bg-[#E7F0EB] border border-[#CDE0D5] text-[#173D32] rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-extrabold text-[#171A18]">100% Real Reviews</p>
              <p className="text-[10px] text-[#707873] font-normal">Verified 1 rating per store rule</p>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-3 text-xs text-[#171A18] font-bold">
            <div className="p-2.5 bg-[#E7F0EB] border border-[#CDE0D5] text-[#173D32] rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-extrabold text-[#171A18]">Secure & Private</p>
              <p className="text-[10px] text-[#707873] font-normal">Encrypted authentication telemetry</p>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-3 text-xs text-[#171A18] font-bold">
            <div className="p-2.5 bg-[#E7F0EB] border border-[#CDE0D5] text-[#173D32] rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-extrabold text-[#171A18]">Community Driven</p>
              <p className="text-[10px] text-[#707873] font-normal">Built for consumers and local stores</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;

