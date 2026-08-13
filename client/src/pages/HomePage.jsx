import { API_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FaArrowRight, FaMicrochip, FaIndustry, FaWifi, FaStar, FaShoppingCart,
  FaBolt, FaRobot, FaTools, FaDesktop, FaBox, FaPlug, FaLayerGroup,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import SkeletonCard from '../components/common/SkeletonCard';
// === 1. IMPORT META COMPONENT ===
import Meta from '../components/common/Meta';

const HomePage = () => {
  const dispatch = useDispatch();

  // === STATE ===
  const [newArrivals, setNewArrivals] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // === 2. FINAL CATEGORIES LIST ===
  const categories = [
    { id: 1, title: "NYORAI", icon: <FaStar className="text-4xl text-yellow-500" />, desc: "Flagship products and exclusive technological innovations.", bg: "bg-yellow-50" },
    { id: 2, title: "Core Electronix", icon: <FaMicrochip className="text-4xl text-blue-500" />, desc: "Essential semiconductors, resistors, capacitors, and active components.", bg: "bg-blue-50" },
    { id: 3, title: "Controllers", icon: <FaIndustry className="text-4xl text-gray-600" />, desc: "Microcontrollers, PLCs, and logic control units for automation.", bg: "bg-gray-50" },
    { id: 4, title: "Sensor & Modules", icon: <FaWifi className="text-4xl text-green-500" />, desc: "Precision sensors, communication modules, and IoT components.", bg: "bg-green-50" },
    { id: 5, title: "Power & Battery", icon: <FaBolt className="text-4xl text-orange-500" />, desc: "Batteries, BMS, chargers, solar, and power management units.", bg: "bg-orange-50" },
    { id: 6, title: "Motion Control & Robotics", icon: <FaRobot className="text-4xl text-purple-500" />, desc: "Motors, servos, drivers, actuators, and robotic chassis kits.", bg: "bg-purple-50" },
    { id: 7, title: "Tools & Instruments", icon: <FaTools className="text-4xl text-red-500" />, desc: "Soldering gear, multimeters, oscilloscopes, and precision tools.", bg: "bg-red-50" },
    { id: 8, title: "Displays & Interfaces", icon: <FaDesktop className="text-4xl text-indigo-500" />, desc: "LCDs, OLEDs, touchscreens, HMI displays, and indicators.", bg: "bg-indigo-50" },
    { id: 9, title: "Panels, Enclosures & Mounting", icon: <FaBox className="text-4xl text-teal-600" />, desc: "Chassis, project boxes, DIN rails, and mounting hardware.", bg: "bg-teal-50" },
    { id: 10, title: "Cables & Connectors", icon: <FaPlug className="text-4xl text-pink-500" />, desc: "Wires, connectors, headers, jumpers, and cable assemblies.", bg: "bg-pink-50" },
    { id: 11, title: "Electronics Kits", icon: <FaLayerGroup className="text-4xl text-cyan-500" />, desc: "DIY learning kits, STEM projects, and starter bundles.", bg: "bg-cyan-50" }
  ];

  // === FETCH DATA ===
  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, configRes] = await Promise.all([
          axios.get(`${API_URL}/api/products?isNewArrival=true`),
          axios.get(`${API_URL}/api/config`)
        ]);

        setNewArrivals(prodRes.data.slice(0, 8));

        if (configRes.data.banners && configRes.data.banners.length > 0) {
          setBanners(configRes.data.banners);
        } else if (configRes.data.banner) {
          setBanners([configRes.data.banner]);
        } else {
          setBanners([{
            image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
            title: 'Innovate with Precision',
            subtitle: 'Your one-stop shop for premium electronics...'
          }]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading home data", error);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // === AUTO-SLIDE LOGIC ===
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide(currentSlide === banners.length - 1 ? 0 : currentSlide + 1);
  };

  const prevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? banners.length - 1 : currentSlide - 1);
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="font-sans text-gray-800">
      {/* === 2. ADD META TAG HERE === */}
      <Meta />

      {/* 1. DYNAMIC HERO SLIDER */}
      <section className="relative h-screen w-full bg-gray-900 flex items-center justify-center overflow-hidden group">

        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900 opacity-90 z-0"></div>

            <div
              className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
              style={{ backgroundImage: `url('${banner.image}')` }}
            ></div>

            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="text-center px-4 max-w-4xl mx-auto animate-fade-in-up">
                <span className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-4 block">Welcome to Nyoranix</span>
                <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
                  {banner.title}
                </h1>
                <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                  {banner.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/shop" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                    Shop Now <FaArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {banners.length > 1 && (
          <>
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full z-30 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
              <FaChevronLeft size={24} />
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full z-30 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
              <FaChevronRight size={24} />
            </button>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? 'bg-blue-500 w-8' : 'bg-white/50 w-2 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Categories</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Explore our specialized components across different sectors.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className={`p-6 rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 group ${cat.bg}`}>
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto">
                  {cat.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{cat.title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed text-center mb-4">
                  {cat.desc}
                </p>
                <div className="text-center">
                  <Link to={`/shop?category=${encodeURIComponent(cat.title)}`} className="inline-flex items-center gap-2 text-xs font-bold text-gray-900 hover:text-blue-600 transition-colors">
                    Explore <FaArrowRight size={10} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. NEW ARRIVALS SECTION */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">New Arrivals</h2>
              <p className="text-gray-500">Check out the latest additions to our inventory.</p>
            </div>
            <Link to="/shop" className="text-blue-600 font-bold hover:underline hidden sm:block">View All Products &rarr;</Link>
          </div>

           {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : newArrivals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {newArrivals.map((product) => (
                <div key={product._id} className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
                   <div className="relative h-64 bg-gray-50 flex items-center justify-center p-4">
                    <img
                      src={product.images?.[0] || product.image || 'https://via.placeholder.com/300'}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg text-gray-800 hover:text-blue-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                    >
                      <FaShoppingCart />
                    </button>
                   </div>
                   <div className="p-5">
                    <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                    <Link to={`/product/${product._id}`} className="block font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2 h-12">
                      {product.name}
                    </Link>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xl font-bold text-blue-600">₹{product.price}</span>
                      <div className="flex text-yellow-400 text-xs">
                        {[...Array(5)].map((_, i) => <FaStar key={i} />)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No new arrivals.</div>
          )}

        </div>
      </section>

    </div>
  );
};

export default HomePage;