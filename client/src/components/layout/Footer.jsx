import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaYoutube, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope, FaExternalLinkAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // There was no onSubmit handler here at all - clicking "Subscribe" fell
  // through to the browser's native form submission (no action/method set),
  // which does a full page reload and dumps the email into the URL as a
  // query string. This just stops that broken behavior; there's no backend
  // endpoint yet to actually persist newsletter signups.
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    toast.success("Thanks for subscribing!");
    setNewsletterEmail('');
  };

  return (
    // Added 'no-print' class AND 'data-html2canvas-ignore' attribute
    <footer
      className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800 no-print"
      data-html2canvas-ignore="true"
    >
      <div className="container mx-auto px-4">

        {/* Top Section: Links & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand Info */}
          <div>
            <h3 className="text-white text-2xl font-bold mb-6 tracking-tight">Nyoranix</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Your trusted partner for premium electronic components, educational kits, and industrial solutions. Smart made simple.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/people/Tathagat-Tech-Universe/61567520693073/?rdid=hzDwyluu54ig01dt&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F15Ut7zZQkE%2F" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300"><FaFacebook /></a>
              <a href="https://youtube.com/@nyoranix?si=Z8lRIjmUOzZaO0N0" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-all duration-300"><FaYoutube /></a>
              <a href="https://www.instagram.com/nyoranix/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all duration-300"><FaInstagram /></a>
              <a href="https://www.linkedin.com/company/nyoranix/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-700 hover:text-white transition-all duration-300"><FaLinkedin /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/shop" className="hover:text-blue-400 transition-colors">All Products</Link></li>
              <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact Support</Link></li>
              <li><Link to="/profile" className="hover:text-blue-400 transition-colors">My Account</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-blue-500 mt-1 flex-shrink-0" />
                <span>Ashirwad Building, Vadgaon Bk, Pune, Maharashtra 411041</span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="text-blue-500 flex-shrink-0" />
                <span>+91 88050 06332</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-blue-500 flex-shrink-0" />
                <span>nyoranix@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Stay Updated</h4>
            <p className="text-xs text-gray-500 mb-4">Subscribe for latest products and offers.</p>
            <form className="flex flex-col gap-3" onSubmit={handleNewsletterSubmit}>
              <input type="email" required value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} placeholder="Enter your email" className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-blue-500 text-sm" />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold text-sm transition-colors">Subscribe</button>
            </form>
          </div>
        </div>

        {/* === DISCLAIMER SECTION (NEW) === */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
           <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                 <h5 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Service & Solution Disclaimer
                 </h5>
                 <p className="text-xs text-gray-400 leading-relaxed">
                    All solution engineering and service execution are delivered by <span className="text-gray-300 font-bold">Tathagat Tech Universe</span>.
                    Nyoranix acts solely as the supply and product interface. Clicking on specific solution services may redirect you to the partner website.
                 </p>
              </div>
              <a
                href="https://tathagatglobal.com/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnrLXkpnvvrrlYGcTXiRRuT8-RYsnvsiDf_QBsdesheI8grG7Vnfb3WJ6-Q-k&brid=rbcvnujHlW9WwRhN4QE3AA"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap bg-gray-900 px-4 py-2 rounded border border-gray-700"
              >
                Visit Tathagat Tech <FaExternalLinkAlt size={10} />
              </a>
           </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Nyoranix. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;