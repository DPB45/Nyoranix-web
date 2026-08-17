import { API_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCheck, FaTruck, FaCreditCard, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { clearCartItems } from '../redux/slices/cartSlice';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.user);

  // Guards against landing on /checkout directly with an empty cart (e.g. a
  // stale bookmark, browser back button, or refreshing after already
  // ordering) - redirects to the cart instead of showing a confusing
  // zero-item, zero-total checkout. Mount-only on purpose: placing an order
  // clears the cart right before navigating to the order page, and this
  // shouldn't fire and redirect mid-flight during that transition.
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === 1. STATE MANAGEMENT ===
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address1: '', address2: '', city: '', state: '', zip: '', country: 'India'
  });

  const [errors, setErrors] = useState({});
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [upiConfig, setUpiConfig] = useState({ upiId: '', upiPayeeName: '' });
  const [upiRef, setUpiRef] = useState('');
  const [upiRefError, setUpiRefError] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/api/config`)
      .then(({ data }) => setUpiConfig({ upiId: data.upiId || '', upiPayeeName: data.upiPayeeName || '' }))
      .catch(() => {}); // Non-critical - checkout still works with COD if this fails
  }, []);

  // Math
  const itemsPrice = cartItems.reduce((acc, item) => acc + Number(item.price) * Number(item.quantity || item.qty || 1), 0);
  const FREE_SHIPPING_THRESHOLD = 500;
  const standardShippingCost = itemsPrice > FREE_SHIPPING_THRESHOLD ? 0 : 50;
  const expressShippingCost = 150;
  const shippingCost = shippingMethod === 'express' ? expressShippingCost : standardShippingCost;
  const tax = (itemsPrice * 0.18);
  const grandTotal = (itemsPrice + shippingCost + tax);

  // === 2. HANDLERS ===
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  // === 3. VALIDATION ===
  const validateStep = (currentStep) => {
    let newErrors = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "First Name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!formData.phone.trim()) newErrors.phone = "Phone is required";
      if (!formData.address1.trim()) newErrors.address1 = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.zip.trim()) newErrors.zip = "Zip Code is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
    }
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  // === 4. PLACE ORDER HANDLER ===
  const handlePlaceOrder = async () => {
    if (!userInfo) {
      toast.error("Please login to place an order");
      navigate('/login');
      return;
    }

    if (paymentMethod === 'online') {
      if (!upiRef.trim()) {
        setUpiRefError('Please enter the UPI transaction ID / UTR number after paying');
        window.scrollTo(0, 0);
        return;
      }
      setUpiRefError('');
    }

    setLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const orderPayload = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          quantity: Number(item.quantity || item.qty || 1),
          image: item.image,
          price: Number(item.price),
          product: item.id || item._id || item.product,
        })),
        shippingAddress: {
          fullName: `${formData.firstName} ${formData.lastName}`,
          address: `${formData.address1}, ${formData.address2}`,
          city: formData.city,
          postalCode: formData.zip,
          country: formData.country,
          mobile: formData.phone
        },
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online',
        shippingMethod,
        paymentReference: paymentMethod === 'online' ? upiRef.trim() : undefined,
        itemsPrice: Number(itemsPrice.toFixed(2)),
        shippingPrice: Number(shippingCost.toFixed(2)),
        taxPrice: Number(tax.toFixed(2)),
        totalPrice: Number(grandTotal.toFixed(2)),
      };

      const { data } = await axios.post(`${API_URL}/api/orders`, orderPayload, config);

      toast.success("Order Placed Successfully!");

      dispatch(clearCartItems());
      navigate(`/order/${data._id}`);
    } catch (error) {
      console.error("Order Error:", error);
      const msg = error.response?.data?.message || "Order Failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 font-sans">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10"></div>
          {['Customer', 'Shipping', 'Payment', 'Summary'].map((label, idx) => {
            const stepNum = idx + 1;
            const active = step >= stepNum;
            return (
              <div key={label} className="flex flex-col items-center bg-white px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 border'}`}>{step > stepNum ? <FaCheck /> : stepNum}</div>
                <span className={`text-xs font-medium ${active ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              {step === 1 && (
                <div className="animate-fade-in space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Details</h2>
                  <div className="flex gap-6"><InputField label="First Name" name="firstName" placeholder="John" half formData={formData} errors={errors} onChange={handleChange} /><InputField label="Last Name" name="lastName" placeholder="Doe" half formData={formData} errors={errors} onChange={handleChange} /></div>
                  <div className="flex gap-6"><InputField label="Email" name="email" placeholder="john@example.com" type="email" half formData={formData} errors={errors} onChange={handleChange} /><InputField label="Phone" name="phone" placeholder="9876543210" half formData={formData} errors={errors} onChange={handleChange} /></div>
                  <InputField label="Address Line 1" name="address1" placeholder="123 Main St" formData={formData} errors={errors} onChange={handleChange} />
                  <div className="flex gap-6"><InputField label="City" name="city" placeholder="City" half formData={formData} errors={errors} onChange={handleChange} /><InputField label="State" name="state" placeholder="State" half formData={formData} errors={errors} onChange={handleChange} /></div>
                  <div className="flex gap-6"><InputField label="Zip Code" name="zip" placeholder="Zip" half formData={formData} errors={errors} onChange={handleChange} /><div className="w-full md:w-1/2"><label className="block text-sm font-medium text-gray-700 mb-1">Country</label><input type="text" value="India" readOnly className="w-full border rounded-lg px-4 py-3 bg-gray-100 text-gray-500" /></div></div>
                </div>
              )}
              {step === 2 && (
                <div className="animate-fade-in space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Method</h2>
                  {itemsPrice <= FREE_SHIPPING_THRESHOLD && (
                    <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 -mt-2">
                      Add ₹{(FREE_SHIPPING_THRESHOLD - itemsPrice).toFixed(2)} more to unlock free Standard shipping.
                    </p>
                  )}
                  <div onClick={() => setShippingMethod('standard')} className={`p-4 border rounded-xl flex justify-between cursor-pointer ${shippingMethod === 'standard' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}><div className="flex gap-4 items-center"><FaTruck className="text-gray-600" /><div><p className="font-bold">Standard</p><p className="text-xs text-gray-500">5-7 Days</p></div></div><span className={`font-bold ${standardShippingCost === 0 ? 'text-green-600' : 'text-gray-800'}`}>{standardShippingCost === 0 ? 'Free' : `₹${standardShippingCost.toFixed(2)}`}</span></div>
                  <div onClick={() => setShippingMethod('express')} className={`p-4 border rounded-xl flex justify-between cursor-pointer ${shippingMethod === 'express' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}><div className="flex gap-4 items-center"><FaTruck className="text-blue-600" /><div><p className="font-bold">Express</p><p className="text-xs text-gray-500">1-2 Days</p></div></div><span className="font-bold">₹{expressShippingCost.toFixed(2)}</span></div>
                </div>
              )}
              {step === 3 && (
                <div className="animate-fade-in space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
                  <div onClick={() => setPaymentMethod('cod')} className={`p-4 border rounded-xl flex items-center gap-4 cursor-pointer ${paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : ''}`}><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-blue-600' : 'border-gray-300'}`}>{paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}</div><span className="font-bold">Cash on Delivery</span></div>

                  {upiConfig.upiId ? (
                    <>
                      <div onClick={() => setPaymentMethod('online')} className={`p-4 border rounded-xl flex items-center gap-4 cursor-pointer ${paymentMethod === 'online' ? 'border-blue-500 bg-blue-50' : ''}`}><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'online' ? 'border-blue-600' : 'border-gray-300'}`}>{paymentMethod === 'online' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}</div><span className="font-bold flex items-center gap-2"><FaCreditCard /> Pay via UPI (Scan QR)</span></div>

                      {paymentMethod === 'online' && (
                        <div className="p-6 border rounded-xl bg-gray-50 flex flex-col items-center text-center animate-fade-in">
                          <p className="text-sm text-gray-600 mb-4">Scan with any UPI app (GPay, PhonePe, Paytm...) to pay <span className="font-bold text-gray-900">₹{grandTotal.toFixed(2)}</span></p>
                          <div className="bg-white p-3 rounded-lg border">
                            <QRCode value={`upi://pay?pa=${encodeURIComponent(upiConfig.upiId)}&pn=${encodeURIComponent(upiConfig.upiPayeeName || 'Merchant')}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Order Payment')}`} size={180} />
                          </div>
                          <p className="text-xs text-gray-400 mt-3">UPI ID: {upiConfig.upiId}</p>

                          <div className="w-full mt-6 text-left">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">UPI Transaction ID / UTR Number *</label>
                            <input
                              type="text"
                              value={upiRef}
                              onChange={(e) => { setUpiRef(e.target.value); if (upiRefError) setUpiRefError(''); }}
                              placeholder="e.g. 123456789012"
                              className={`w-full border rounded-lg p-3 text-sm ${upiRefError ? 'border-red-400' : 'border-gray-300'}`}
                            />
                            {upiRefError && <p className="text-red-500 text-xs mt-1">{upiRefError}</p>}
                            <p className="text-xs text-gray-400 mt-2">After paying, your UPI app shows a transaction ID / UTR - enter it here so we can verify your payment. Your order will be marked "Processing" until we confirm it (usually within a few hours).</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 border border-dashed rounded-xl text-sm text-gray-400 flex items-center gap-3">
                      <FaCreditCard /> Online payment isn't set up yet - Cash on Delivery only for now.
                    </div>
                  )}
                </div>
              )}
              {step === 4 && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Order</h2>
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200"><h3 className="font-bold mb-2">Shipping To:</h3><p className="text-sm text-gray-600">{formData.firstName} {formData.lastName}<br/>{formData.address1}, {formData.city}<br/>{formData.state} - {formData.zip}<br/>{formData.phone}</p></div>
                </div>
              )}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                {step > 1 && <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-gray-500 font-bold px-4 py-2 hover:bg-gray-100 rounded-lg"><FaChevronLeft size={12} /> Back</button>}
                {step < 4 ? <button onClick={handleNext} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 ml-auto flex items-center gap-2">Continue <FaChevronRight size={12} /></button> : <button onClick={handlePlaceOrder} disabled={loading} className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 ml-auto">{loading ? 'Processing...' : 'Place Order'}</button>}
              </div>
            </div>
          </div>
          <div className="lg:w-1/3">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-gray-50 rounded border flex items-center justify-center flex-shrink-0"><img src={item.image} alt={item.name} className="max-w-full max-h-full p-1" /></div>
                    <div className="flex-1"><p className="text-sm font-medium line-clamp-2">{item.name}</p><p className="text-xs text-gray-500">Qty: {item.quantity || item.qty}</p></div>
                    <p className="text-sm font-bold">₹{((item.price * (item.quantity || item.qty)) || 0).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{itemsPrice.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>₹{shippingCost.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax (18%)</span><span>₹{tax.toFixed(2)}</span></div>
              </div>
              <div className="border-t pt-4 mt-4 flex justify-between items-center"><span className="text-lg font-bold text-gray-900">Total</span><span className="text-xl font-bold text-blue-600">₹{grandTotal.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Defined OUTSIDE CheckoutPage on purpose: a component defined inside another
// component's body gets recreated as a new function on every re-render (e.g.
// every keystroke, since typing updates formData). React then treats it as a
// different component type and remounts the underlying <input>, which drops
// focus after every character. Keeping it top-level gives it a stable
// identity across re-renders so focus is preserved while typing.
const InputField = ({ label, name, placeholder, type = "text", half = false, formData, errors, onChange }) => (
  <div className={half ? "w-full md:w-1/2" : "w-full"}>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label} <span className="text-red-500">*</span></label>
    <input type={type} name={name} value={formData[name]} onChange={onChange} placeholder={placeholder}
      className={`w-full border rounded-lg px-4 py-3 text-sm outline-none ${errors[name] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'}`} />
    {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
  </div>
);

export default CheckoutPage;