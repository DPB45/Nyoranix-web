import React from 'react';
import { Link } from 'react-router-dom';
import { FaLaptopCode, FaIndustry, FaHandshake, FaExternalLinkAlt, FaMicrochip, FaTools, FaLightbulb } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Meta from '../components/common/Meta';

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

const SolutionsPage = () => {
  const partnerLink = "https://tathagatglobal.com/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnrLXkpnvvrrlYGcTXiRRuT8-RYsnvsiDf_QBsdesheI8grG7Vnfb3WJ6-Q-k&brid=rbcvnujHlW9WwRhN4QE3AA"; // Redirect link

  const solutionCategories = [
    {
      id: 1,
      title: "Design & Development",
      icon: <FaLaptopCode className="text-4xl text-nyoranixRed" />,
      description: "Comprehensive engineering for hardware and software ecosystems.",
      services: [
        "Electronics Design & Development",
        "Embedded Systems & Firmware Development",
        "IoT & IIoT Development",
        "Power Electronics Design",
        "Custom Electronic Module & OEM Design",
        "Web Dashboards & Device–Cloud Integration",
        "3D Printing Design"
      ]
    },
    {
      id: 2,
      title: "Manufacturing & Installation",
      icon: <FaIndustry className="text-4xl text-orange-500" />,
      description: "End-to-end production, fabrication, and field deployment.",
      services: [
        "End to End Electronics Product Manufacturing",
        "PCB Fabrication & Assembly Support",
        "Product Enclosure Fabrication",
        "Custom Industrial Control Panels",
        "3D Printing (Prototyping & Production)",
        "Home, Office, Society Automation Systems",
        "Agriculture, Industrial Automation Systems",
        "Field Installation & Commissioning Support",
        "Testing, Calibration & Quality Validation"
      ]
    },
    {
      id: 3,
      title: "Consulting & Support",
      icon: <FaHandshake className="text-4xl text-green-600" />,
      description: "Expert guidance for educational institutes and tech startups.",
      subSections: [
        {
          header: "For School, College & University",
          items: [
            "Technical Project Support & Mentoring",
            "Educational Internships, Workshops & Training"
          ]
        },
        {
          header: "For Tech Startups & Companies",
          items: [
            "R&D and Engineering Consulting",
            "Product Architecture & Feasibility Consulting",
            "Cost Optimization & Component Selection"
          ]
        }
      ]
    }
  ];

  // These three icons were imported but never actually used anywhere in the
  // file. Putting them to real use here instead of leaving them as dead
  // imports - honest, general value props that match what's already
  // described above (not new claims, just surfacing them).
  const whyPoints = [
    { icon: <FaMicrochip />, title: "Custom Engineering", desc: "Hardware and firmware built around your exact requirements, not off-the-shelf templates." },
    { icon: <FaTools />, title: "End-to-End Delivery", desc: "From design through manufacturing to field installation, handled by one team." },
    { icon: <FaLightbulb />, title: "Practical Consulting", desc: "Feasibility, cost, and component guidance for startups, schools, and institutions alike." },
  ];

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Meta
        title="Solutions for Industry, Education & Makers | Nyoranix"
        description="Nyoranix builds custom electronics, robotics, and industrial automation solutions for businesses, educators, and hobbyists."
        path="/solutions"
      />

      {/* 1. HERO SECTION */}
      <section className="bg-nyoranixBlack text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-nyoranixBlack via-nyoranixBlack to-red-950/40 opacity-95"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-red-400 font-bold tracking-widest uppercase text-xs mb-2 block"
          >
            POWERED BY TATHAGAT TECH UNIVERSE
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight"
          >
            Engineering <span className="text-nyoranixRed">Solutions</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            From concept to commissioning, we deliver cutting-edge electronics and automation solutions tailored to your needs.
          </motion.p>
        </div>
      </section>

      {/* 2. DISCLAIMER BANNER */}
      <div className="bg-gray-800 text-gray-300 text-center py-3 text-xs md:text-sm px-4 border-b border-gray-700">
        <p>
          <span className="font-bold text-yellow-500">Note:</span> All solution engineering and service execution are delivered by
          <a href={partnerLink} target="_blank" rel="noopener noreferrer" className="text-nyoranixRed hover:underline font-bold ml-1">
             Tathagat Tech Universe
          </a>.
        </p>
      </div>

      {/* 2b. WHY WORK WITH US */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {whyPoints.map((point, idx) => (
            <Reveal key={point.title} delay={idx * 0.1} className="flex gap-4 items-start">
              <div className="text-2xl text-nyoranixRed bg-red-50 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                {point.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{point.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{point.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 3. SOLUTIONS GRID */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {solutionCategories.map((cat, idx) => (
            <Reveal key={cat.id} delay={idx * 0.12}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full"
              >
                {/* Stretched link: the whole card is clickable, but the
                    anchor doesn't wrap every bullet point inside it (as it
                    did before) - a screen reader previously had to read the
                    title, description, AND every single service line as one
                    giant link label. This overlay makes the whole card
                    clickable while keeping the actual link's accessible
                    name short and meaningful. */}
                <a
                  href={partnerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${cat.title} solutions on Tathagat Tech Universe's website (opens in a new tab)`}
                  className="absolute inset-0 z-10"
                ></a>

                {/* Card Header */}
                <div className="p-8 border-b border-gray-100 bg-gray-50 group-hover:bg-red-50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm">{cat.icon}</div>
                    <FaExternalLinkAlt className="text-gray-300 group-hover:text-nyoranixRed transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-nyoranixRed transition-colors">{cat.title}</h3>
                  <p className="text-gray-500 text-sm">{cat.description}</p>
                </div>

                {/* Card Body */}
                <div className="p-8 flex-grow">
                  {/* Standard List */}
                  {cat.services && (
                    <ul className="space-y-3">
                      {cat.services.map((service, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-3 text-gray-600 text-sm">
                          <span className="mt-1.5 w-1.5 h-1.5 bg-nyoranixRed rounded-full flex-shrink-0"></span>
                          <span className="group-hover:text-gray-900 transition-colors">{service}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Sub-section List (For Consulting) */}
                  {cat.subSections && (
                    <div className="space-y-6">
                      {cat.subSections.map((sub, subIdx) => (
                        <div key={subIdx}>
                          <h4 className="font-bold text-gray-800 text-sm uppercase mb-3 border-b border-gray-100 pb-1">
                            {sub.header}
                          </h4>
                          <ul className="space-y-3">
                            {sub.items.map((item, i) => (
                              <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                                <span className="group-hover:text-gray-900 transition-colors">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
                  <span className="text-nyoranixRed font-bold text-sm flex items-center justify-center gap-2 group-hover:underline">
                     Visit Partner Site <FaExternalLinkAlt size={12} />
                  </span>
                </div>
              </motion.div>
            </Reveal>
          ))}

        </div>
      </section>

      {/* 4. CTA SECTION */}
      <section className="bg-nyoranixRed py-16 text-white text-center">
        <div className="container mx-auto px-4">
          <Reveal>
            <h2 className="text-3xl font-bold mb-4">Need a Custom Solution?</h2>
            <p className="text-red-100 mb-8 max-w-2xl mx-auto">
              Contact us to discuss your requirements, and our engineering partners at Tathagat Tech Universe will assist you.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link to="/contact" className="inline-block bg-white text-nyoranixRed px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg">
                  Contact Us
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <a href={partnerLink} target="_blank" rel="noopener noreferrer" className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition">
                  View All Services
                </a>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
};

export default SolutionsPage;