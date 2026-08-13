import { API_URL } from '../../config/api';
import React, { useState } from 'react';
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

  const dispatch = useDispatch();
  const navigate = useNavigate();
  // === 2. GET CURRENT LOCATION ===
  const location = useLocation();

  const { totalQuantity } = useSelector((state) => state.cart);
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

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.length > 1) {
      try {
        const { data } = await axios.get(`${API_URL}/api/products`);
        const filtered = data.filter(p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
        setSuggestions(filtered);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (id) => {
    setSearchTerm('');
    setSuggestions([]);
    navigate(`/product/${id}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${searchTerm}`);
      setIsMobileMenuOpen(false);
      setSuggestions([]);
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/shop" },
    { name: "Solutions", path: "/solutions" },
    { name: "Documents", path: "/documents" },
    { name: "About", path: "/about" },
    { name: "Support", path: "/contact" },
  ];

  return (
    <>
      <div className="h-1 bg-gradient-to-r from-blue-600 to-purple-600 w-full"></div>

      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm font-sans">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="Nyoranix Logo"
              className="h-16 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-600 font-medium hover:text-nyoranixRed transition-colors text-[15px]"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-6">

            {/* === 3. CONDITIONAL SEARCH BAR (ONLY ON /shop) === */}
            {location.pathname === '/shop' && (
              <div className="relative hidden xl:block">
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

                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white border border-gray-100 shadow-xl rounded-lg mt-1 z-50 overflow-hidden">
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
                  </div>
                )}
              </div>
            )}

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
                <Link to="/login" className="hover:text-nyoranixRed transition-colors"><FaUser size={18} /></Link>
              )}

              {/* Cart */}
              <Link to="/cart" className="relative hover:text-nyoranixRed transition-colors">
                <FaShoppingCart size={18} />
                {totalQuantity > 0 && <span className="absolute -top-2 -right-2 bg-nyoranixRed text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-sm">{totalQuantity}</span>}
              </Link>

              {/* Mobile Menu Button */}
              <button className="lg:hidden ml-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 py-4 px-6 absolute w-full left-0 top-20 shadow-lg z-40">

             {/* === 4. CONDITIONAL MOBILE SEARCH (ONLY ON /shop) === */}
             {location.pathname === '/shop' && (
               <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-full px-4 py-2 mb-4 w-full">
                  <FaSearch className="text-gray-400" />
                  <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full outline-none" />
               </form>
             )}

             <div className="flex flex-col space-y-4">
                {navLinks.map(link => (
                  <Link key={link.name} to={link.path} onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 font-medium">
                    {link.name}
                  </Link>
                ))}
             </div>
          </div>
        )}

      </nav>
    </>
  );
};

export default Navbar;