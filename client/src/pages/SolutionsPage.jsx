import React from 'react';
import { FaLaptopCode, FaIndustry, FaHandshake, FaExternalLinkAlt, FaMicrochip, FaTools, FaLightbulb } from 'react-icons/fa';

const SolutionsPage = () => {
  const partnerLink = "https://tathagatglobal.com/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnrLXkpnvvrrlYGcTXiRRuT8-RYsnvsiDf_QBsdesheI8grG7Vnfb3WJ6-Q-k&brid=rbcvnujHlW9WwRhN4QE3AA"; // Redirect link

  const solutionCategories = [
    {
      id: 1,
      title: "Design & Development",
      icon: <FaLaptopCode className="text-4xl text-blue-600" />,
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

  return (
    <div className="bg-gray-50 min-h-screen font-sans">

      {/* 1. HERO SECTION */}
      <section className="bg-gray-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-gray-900 opacity-90"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="text-blue-400 font-bold tracking-widest uppercase text-xs mb-2 block">
            POWERED BY TATHAGAT TECH UNIVERSE
          </span>
          {/* UPDATED: Changed text-gray-900 to text-white for visibility */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Engineering <span className="text-blue-500">Solutions</span>
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
            From concept to commissioning, we deliver cutting-edge electronics and automation solutions tailored to your needs.
          </p>
        </div>
      </section>

      {/* 2. DISCLAIMER BANNER */}
      <div className="bg-gray-800 text-gray-300 text-center py-3 text-xs md:text-sm px-4 border-b border-gray-700">
        <p>
          <span className="font-bold text-yellow-500">Note:</span> All solution engineering and service execution are delivered by
          <a href={partnerLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-bold ml-1">
             Tathagat Tech Universe
          </a>.
        </p>
      </div>

      {/* 3. SOLUTIONS GRID */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {solutionCategories.map((cat) => (
            <a
              key={cat.id}
              href={partnerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col"
            >
              {/* Card Header */}
              <div className="p-8 border-b border-gray-100 bg-gray-50 group-hover:bg-blue-50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-white p-3 rounded-xl shadow-sm">{cat.icon}</div>
                  <FaExternalLinkAlt className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">{cat.title}</h3>
                <p className="text-gray-500 text-sm">{cat.description}</p>
              </div>

              {/* Card Body */}
              <div className="p-8 flex-grow">
                {/* Standard List */}
                {cat.services && (
                  <ul className="space-y-3">
                    {cat.services.map((service, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-600 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                        <span className="group-hover:text-gray-900 transition-colors">{service}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Sub-section List (For Consulting) */}
                {cat.subSections && (
                  <div className="space-y-6">
                    {cat.subSections.map((sub, idx) => (
                      <div key={idx}>
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
                <span className="text-blue-600 font-bold text-sm flex items-center justify-center gap-2 group-hover:underline">
                   Visit Partner Site <FaExternalLinkAlt size={12} />
                </span>
              </div>
            </a>
          ))}

        </div>
      </section>

      {/* 4. CTA SECTION */}
      <section className="bg-blue-600 py-16 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Need a Custom Solution?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Contact us to discuss your requirements, and our engineering partners at Tathagat Tech Universe will assist you.
          </p>
          <div className="flex justify-center gap-4">
            <a href="/contact" className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg">
              Contact Us
            </a>
            <a href={partnerLink} target="_blank" rel="noopener noreferrer" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition">
              View All Services
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default SolutionsPage;