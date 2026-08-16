import React from 'react';

export const StoreCardSkeleton = () => (
  <div className="bg-white border border-[#E2E5DF] rounded-2xl overflow-hidden shadow-xs animate-pulse flex flex-col justify-between h-96">
    <div className="h-44 w-full bg-[#E7F0EB]" />
    <div className="p-5 flex-1 space-y-4">
      <div className="space-y-2">
        <div className="h-5 bg-[#E2E5DF] rounded-lg w-3/4" />
        <div className="h-3.5 bg-[#F7F6F1] rounded-lg w-1/2" />
      </div>
      <div className="pt-4 border-t border-[#E2E5DF] space-y-2">
        <div className="h-3 bg-[#E7F0EB] rounded w-full" />
        <div className="h-2 bg-[#E2E5DF] rounded-full w-2/3" />
      </div>
      <div className="h-10 bg-[#E7F0EB] rounded-xl w-full pt-2" />
    </div>
  </div>
);

export const StoreGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <StoreCardSkeleton key={i} />
    ))}
  </div>
);

export const StoreProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-6 animate-pulse text-left">
    <div className="h-4 bg-[#E2E5DF] rounded w-32" />
    <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 space-y-6">
      <div className="h-64 bg-[#E7F0EB] rounded-2xl w-full" />
      <div className="space-y-3">
        <div className="h-8 bg-[#E2E5DF] rounded-lg w-2/3" />
        <div className="h-4 bg-[#F7F6F1] rounded-lg w-1/3" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-[#E2E5DF]">
        <div className="h-24 bg-[#E7F0EB] rounded-2xl" />
        <div className="h-24 bg-[#E7F0EB] rounded-2xl" />
        <div className="h-24 bg-[#E7F0EB] rounded-2xl" />
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="max-w-6xl mx-auto space-y-6 animate-pulse text-left">
    <div className="h-8 bg-[#E2E5DF] rounded-lg w-1/3" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 bg-white border border-[#E2E5DF] rounded-2xl p-4 space-y-2">
          <div className="h-3 bg-[#E7F0EB] rounded w-1/2" />
          <div className="h-8 bg-[#E2E5DF] rounded-lg w-3/4" />
        </div>
      ))}
    </div>
    <div className="h-64 bg-white border border-[#E2E5DF] rounded-2xl p-6" />
  </div>
);

export default StoreProfileSkeleton;
