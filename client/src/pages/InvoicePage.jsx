import { API_URL } from '../config/api';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FaPrint } from 'react-icons/fa';
// === 1. ADD IMPORTS ===
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const InvoicePage = () => {
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
    if (userInfo) {
      fetchOrder();
    } else {
      setError('Please log in to view this invoice.');
      setLoading(false);
    }
  }, [id, userInfo]);

  // === 2. ADD DOWNLOAD FUNCTION ===
  const downloadPDF = () => {
    const input = document.getElementById('invoice-content'); // Target specific ID

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // If the invoice is taller than one A4 page (e.g. an order with many
      // line items), a single addImage() call silently clips everything
      // past the first page - the rest just doesn't appear in the PDF.
      // Splitting across multiple pages: draw the full-height image on each
      // page at a progressively larger negative Y offset, so each page
      // reveals the correct "slice" clipped by that page's boundary.
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfPageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfPageHeight;
      }

      pdf.save(`invoice_${order._id}.pdf`);
    });
  };

  if (loading) return <div className="text-center py-20">Loading Invoice...</div>;
  if (error) return <div className="text-center py-20 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">

      {/* Action Bar */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Invoice #{order._id.substring(0, 8)}</h1>
        <button
          onClick={downloadPDF} // === 3. UPDATE BUTTON ACTION ===
          className="bg-gray-900 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 shadow-md transition-all"
        >
          <FaPrint /> Download PDF
        </button>
      </div>

      {/* Invoice Paper - === 4. ADD ID HERE === */}
      <div
        id="invoice-content"
        className="max-w-3xl mx-auto bg-white p-10 rounded-xl shadow-lg"
      >

        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-red-600 mb-1">NYORANIX</h1>
            <p className="text-gray-500 text-sm">Smart Made Simple</p>
          </div>
          <div className="text-right text-gray-600 text-sm leading-relaxed">
            <p className="font-bold text-gray-800">Tathagat Tech Universe</p>
            <p>Ashirwad Building, Vadgaon Bk</p>
            <p>Pune, Maharashtra 411041</p>
            <p>GSTIN: 27ABCDE1234F1Z5</p>
          </div>
        </div>

        {/* Bill To & Details */}
        <div className="flex justify-between mb-8">
          <div>
            <h3 className="text-gray-500 text-xs uppercase font-bold mb-2">Bill To</h3>
            <p className="font-bold text-gray-800">{order.shippingAddress.fullName}</p>
            <p className="text-gray-600 text-sm">{order.shippingAddress.address}</p>
            <p className="text-gray-600 text-sm">
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}
            </p>
            <p className="text-gray-600 text-sm">Phone: {order.shippingAddress.mobile}</p>
          </div>
          <div className="text-right">
             <h3 className="text-gray-500 text-xs uppercase font-bold mb-2">Invoice Details</h3>
             <p className="text-gray-600 text-sm">Date: <span className="font-bold text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</span></p>
             <p className="text-gray-600 text-sm">Order ID: <span className="font-bold text-gray-800">#{order._id.substring(0, 8)}</span></p>
             <p className="text-gray-600 text-sm">Status: <span className={`font-bold ${order.isPaid ? 'text-green-600' : 'text-orange-500'}`}>{order.paymentMethod}</span></p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <th className="py-3 px-4 rounded-l-lg">Item Description</th>
              <th className="py-3 px-4 text-right">Qty</th>
              <th className="py-3 px-4 text-right">Unit Price</th>
              <th className="py-3 px-4 text-right rounded-r-lg">Amount</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {order.orderItems.map((item, index) => (
              <tr key={index} className="border-b border-gray-50 last:border-0">
                <td className="py-4 px-4 font-medium">{item.name}</td>
                <td className="py-4 px-4 text-right">{item.quantity}</td>
                <td className="py-4 px-4 text-right">₹{item.price}</td>
                <td className="py-4 px-4 text-right font-bold">₹{item.quantity * item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal:</span>
              <span>₹{order.itemsPrice}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping:</span>
              <span>₹{order.shippingPrice}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax (18%):</span>
              <span>₹{order.taxPrice}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-800 border-t-2 border-gray-100 pt-2 mt-2">
              <span>Total:</span>
              <span>₹{order.totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-8 mt-12 text-center">
          <p className="text-gray-800 font-bold text-sm mb-1">Thank you for your business!</p>
          <p className="text-xs text-gray-500">
            For support, contact: <a href="tel:8805006332" className="hover:text-blue-600">8805006332</a> |
            <a href="mailto:nyoranix@gmail.com" className="hover:text-blue-600 ml-1">nyoranix@gmail.com</a>
          </p>
          <p className="text-[10px] text-gray-400 mt-4">This is a computer-generated invoice.</p>
        </div>

      </div>
    </div>
  );
};

export default InvoicePage;