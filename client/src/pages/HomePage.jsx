import { API_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FaArrowRight, FaMicrochip, FaIndustry, FaWifi, FaStar,
  FaBolt, FaRobot, FaTools, FaDesktop, FaBox, FaPlug, FaLayerGroup,
  FaShippingFast, FaShieldAlt, FaHeadset, FaAward, FaCode, FaCogs
} from 'react-icons/fa';
import SkeletonCard from '../components/common/SkeletonCard';
import ProductCard from '../components/common/ProductCard';
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
  const [loading, setLoading] = useState(true);
  const [productCount, setProductCount] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [typedText, setTypedText] = useState('');
  const phrases = ['Sensors.', 'Controllers.', 'Robotics.'];

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
      try {
        const [prodRes, configRes, allProductsRes] = await Promise.all([
          axios.get(`${API_URL}/api/products?isNewArrival=true`),
          axios.get(`${API_URL}/api/config`),
          axios.get(`${API_URL}/api/products`)
        ]);

        setNewArrivals(prodRes.data.slice(0, 8));
        setAllProducts(allProductsRes.data);
        setProductCount(allProductsRes.data.length);

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

  useEffect(() => {
    let phrase = 0, char = 0, deleting = false;
    const timer = setInterval(() => {
      const target = phrases[phrase];
      char = deleting ? char - 1 : char + 1;
      setTypedText(target.slice(0, char));
      if (!deleting && char === target.length) deleting = true;
      else if (deleting && char === 0) { deleting = false; phrase = (phrase + 1) % phrases.length; }
    }, deleting ? 55 : 110);
    return () => clearInterval(timer);
  }, []);

  const categoryCount = title => allProducts.filter(p => p.category === title).length;

  return (
    <div className="font-sans text-gray-800 overflow-x-hidden">
      {/* === 2. ADD META TAG HERE === */}
      <Meta
        title="Nyoranix | Electronic Components, Sensors & Robotics Kits"
        description="Nyoranix is your trusted partner for premium electronic components, educational kits, and industrial solutions. Shop sensors, controllers, and robotics parts online."
        path="/"
      />

      {/* ELECTRONICS HERO */}
      <section className="relative min-h-[calc(100vh-5rem)] bg-zinc-950 text-white overflow-hidden flex items-center">
        <div className="absolute inset-0 circuit-grid opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(211,47,47,.22),transparent_42%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/70 to-zinc-950" />
        <motion.div animate={{ y: [0, -14, 0], x: [0, 10, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute top-28 left-[8%] text-red-500/70 text-5xl"><FaMicrochip /></motion.div>
        <motion.div animate={{ y: [0, 18, 0], x: [0, -12, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-1/3 right-[10%] text-white/30 text-5xl"><FaCogs /></motion.div>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute bottom-24 left-[16%] text-red-400/40 text-4xl"><FaCode /></motion.div>
        <div className="relative z-10 container mx-auto px-5 py-28 grid lg:grid-cols-[1.1fr_.9fr] gap-12 items-center">
          <div>
            <motion.span initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-bold uppercase tracking-[.25em]"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Nyoranix Electronics</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }} className="text-5xl md:text-7xl font-black leading-[.95] mt-6">Build what’s next.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-300 to-white">{typedText}<span className="text-red-500 animate-pulse">|</span></span></motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .35 }} className="text-gray-300 text-lg md:text-xl max-w-xl mt-7 leading-relaxed">Precision electronic components, modules and kits for makers, engineers, automation teams and robotics builders.</motion.p>
            <div className="flex flex-wrap gap-4 mt-9"><Link to="/shop" className="px-7 py-3.5 rounded-full bg-nyoranixRed hover:bg-red-700 font-bold shadow-[0_0_35px_rgba(211,47,47,.35)] flex items-center gap-2">Explore Components <FaArrowRight /></Link><Link to="/solutions" className="px-7 py-3.5 rounded-full border border-white/20 bg-white/5 backdrop-blur hover:bg-white/10 font-bold">Explore Solutions</Link></div>
          </div>
          <div className="relative hidden lg:block h-[430px]"><motion.div animate={{ rotate: [0, 2, -2, 0], y: [0, -8, 0] }} transition={{ duration: 9, repeat: Infinity }} className="absolute inset-10 rounded-[3rem] border border-red-500/20 bg-white/[.04] backdrop-blur-md shadow-[0_0_100px_rgba(211,47,47,.12)]" /><div className="absolute inset-0 flex items-center justify-center">{banners[0]?.image ? <img src={banners[0].image} alt="" className="w-[75%] h-[75%] object-cover rounded-3xl opacity-50 mix-blend-screen" /> : <FaMicrochip className="text-[13rem] text-red-500/50" />}</div><div className="absolute top-4 right-5 glass-chip">PRECISION</div><div className="absolute bottom-8 left-3 glass-chip">SMART SYSTEMS</div></div>
        </div>
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

      <section className="py-20 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4">
          <Reveal className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">Explore the ecosystem</h2><p className="text-gray-500 dark:text-gray-400 mt-3">Find the parts behind your next prototype, product or robot.</p></Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat, idx) => <Reveal key={cat.id} delay={(idx % 4) * .06}><Link to={`/shop?category=${encodeURIComponent(cat.title)}`}><motion.div whileHover={{ y: -7 }} className="category-card p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 h-full group"><motion.div whileHover={{ rotate: 8, scale: 1.12 }} className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-950 flex items-center justify-center shadow-sm mb-5 mx-auto">{cat.icon}</motion.div><h3 className="text-lg font-extrabold text-gray-900 dark:text-white text-center">{cat.title}</h3><p className="text-gray-500 dark:text-gray-400 text-xs text-center mt-2 leading-relaxed min-h-[42px]">{cat.desc}</p><div className="flex items-center justify-between mt-5 text-xs font-bold"><span className="text-gray-400">{categoryCount(cat.title)} items</span><span className="text-nyoranixRed flex items-center gap-1">Explore <FaArrowRight /></span></div></motion.div></Link></Reveal>)}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product, idx) => <Reveal key={product._id} delay={(idx % 4) * .06}><ProductCard product={product} compact /></Reveal>)}
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