import React from 'react';
import { Link } from 'react-router-dom';
// === 1. UPDATED IMPORTS FOR NEW ICONS ===
import {
  FaCheckCircle, FaMicrochip, FaIndustry, FaUserGraduate,
  FaLightbulb, FaCogs, FaShieldAlt, FaTruck,
  FaStar, FaWifi, FaBolt, FaRobot, FaTools, FaDesktop, FaBox, FaPlug, FaLayerGroup
} from 'react-icons/fa';

const AboutPage = () => {

  // === 2. NEW CATEGORIES DATA ===
  const categories = [
    {
      id: 1,
      title: "NYORAI",
      icon: <FaStar className="text-3xl text-yellow-500" />,
      desc: "Flagship products and exclusive technological innovations.",
      bg: "bg-yellow-50",
      border: "border-yellow-500"
    },
    {
      id: 2,
      title: "Core Electronix",
      icon: <FaMicrochip className="text-3xl text-blue-500" />,
      desc: "Essential semiconductors, resistors, capacitors, and active components.",
      bg: "bg-blue-50",
      border: "border-blue-500"
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
      icon: <FaWifi className="text-3xl text-green-500" />,
      desc: "Precision sensors, communication modules, and IoT components.",
      bg: "bg-green-50",
      border: "border-green-500"
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
      icon: <FaRobot className="text-3xl text-purple-500" />,
      desc: "Motors, servos, drivers, actuators, and robotic chassis kits.",
      bg: "bg-purple-50",
      border: "border-purple-500"
    },
    {
      id: 7,
      title: "Tools & Instruments",
      icon: <FaTools className="text-3xl text-red-500" />,
      desc: "Soldering gear, multimeters, oscilloscopes, and precision tools.",
      bg: "bg-red-50",
      border: "border-red-500"
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
      icon: <FaPlug className="text-3xl text-pink-500" />,
      desc: "Wires, connectors, headers, jumpers, and cable assemblies.",
      bg: "bg-pink-50",
      border: "border-pink-500"
    },
    {
      id: 11,
      title: "Electronics Kits",
      icon: <FaLayerGroup className="text-3xl text-cyan-500" />,
      desc: "DIY learning kits, STEM projects, and starter bundles.",
      bg: "bg-cyan-50",
      border: "border-cyan-500"
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">

      {/* === 1. HERO HEADER (Kept as is) === */}
      <div className="bg-white shadow-sm py-16 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            About <span className="text-blue-600">Nyoranix</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Your trusted partner for quality-assured electronic, electrical, robotics, and automation components.
          </p>
        </div>
      </div>

      {/* === 2. WHO WE ARE SECTION (Kept as is) === */}
      <section className="py-16 container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
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
            <div className="w-full max-w-md bg-blue-50 rounded-2xl p-8 text-center border border-blue-100">
              <FaMicrochip className="text-6xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800">Powered By</h3>
              <p className="text-blue-800 font-bold text-lg mt-1">Tathagat Tech Universe</p>
              <span className="inline-block mt-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">MSME Registered</span>
            </div>
          </div>
        </div>
      </section>

      {/* === 3. WHY NYORANIX (Kept as is) === */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Nyoranix?</h2>
            <p className="text-gray-500 max-w-3xl mx-auto">
              As electronics usage expands across education, industry, and consumer applications, the need for consistent quality and genuine components has become critical. Nyoranix was established to meet this demand with a straightforward approach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ValueCard
              icon={<FaCheckCircle />}
              title="Right Products"
              desc="Supply the right products curated strictly for your specific needs."
              color="text-green-500"
            />
            <ValueCard
              icon={<FaShieldAlt />}
              title="Consistent Quality"
              desc="Maintain rigorous quality standards to ensure every part performs as expected."
              color="text-blue-500"
            />
            <ValueCard
              icon={<FaLightbulb />}
              title="Clear Specifications"
              desc="Ensure clear specifications and accurate technical data for all our products."
              color="text-yellow-500"
            />
            <ValueCard
              icon={<FaTruck />}
              title="Reliable Availability"
              desc="Provide reliable availability through dependable supply chains."
              color="text-purple-500"
            />
          </div>
        </div>
      </section>

      {/* === 4. WHAT WE OFFER (UPDATED WITH 11 CATEGORIES) === */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">What We Offer</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className={`bg-white p-6 rounded-xl shadow-sm border-t-4 ${cat.border} hover:shadow-lg transition-all flex flex-col h-full`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${cat.bg}`}>
                  {cat.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{cat.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed flex-grow">
                  {cat.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Manufacturing Note */}
          <div className="mt-12 bg-blue-900 text-white rounded-2xl p-8 md:p-10 text-center shadow-lg">
            <h3 className="text-2xl font-bold mb-3">Manufacturing Excellence</h3>
            <p className="text-blue-100 max-w-3xl mx-auto text-lg leading-relaxed">
              In addition to sourcing and importing, Nyoranix also manufactures selected electronic components and modules, ensuring better quality control, consistency, and long-term availability.
            </p>
            <div className="mt-8">
              <Link to="/shop" className="bg-white text-blue-900 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors">
                Explore Our Products
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

// Helper Component for Value Cards
const ValueCard = ({ icon, title, desc, color }) => (
  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center hover:bg-white hover:shadow-md transition-all duration-300">
    <div className={`text-4xl ${color} mb-4 flex justify-center`}>{icon}</div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{desc}</p>
  </div>
);

export default AboutPage;