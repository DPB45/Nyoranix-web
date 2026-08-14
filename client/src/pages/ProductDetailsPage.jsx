import { API_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { confirmToast } from '../utils/confirmToast';
import { addToCart } from '../redux/slices/cartSlice';
// === 1. ADD WHATSAPP ICON ===
import {
  FaStar, FaCheckCircle, FaShoppingCart, FaBoxOpen, FaInfoCircle,
  FaTruck, FaShieldAlt, FaShareAlt, FaThumbsUp, FaRegThumbsUp, FaUserCircle,
  FaEdit, FaTrash, FaWhatsapp, FaBolt // <--- Import FaWhatsapp
} from 'react-icons/fa';
import Meta from '../components/common/Meta';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.user);

  // === STATE ===
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Description');
  const [relatedProducts, setRelatedProducts] = useState([]);

  // === REVIEW FORM STATE ===
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // === FETCH DATA ===
  const fetchProductData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/products/${id}`);
      setProduct(data);

      const allProductsRes = await axios.get(`${API_URL}/api/products`);
      const related = allProductsRes.data
        .filter(p => p._id !== id && p.category === data.category)
        .slice(0, 4);
      setRelatedProducts(related);

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Product not found');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
    window.scrollTo(0, 0);
    setActiveTab('Description');
  }, [id]);

  // Pre-fill the review form if this user already has a review on this
  // product - keyed on primitive ids (not the `product`/`reviews` objects)
  // so it only runs once per product view and won't overwrite the user's
  // in-progress typing every time fetchProductData() re-runs (e.g. after
  // liking a review).
  useEffect(() => {
    const existing = (product?.reviews || []).find((r) => r.user === userInfo?._id);
    if (existing) {
      setRating(existing.rating);
      setComment(existing.comment);
    }
  }, [product?._id, userInfo?._id]);

  // === HANDLERS ===
  const handleAddToCart = () => {
    if (product && product.countInStock > 0) {
      dispatch(addToCart({ ...product, quantity: quantity, countInStock: product.countInStock }));
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleBuyNow = () => {
    if (product && product.countInStock > 0) {
      dispatch(addToCart({ ...product, quantity: quantity, countInStock: product.countInStock }));
      navigate('/checkout');
    }
  };

  // === 2. WHATSAPP HANDLER ===
  const handleWhatsAppInquiry = () => {
    const message = `Hi Nyoranix, I have a question about ${product.name} (ID: ${product._id}).`;
    const url = `https://wa.me/918805006332?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // === 3. DELIVERY DATE ESTIMATOR ===
  const getDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 5); // Add 5 days
    return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  const handleSubmitReview = async (e) => {
     // ... (Keep existing review logic)
     e.preventDefault();
     if (rating === 0) { setReviewError("Please select a star rating"); return; }
     try {
       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
       await axios.post(`${API_URL}/api/products/${id}/reviews`, { rating, comment }, config);
       setReviewSuccess('Review Submitted Successfully');
       setReviewError('');
       fetchProductData();
     } catch (err) {
       setReviewError(err.response?.data?.message || 'Error submitting review');
     }
  };

  // ... (Keep other handlers: handleLikeReview, handleDeleteReview, handleEditReview)
  const handleLikeReview = async (reviewId) => {
    if(!userInfo) { toast.error("Please login to like reviews"); return; }
    try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.put(`${API_URL}/api/products/${id}/reviews/${reviewId}/like`, {}, config);
        fetchProductData();
    } catch (err) { console.error(err); }
  }

  const handleDeleteReview = async (reviewId) => {
    if (await confirmToast("Are you sure you want to delete your review?", "Delete")) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`${API_URL}/api/products/${id}/reviews/${reviewId}`, config);
        fetchProductData();
        setReviewSuccess('Review Deleted');
        if (reviewId === myReview?._id) {
          setRating(0);
          setComment('');
        }
      } catch (err) {
        setReviewError(err.response?.data?.message || 'Error deleting review');
      }
    }
  };

  const handleEditReview = (review) => {
    setRating(review.rating);
    setComment(review.comment);
    const form = document.getElementById('reviewForm');
    if(form) form.scrollIntoView({ behavior: 'smooth' });
  };


  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div></div>;
  if (error || !product) return <div className="text-center p-10">Product Not Found</div>;

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const reviews = product.reviews || [];
  const myReview = userInfo ? reviews.find((r) => r.user === userInfo._id) : null;

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800 py-8">
      {product && (
        <Meta
          title={`${product.name} | Nyoranix`}
          description={product.shortDescription || product.description?.substring(0, 150)}
          keywords={`${product.category}, ${product.brand || 'Generic'}, electronics, components`}
        />
      )}

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-blue-600">Home</Link> / <Link to="/shop" className="hover:text-blue-600 ml-1">{product.category}</Link> / <span className="ml-1 text-gray-800 font-semibold">{product.name}</span>
      </div>

      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: Images */}
            <div className="p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
              <div className="bg-gray-50 rounded-xl flex items-center justify-center p-6 h-[400px] mb-4 relative group">
                {product.brand && (
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md border border-gray-200 px-3 py-1 rounded-full shadow-sm z-10">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{product.brand}</span>
                  </div>
                )}
                <img src={images[activeImage]} alt={product.name} className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 justify-center">
                {images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(idx)} className={`w-16 h-16 rounded-lg border-2 flex-shrink-0 overflow-hidden transition-all ${activeImage === idx ? 'border-blue-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}><img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" /></button>
                ))}
              </div>
            </div>

            {/* Right: Details */}
            <div className="p-8 lg:p-10 flex flex-col">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">{product.name}</h1>
              {product.shortDescription && <p className="text-gray-500 text-sm mb-6 leading-relaxed border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded-r">{product.shortDescription}</p>}

              <div className="mb-6">
                <div className="flex items-end gap-3"><span className="text-4xl font-bold text-blue-700">₹{product.price}</span><span className="text-sm text-gray-500 mb-2 font-medium">(Incl. GST)</span></div>
                {product.priceExclGST > 0 && <p className="text-xs text-gray-400 mt-1">Excl. GST: ₹{product.priceExclGST}</p>}

                {/* === 4. ADDED DELIVERY ESTIMATOR === */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-3 bg-green-50 px-3 py-2 rounded-lg border border-green-100 inline-block">
                  <FaTruck className="text-green-600" />
                  <span>Order now to get it by <span className="font-bold text-gray-900">{getDeliveryDate()}</span></span>
                </div>
              </div>

              {/* === 5. ADDED STOCK SCARCITY BAR === */}
              {product.countInStock > 0 && product.countInStock < 10 && (
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-orange-600">Hurry! Only {product.countInStock} left in stock</span>
                    <span className="text-gray-400">84% Sold</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(product.countInStock / 20) * 100}%` }}></div>
                  </div>
                </div>
              )}

              <div className="mb-8 flex-grow">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2"><FaStar className="text-yellow-400" /> Key Features</h3>
                <ul className="grid grid-cols-1 gap-2">{(product.features && product.features.length > 0 ? product.features : ["High Quality", "Reliable Performance"]).map((feat, i) => (<li key={i} className="flex items-start gap-2 text-sm text-gray-700"><FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={14} /><span className="leading-snug">{feat}</span></li>))}</ul>
              </div>

              <div className="border-t border-gray-100 pt-6 mt-auto">
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2 text-sm">{product.countInStock > 0 ? <span className="text-green-700 font-bold flex items-center gap-1 bg-green-100 px-2 py-1 rounded"><FaBoxOpen /> In Stock</span> : <span className="text-red-700 font-bold flex items-center gap-1 bg-red-100 px-2 py-1 rounded">Out of Stock</span>}</div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg h-12 w-32"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold text-lg">-</button><input type="text" readOnly value={quantity} className="w-full h-full text-center border-x border-gray-300 text-gray-900 font-bold outline-none" /><button onClick={() => setQuantity(Math.min(product.countInStock, quantity + 1))} className="w-10 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold text-lg">+</button></div>
                    <button onClick={handleAddToCart} disabled={product.countInStock === 0} className={`flex-1 h-12 rounded-lg font-bold text-lg border-2 flex items-center justify-center gap-2 transition-transform active:scale-95 ${product.countInStock > 0 ? 'border-blue-600 text-blue-600 hover:bg-blue-50' : 'border-gray-300 text-gray-400 cursor-not-allowed'}`}><FaShoppingCart /> {product.countInStock > 0 ? 'Add to Cart' : 'Sold Out'}</button>
                  </div>

                  <button onClick={handleBuyNow} disabled={product.countInStock === 0} className={`w-full h-12 rounded-lg font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 ${product.countInStock > 0 ? 'bg-nyoranixRed text-white hover:opacity-90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}><FaBolt /> Buy Now</button>

                  {/* === 6. ADDED WHATSAPP BUTTON === */}
                  <button onClick={handleWhatsAppInquiry} className="w-full h-10 border border-green-500 text-green-600 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-50 transition-colors">
                    <FaWhatsapp size={18} /> Ask about this product on WhatsApp
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ... (Rest of the file remains unchanged: Info Tabs, Reviews, Related Products) ... */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 sticky top-24">
              {['Description', 'Technical Specifications', 'Other Specifications', `Reviews (${reviews.length})`].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left px-6 py-4 rounded-lg font-bold text-sm transition-all mb-1 flex items-center justify-between ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}>{tab}{isActive && <FaInfoCircle />}</button>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-2">
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[300px]">
                {activeTab === 'Description' && (
                  <div className="animate-fade-in">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Product Description</h3>
                    <div className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                      {product.description && product.description.trim() !== ''
                        ? product.description
                        : <span className="text-gray-400 italic">No description available for this product.</span>}
                    </div>
                  </div>
                )}
                {activeTab === 'Technical Specifications' && (
                  <div className="animate-fade-in"><h3 className="text-xl font-bold text-gray-900 mb-6">Technical Specifications</h3>{product.specifications && product.specifications.length > 0 ? (<div className="border rounded-lg overflow-hidden"><table className="w-full text-sm text-left"><tbody className="divide-y divide-gray-100">{product.specifications.map((spec, idx) => (<tr key={idx} className="hover:bg-gray-50"><td className="px-6 py-4 font-semibold text-gray-600 bg-gray-50/50 w-1/3 border-r border-gray-100">{spec.key}</td><td className="px-6 py-4 text-gray-800 font-medium">{spec.value}</td></tr>))}</tbody></table></div>) : (<div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg border border-dashed">No technical specifications available.</div>)}</div>
                )}
                {activeTab === 'Other Specifications' && (
                  <div className="animate-fade-in"><h3 className="text-xl font-bold text-gray-900 mb-6">Additional Information</h3>{product.otherSpecifications && product.otherSpecifications.length > 0 ? (<div className="border rounded-lg overflow-hidden"><table className="w-full text-sm text-left"><tbody className="divide-y divide-gray-100">{product.otherSpecifications.map((spec, idx) => (<tr key={idx} className="hover:bg-gray-50"><td className="px-6 py-4 font-semibold text-gray-600 bg-gray-50/50 w-1/3 border-r border-gray-100">{spec.key}</td><td className="px-6 py-4 text-gray-800 font-medium">{spec.value}</td></tr>))}</tbody></table></div>) : (<div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg border border-dashed">No additional information available.</div>)}</div>
                )}
                {activeTab.startsWith('Reviews') && (
                  <div className="animate-fade-in">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews</h3>
                    <div className="space-y-6 mb-10">
                      {reviews.length === 0 && <div className="p-6 bg-blue-50 text-blue-600 rounded-lg text-center">No reviews yet. Be the first to review!</div>}
                      {reviews.map((review) => (
                          <div key={review._id} className="border-b border-gray-100 pb-6 last:border-none group">
                              <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500"><FaUserCircle size={24} /></div>
                                      <div>
                                          <p className="font-bold text-gray-900 text-sm">{review.name}</p>
                                          <div className="flex text-yellow-400 text-xs">{[...Array(5)].map((_, i) => (<FaStar key={i} className={i < review.rating ? "fill-current" : "text-gray-300"} />))}</div>
                                      </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <span className="text-xs text-gray-400">{review.createdAt?.substring(0, 10)}</span>
                                    {userInfo && review.user === userInfo._id && (
                                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditReview(review)} className="text-xs text-blue-600 hover:underline flex items-center gap-1"><FaEdit /> Edit</button>
                                        <button onClick={() => handleDeleteReview(review._id)} className="text-xs text-red-600 hover:underline flex items-center gap-1"><FaTrash /> Delete</button>
                                      </div>
                                    )}
                                  </div>
                              </div>
                              <p className="text-gray-600 text-sm mb-3 pl-14">{review.comment}</p>
                              <div className="pl-14 flex items-center gap-4">
                                  <button onClick={() => handleLikeReview(review._id)} className={`flex items-center gap-1 text-xs font-bold transition-colors ${review.likes?.includes(userInfo?._id) ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}>
                                      {review.likes?.includes(userInfo?._id) ? <FaThumbsUp /> : <FaRegThumbsUp />} Helpful ({review.likes?.length || 0})
                                  </button>
                              </div>
                          </div>
                      ))}
                    </div>
                    <div id="reviewForm" className="bg-gray-50 p-6 rounded-xl border border-gray-200 scroll-mt-24">
                        <h4 className="font-bold text-gray-800 mb-4">{myReview ? "Update your Review" : "Write a Review"}</h4>
                        {userInfo ? (
                            <form onSubmit={handleSubmitReview}>
                                {reviewError && <div className="text-red-500 text-xs mb-3">{reviewError}</div>}
                                {reviewSuccess && <div className="text-green-500 text-xs mb-3">{reviewSuccess}</div>}
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button type="button" key={star} onClick={() => setRating(star)} className={`text-2xl transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}><FaStar /></button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Comment</label>
                                    <textarea className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" rows="3" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your thoughts..." required></textarea>
                                </div>
                                <div className="flex gap-3">
                                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors">Submit Review</button>
                                  {comment && <button type="button" onClick={() => { setRating(myReview?.rating || 0); setComment(myReview?.comment || ''); }} className="text-gray-500 text-sm hover:underline">Cancel</button>}
                                </div>
                            </form>
                        ) : (
                            <div className="text-sm text-gray-600">Please <Link to="/login" className="text-blue-600 font-bold underline">login</Link> to write a review.</div>
                        )}
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-200 pt-12 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(prod => (
                <Link to={`/product/${prod._id}`} key={prod._id} className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="h-48 bg-gray-50 flex items-center justify-center p-4 relative">
                    <img src={prod.images?.[0] || prod.image} alt={prod.name} className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-blue-600 font-bold uppercase mb-1 block">{prod.brand || "Generic"}</span>
                    <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 h-10 group-hover:text-blue-600 transition-colors">{prod.name}</h3>
                    <div className="flex items-center justify-between mt-3"><span className="text-lg font-bold text-gray-900">₹{prod.price}</span><button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><FaShoppingCart size={12} /></button></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsPage;