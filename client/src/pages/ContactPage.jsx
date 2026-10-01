import { API_URL } from '../config/api';
import React, { useState } from 'react';
import axios from 'axios';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaPaperPlane, FaUser, FaPen } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
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

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(''); // success, error, loading
  const [statusMsg, setStatusMsg] = useState('');

  // Validate individual fields
  const validateField = (name, value) => {
    let error = '';
    if (!value.trim()) {
      error = 'This field is required';
    } else if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = 'Please enter a valid email address';
      }
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Run Validation
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 2. Submit Data
    setStatus('loading');
    setStatusMsg('Sending message...');

    try {
      await axios.post(`${API_URL}/api/inquiry`, formData);
      setStatus('success');
      setStatusMsg('Message Sent Successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form

      // Clear success message after 5 seconds
      setTimeout(() => {
        setStatus('');
        setStatusMsg('');
      }, 5000);

    } catch (error) {
      console.error(error);
      setStatus('error');
      setStatusMsg('Failed to send message. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Meta
        title="Contact Us | Nyoranix"
        description="Get in touch with Nyoranix for questions about electronic components, bulk orders, or support. We're based in Pune, Maharashtra."
        path="/contact"
      />
      {/* Header Section */}
      <div className="bg-white shadow-sm py-12 mb-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-nyoranixRed via-red-700 to-nyoranixBlack"></div>
        {/* Subtle parallax blob, same treatment as the About page hero -
            purely decorative, hidden from assistive tech. */}
        <motion.div
          aria-hidden="true"
          initial={{ y: 0 }}
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 w-72 h-72 bg-red-50 rounded-full blur-3xl opacity-70 pointer-events-none"
        />
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight relative z-10"
        >
          Contact <span className="text-nyoranixRed">Us</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-gray-500 text-lg max-w-2xl mx-auto px-4 relative z-10"
        >
          Have questions about our products or need technical support? We're here to help.
        </motion.p>
      </div>

      <div className="container mx-auto px-4 max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

        {/* Left: Contact Form */}
        <Reveal className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
            <span className="bg-red-50 text-nyoranixRed p-2 rounded-lg"><FaPaperPlane size={18}/></span>
            Send Us a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Name Field */}
              <div className="relative">
                <label htmlFor="contact-name" className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full border ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-nyoranixRed focus:bg-white'} rounded-xl pl-10 pr-4 py-3 outline-none transition-all`}
                    placeholder="Your Name"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
              </div>

              {/* Email Field */}
              <div className="relative">
                <label htmlFor="contact-email" className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full border ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-nyoranixRed focus:bg-white'} rounded-xl pl-10 pr-4 py-3 outline-none transition-all`}
                    placeholder="name@example.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
              </div>
            </div>

            {/* Subject Field */}
            <div>
              <label htmlFor="contact-subject" className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Subject <span className="text-red-500">*</span></label>
              <div className="relative">
                <FaPen className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full border ${errors.subject ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-nyoranixRed focus:bg-white'} rounded-xl pl-10 pr-4 py-3 outline-none transition-all`}
                  placeholder="What is this regarding?"
                />
              </div>
              {errors.subject && <p className="text-red-500 text-xs mt-1 ml-1">{errors.subject}</p>}
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="contact-message" className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Message <span className="text-red-500">*</span></label>
              <textarea
                id="contact-message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                className={`w-full border ${errors.message ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-nyoranixRed focus:bg-white'} rounded-xl p-4 outline-none transition-all resize-none`}
                placeholder="Write your message here..."
              ></textarea>
              {errors.message && <p className="text-red-500 text-xs mt-1 ml-1">{errors.message}</p>}
            </div>

            <motion.button
              whileHover={{ scale: status === 'loading' ? 1 : 1.01 }}
              whileTap={{ scale: status === 'loading' ? 1 : 0.98 }}
              type="submit"
              disabled={status === 'loading'}
              className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-colors ${
                status === 'loading' ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-nyoranixRed to-red-700 hover:from-red-700 hover:to-red-800'
              }`}
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Sending...
                </span>
              ) : 'Submit Message'}
            </motion.button>

            {/* Status Message Display */}
            <AnimatePresence>
              {statusMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`text-center p-3 rounded-lg text-sm font-bold border overflow-hidden ${
                    status === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
                    status === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'text-gray-500'
                  }`}
                >
                  {statusMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Reveal>

        {/* Right: Details & Info */}
        <div className="space-y-8 flex flex-col justify-center">
          <Reveal delay={0.1} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Our Contact Details</h2>
            <div className="space-y-6 text-gray-600">
              <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-nyoranixRed flex-shrink-0">
                  <FaMapMarkerAlt size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Head Office</h4>
                  <p className="text-sm leading-relaxed">Ashirwad Building, Flat No. 6,<br/>Vadgaon Bk, Maharashtra 411041</p>
                </div>
              </motion.div>

              <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-nyoranixRed flex-shrink-0">
                  <FaEnvelope size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Email Us</h4>
                  <a href="mailto:nyoranix@gmail.com" className="text-sm text-nyoranixRed hover:underline">nyoranix@gmail.com</a>
                </div>
              </motion.div>

              <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-nyoranixRed flex-shrink-0">
                  <FaPhone size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Call Support</h4>
                  <p className="text-sm">+91 88050 06332</p>
                  <p className="text-xs text-gray-400 mt-1">Mon - Sat, 9am - 6pm</p>
                </div>
              </motion.div>
            </div>
          </Reveal>

          {/* Map Section */}
          <Reveal delay={0.2} className="bg-gray-200 rounded-2xl overflow-hidden h-64 shadow-inner relative group">
            <iframe
              title="Nyoranix Head Office Location"
              src="https://maps.google.com/maps?q=Ashirwad%20Building%2C%20Flat%20No.%206%2C%20Vadgaon%20Bk%2C%20Maharashtra%20411041&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            ></iframe>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all pointer-events-none"></div>
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;