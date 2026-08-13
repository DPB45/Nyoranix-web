import React from 'react';
import { FaStar, FaShoppingCart } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
      {/* Product Image Area */}
      <div className="h-48 bg-gray-50 flex items-center justify-center p-4 relative group">
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300"
        />
        {product.isNew && (
          <span className="absolute top-2 left-2 bg-nyoranixBlack text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
            New
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1 min-h-[40px]">
          {product.name}
        </h3>

        {/* Price & Rating */}
        <div className="mb-3">
          <p className="text-lg font-bold text-nyoranixRed">₹{product.price}</p>
          <div className="flex items-center text-yellow-400 text-xs mt-1">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={i < Math.round(product.rating || 0) ? "fill-current" : "text-gray-300"} />
            ))}
            <span className="text-gray-400 ml-1">({product.numReviews || 0})</span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="mt-auto w-full bg-nyoranixRed text-white text-sm font-medium py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          <FaShoppingCart size={14} /> Add to Cart
        </motion.button>
      </div>
    </div>
  );
};

export default ProductCard;