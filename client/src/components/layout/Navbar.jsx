import { API_URL } from '../../config/api';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaTimes, FaSignOutAlt, FaMoon, FaSun, FaClock, FaArrowRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { logout } from '../../redux/slices/userSlice';
import { openCartDrawer } from '../../redux/slices/cartSlice';
import { useTheme } from '../common/ThemeProvider';
import logo from '../../assets/logo.jpg';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => JSON.parse(localStorage.getItem('nyoranix-recent-searches') || '[]'));
  const searchBoxRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();
  const { cartItems, cartAnimationKey } = useSelector(state => state.cart);
  const { userInfo } = useSelector(state => state.user);
  const totalQuantity = cartItems.reduce((acc, item) => acc + Number(item.quantity || 0), 0);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    axios.get(`${API_URL}/api/products`).then(({ data }) => setProducts(Array.isArray(data) ? data : data.products || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const outside = e => { if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) setIsSearchOpen(false); };
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);

  const filtered = searchTerm.trim()
    ? products.filter(p => `${p.name || ''} ${p.category || ''} ${p.brand || ''}`.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
    : [];

  const categoryShortcuts = [...new Set(products.map(p => p.category).filter(Boolean))]
    .filter(c => !searchTerm || c.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 4);

  const saveRecent = value => {
    if (!value.trim()) return;
    const next = [value.trim(), ...recentSearches.filter(x => x.toLowerCase() !== value.trim().toLowerCase())].slice(0, 5);
    setRecentSearches(next);
    localStorage.setItem('nyoranix-recent-searches', JSON.stringify(next));
  };

  const submitSearch = value => {
    const q = value.trim();
    if (!q) return;
    saveRecent(q);
    setSearchTerm(q);
    setIsSearchOpen(false);
    navigate(`/shop?search=${encodeURIComponent(q)}`);
  };

  const getUserName = () => userInfo?.name?.split(' ')[0] || 'User';
  const handleLogout = () => { dispatch(logout()); navigate('/login'); setIsUserDropdownOpen(false); };

  const navLinks = [
    { name: 'Home', path: '/' }, { name: 'Products', path: '/shop' },
    { name: 'Solutions', path: '/solutions' }, { name: 'About', path: '/about' }, { name: 'Support', path: '/contact' }
  ];

  return (
    <>
      <div className="h-1 bg-gradient-to-r from-nyoranixRed via-red-700 to-nyoranixBlack" />
      <nav className={`sticky top-0 z-50 font-sans border-b transition-all duration-300 backdrop-blur-xl ${isScrolled ? 'bg-white/75 dark:bg-zinc-950/75 border-gray-200/60 dark:border-zinc-800 shadow-lg' : 'bg-white/95 dark:bg-zinc-950/95 border-gray-100 dark:border-zinc-900'}`}>
        <div className={`container mx-auto px-4 md:px-6 flex items-center justify-between gap-4 transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`}>
          <Link to="/" className="shrink-0"><img src={logo} alt="Nyoranix Logo" className={`w-auto object-contain transition-all ${isScrolled ? 'h-11' : 'h-14 md:h-16'}`} /></Link>

          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map(link => <Link key={link.name} to={link.path} className={`relative font-semibold text-sm py-2 ${location.pathname === link.path ? 'text-nyoranixRed' : 'text-gray-600 dark:text-gray-300 hover:text-nyoranixRed'}`}>
              {link.name}{location.pathname === link.path && <motion.span layoutId="nav-dot" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-nyoranixRed rounded-full" />}
            </Link>)}
          </div>

          <div className="flex items-center gap-3 md:gap-5 text-gray-600 dark:text-gray-200 flex-1 justify-end">
            <div ref={searchBoxRef} className="relative hidden md:block w-52 xl:w-72">
              <form onSubmit={e => { e.preventDefault(); submitSearch(searchTerm); }} className="flex items-center bg-gray-100/80 dark:bg-zinc-900/80 rounded-full px-4 py-2.5 border border-transparent focus-within:border-nyoranixRed/50 focus-within:bg-white dark:focus-within:bg-zinc-900 transition-all">
                <FaSearch className="text-gray-400 shrink-0" /><input value={searchTerm} onFocus={() => setIsSearchOpen(true)} onChange={e => { setSearchTerm(e.target.value); setIsSearchOpen(true); }} placeholder="Search components..." className="bg-transparent outline-none border-0 focus:ring-0 text-sm ml-2 w-full text-gray-800 dark:text-white placeholder-gray-400" />
              </form>
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-[70]">
                    {filtered.length > 0 ? <div>
                      <p className="px-4 pt-3 pb-2 text-[10px] uppercase tracking-wider text-gray-400 font-bold">Products</p>
                      {filtered.map(p => <button key={p._id} onClick={() => { saveRecent(p.name); setSearchTerm(''); setIsSearchOpen(false); navigate(`/product/${p._id}`); }} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-zinc-900 text-left">
                        <img src={p.images?.[0] || p.image || 'https://via.placeholder.com/50'} alt="" className="w-11 h-11 rounded-lg bg-gray-50 object-contain" />
                        <span className="min-w-0 flex-1"><strong className="block text-xs truncate text-gray-800 dark:text-white">{p.name}</strong><small className="text-gray-400">{p.category} · {p.countInStock > 0 ? `${p.countInStock} in stock` : 'Out of stock'}</small></span>
                        <strong className="text-sm text-nyoranixRed">₹{Number(p.price || 0).toLocaleString('en-IN')}</strong>
                      </button>)}
                    </div> : <div className="p-4">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">{searchTerm ? 'Categories' : 'Recent searches'}</p>
                      {(searchTerm ? categoryShortcuts : recentSearches).length ? (searchTerm ? categoryShortcuts : recentSearches).map(item => <button key={item} onClick={() => submitSearch(item)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-900 text-sm flex items-center gap-2"><FaClock className="text-gray-400 text-xs" />{item}<FaArrowRight className="ml-auto text-gray-300 text-xs" /></button>) : <p className="text-sm text-gray-400 py-2">Start typing to find products.</p>}
                    </div>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={toggleDarkMode} aria-label="Toggle dark mode" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition">{darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon />}</button>

            {userInfo ? <div className="relative hidden sm:block">
              <button onClick={() => setIsUserDropdownOpen(v => !v)} className="flex items-center gap-2 hover:text-nyoranixRed font-semibold text-sm"><FaUser size={15} /><span className="hidden xl:inline">Hi, {getUserName()}</span></button>
              <AnimatePresence>{isUserDropdownOpen && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-10 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-800 py-2 z-50">
                <Link to="/profile" onClick={() => setIsUserDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 text-sm">My Profile</Link>
                {userInfo.isAdmin && <Link to="/admin/dashboard" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 text-sm">Admin Panel</Link>}
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 border-t dark:border-zinc-800 mt-1 hover:bg-gray-50 dark:hover:bg-zinc-800 text-sm"><FaSignOutAlt className="inline mr-2" />Logout</button>
              </motion.div>}</AnimatePresence>
            </div> : <Link to="/login" className="hidden sm:block hover:text-nyoranixRed"><FaUser size={17} /></Link>}

            <motion.button key={cartAnimationKey} initial={{ scale: 1 }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: .35 }} onClick={() => dispatch(openCartDrawer())} className="relative hover:text-nyoranixRed">
              <FaShoppingCart size={18} />
              {totalQuantity > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 bg-nyoranixRed text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full">{totalQuantity}</motion.span>}
            </motion.button>

            <button className="lg:hidden" onClick={() => setIsMobileMenuOpen(v => !v)}>{isMobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}</button>
          </div>
        </div>

        <AnimatePresence>{isMobileMenuOpen && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden border-t border-gray-100 dark:border-zinc-800 px-5 py-5 bg-white/95 dark:bg-zinc-950/95">
          <div className="flex items-center bg-gray-100 dark:bg-zinc-900 rounded-full px-4 py-3 mb-4"><FaSearch className="text-gray-400" /><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitSearch(searchTerm)} placeholder="Search components..." className="bg-transparent outline-none ml-2 w-full text-sm" /></div>
          <div className="grid grid-cols-2 gap-2">{navLinks.map(l => <Link key={l.name} to={l.path} onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-lg bg-gray-50 dark:bg-zinc-900 font-semibold text-sm">{l.name}</Link>)}</div>
        </motion.div>}</AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
