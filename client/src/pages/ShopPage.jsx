import { API_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import { FaStar, FaChevronDown, FaChevronUp, FaShoppingCart, FaEye, FaBolt } from 'react-icons/fa';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { addToCart } from '../redux/slices/cartSlice';

// Reusable Filter Component
const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex justify-between items-center w-full text-left font-semibold mb-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
      </button>
      {isOpen && <div className="space-y-2">{children}</div>}
    </div>
  );
};

const ShopPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || "";
  const categoryParam = searchParams.get('category') || "";

  // === STATE MANAGEMENT ===
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);
  const [sortBy, setSortBy] = useState("Relevance");

  // Filter States
  const [priceRange, setPriceRange] = useState(20000);
  const [maxPriceLimit, setMaxPriceLimit] = useState(20000);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // The homepage's category cards (and anything else) link here as
  // /shop?category=X - without this, that query param was read nowhere and
  // every category card just dumped the visitor on the full unfiltered
  // shop page instead of that category. Effect (not a useState initializer)
  // because navigating from one category card to another doesn't remount
  // this page - only the query string changes.
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
  }, [categoryParam]);

  // === UPDATED CATEGORIES LIST ===
  const categoriesList = [
    "NYORAI",
    "Core Electronix",
    "Controllers",
    "Sensor & Modules",
    "Power & Battery",
    "Motion Control & Robotics",
    "Tools & Instruments",
    "Displays & Interfaces",
    "Panels, Enclosures & Mounting",
    "Cables & Connectors",
    "Electronics Kits"
  ];

  // === 1. FETCH PRODUCTS FROM API ===
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/api/products`);
        setAllProducts(data);
        setFilteredProducts(data);

        // Size the price slider to the actual catalog instead of a hardcoded
        // ceiling - otherwise any product priced above that fixed number
        // becomes permanently invisible on this page, filter or no filter.
        const highestPrice = data.reduce((max, p) => Math.max(max, p.price || 0), 0);
        const dynamicMax = Math.max(20000, Math.ceil(highestPrice / 1000) * 1000);
        setMaxPriceLimit(dynamicMax);
        setPriceRange(dynamicMax); // default to showing the full catalog, not pre-filtered

        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // === 2. FILTERING LOGIC ===
  useEffect(() => {
    let result = [...allProducts];

    if (searchQuery) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    if (priceRange < maxPriceLimit) {
      result = result.filter(p => p.price <= priceRange);
    }

    if (sortBy === "Price: Low to High") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price: High to Low") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "Newest First") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, priceRange, maxPriceLimit, sortBy, allProducts]);

  const handleCheckboxChange = (e, value) => {
    if (e.target.checked) {
      setSelectedCategories([...selectedCategories, value]);
    } else {
      setSelectedCategories(selectedCategories.filter(item => item !== value));
    }
  };

  const handleAddToCart = (product) => {
    if (product.countInStock > 0) {
      dispatch(addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || product.image,
        quantity: 1,
        countInStock: product.countInStock
      }));
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error("Item is out of stock");
    }
  };

  const handleBuyNow = (product) => {
    if (product.countInStock > 0) {
      dispatch(addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || product.image,
        quantity: 1,
        countInStock: product.countInStock
      }));
      navigate('/checkout');
    } else {
      toast.error("Item is out of stock");
    }
  };

  // Pagination Logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 font-sans bg-gray-50 min-h-screen">

      {/* === LEFT SIDEBAR - FILTERS === */}
      <aside className="lg:w-1/4 pr-4 bg-white p-6 rounded-lg shadow-sm h-fit">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Filters</h2>
          <button onClick={() => window.location.reload()} className="text-xs text-blue-600 hover:underline">Reset</button>
        </div>

        {/* Price Range */}
        <FilterSection title={`Max Price: ₹${priceRange.toLocaleString('en-IN')}${priceRange >= maxPriceLimit ? '+' : ''}`}>
          <input
            type="range"
            min="0"
            max={maxPriceLimit}
            step="100"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>₹0</span><span>₹{maxPriceLimit.toLocaleString('en-IN')}+</span>
          </div>
        </FilterSection>

        {/* === UPDATED CATEGORY FILTER === */}
        <FilterSection title="Category">
          {categoriesList.map(cat => (
            <label key={cat} className="flex items-center space-x-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                className="rounded text-blue-600 focus:ring-blue-500"
                onChange={(e) => handleCheckboxChange(e, cat)}
              />
              <span className="text-gray-700 text-sm">{cat}</span>
            </label>
          ))}
        </FilterSection>
      </aside>

      {/* === RIGHT MAIN CONTENT === */}
      <main className="lg:w-3/4">

        {/* Sorting Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-600 text-sm mb-4 sm:mb-0">
            Showing <span className="font-bold">{filteredProducts.length > 0 ? indexOfFirstProduct + 1 : 0}–{Math.min(indexOfLastProduct, filteredProducts.length)}</span> of <span className="font-bold">{filteredProducts.length}</span> results
          </p>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border-gray-300 rounded-md text-sm focus:border-blue-500">
            <option>Relevance</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest First</option>
          </select>
        </div>

        {/* Loading & Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Product Grid */}
            {currentProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentProducts.map(product => (
                  <div key={product._id} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col hover:shadow-lg transition-shadow duration-300">

                    <div className="h-48 flex items-center justify-center mb-4 bg-gray-50 rounded-md overflow-hidden relative group">
                      <Link to={`/product/${product._id}`} className="w-full h-full flex items-center justify-center">
                        <img
                          src={product.images?.[0] || product.image || "https://via.placeholder.com/300"}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                        />
                      </Link>
                      {product.countInStock === 0 && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">Out of Stock</span>
                        </div>
                      )}
                    </div>

                    <span className="text-xs text-gray-500 mb-1">{product.category}</span>

                    <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 h-10 hover:text-blue-600 cursor-pointer">
                      <Link to={`/product/${product._id}`}>{product.name}</Link>
                    </h3>

                    <p className="text-blue-600 font-bold text-lg mb-2">₹{product.price}</p>

                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < 4 ? "fill-current" : "text-gray-300"} />
                        ))}
                      </div>
                      <span>({product.numReviews || 0})</span>
                    </div>

                    <div className="mt-auto flex flex-col gap-2">
                      <button
                        onClick={() => handleBuyNow(product)}
                        disabled={product.countInStock === 0}
                        className={`w-full px-3 py-2 rounded-md font-bold transition-colors text-xs flex items-center justify-center gap-1 ${
                          product.countInStock > 0
                            ? 'bg-nyoranixRed text-white hover:opacity-90'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                       <FaBolt /> Buy Now
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.countInStock === 0}
                        className={`w-full px-3 py-2 rounded-md font-medium transition-colors text-xs flex items-center justify-center gap-1 border ${
                          product.countInStock > 0
                            ? 'border-blue-600 text-blue-600 hover:bg-blue-50'
                            : 'border-gray-300 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                       <FaShoppingCart /> {product.countInStock > 0 ? 'Add to Cart' : 'Sold Out'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-gray-700">No products found</h3>
                <p className="text-gray-500">Try changing your filters or check back later.</p>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {filteredProducts.length > productsPerPage && (
          <div className="flex justify-center items-center space-x-2 mt-12">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-2 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50">&lt; Prev</button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => paginate(i + 1)} className={`px-3 py-2 border rounded-md text-sm font-medium ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>{i + 1}</button>
            ))}
            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-2 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50">Next &gt;</button>
          </div>
        )}

      </main>
    </div>
  );
};

export default ShopPage;