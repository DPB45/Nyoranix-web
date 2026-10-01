import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Meta from '../components/common/Meta';
import { motion } from 'framer-motion';
// === 1. UPDATED IMPORTS FOR NEW ICONS ===
import {
  FaCheckCircle, FaMicrochip, FaIndustry, FaUserGraduate,
  FaLightbulb, FaCogs, FaShieldAlt, FaTruck,
  FaStar, FaWifi, FaBolt, FaRobot, FaTools, FaDesktop, FaBox, FaPlug, FaLayerGroup
} from 'react-icons/fa';

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

// Counts up to a real, derivable number (categories.length below) once it
// scrolls into view, rather than a static digit appearing instantly. Uses
// plain IntersectionObserver/requestAnimationFrame instead of a
// framer-motion viewport callback, so it doesn't depend on animation-prop
// details that are easy to get subtly wrong.
const CountUp = ({ end, duration = 1.2, className = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const startTime = performance.now();
        const step = (now) => {
          const progress = Math.min((now - startTime) / (duration * 1000), 1);
          setCount(Math.floor(progress * end));
          if (progress < 1) requestAnimationFrame(step);
          else setCount(end);
        };
        requestAnimationFrame(step);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref} className={className}>{count}</span>;
};

const AboutPage = () => {

  // === 2. CATEGORIES DATA ===
  // Note: this is the same 11-category list used on HomePage/ShopPage, kept
  // as its own local copy here (matching how those pages currently define
  // theirs too) rather than introducing a new shared constants file as part
  // of this change. Worth doing later - having three independently
  // maintained copies means they can quietly drift out of sync if one page
  // adds/edits a category and the others don't.
  const categories = [
    {
      id: 1,
      title: "NYORAI",
      icon: <FaStar className="text-3xl text-nyoranixRed" />,
      desc: "Flagship products and exclusive technological innovations.",
      bg: "bg-red-50",
      border: "border-nyoranixRed"
    },
    {
      id: 2,
      title: "Core Electronix",
      icon: <FaMicrochip className="text-3xl text-nyoranixBlack" />,
      desc: "Essential semiconductors, resistors, capacitors, and active components.",
      bg: "bg-gray-50",
      border: "border-nyoranixBlack"
    },
    {
      id: 3,
      title: "Controllers",
      icon: <FaIndustry className="text-3xl text-gray-600" />,
      desc: "Microcontrollers, PLCs, and logic control units for automation.",
      bg: "bg-gray-50",
      border: "border-gray-500"
    },
    {
      id: 4,
      title: "Sensor & Modules",
      icon: <FaWifi className="text-3xl text-nyoranixRed" />,
      desc: "Precision sensors, communication modules, and IoT components.",
      bg: "bg-red-50",
      border: "border-nyoranixRed"
    },
    {
      id: 5,
      title: "Power & Battery",
      icon: <FaBolt className="text-3xl text-orange-500" />,
      desc: "Batteries, BMS, chargers, solar, and power management units.",
      bg: "bg-orange-50",
      border: "border-orange-500"
    },
    {
      id: 6,
      title: "Motion Control & Robotics",
      icon: <FaRobot className="text-3xl text-nyoranixBlack" />,
      desc: "Motors, servos, drivers, actuators, and robotic chassis kits.",
      bg: "bg-gray-50",
      border: "border-nyoranixBlack"
    },
    {
      id: 7,
      title: "Tools & Instruments",
      icon: <FaTools className="text-3xl text-nyoranixRed" />,
      desc: "Soldering gear, multimeters, oscilloscopes, and precision tools.",
      bg: "bg-red-50",
      border: "border-nyoranixRed"
    },
    {
      id: 8,
      title: "Displays & Interfaces",
      icon: <FaDesktop className="text-3xl text-indigo-500" />,
      desc: "LCDs, OLEDs, touchscreens, HMI displays, and indicators.",
      bg: "bg-indigo-50",
      border: "border-indigo-500"
    },
    {
      id: 9,
      title: "Panels, Enclosures & Mounting",
      icon: <FaBox className="text-3xl text-teal-600" />,
      desc: "Chassis, project boxes, DIN rails, and mounting hardware.",
      bg: "bg-teal-50",
      border: "border-teal-500"
    },
    {
      id: 10,
      title: "Cables & Connectors",
      icon: <FaPlug className="text-3xl text-nyoranixRed" />,
      desc: "Wires, connectors, headers, jumpers, and cable assemblies.",
      bg: "bg-red-50",
      border: "border-nyoranixRed"
    },
    {
      id: 11,
      title: "Electronics Kits",
      icon: <FaLayerGroup className="text-3xl text-nyoranixBlack" />,
      desc: "DIY learning kits, STEM projects, and starter bundles.",
      bg: "bg-gray-50",
      border: "border-nyoranixBlack"
    }
  ];

  // "Who We Are" below already says Nyoranix serves: students, makers,
  // institutions, startups, and industrial buyers. This section surfaces
  // that same claim visually with a dedicated row instead of leaving it
  // buried in a paragraph, using FaUserGraduate/FaCogs which weren't
  // otherwise used anywhere on this page.
  const whoWeServe = [
    { Icon: FaUserGraduate, title: "Students & Makers", desc: "STEM learners and hobbyists building real projects." },
    { Icon: FaCogs, title: "Institutions & Startups", desc: "R&D teams and early-stage companies sourcing components." },
    { Icon: FaTruck, title: "Industrial Buyers", desc: "Reliable, repeat supply for production and automation needs." },
  ];

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      <Meta
        title="About Us | Nyoranix"
        description="Learn about Nyoranix - your trusted partner for premium electronic components, educational kits, and industrial solutions."
        path="/about"
      />

      {/* === 1. HERO HEADER === */}
      <div className="bg-white shadow-sm py-16 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-nyoranixRed via-red-700 to-nyoranixBlack"></div>
        {/* Subtle parallax: the accent blob drifts slowly behind the hero
            text, giving it a bit of depth instead of sitting completely
            flat. Purely decorative, so it's hidden from assistive tech. */}
        <motion.div
          aria-hidden="true"
          initial={{ y: 0 }}
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -right-24 w-72 h-72 bg-red-50 rounded-full blur-3xl opacity-70 pointer-events-none"
        />
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight"
          >
            About <span className="text-nyoranixRed">Nyoranix</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto"
          >
            Your trusted partner for quality-assured electronic, electrical, robotics, and automation components.
          </motion.p>
        </div>
      </div>

      {/* === 2. WHO WE ARE SECTION === */}
      <section className="py-16 container mx-auto px-4">
        <Reveal className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
              <p>
                <strong>Nyoranix</strong> is a specialized electronics components and technology products brand focused on the selling and supply of quality-assured components for innovation and industry.
              </p>
              <p>
                Powered by <strong>Tathagat Tech Universe</strong>, an MSME-registered company, Nyoranix operates as a product-focused brand. We deal in manufactured, sourced, and imported components, serving a diverse ecosystem of students, makers, institutions, startups, and industrial buyers across India.
              </p>
            </div>
          </div>
          <div className="flex-1 w-full flex justify-center">
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative w-full max-w-md bg-red-50 rounded-2xl p-8 text-center border border-red-100"
            >
              {/* Slow pulsing ring draws a little extra attention to this
                  card without being distracting - it's the page's one
                  concrete credibility signal (MSME registration). */}
              <motion.div
                aria-hidden="true"
                animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-2xl border-2 border-nyoranixRed pointer-events-none"
              />
              <FaMicrochip className="text-6xl text-nyoranixRed mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800">Powered By</h3>
              <p className="text-nyoranixRed font-bold text-lg mt-1">Tathagat Tech Universe</p>
              <span className="inline-block mt-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">MSME Registered</span>
            </motion.div>
          </div>
        </Reveal>
      </section>

      {/* === 2b. WHO WE SERVE === */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Who We Serve</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whoWeServe.map((item, idx) => (
              <Reveal key={item.title} delay={idx * 0.1} className="flex gap-4 items-start">
                <div className="text-2xl text-nyoranixRed bg-red-50 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.Icon />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* === 3. WHY NYORANIX === */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Nyoranix?</h2>
            <p className="text-gray-500 max-w-3xl mx-auto">
              As electronics usage expands across education, industry, and consumer applications, the need for consistent quality and genuine components has become critical. Nyoranix was established to meet this demand with a straightforward approach.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Reveal delay={0}>
              <ValueCard
                icon={<FaCheckCircle />}
                title="Right Products"
                desc="Supply the right products curated strictly for your specific needs."
                color="text-green-500"
              />
            </Reveal>
            <Reveal delay={0.1}>
              <ValueCard
                icon={<FaShieldAlt />}
                title="Consistent Quality"
                desc="Maintain rigorous quality standards to ensure every part performs as expected."
                color="text-nyoranixRed"
              />
            </Reveal>
            <Reveal delay={0.2}>
              <ValueCard
                icon={<FaLightbulb />}
                title="Clear Specifications"
                desc="Ensure clear specifications and accurate technical data for all our products."
                color="text-yellow-500"
              />
            </Reveal>
            <Reveal delay={0.3}>
              <ValueCard
                icon={<FaTruck />}
                title="Reliable Availability"
                desc="Provide reliable availability through dependable supply chains."
                color="text-nyoranixBlack"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* === 4. WHAT WE OFFER === */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <Reveal className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              What We Offer &mdash; <CountUp end={categories.length} className="text-nyoranixRed" />+ Categories
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <Reveal key={cat.id} delay={(idx % 4) * 0.06}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`bg-white p-6 rounded-xl shadow-sm border-t-4 ${cat.border} hover:shadow-lg transition-shadow flex flex-col h-full`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${cat.bg}`}>
                    {cat.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{cat.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-grow">
                    {cat.desc}
                  </p>
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* Manufacturing Note */}
          <Reveal delay={0.2} className="mt-12 bg-nyoranixBlack text-white rounded-2xl p-8 md:p-10 text-center shadow-lg">
            <h3 className="text-2xl font-bold mb-3">Manufacturing Excellence</h3>
            <p className="text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed">
              In addition to sourcing and importing, Nyoranix also manufactures selected electronic components and modules, ensuring better quality control, consistency, and long-term availability.
            </p>
            <div className="mt-8">
              <motion.div className="inline-block" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link to="/shop" className="inline-block bg-nyoranixRed text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors">
                  Explore Our Products
                </Link>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
};

// Helper Component for Value Cards
const ValueCard = ({ icon, title, desc, color }) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center hover:bg-white hover:shadow-md transition-shadow duration-300 h-full"
  >
    <div className={`text-4xl ${color} mb-4 flex justify-center`}>{icon}</div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{desc}</p>
  </motion.div>
);

export default AboutPage;