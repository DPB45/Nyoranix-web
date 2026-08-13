import React from 'react';
import { FaCalendar, FaClock, FaArrowRight, FaSearch } from 'react-icons/fa';

const BlogPage = () => {
  // === MOCK DATA ===
  const featuredPost = {
    id: 1,
    title: "Mastering IoT: From Sensor to Cloud",
    excerpt: "Dive deep into the world of IoT devices. Learn how to connect sensors, process data, and integrate with cloud platforms for robust applications.",
    image: "https://via.placeholder.com/1200x500?text=IoT+Workshop",
    date: "July 15, 2025",
    readTime: "7 min read",
    tags: ["IoT", "Electronics", "Tutorial"]
  };

  const recentArticles = [
    {
      id: 2,
      title: "Beginner's Guide to Arduino Programming",
      excerpt: "An easy-to-follow guide for new Arduino enthusiasts. Learn the basics of writing code and building your first project.",
      image: "https://via.placeholder.com/600x400?text=Arduino+Code",
      date: "July 10, 2025",
      readTime: "5 min read",
      tags: ["Arduino", "Education", "Programming"]
    },
    {
      id: 3,
      title: "The Future of Robotics in Manufacturing",
      excerpt: "Explore how advanced robotics is revolutionizing the manufacturing sector, boosting efficiency and precision across industries.",
      image: "https://via.placeholder.com/600x400?text=Robotic+Arm",
      date: "June 28, 2025",
      readTime: "6 min read",
      tags: ["Robotics", "Industry", "Innovation"]
    },
    {
      id: 4,
      title: "Choosing the Right Microcontroller for Your Project",
      excerpt: "Navigate the vast landscape of microcontrollers. This guide helps you pick the perfect brain for your next electronic endeavor.",
      image: "https://via.placeholder.com/600x400?text=Microchips",
      date: "June 15, 2025",
      readTime: "4 min read",
      tags: ["Electronics", "DIY", "Guide"]
    },
    {
      id: 5,
      title: "Building a Smart Home System with ESP32",
      excerpt: "Transform your home into a smart haven using the versatile ESP32. This guide covers everything from basic setup to advanced automation.",
      image: "https://via.placeholder.com/600x400?text=Smart+Home",
      date: "May 30, 2025",
      readTime: "8 min read",
      tags: ["Smart Home", "IoT", "DIY"]
    }
  ];

  const categories = ["IoT", "Electronics", "Robotics", "Programming", "Education", "Smart Home", "Future Tech", "Industry"];
  const popularTags = ["Arduino", "ESP32", "Sensors", "AI", "Machine Learning", "Automation", "Wireless", "Microcontrollers", "DIY", "Guides"];

  return (
    <div className="bg-white min-h-screen font-sans text-gray-800">
      <div className="container mx-auto px-4 py-12 max-w-7xl">

        {/* === SECTION 1: HEADER & FEATURED POST === */}
        <div className="mb-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Featured Post</h1>

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer hover:shadow-md transition-all">
            <div className="h-80 md:h-96 overflow-hidden">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="p-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {featuredPost.tags.map(tag => (
                  <span key={tag} className="text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-nyoranixRed transition-colors">
                {featuredPost.title}
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center text-sm text-gray-400 gap-6 mb-6">
                <span className="flex items-center gap-2"><FaCalendar /> {featuredPost.date}</span>
                <span className="flex items-center gap-2"><FaClock /> {featuredPost.readTime}</span>
              </div>
              <button className="text-nyoranixRed font-bold flex items-center gap-2 hover:gap-3 transition-all">
                Read now <FaArrowRight />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">

          {/* === SECTION 2: LEFT COLUMN - RECENT ARTICLES === */}
          <div className="lg:w-2/3">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Recent Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {recentArticles.map((article) => (
                <article key={article.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
                  <div className="h-48 overflow-hidden">
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {article.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] font-bold uppercase bg-gray-50 text-gray-500 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-nyoranixRed cursor-pointer line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-grow">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                      <div className="flex items-center text-xs text-gray-400 gap-3">
                        <span>{article.date}</span>
                        <span>•</span>
                        <span>{article.readTime}</span>
                      </div>
                      <button className="text-nyoranixRed text-sm font-medium hover:underline">
                        Read now
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* === SECTION 3: RIGHT SIDEBAR === */}
          <aside className="lg:w-1/3 space-y-8">

            {/* Search */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-nyoranixRed focus:ring-0 rounded-lg text-sm outline-none transition-all"
                />
                <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <span key={cat} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-md hover:bg-nyoranixRed hover:text-white cursor-pointer transition-colors">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Tags Cloud */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <span key={tag} className="px-3 py-1 border border-gray-200 text-gray-500 text-xs rounded-full hover:border-nyoranixRed hover:text-nyoranixRed cursor-pointer transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">Subscribe to our Newsletter</h3>
              <p className="text-sm text-gray-500 mb-4">Get the latest updates, tips, and exclusive offers delivered straight to your inbox.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-nyoranixRed"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
};

export default BlogPage;