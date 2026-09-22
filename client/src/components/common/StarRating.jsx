import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

// Renders stars based on the product's real average rating instead of a
// hardcoded count. Both HomePage and ShopPage were previously showing every
// single product with the same fixed number of filled stars regardless of
// its actual rating in the database - misleading, and inconsistent with the
// real rating/review-count values already sent to Google via the JSON-LD
// structured data on the product page.
const StarRating = ({ rating = 0, size = 'text-xs', showCount = false, count = 0 }) => {
  const rounded = Math.round(rating * 2) / 2; // nearest half star
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rounded >= i) {
      stars.push(<FaStar key={i} />);
    } else if (rounded >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} />);
    } else {
      stars.push(<FaRegStar key={i} />);
    }
  }

  return (
    <div className={`flex items-center gap-1 ${size}`}>
      <div className="flex text-yellow-400">{stars}</div>
      {showCount && <span className="text-gray-400">({count})</span>}
    </div>
  );
};

export default StarRating;