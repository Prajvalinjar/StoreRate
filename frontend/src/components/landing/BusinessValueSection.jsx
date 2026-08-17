import React from 'react';
import { ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const BusinessValueSection = () => {
  const [sectionRef, isRevealed] = useScrollReveal({ threshold: 0.1 });

  const benefits = [
    {
      title: 'Build Trust',
      description: 'Understand how customers perceive your store and build lasting community confidence.',
      icon: ShieldCheck,
    },
    {
      title: 'Understand Reputation',
      description: 'Monitor authentic rating telemetry and feedback trends that customers leave for your business.',
      icon: TrendingUp,
    },
    {
      title: 'Improve Experience',
      description: 'Use real customer feedback as a direct operational signal for continuous quality improvements.',
      icon: Sparkles,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={`py-16 sm:py-24 bg-white border-t border-[#E2E5DF] reveal-hidden ${
        isRevealed ? 'reveal-visible' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block">
            VALUE FOR BUSINESSES
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#171A18] tracking-tight">
            Feedback is more than a number.
          </h2>
          <p className="text-sm sm:text-base text-[#707873] font-normal">
            Turn customer ratings into meaningful reputation insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#F7F6F1] border border-[#E2E5DF] rounded-2xl p-8 shadow-xs space-y-4 text-left hover:border-[#C4CBC0] hover:shadow-md transition-all duration-200 card-interactive"
              >
                <div className="p-3 bg-[#E7F0EB] text-[#173D32] border border-[#CDE0D5] rounded-xl w-fit">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#171A18]">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#707873] leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BusinessValueSection;
