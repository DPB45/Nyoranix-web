import { API_URL } from '../config/api';
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FaCheckCircle, FaTruck, FaBox, FaFilePdf, FaFileInvoice, FaArrowLeft } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const { userInfo } = useSelector((state) => state.user);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`${API_URL}/api/orders/${id}`, config);
        setOrder(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    if (userInfo) fetchOrder();
  }, [id, userInfo]);

  // === OPTION 1: DOWNLOAD DIRECT PDF ===
  const downloadInvoice = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(220, 38, 38);
    doc.text("Nyoranix", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Smart Made Simple", 14, 28);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("INVOICE", 150, 22);
    doc.setFontSize(10);
    doc.text(`Order ID: ${order._id}`, 150, 28);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 150, 34);
    doc.line(14, 40, 196, 40);

    const tableColumn = ["Product", "Qty", "Unit Price", "Total"];
    const tableRows = [];
    order.orderItems.forEach(item => {
      tableRows.push([item.name, item.quantity, `Rs. ${item.price}`, `Rs. ${item.quantity * item.price}`]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
    });

    doc.text(`Total: Rs. ${order.totalPrice}`, 140, doc.lastAutoTable.finalY + 10);
    doc.save(`Invoice_${order._id}.pdf`);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-10 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">

        {/* Header */}
        <div className="bg-blue-600 p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FaCheckCircle className="text-green-300" /> Order Placed Successfully!
            </h1>
            <p className="text-blue-100 mt-1">Order ID: {order._id}</p>
          </div>

          <div className="flex gap-3">
            {/* OPTION 1: Download PDF Directly */}
            <button
              onClick={downloadInvoice}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-100 transition shadow"
            >
              <FaFilePdf /> PDF
            </button>

            {/* OPTION 2: View Printable Invoice Page */}
            <Link
              to={`/order/${order._id}/invoice`}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-700 transition shadow"
            >
              <FaFileInvoice /> View Invoice
            </Link>
          </div>
        </div>

        {/* Order Info Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Shipping Info */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaTruck className="text-blue-600" /> Shipping Info
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="font-bold">{order.shippingAddress.fullName}</p>
              <p className="text-gray-600">{order.shippingAddress.address}</p>
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              <p className="text-gray-600 mt-2">Phone: {order.shippingAddress.mobile}</p>
              <div className="mt-3">
                 <span className={`text-xs font-bold px-2 py-1 rounded ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.isDelivered ? "Delivered" : "Processing"}
                 </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaBox className="text-blue-600" /> Items
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg border max-h-64 overflow-y-auto">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4 mb-4 last:mb-0 border-b pb-4 last:border-0 last:pb-0">
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded border" />
                  <div className="flex-1">
                    <Link to={`/product/${item.product}`} className="font-bold text-gray-800 hover:text-blue-600 line-clamp-1 text-sm">
                      {item.name}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {item.quantity} x ₹{item.price} = <b>₹{item.quantity * item.price}</b>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t flex justify-center">
          <Link to="/shop" className="text-gray-600 font-bold flex items-center gap-2 hover:text-blue-600 transition">
            <FaArrowLeft /> Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderDetailsPage;