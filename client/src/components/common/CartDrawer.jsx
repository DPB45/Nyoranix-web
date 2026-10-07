import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMinus, FaPlus, FaTrash, FaShoppingBag, FaArrowRight } from 'react-icons/fa';
import { removeFromCart, updateQuantity } from '../../redux/slices/cartSlice';
import { closeCartDrawer } from '../../redux/slices/uiSlice';
import { FREE_SHIPPING_THRESHOLD } from '../../constants';

const CartDrawer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector(state => state.cart);
  const userInfo = useSelector(state => state.user.userInfo);
  const isDrawerOpen = useSelector(state => state.ui.cartDrawerOpen);
  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  // Standard shipping is free ABOVE the threshold (matches the server rule)
  const unlocked = subtotal > FREE_SHIPPING_THRESHOLD;
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  // Esc closes the drawer
  useEffect(() => {
    if (!isDrawerOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') dispatch(closeCartDrawer()); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDrawerOpen, dispatch]);

  const checkout = () => {
    dispatch(closeCartDrawer());
    navigate(userInfo ? '/checkout' : '/login?redirect=/checkout');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCartDrawer())}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]" />
          <motion.aside role="dialog" aria-modal="true" aria-label="Shopping cart" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-zinc-950 text-gray-900 dark:text-white z-[100] shadow-2xl flex flex-col">
            <header className="p-5 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
              <div><h2 className="text-xl font-extrabold">Your Cart</h2><p className="text-xs text-gray-500">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p></div>
              <button onClick={() => dispatch(closeCartDrawer())} aria-label="Close cart" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"><FaTimes /></button>
            </header>

            <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span>{!unlocked ? `Add ₹${(remaining + 1).toLocaleString('en-IN')} more for free shipping` : '🎉 Free shipping unlocked!'}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-nyoranixRed to-orange-400 rounded-full" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <FaShoppingBag className="text-5xl text-gray-300 dark:text-zinc-700 mb-4" />
                  <h3 className="font-bold text-lg">Your cart is empty</h3>
                  <p className="text-sm text-gray-500 mb-5">Add components you want to build with.</p>
                  <button onClick={() => { dispatch(closeCartDrawer()); navigate('/shop'); }} className="bg-nyoranixRed text-white px-5 py-2.5 rounded-full font-bold">Browse Products</button>
                </div>
              ) : cartItems.map(item => (
                <div key={item.id} className="flex gap-3 p-3 rounded-xl border border-gray-100 dark:border-zinc-800">
                  <div className="w-20 h-20 rounded-lg bg-gray-50 dark:bg-zinc-900 flex items-center justify-center p-2 shrink-0">
                    <img src={item.image || item.images?.[0]} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <p className="font-semibold text-sm line-clamp-2">{item.name}</p>
                      <button onClick={() => dispatch(removeFromCart(item.id))} aria-label={`Remove ${item.name}`} className="text-gray-400 hover:text-red-600"><FaTrash size={12} /></button>
                    </div>
                    <p className="text-nyoranixRed font-bold mt-1">₹{Number(item.price).toLocaleString('en-IN')}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))} disabled={item.quantity <= 1} className="w-7 h-7 rounded-md border disabled:opacity-30"><FaMinus size={9} className="mx-auto" /></button>
                      <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                      <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))} disabled={item.quantity >= item.countInStock} className="w-7 h-7 rounded-md border disabled:opacity-30"><FaPlus size={9} className="mx-auto" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {cartItems.length > 0 && (
              <footer className="p-5 border-t border-gray-200 dark:border-zinc-800 space-y-3">
                <div className="flex justify-between text-lg font-extrabold"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                <button onClick={checkout} className="w-full bg-nyoranixRed text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition">Checkout <FaArrowRight size={12} /></button>
                <Link to="/cart" onClick={() => dispatch(closeCartDrawer())} className="block text-center text-sm font-semibold text-gray-500 hover:text-nyoranixRed">View full cart</Link>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
