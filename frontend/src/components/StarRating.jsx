import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ value = 0, onChange, onHover, readOnly = false, size = 'md' }) => {
  const [hoverValue, setHoverValue] = useState(0);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
  };

  const currentSizeClass = starSizes[size] || starSizes.md;

  const handleMouseEnter = (starIndex) => {
    if (!readOnly) {
      setHoverValue(starIndex);
      if (onHover) onHover(starIndex);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverValue(0);
      if (onHover) onHover(0);
    }
  };

  const handleClick = (starIndex) => {
    if (!readOnly && onChange) {
      onChange(starIndex);
    }
  };

  return (
    <div className="flex items-center space-x-1" onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFilled = (hoverValue || value) >= starIndex;
        return (
          <button
            key={starIndex}
            type="button"
            disabled={readOnly}
            aria-label={`Rate ${starIndex} out of 5 stars`}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            onClick={() => handleClick(starIndex)}
            className={`${
              readOnly ? 'cursor-default' : 'cursor-pointer transition-transform duration-150 hover:scale-110 active:scale-95'
            } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A24A] rounded p-0.5`}
          >
            <Star
              className={`${currentSizeClass} transition-colors duration-150 ${
                isFilled
                  ? 'fill-[#C9A24A] text-[#C9A24A] drop-shadow-[0_1px_3px_rgba(201,162,74,0.3)]'
                  : 'fill-[#E2E5DF]/70 text-[#C4CBC0]'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
