import { API_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FaArrowRight, FaMicrochip, FaIndustry, FaWifi, FaStar,
  FaBolt, FaRobot, FaTools, FaDesktop, FaBox, FaPlug, FaLayerGroup,
  FaChevronLeft, FaChevronRight, FaShippingFast, FaShieldAlt, FaHeadset, FaAward
} from 'react-icons/fa';
import ProductCard from '../components/common/ProductCard';
import { fetchAllProducts } from '../utils/productsCache';
import SkeletonCard from '../components/common/SkeletonCard';
// === 1. IMPORT META COMPONENT ===
import Meta from '../components/common/Meta';

// Reusable scroll-triggered reveal - animates a section in once when it
// enters the viewport, instead of everything just sitting static on load.
const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

const HomePage = () => {

  // === STATE ===
  const [newArrivals, setNewArrivals] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [productCount, setProductCount] = useState(null);

  // === 2. FINAL CATEGORIES LIST ===
  const categories = [
    { id: 1, title: "NYORAI", icon: <FaStar className="text-4xl text-nyoranixRed" />, desc: "Flagship products and exclusive technological innovations.", bg: "bg-red-50" },
    { id: 2, title: "Core Electronix", icon: <FaMicrochip className="text-4xl text-nyoranixBlack" />, desc: "Essential semiconductors, resistors, capacitors, and active components.", bg: "bg-gray-50" },
    { id: 3, title: "Controllers", icon: <FaIndustry className="text-4xl text-gray-600" />, desc: "Microcontrollers, PLCs, and logic control units for automation.", bg: "bg-gray-50" },
    { id: 4, title: "Sensor & Modules", icon: <FaWifi className="text-4xl text-nyoranixRed" />, desc: "Precision sensors, communication modules, and IoT components.", bg: "bg-red-50" },
    { id: 5, title: "Power & Battery", icon: <FaBolt className="text-4xl text-orange-500" />, desc: "Batteries, BMS, chargers, solar, and power management units.", bg: "bg-orange-50" },
    { id: 6, title: "Motion Control & Robotics", icon: <FaRobot className="text-4xl text-nyoranixBlack" />, desc: "Motors, servos, drivers, actuators, and robotic chassis kits.", bg: "bg-gray-50" },
    { id: 7, title: "Tools & Instruments", icon: <FaTools className="text-4xl text-nyoranixRed" />, desc: "Soldering gear, multimeters, oscilloscopes, and precision tools.", bg: "bg-red-50" },
    { id: 8, title: "Displays & Interfaces", icon: <FaDesktop className="text-4xl text-indigo-500" />, desc: "LCDs, OLEDs, touchscreens, HMI displays, and indicators.", bg: "bg-indigo-50" },
    { id: 9, title: "Panels, Enclosures & Mounting", icon: <FaBox className="text-4xl text-teal-600" />, desc: "Chassis, project boxes, DIN rails, and mounting hardware.", bg: "bg-teal-50" },
    { id: 10, title: "Cables & Connectors", icon: <FaPlug className="text-4xl text-nyoranixRed" />, desc: "Wires, connectors, headers, jumpers, and cable assemblies.", bg: "bg-red-50" },
    { id: 11, title: "Electronics Kits", icon: <FaLayerGroup className="text-4xl text-nyoranixBlack" />, desc: "DIY learning kits, STEM projects, and starter bundles.", bg: "bg-gray-50" }
  ];

  // Honest trust signals - real policies/features that already exist on the
  // site (UPI checkout, categories, etc), not fabricated customer counts or
  // "years in business" claims that would need to be verified with the
  // business owner before being presented as fact.
  const trustPoints = [
    { icon: <FaShippingFast />, title: "Pan-India Shipping", desc: "We ship components and kits across India." },
    { icon: <FaShieldAlt />, title: "Secure Checkout", desc: "UPI payments handled through a verified, secure flow." },
    { icon: <FaHeadset />, title: "Real Support", desc: "Reach us directly by phone, email, or WhatsApp." },
    { icon: <FaAward />, title: "Curated Range", desc: `${categories.length} categories of components, kits, and tools.` },
  ];

  // === FETCH DATA ===
  useEffect(() => {
    const loadData = async () => {
      const fallbackBanner = {
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
        title: 'Innovate with Precision',
        subtitle: 'Your one-stop shop for premium electronics...'
      };

      // allSettled: if /api/config fails the products still show (and vice versa)
      const [productsResult, configResult] = await Promise.allSettled([
        fetchAllProducts(),
        axios.get(`${API_URL}/api/config`),
      ]);

      if (productsResult.status === 'fulfilled') {
        const all = productsResult.value;
        setNewArrivals(all.filter(p => p.isNewArrival).slice(0, 8));
        setProductCount(all.length);
      } else {
        console.error('Error loading products', productsResult.reason);
      }

      const config = configResult.status === 'fulfilled' ? configResult.value.data : {};
      if (config.banners && config.banners.length > 0) {
        setBanners(config.banners);
      } else if (config.banner) {
        setBanners([config.banner]);
      } else {
        setBanners([fallbackBanner]);
      }

      setLoading(false);
    };
    loadData();
  }, []);

  // === PRELOAD + DECODE BANNER IMAGES ===
  // Banners are large (often base64) images. Decoding one only at the moment it
  // becomes visible is what made the change look janky, so do it up front.
  useEffect(() => {
    banners.forEach((b) => {
      if (!b.image) return;
      const img = new Image();
      img.src = b.image;
      if (img.decode) img.decode().catch(() => {});
    });
  }, [banners]);

  // === AUTO-SLIDE LOGIC ===
  // Depends on currentSlide so a manual click restarts the 6s timer instead of
  // auto-advancing a moment after the user just chose a slide. Pauses on hover.
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (banners.length <= 1 || paused) return undefined;
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearTimeout(timer);
  }, [banners.length, currentSlide, paused]);

  const nextSlide = () => setCurrentSlide((c) => (c === banners.length - 1 ? 0 : c + 1));
  const prevSlide = () => setCurrentSlide((c) => (c === 0 ? banners.length - 1 : c - 1));

  return (
    <div className="font-sans text-gray-800 overflow-x-hidden">
      {/* === 2. ADD META TAG HERE === */}
      <Meta
        title="Nyoranix | Electronic Components, Sensors & Robotics Kits"
        description="Nyoranix is your trusted partner for premium electronic components, educational kits, and industrial solutions. Shop sensors, controllers, and robotics parts online."
        path="/"
      />

      {/* 1. DYNAMIC HERO SLIDER */}
      <section onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className="relative h-screen w-full bg-nyoranixBlack flex items-center justify-center overflow-hidden group">

        {/* All slides stay mounted and stacked; only opacity changes, so the next
            slide fades in while the previous fades out (no flash of black). */}
        {banners.map((banner, idx) => {
          const active = idx === currentSlide;
          const Heading = active ? 'h1' : 'div';
          return (
            <div
              key={idx}
              aria-hidden={!active}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
              style={{ willChange: 'opacity' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-nyoranixBlack via-nyoranixBlack/90 to-red-950/60 opacity-95 z-0"></div>

              <div
                className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
                style={{ backgroundImage: `url('${banner.image}')` }}
              ></div>

              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="text-center px-4 max-w-4xl mx-auto">
                  <span className="text-red-400 font-bold tracking-widest uppercase text-sm mb-4 block">
                    Welcome to Nyoranix
                  </span>
                  <Heading className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
                    {banner.title}
                  </Heading>
                  <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                    {banner.subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/shop" tabIndex={active ? 0 : -1} className="bg-nyoranixRed hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95">
                      Shop Now <FaArrowRight />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

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
                  aria-label={`Show slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? 'bg-nyoranixRed w-8' : 'bg-white/50 w-2 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* TRUST BAR */}
      <section className="bg-nyoranixBlack py-8 border-b border-gray-800">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustPoints.map((point, idx) => (
            <Reveal key={point.title} delay={idx * 0.1} className="flex items-center gap-3 text-white justify-center md:justify-start">
              <div className="text-2xl text-nyoranixRed flex-shrink-0">{point.icon}</div>
              <div className="text-left">
                <p className="font-bold text-sm leading-tight">{point.title}</p>
                <p className="text-gray-400 text-xs hidden sm:block">{point.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Categories</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Explore {productCount !== null ? `${productCount}+ products across` : ''} our specialized components across different sectors.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <Reveal key={cat.id} delay={(idx % 4) * 0.08}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`p-6 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow duration-300 group h-full ${cat.bg}`}
                >
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto">
                    {cat.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{cat.title}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed text-center mb-4">
                    {cat.desc}
                  </p>
                  <div className="text-center">
                    <Link to={`/shop?category=${encodeURIComponent(cat.title)}`} className="inline-flex items-center gap-2 text-xs font-bold text-gray-900 group-hover:text-nyoranixRed transition-colors">
                      Explore <FaArrowRight size={10} />
                    </Link>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. NEW ARRIVALS SECTION */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <Reveal className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">New Arrivals</h2>
              <p className="text-gray-500">Check out the latest additions to our inventory.</p>
            </div>
            <Link to="/shop" className="text-nyoranixRed font-bold hover:underline hidden sm:block">View All Products &rarr;</Link>
          </Reveal>

           {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : newArrivals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {newArrivals.map((product, idx) => (
                <Reveal key={product._id} delay={(idx % 4) * 0.08} className="h-full">
                  <ProductCard product={product} />
                </Reveal>
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