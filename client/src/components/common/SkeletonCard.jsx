import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm p-4 animate-pulse">
      {/* Image Placeholder */}
      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>

      {/* Category Placeholder */}
      <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>

      {/* Title Placeholder */}
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>

      {/* Price & Rating Placeholder */}
      <div className="flex justify-between items-center mt-4">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;