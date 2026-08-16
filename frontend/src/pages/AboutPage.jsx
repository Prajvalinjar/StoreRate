import React from 'react';
import { Link } from 'react-router-dom';
import { Store, ShieldCheck, Award, Heart, ArrowRight } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#F7F6F1] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-[#171A18] text-left">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Banner Header */}
        <div className="border-b border-[#E2E5DF] pb-6 space-y-2">
          <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block border border-[#CDE0D5]">
            OUR PLATFORM MISSION
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#171A18] tracking-tight">
            About StoreRate
          </h1>
          <p className="text-xs sm:text-sm text-[#707873] max-w-2xl font-normal">
            StoreRate is India's dedicated business reputation and store rating platform connecting local shoppers with verified merchants.
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center space-x-3 text-[#173D32]">
            <Store className="w-6 h-6 text-[#C9A24A]" />
            <h2 className="font-display text-xl font-bold">Empowering Local Commerce</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#707873] leading-relaxed font-normal">
            Whether you are searching for a traditional restaurant in Kolhapur, a reliable electronics center in Pune, or daily essentials in Mumbai, StoreRate provides transparent rating intelligence so you can shop with confidence.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E2E5DF]">
            <div className="p-4 bg-[#F7F6F1] rounded-xl border border-[#E2E5DF] space-y-1">
              <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">Verified Merchants</span>
              <p className="font-bold text-sm text-[#173D32]">36+ Approved Stores</p>
            </div>
            <div className="p-4 bg-[#F7F6F1] rounded-xl border border-[#E2E5DF] space-y-1">
              <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">Coverage</span>
              <p className="font-bold text-sm text-[#173D32]">8 Key Cities</p>
            </div>
            <div className="p-4 bg-[#F7F6F1] rounded-xl border border-[#E2E5DF] space-y-1">
              <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">Store Categories</span>
              <p className="font-bold text-sm text-[#173D32]">12 Industry Sectors</p>
            </div>
          </div>
        </div>

        {/* Callout */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-[#E7F0EB] border border-[#CDE0D5] rounded-2xl">
          <div className="space-y-1">
            <h3 className="font-display text-base font-bold text-[#171A18]">Are you a business owner?</h3>
            <p className="text-xs text-[#707873]">Register your store, get verified, and start building your local reputation.</p>
          </div>
          <Link
            to="/register"
            className="px-5 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold rounded-xl text-xs shrink-0 transition-colors shadow-xs"
          >
            Register Store Owner Account →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
