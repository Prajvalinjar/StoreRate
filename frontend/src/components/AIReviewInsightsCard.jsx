import React from 'react';
import { Sparkles, ThumbsUp, AlertTriangle, Info, CheckCircle2, MessageSquare, Lightbulb } from 'lucide-react';

/**
 * AIReviewInsightsCard Component (Phase 13.1 Refined)
 * Displays AI-assisted review intelligence derived strictly from written customer reviews.
 */
const AIReviewInsightsCard = ({ aiInsights = {}, compact = false, title = 'Review Intelligence' }) => {
  const {
    status = 'NO_WRITTEN_REVIEWS',
    reviewCount = 0,
    sentimentScore = null,
    sentiment = { positive: 0, neutral: 0, negative: 0 },
    strengths = [],
    improvements = [],
    actionableSummary = null,
    confidence = 'LOW',
    disclaimer = 'No written reviews submitted yet.',
  } = aiInsights || {};

  const positivePct = sentiment?.positive || 0;
  const neutralPct = sentiment?.neutral || 0;
  const negativePct = sentiment?.negative || 0;

  // 0 Written Reviews State
  if (status === 'NO_WRITTEN_REVIEWS' || reviewCount === 0) {
    return (
      <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3 text-left">
        <div className="flex items-center justify-between border-b border-[#E2E5DF] pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#E7F0EB] text-[#173D32] rounded-xl border border-[#CDE0D5]">
              <Sparkles className="w-4 h-4 text-[#C9A24A]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm sm:text-base text-[#171A18]">{title}</h3>
              <p className="text-[11px] text-[#707873]">AI-assisted review sentiment analysis</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#707873] bg-[#F7F6F1] px-2.5 py-1 rounded-md border border-[#E2E5DF]">
            0 Written Reviews
          </span>
        </div>

        <div className="p-5 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl text-center space-y-1.5">
          <MessageSquare className="w-5 h-5 text-[#9CA59E] mx-auto opacity-60" />
          <p className="text-xs font-bold text-[#171A18]">No written reviews submitted yet</p>
          <p className="text-[11px] text-[#707873] max-w-sm mx-auto font-normal">
            Once customers leave written feedback, StoreRate will summarize sentiment, common themes, and actionable operational insights here.
          </p>
        </div>
      </div>
    );
  }

  const isLowSample = status === 'LOW_SAMPLE' || reviewCount < 3;

  return (
    <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 sm:space-y-5 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E5DF] pb-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#E7F0EB] text-[#173D32] rounded-xl border border-[#CDE0D5]">
            <Sparkles className="w-4 h-4 text-[#C9A24A]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-display font-bold text-sm sm:text-base text-[#171A18]">{title}</h3>
              {isLowSample ? (
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  EARLY INSIGHT
                </span>
              ) : (
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#173D32] bg-[#E7F0EB] px-2 py-0.5 rounded border border-[#CDE0D5]">
                  AI ASSISTED
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#707873]">
              Based on <strong className="text-[#171A18]">{reviewCount}</strong> {reviewCount === 1 ? 'written customer review' : 'written customer reviews'}
            </p>
          </div>
        </div>

        {/* AI Sentiment Score (0-100 Index) */}
        {sentimentScore !== null && (
          <div className="flex items-center space-x-2 bg-[#F7F6F1] px-3 py-1.5 rounded-xl border border-[#E2E5DF] self-start sm:self-auto">
            <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider">AI Sentiment Score</span>
            <span className="font-black text-sm text-[#173D32] font-mono">{sentimentScore}<span className="text-xs text-[#707873]">/100</span></span>
          </div>
        )}
      </div>

      {/* Sentiment Breakdown Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[#171A18]">
          <span className="text-emerald-700 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Positive ({positivePct}%)</span>
          </span>
          <span className="text-slate-600 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
            <span>Neutral ({neutralPct}%)</span>
          </span>
          <span className="text-rose-700 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            <span>Negative ({negativePct}%)</span>
          </span>
        </div>

        {/* Multi-segment Bar with Smooth Transition */}
        <div className="h-2.5 w-full bg-[#E7F0EB] rounded-full overflow-hidden flex">
          {positivePct > 0 && (
            <div className="bg-emerald-500 h-full transition-all duration-500 ease-out" style={{ width: `${positivePct}%` }} title={`Positive: ${positivePct}%`} />
          )}
          {neutralPct > 0 && (
            <div className="bg-slate-400 h-full transition-all duration-500 ease-out" style={{ width: `${neutralPct}%` }} title={`Neutral: ${neutralPct}%`} />
          )}
          {negativePct > 0 && (
            <div className="bg-rose-500 h-full transition-all duration-500 ease-out" style={{ width: `${negativePct}%` }} title={`Negative: ${negativePct}%`} />
          )}
        </div>
      </div>

      {/* Actionable Summary Banner */}
      {actionableSummary && (
        <div className="p-3.5 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl flex items-start space-x-2.5">
          <Lightbulb className="w-4 h-4 text-[#C9A24A] shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs text-[#171A18]">
            <span className="font-extrabold block text-[11px] uppercase tracking-wider text-[#173D32]">Actionable Insight</span>
            <p className="font-normal text-[#171A18] leading-relaxed">{actionableSummary}</p>
          </div>
        </div>
      )}

      {/* Themes: What Customers Like vs Areas to Improve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* What Customers Like */}
        <div className="p-3.5 bg-[#E7F0EB]/60 border border-[#CDE0D5] rounded-xl space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-extrabold text-[#173D32]">
            <ThumbsUp className="w-3.5 h-3.5 text-[#173D32]" />
            <span>What Customers Like</span>
          </div>
          {strengths.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {strengths.map((item, i) => {
                const themeName = typeof item === 'object' ? item.theme : item;
                const mentions = typeof item === 'object' ? item.mentions : 1;
                return (
                  <span key={i} className="text-[11px] font-bold text-[#173D32] bg-white px-2.5 py-1 rounded-md border border-[#CDE0D5] shadow-2xs flex items-center space-x-1">
                    <span>✓ {themeName}</span>
                    {mentions > 1 && (
                      <span className="text-[9px] font-mono text-[#707873] bg-[#F7F6F1] px-1 rounded border border-[#E2E5DF]">
                        {mentions} mentions
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-[#707873] italic">No specific positive themes highlighted yet.</p>
          )}
        </div>

        {/* What Customers Should Improve */}
        <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-extrabold text-amber-900">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>Areas to Improve</span>
          </div>
          {improvements.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {improvements.map((item, i) => {
                const themeName = typeof item === 'object' ? item.theme : item;
                const mentions = typeof item === 'object' ? item.mentions : 1;
                return (
                  <span key={i} className="text-[11px] font-bold text-amber-900 bg-white px-2.5 py-1 rounded-md border border-amber-200 shadow-2xs flex items-center space-x-1">
                    <span>⚠ {themeName}</span>
                    {mentions > 1 && (
                      <span className="text-[9px] font-mono text-amber-800 bg-amber-50 px-1 rounded border border-amber-200">
                        {mentions} mentions
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-[#707873] italic">No recurring improvement theme identified yet.</p>
          )}
        </div>
      </div>

      {/* Confidence / Sample Size Notice Banner */}
      <div className="pt-2 border-t border-[#E2E5DF] flex items-center justify-between text-[11px] text-[#707873]">
        <div className="flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-[#173D32] shrink-0" />
          <span className="leading-snug">{disclaimer}</span>
        </div>
        <span className="font-mono text-[10px] uppercase font-bold text-[#707873] shrink-0 ml-2">
          Sample: {confidence}
        </span>
      </div>
    </div>
  );
};

export default AIReviewInsightsCard;
