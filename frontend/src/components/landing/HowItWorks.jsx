import React from 'react';
import { Compass, CheckCircle2, Star, Users } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const HowItWorks = () => {
  const [sectionRef, isRevealed] = useScrollReveal({ threshold: 0.1 });

  const steps = [
    {
      num: '01',
      title: 'Discover',
      desc: 'Browse verified local stores and compare real customer rating telemetry near you.',
      icon: Compass,
    },
    {
      num: '02',
      title: 'Experience',
      desc: 'Visit businesses with confidence knowing their true community track record.',
      icon: CheckCircle2,
    },
    {
      num: '03',
      title: 'Rate',
      desc: 'Share your authentic experience with a simple, transparent 1–5 star evaluation.',
      icon: Star,
    },
    {
      num: '04',
      title: 'Help Others',
      desc: 'Your rating helps local businesses improve and helps fellow customers choose better.',
      icon: Users,
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className={`py-16 sm:py-24 bg-white border-t border-[#E2E5DF] reveal-hidden ${
        isRevealed ? 'reveal-visible' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block">
            TRANSPARENT PROCESS
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#171A18] tracking-tight">
            How StoreRate Works
          </h2>
          <p className="text-sm text-[#707873] font-normal">
            From discovery to decision in a few transparent steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-[#F7F6F1] border border-[#E2E5DF] hover:border-[#173D32]/30 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 text-left relative transition-all duration-200 card-interactive"
              >
                {/* Desktop Horizontal Connecting Accent Indicator */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-3 z-10 w-6 h-[2px] bg-[#CDE0D5]" />
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs font-black font-mono text-[#173D32] bg-[#E7F0EB] px-2.5 py-1 rounded-lg border border-[#CDE0D5]">
                    {step.num}
                  </span>
                  <div className="p-2 bg-white text-[#173D32] border border-[#E2E5DF] rounded-xl shadow-2xs">
                    <Icon className="w-4 h-4 text-[#C9A24A]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-display text-base sm:text-lg font-bold text-[#171A18]">{step.title}</h3>
                  <p className="text-xs text-[#707873] leading-relaxed font-normal">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
