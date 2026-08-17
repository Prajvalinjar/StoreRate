import React, { useState } from 'react';
import { Store, ShoppingBag, Laptop, Coffee } from 'lucide-react';

const categoryIcons = {
  cafe: Coffee,
  grocery: ShoppingBag,
  electronics: Laptop,
  fashion: ShoppingBag,
  default: Store,
};

const SafeImage = ({
  src,
  fallbackSrc,
  alt = 'Store photography',
  className = 'w-full h-full object-cover',
  category = 'default',
}) => {
  const [status, setStatus] = useState('primary'); // 'primary' | 'fallback' | 'svg'

  const handleError = () => {
    if (status === 'primary' && fallbackSrc) {
      setStatus('fallback');
    } else {
      setStatus('svg');
    }
  };

  const currentSrc = status === 'primary' ? src : status === 'fallback' ? fallbackSrc : null;
  const catKey = (typeof category === 'string' && category.trim().length > 0)
    ? category.trim().toLowerCase()
    : 'default';
  const CategoryIcon = categoryIcons[catKey] || categoryIcons.default;

  if (status === 'svg' || !currentSrc) {
    return (
      <div className={`bg-[#173D32] flex flex-col items-center justify-center p-6 text-white text-center relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#2F6654]/40 to-[#0F2B23]/90 pointer-events-none" />
        <div className="relative z-10 space-y-2 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#E7F0EB]/10 border border-[#CDE0D5]/20 text-[#C9A24A] flex items-center justify-center shadow-inner">
            <CategoryIcon className="w-7 h-7" />
          </div>
          <span className="font-display font-bold text-sm tracking-tight text-[#E7F0EB]">{alt}</span>
          <span className="text-[10px] font-mono text-[#C9A24A] bg-[#0F2B23] px-2.5 py-0.5 rounded-full border border-[#235344]">
            VERIFIED BUSINESS
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default SafeImage;
