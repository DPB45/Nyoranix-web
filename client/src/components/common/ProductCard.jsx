import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaShoppingCart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { addToCart } from '../../redux/slices/cartSlice';
import { openCartDrawer } from '../../redux/slices/uiSlice';
import { toCartItem } from '../../utils/productsCache';
import StarRating from './StarRating';

// Shared product card (used on the home page "New Arrivals" grid).
const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const inStock = product.countInStock > 0;
  const link = `/product/${product._id}`;

  const handleAdd = () => {
    if (!inStock) return toast.error('Item is out of stock');
    dispatch(addToCart(toCartItem(product, 1)));
    dispatch(openCartDrawer());
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
      <div className="h-48 bg-gray-50 relative group">
        <Link to={link} aria-label={`View ${product.name}`} className="absolute inset-0 flex items-center justify-center p-4">
          <img
            src={product.images?.[0] || product.image || 'https://via.placeholder.com/300'}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300"
          />
        </Link>
        {product.isNewArrival && (
          <span className="absolute top-2 left-2 bg-nyoranixBlack text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">New</span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center pointer-events-none">
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs text-gray-500 mb-1">{product.category}</span>
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1 min-h-[40px]">
          <Link to={link} className="hover:text-nyoranixRed transition-colors">{product.name}</Link>
        </h3>

        <div className="mb-3">
          <p className="text-lg font-bold text-nyoranixRed">₹{Number(product.price || 0).toLocaleString('en-IN')}</p>
          <div className="mt-1"><StarRating rating={product.rating} showCount count={product.numReviews || 0} /></div>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={handleAdd}
          disabled={!inStock}
          className="mt-auto w-full bg-nyoranixRed text-white text-sm font-medium py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          <FaShoppingCart size={14} /> {inStock ? 'Add to Cart' : 'Sold Out'}
        </motion.button>
      </div>
    </div>
  );
};

export default ProductCard;