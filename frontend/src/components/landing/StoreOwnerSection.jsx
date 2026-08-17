import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import SafeImage from '../SafeImage';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const StoreOwnerSection = () => {
  const [sectionRef, isRevealed] = useScrollReveal({ threshold: 0.1 });

  return (
    <section
      id="for-businesses"
      ref={sectionRef}
      className={`py-16 sm:py-24 bg-[#F7F6F1] border-t border-[#E2E5DF] reveal-hidden ${
        isRevealed ? 'reveal-visible' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#E2E5DF] rounded-3xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 items-center text-left">
          {/* Content Column */}
          <div className="lg:col-span-6 p-8 sm:p-12 space-y-6">
            <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block border border-[#CDE0D5]">
              FOR BUSINESS OWNERS
            </span>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#171A18] tracking-tight leading-tight">
              Build trust.<br />Grow your business.
            </h2>

            <p className="text-base text-[#707873] leading-relaxed font-normal">
              Claim your business profile, view authentic customer rating telemetry, analyze reputation trends, and showcase your local trust.
            </p>

            <div className="space-y-3 text-xs text-[#171A18] font-semibold pt-2">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#173D32]" />
                <span>Transparent 1–5 star customer feedback telemetry</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#173D32]" />
                <span>Mathematically accurate rating distribution breakdown</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#173D32]" />
                <span>Reputation management dashboard for store owners</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 px-7 py-3.5 bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold rounded-xl text-sm transition-all shadow-xs"
              >
                <span>Claim Your Business</span>
                <ArrowRight className="w-4 h-4 text-[#C9A24A]" />
              </Link>
            </div>
          </div>

          {/* Business Owner Photography Column */}
          <div className="lg:col-span-6 h-full relative min-h-[360px] bg-[#173D32] overflow-hidden">
            <SafeImage
              src="https://images.unsplash.com/photo-1556742049-0a67daf40955?auto=format&fit=crop&w=1000&q=80"
              alt="Store Owner"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent hidden lg:block pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoreOwnerSection;

