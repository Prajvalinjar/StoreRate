import React from 'react';
import StarRating from '../StarRating';
import { Search, Store, Star, CheckCircle } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const CustomerValueSection = () => {
  const [sectionRef, isRevealed] = useScrollReveal({ threshold: 0.1 });

  const steps = [
    {
      label: 'SEARCH',
      desc: 'Look up stores by name or location',
      icon: Search,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      label: 'STORE',
      desc: 'Inspect store profile & overall rating average',
      icon: Store,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      label: 'RATING',
      desc: 'Review 1–5 star ratings submitted by real customers',
      icon: Star,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      label: 'DECISION',
      desc: 'Visit with confidence or submit your own rating',
      icon: CheckCircle,
      color: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
    },
  ];

  const ratingConcepts = [
    { stars: 5, label: 'Excellent', count: '5.0 Rating Score' },
    { stars: 4, label: 'Good', count: '4.0 Rating Score' },
    { stars: 3, label: 'Average', count: '3.0 Rating Score' },
    { stars: 2, label: 'Needs Improvement', count: '2.0 Rating Score' },
    { stars: 1, label: 'Poor', count: '1.0 Rating Score' },
  ];

  return (
    <section
      ref={sectionRef}
      className={`py-16 md:py-24 bg-[#F7F7F2] border-t border-stone-200/90 reveal-hidden ${
        isRevealed ? 'reveal-visible' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section 1: Know Before You Choose */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-widest bg-emerald-100/80 px-3 py-1 rounded-full inline-block">
              CUSTOMER CONFIDENCE
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight uppercase">
              KNOW BEFORE YOU CHOOSE.
            </h2>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
              Your next store doesn't have to be a guess. StoreRate gives customers a simple way to discover stores, understand customer ratings, and make more informed decisions.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3 text-xs sm:text-sm text-stone-700 font-medium">
                <div className="p-1 bg-emerald-100 text-[#16A34A] rounded-full mt-0.5 shrink-0">
                  ✓
                </div>
                <span>Transparent 1-to-5 star rating breakdown</span>
              </div>
              <div className="flex items-start space-x-3 text-xs sm:text-sm text-stone-700 font-medium">
                <div className="p-1 bg-emerald-100 text-[#16A34A] rounded-full mt-0.5 shrink-0">
                  ✓
                </div>
                <span>One rating per customer for authentic reputation data</span>
              </div>
              <div className="flex items-start space-x-3 text-xs sm:text-sm text-stone-700 font-medium">
                <div className="p-1 bg-emerald-100 text-[#16A34A] rounded-full mt-0.5 shrink-0">
                  ✓
                </div>
                <span>Instant rating updates whenever your experience changes</span>
              </div>
            </div>
          </div>

          {/* Right Product Decision Journey Diagram */}
          <div className="lg:col-span-6">
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4 text-left">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block border-b border-stone-100 pb-3">
                STORERATE DECISION JOURNEY
              </span>

              <div className="space-y-3 relative">
                {steps.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-center space-x-4 p-3.5 bg-[#F7F7F2] rounded-xl border border-stone-200/70">
                      <div className={`p-2.5 rounded-xl border ${item.color} shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm">{item.label}</h4>
                        <p className="text-[11px] text-stone-500 truncate">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Every Rating Tells a Story */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-8 shadow-xs space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest bg-amber-50 border border-amber-200 px-3 py-1 rounded-full inline-block">
              RATING TELEMETRY
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Every rating tells a story.
            </h3>
            <p className="text-xs sm:text-sm text-stone-600">
              Clear 1–5 star categories built on customer satisfaction indices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-2">
            {ratingConcepts.map((item) => (
              <div
                key={item.stars}
                className="bg-[#F7F7F2] border border-stone-200/80 rounded-xl p-4 text-center space-y-2 hover:border-stone-300 transition-colors"
              >
                <div className="flex justify-center">
                  <StarRating value={item.stars} readOnly size="xs" />
                </div>
                <h4 className="font-bold text-stone-900 text-xs">{item.label}</h4>
                <span className="text-[10px] text-stone-500 font-mono block">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerValueSection;
