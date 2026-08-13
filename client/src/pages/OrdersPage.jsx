import { API_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux'; // 1. Import Redux
import axios from 'axios'; // 2. Import Axios
import { FaBox, FaClock, FaCheckCircle, FaTruck, FaArrowRight } from 'react-icons/fa';

const OrdersPage = () => {
  const { userInfo } = useSelector((state) => state.user); // 3. Get User Info
  const [orders, setOrders] = useState([]); // 4. Initialize empty state

  // === 5. FETCH REAL ORDERS ===
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        const { data } = await axios.get(`${API_URL}/api/orders/myorders`, config);

        // Map backend data to match the UI structure
        const formattedOrders = data.map(order => ({
          _id: order._id,
          date: order.createdAt.substring(0, 10),
          total: order.totalPrice,
          status: order.isDelivered ? 'Delivered' : 'Processing', // Simple logic for status
          items: order.orderItems
        }));

        setOrders(formattedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    if (userInfo) {
      fetchOrders();
    }
  }, [userInfo]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'Delivered') return <FaCheckCircle />;
    if (status === 'Processing') return <FaTruck />;
    return <FaClock />;
  };

  return (
    <div className="container mx-auto px-4 py-12 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
          <FaBox className="text-gray-300 text-6xl mx-auto mb-4" />
          <p className="text-gray-500 text-lg">You haven't placed any orders yet.</p>
          <Link to="/shop" className="text-nyoranixRed font-bold mt-4 inline-block hover:underline">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-6 text-sm text-gray-600">
                  <div>
                    <p className="font-bold text-gray-800 uppercase">Order Placed</p>
                    <p>{order.date}</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 uppercase">Total</p>
                    <p>₹{order.total}</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 uppercase">Order ID</p>
                    <p>#{order._id}</p>
                  </div>
                </div>

                <div className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 w-fit ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)} {order.status}
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 mb-4 last:mb-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {/* Check for item.image or item.images array */}
                      <img
                        src={item.image || (item.images && item.images[0]) || 'https://via.placeholder.com/150'}
                        alt={item.name}
                        className="max-w-full max-h-full p-2"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                    </div>
                    {/* Link to product details using item.product (ID) */}
                    <Link to={`/product/${item.product}`} className="text-nyoranixRed text-sm font-medium hover:underline">
                      View Product
                    </Link>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-gray-50 flex justify-end gap-3">
                {/* Linked Invoice Button */}
                <Link
                  to={`/order/${order._id}/invoice`}
                  className="text-sm border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center"
                >
                  Invoice
                </Link>

                <button className="text-sm bg-nyoranixBlack text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 flex items-center gap-2">
                  Track Package <FaArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;