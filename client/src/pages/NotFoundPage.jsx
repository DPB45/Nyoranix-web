import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaShoppingBag, FaExclamationTriangle } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaExclamationTriangle className="text-3xl text-nyoranixRed" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-xl font-semibold text-gray-700 mb-2">Page Not Found</p>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-nyoranixRed text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition"
          >
            <FaHome /> Back to Home
          </Link>
          <Link
            to="/shop"
            className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
          >
            <FaShoppingBag /> Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;