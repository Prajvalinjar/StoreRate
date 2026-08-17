import React from 'react';
import { Users, Store, Star, Award } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const TrustMetrics = ({ stats, loading }) => {
  const [sectionRef, isRevealed] = useScrollReveal({ threshold: 0.15 });

  const metrics = [
    {
      value: loading ? '...' : String(stats?.businesses ?? 0),
      label: 'VERIFIED BUSINESSES',
      detail: 'Curated store directory listings',
      icon: Store,
    },
    {
      value: loading ? '...' : String(stats?.ratings ?? 0),
      label: 'CUSTOMER RATINGS',
      detail: 'Authentic 1–5 star reviews',
      icon: Star,
    },
    {
      value: loading ? '...' : String(stats?.users ?? 0),
      label: 'PLATFORM USERS',
      detail: 'Registered consumers & store owners',
      icon: Users,
    },
    {
      value: loading ? '...' : Number(stats?.averageRating ?? 0).toFixed(1),
      label: 'PLATFORM AVERAGE',
      detail: '5.0 rating score benchmark',
      icon: Award,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={`bg-white border-y border-[#E2E5DF] py-10 reveal-hidden ${
        isRevealed ? 'reveal-visible' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          {metrics.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="p-5 bg-[#F7F6F1] border border-[#E2E5DF] hover:border-[#173D32]/30 rounded-2xl space-y-2 card-interactive shadow-2xs hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-3xl sm:text-4xl font-bold text-[#173D32]">
                    {loading ? <span className="animate-pulse">{item.value}</span> : item.value}
                  </span>
                  <div className="p-2 bg-white rounded-xl border border-[#E2E5DF] text-[#173D32]">
                    <IconComponent className="w-4 h-4 text-[#C9A24A]" />
                  </div>
                </div>
                <h4 className="text-[10px] font-extrabold text-[#171A18] uppercase tracking-wider">
                  {item.label}
                </h4>
                <p className="text-[11px] text-[#707873] font-normal">{item.detail}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustMetrics;
