import { API_URL } from '../../config/api';
import React, { useState, useEffect, useRef } from 'react';
// === 1. ADD useLocation IMPORT ===
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

import { logout } from '../../redux/slices/userSlice';
import logo from '../../assets/logo.jpg';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchBoxRef = useRef(null);
  const debounceRef = useRef(null);
  const latestQueryRef = useRef("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  // === 2. GET CURRENT LOCATION ===
  const location = useLocation();

  const { cartItems } = useSelector((state) => state.cart);
  const totalQuantity = cartItems.reduce((acc, item) => acc + Number(item.quantity || 0), 0);
  const { userInfo } = useSelector((state) => state.user);

  const getUserName = () => {
    if (userInfo && userInfo.name) {
      return userInfo.name.split(' ')[0];
    }
    return "User";
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setIsUserDropdownOpen(false);
  };

  // Shrinks the navbar slightly once the page scrolls, a common
  // "premium feel" touch, and gives the sticky nav a stronger shadow so it
  // reads clearly on top of scrolled content instead of blending in.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the suggestions dropdown on an outside click - previously it
  // stayed open indefinitely until a suggestion was clicked or the query
  // was cleared, even after the user had moved on to something else.
  useEffect(() => {
    const onClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const fetchSuggestions = (query) => {
    // Debounced (300ms) and guarded against out-of-order responses: without
    // this, every keystroke fired an immediate request for the ENTIRE
    // product catalog with no debounce, and a slow earlier request could
    // resolve after a newer one and overwrite it with stale suggestions.
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length <= 1) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      latestQueryRef.current = query;
      try {
        const { data } = await axios.get(`${API_URL}/api/products`);
        // If the user kept typing while this request was in flight, a newer
        // request has already been scheduled - drop this stale result.
        if (latestQueryRef.current !== query) return;
        const filtered = data.filter(p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
        setSuggestions(filtered);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    }, 300);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    fetchSuggestions(query);
  };

  const handleSuggestionClick = (id) => {
    setSearchTerm('');
    setSuggestions([]);
    setIsMobileMenuOpen(false);
    navigate(`/product/${id}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsMobileMenuOpen(false);
      setSuggestions([]);
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/shop" },
    { name: "Solutions", path: "/solutions" },
    { name: "About", path: "/about" },
    { name: "Support", path: "/contact" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className="h-1 bg-gradient-to-r from-nyoranixRed via-red-700 to-nyoranixBlack w-full"></div>

      <nav className={`sticky top-0 z-50 bg-white border-b border-gray-100 font-sans transition-shadow duration-300 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>
        <div className={`container mx-auto px-6 flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`}>

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="Nyoranix Logo"
              className={`w-auto object-contain hover:opacity-90 transition-all duration-300 ${isScrolled ? 'h-12' : 'h-16'}`}
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative font-medium transition-colors text-[15px] py-1 ${
                  isActive(link.path) ? 'text-nyoranixRed' : 'text-gray-600 hover:text-nyoranixRed'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="navActiveIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-nyoranixRed rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-6">

            {/* === 3. SEARCH BAR (now available site-wide, not just /shop) === */}
            <div className="relative hidden xl:block" ref={searchBoxRef}>
              <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-64 border border-transparent focus-within:border-gray-300 focus-within:bg-white transition-all">
                <FaSearch className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="bg-transparent border-none focus:ring-0 text-sm ml-2 text-gray-700 w-full placeholder-gray-400 outline-none"
                />
              </form>

              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 w-full bg-white border border-gray-100 shadow-xl rounded-lg mt-1 z-50 overflow-hidden"
                  >
                    {suggestions.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => handleSuggestionClick(p._id)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                      >
                        <img src={p.image || (p.images && p.images[0]) || 'https://via.placeholder.com/50'} alt={p.name} className="w-8 h-8 object-contain" />
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                          <p className="text-xs text-gray-500 truncate">{p.category}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-5 text-gray-600">
              {/* User Dropdown */}
              {userInfo ? (
                <div className="relative">
                  <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="flex items-center gap-2 hover:text-nyoranixRed transition-colors font-medium text-sm">
                    <FaUser size={16} />
                    <span className="hidden sm:inline">Hi, {getUserName()}</span>
                  </button>

                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-10 w-48 bg-white shadow-xl rounded-lg border border-gray-100 py-2 z-50">
                        <Link to="/profile" onClick={() => setIsUserDropdownOpen(false)} className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700">
                          <FaUser className="text-nyoranixRed" /> My Profile
                        </Link>
                        {userInfo.isAdmin && (
                          <Link to="/admin/dashboard" onClick={() => setIsUserDropdownOpen(false)} className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700">
                            <FaUser className="text-nyoranixRed" /> Admin Panel
                          </Link>
                        )}
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 border-t border-gray-100 mt-1">
                          <FaSignOutAlt className="text-gray-400" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-nyoranixRed transition-colors"><FaUser size={18} /></Link>
              )}

              {/* Cart */}
              <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="relative hover:text-nyoranixRed transition-colors">
                <FaShoppingCart size={18} />
                <AnimatePresence>
                  {totalQuantity > 0 && (
                    <motion.span
                      key={totalQuantity}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 bg-nyoranixRed text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-sm"
                    >
                      {totalQuantity}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Mobile Menu Button */}
              <button className="lg:hidden ml-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="lg:hidden bg-white border-t border-gray-100 py-4 px-6 absolute w-full left-0 top-full shadow-lg z-40 overflow-hidden"
            >

               {/* === 4. MOBILE SEARCH (now with the same live suggestions as desktop) === */}
               <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-full px-4 py-2 mb-2 w-full">
                  <FaSearch className="text-gray-400" />
                  <input type="text" placeholder="Search products..." value={searchTerm} onChange={handleSearchChange} className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full outline-none" />
               </form>

               {suggestions.length > 0 && (
                 <div className="mb-4 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden">
                   {suggestions.map((p) => (
                     <div
                       key={p._id}
                       onClick={() => handleSuggestionClick(p._id)}
                       className="flex items-center gap-3 p-3 hover:bg-white cursor-pointer border-b last:border-0 border-gray-100"
                     >
                       <img src={p.image || (p.images && p.images[0]) || 'https://via.placeholder.com/50'} alt={p.name} className="w-8 h-8 object-contain" />
                       <div className="overflow-hidden">
                         <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                         <p className="text-xs text-gray-500 truncate">{p.category}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               )}

             <div className="flex flex-col space-y-4">
                {navLinks.map(link => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`font-medium ${isActive(link.path) ? 'text-nyoranixRed' : 'text-gray-700'}`}
                  >
                    {link.name}
                  </Link>
                ))}
             </div>
            </motion.div>
          )}
        </AnimatePresence>

      </nav>
    </>
  );
};

export default Navbar;