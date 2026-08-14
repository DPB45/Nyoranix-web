import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, updateQuantity } from '../redux/slices/cartSlice';
// 1. Added FaShoppingBag to imports
import { FaTrash, FaArrowRight, FaShoppingBag } from 'react-icons/fa';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get Cart and User Info from Redux
  const cart = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.user);
  const { cartItems } = cart;

  const totalItems = cartItems.reduce((acc, item) => acc + Number(item.quantity), 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0).toFixed(2);

  // === FIXED CHECKOUT HANDLER ===
  const checkoutHandler = () => {
    if (!userInfo) {
      // If not logged in, go to login, then redirect to checkout
      navigate('/login?redirect=/checkout');
    } else {
      // If logged in, go directly to checkout
      navigate('/checkout');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        // 2. IMPROVED EMPTY CART STATE
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <FaShoppingBag className="text-blue-200 text-6xl" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Your Cart is Empty</h2>
            <p className="text-gray-500 mb-8 leading-relaxed max-w-md mx-auto">
                Looks like you haven't added anything to your cart yet. Explore our top categories and find something you love!
            </p>
            <Link
                to="/shop"
                className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-blue-700 transition-all hover:scale-105 flex items-center gap-2"
            >
                Start Shopping <FaArrowRight />
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                {/* Image */}
                <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <Link to={`/product/${item.product}`} className="text-lg font-bold text-gray-800 hover:text-blue-600 line-clamp-1">
                    {item.name}
                  </Link>
                  <p className="text-gray-500 text-sm mb-2">Unit Price: ₹{item.price}</p>

                  <div className="flex items-center gap-4">
                    {/* Quantity Selector */}
                    <select
                      value={item.quantity}
                      onChange={(e) => dispatch(updateQuantity({ id: item.id, quantity: Number(e.target.value) }))}
                      className="border border-gray-300 rounded-md p-1 text-sm focus:border-blue-500 outline-none"
                    >
                      {[...Array(item.countInStock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                    >
                      <FaTrash /> Remove
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Order Summary</h2>

              <div className="space-y-3 text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span className="font-bold text-gray-900">{totalItems}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Subtotal:</span>
                  <span className="font-bold text-blue-600">₹{totalPrice}</span>
                </div>
              </div>

              <button
                onClick={checkoutHandler}
                className="w-full bg-nyoranixRed text-white py-3 rounded-lg font-bold hover:opacity-90 shadow-md flex items-center justify-center gap-2"
              >
                Proceed to Checkout <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;