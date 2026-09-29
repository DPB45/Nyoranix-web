import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaStar, FaShoppingCart, FaHeart, FaEye, FaTimes, FaBolt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { addToCart } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const getImages = (product) => {
  const imgs = product.images?.length ? product.images : [product.image];
  return imgs.filter(Boolean);
};

const getDiscount = (product) => {
  const original = Number(product.mrp || product.originalPrice || product.listPrice || product.priceExclGST || 0);
  const price = Number(product.price || 0);
  if (original > price && price > 0) return Math.round(((original - price) / original) * 100);
  return 0;
};

const ProductCard = ({ product, compact = false }) => {
  const dispatch = useDispatch();
  const images = getImages(product);
  const [wishlist, setWishlist] = useState(false);
  const [quickView, setQuickView] = useState(false);
  const discount = getDiscount(product);
  const lowStock = product.countInStock > 0 && product.countInStock <= 3;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('nyoranix-wishlist') || '[]');
      setWishlist(saved.includes(product._id));
    } catch {}
  }, [product._id]);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const saved = JSON.parse(localStorage.getItem('nyoranix-wishlist') || '[]');
    const next = saved.includes(product._id) ? saved.filter(id => id !== product._id) : [...saved, product._id];
    localStorage.setItem('nyoranix-wishlist', JSON.stringify(next));
    setWishlist(next.includes(product._id));
    toast.success(next.includes(product._id) ? 'Added to wishlist' : 'Removed from wishlist');
  };

  const add = () => {
    if (!product.countInStock) return toast.error('Item is out of stock');
    dispatch(addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: images[0],
      quantity: 1,
      countInStock: product.countInStock
    }));
  };

  return (
    <>
      <motion.article whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-2xl hover:border-red-200 dark:hover:border-red-900/50 flex flex-col h-full">
        <div className={`relative ${compact ? 'h-48' : 'h-60'} bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-5 overflow-hidden`}>
          <Link to={`/product/${product._id}`} className="absolute inset-0 flex items-center justify-center">
            {images[1] && <img src={images[1]} alt="" aria-hidden className="absolute max-h-full max-w-full object-contain opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-105 transition-all duration-500 mix-blend-multiply" />}
            <img src={images[0] || 'https://via.placeholder.com/400'} alt={product.name} loading="lazy"
              className="relative max-h-full max-w-full object-contain mix-blend-multiply group-hover:opacity-0 transition-opacity duration-300" />
          </Link>

          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            {product.isNewArrival && <span className="bg-nyoranixBlack text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">New</span>}
            {discount > 0 && <span className="bg-nyoranixRed text-white text-[10px] font-bold px-2 py-1 rounded-full">-{discount}%</span>}
            {lowStock && <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">Only {product.countInStock} left</span>}
          </div>

          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <button onClick={toggleWishlist} aria-label="Wishlist" className={`w-9 h-9 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow flex items-center justify-center transition ${wishlist ? 'text-nyoranixRed' : 'text-gray-500 hover:text-nyoranixRed'}`}>
              <FaHeart className={wishlist ? 'fill-current' : ''} size={14} />
            </button>
            <button onClick={() => setQuickView(true)} aria-label="Quick view" className="w-9 h-9 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow flex items-center justify-center text-gray-500 hover:text-nyoranixRed transition">
              <FaEye size={14} />
            </button>
          </div>

          {product.countInStock === 0 && <div className="absolute inset-0 bg-white/70 dark:bg-black/60 flex items-center justify-center z-20"><span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">Out of Stock</span></div>}
        </div>

        <div className="p-4 flex flex-col flex-1">
          <span className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">{product.category}</span>
          <Link to={`/product/${product._id}`} className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 min-h-[40px] hover:text-nyoranixRed transition">{product.name}</Link>
          <div className="flex items-center text-yellow-400 text-xs mt-2">
            {[...Array(5)].map((_, i) => <FaStar key={i} className={i < Math.round(product.rating || 0) ? 'fill-current' : 'text-gray-300 dark:text-zinc-700'} />)}
            <span className="text-gray-400 ml-1">({product.numReviews || 0})</span>
          </div>
          <div className="flex items-end justify-between gap-3 mt-3">
            <div>
              <span className="text-xl font-extrabold text-nyoranixRed">₹{Number(product.price || 0).toLocaleString('en-IN')}</span>
              {discount > 0 && <span className="block text-xs text-gray-400 line-through">₹{Number(product.mrp || product.originalPrice || product.listPrice || product.priceExclGST).toLocaleString('en-IN')}</span>}
            </div>
            <motion.button whileTap={{ scale: 0.92 }} onClick={add} disabled={!product.countInStock}
              className="bg-nyoranixRed text-white w-10 h-10 rounded-xl flex items-center justify-center disabled:bg-gray-300 dark:disabled:bg-zinc-700 shadow-sm hover:bg-red-700 transition" aria-label="Add to cart">
              <FaShoppingCart size={14} />
            </motion.button>
          </div>
        </div>
      </motion.article>

      <AnimatePresence>
        {quickView && (
          <motion.div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setQuickView(false)}>
            <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl">
              <div className="flex justify-end p-3 absolute right-0 z-10"><button onClick={() => setQuickView(false)} className="w-9 h-9 rounded-full bg-white/90 text-gray-700 flex items-center justify-center"><FaTimes /></button></div>
              <div className="grid md:grid-cols-2">
                <div className="bg-gray-50 dark:bg-zinc-950 min-h-72 flex items-center justify-center p-8"><img src={images[0]} alt={product.name} className="max-h-80 max-w-full object-contain mix-blend-multiply" /></div>
                <div className="p-7 flex flex-col justify-center">
                  <span className="text-xs uppercase tracking-wider text-nyoranixRed font-bold">{product.category}</span>
                  <h2 className="text-2xl font-extrabold mt-2">{product.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">{product.shortDescription || product.description}</p>
                  <p className="text-2xl font-extrabold text-nyoranixRed mt-5">₹{Number(product.price || 0).toLocaleString('en-IN')}</p>
                  <button onClick={() => { add(); setQuickView(false); }} disabled={!product.countInStock} className="mt-6 w-full bg-nyoranixRed text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:bg-gray-300"><FaShoppingCart /> Add to Cart</button>
                  <Link to={`/product/${product._id}`} onClick={() => setQuickView(false)} className="text-center text-sm font-semibold mt-3 text-gray-500 hover:text-nyoranixRed">View full details</Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;
