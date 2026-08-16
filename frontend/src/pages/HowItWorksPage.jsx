import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Store, Star, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

const HowItWorksPage = () => {
  const steps = [
    {
      num: '01',
      title: 'Discover Local Stores',
      desc: 'Browse verified store listings across 12 categories in Pune, Kolhapur, Mumbai, and other cities.',
      icon: Search,
    },
    {
      num: '02',
      title: 'Inspect Community Consensus',
      desc: 'Check aggregate 1.0–5.0 star ratings, distribution percentages, and authentic feedback.',
      icon: Store,
    },
    {
      num: '03',
      title: 'Share Your Experience',
      desc: 'Sign in to submit or update your genuine ratings to help fellow community members make informed choices.',
      icon: Star,
    },
    {
      num: '04',
      title: 'Empower Local Merchants',
      desc: 'Store owners build trust, view rating analytics, and grow their reputation transparently.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F1] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-[#171A18] text-left">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Banner Header */}
        <div className="border-b border-[#E2E5DF] pb-6 space-y-2">
          <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block border border-[#CDE0D5]">
            TRANSPARENT REPUTATION SYSTEM
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#171A18] tracking-tight">
            How StoreRate Works
          </h1>
          <p className="text-xs sm:text-sm text-[#707873] max-w-2xl font-normal">
            StoreRate is built to foster transparent local commerce through community ratings and verified merchant listings.
          </p>
        </div>

        {/* Step Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="bg-white border border-[#E2E5DF] rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-[#C9A24A] font-mono">{step.num}</span>
                  <div className="w-10 h-10 bg-[#E7F0EB] text-[#173D32] rounded-xl flex items-center justify-center border border-[#CDE0D5]">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-display text-lg font-bold text-[#171A18]">{step.title}</h3>
                  <p className="text-xs text-[#707873] leading-relaxed font-normal">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Footer */}
        <div className="bg-[#173D32] text-white rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <h2 className="font-display text-2xl font-bold">Ready to discover trusted local businesses?</h2>
          <p className="text-xs text-[#A3C2B6] max-w-md mx-auto font-normal">
            Explore verified store listings and join community rating contributors today.
          </p>
          <div className="pt-2">
            <Link
              to="/stores"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-[#C9A24A] hover:bg-[#B59039] text-[#173D32] font-extrabold rounded-xl text-xs transition-colors shadow-xs"
            >
              <span>Explore Stores Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
