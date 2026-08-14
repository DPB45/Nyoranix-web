import { API_URL } from '../config/api';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { confirmToast } from '../utils/confirmToast';
import { FaUser, FaBoxOpen, FaDownload, FaEye, FaCheckCircle, FaTruck, FaList, FaPen, FaTrash, FaPlus, FaLock, FaSave, FaMapMarkerAlt } from 'react-icons/fa';
// REMOVED jsPDF imports as we are using the dedicated Invoice page
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);

  // === DATA STATES ===
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // === FORM STATES ===
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);

  // === ADDRESS STATES ===
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ address: '', city: '', postalCode: '', country: 'India' });

  const [activeTab, setActiveTab] = useState('profile');

  // === 1. INITIALIZE DATA ===
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      setName(userInfo.name);
      setEmail(userInfo.email);
      setMobile(userInfo.mobile || '');
      setAddresses(userInfo.addresses || []);
      fetchMyOrders();
    }
  }, [userInfo, navigate]);

  const fetchMyOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${API_URL}/api/orders/myorders`, config);
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  // === 2. UPDATE PROFILE HANDLER ===
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const payload = {
        id: userInfo._id,
        name,
        email,
        mobile,
        password: password || undefined
      };

      const { data } = await axios.put(`${API_URL}/api/users/profile`, payload, config);

      setMessage({ type: 'success', text: 'Profile Updated Successfully!' });
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update Failed' });
    }
  };

  // === 3. ADDRESS HANDLERS ===
  const handleAddAddress = () => {
    if(!newAddress.address || !newAddress.city) { toast.error("Please fill address details"); return; }
    const updatedAddresses = [...addresses, { ...newAddress, _id: Date.now().toString() }];
    setAddresses(updatedAddresses);
    setNewAddress({ address: '', city: '', postalCode: '', country: 'India' });
    setShowAddressForm(false);
  };

  const handleDeleteAddress = async (id) => {
    if (await confirmToast("Delete this address?", "Delete")) {
      setAddresses(addresses.filter(addr => addr._id !== id));
    }
  };

  // === REMOVED CLIENT-SIDE PDF GENERATION ===
  // Using the dedicated /order/:id/invoice page instead

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row gap-8">

        {/* === SIDEBAR === */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    <FaUser />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 text-sm truncate w-32">{userInfo?.name}</h2>
                    <p className="text-xs text-gray-500">Member</p>
                  </div>
               </div>
            </div>
            <nav className="p-2 space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <FaUser className="text-lg opacity-70" /> Profile
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <FaList className="text-lg opacity-70" /> Order History
              </button>
            </nav>
          </div>
        </aside>

        {/* === MAIN CONTENT === */}
        <main className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{activeTab === 'profile' ? 'User Profile' : 'Order History'}</h1>

          {/* Feedback Message */}
          {message && (
            <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-bold ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message.text}
            </div>
          )}

          {/* --- TAB 1: PROFILE --- */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              {/* ... (Profile Form code remains exactly as is) ... */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-800">Personal Information</h2>
                  <p className="text-sm text-gray-500">Update your personal details.</p>
                </div>
                <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                    <input type="email" value={email} disabled className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none transition" />
                  </div>
                  <div className="md:col-span-2 flex justify-end mt-2">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm flex items-center gap-2"><FaSave /> Save Changes</button>
                  </div>
                </form>
              </div>

              {/* Security */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-6 flex items-center gap-2"><FaLock className="text-blue-600" /><h2 className="text-lg font-bold text-gray-800">Security (Change Password)</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-xs font-bold text-gray-700 mb-1">New Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none" placeholder="Leave blank to keep current" /></div>
                  <div><label className="block text-xs font-bold text-gray-700 mb-1">Confirm Password</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none" placeholder="Confirm new password" /></div>
                  <div className="md:col-span-2 flex justify-end"><button onClick={handleUpdateProfile} className="text-blue-600 font-bold text-sm hover:underline">Update Password</button></div>
                </div>
              </div>

              {/* Shipping Addresses */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6"><div><h2 className="text-lg font-bold text-gray-800">Shipping Addresses</h2><p className="text-sm text-gray-500">Manage your delivery addresses.</p></div><button onClick={() => setShowAddressForm(!showAddressForm)} className="flex items-center gap-2 text-gray-700 font-bold text-xs border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition"><FaPlus /> {showAddressForm ? 'Cancel' : 'Add New Address'}</button></div>
                {showAddressForm && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-blue-100 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <input type="text" placeholder="Address / Street" className="border p-2 rounded text-sm w-full col-span-2" value={newAddress.address} onChange={e => setNewAddress({...newAddress, address: e.target.value})} />
                      <input type="text" placeholder="City" className="border p-2 rounded text-sm w-full" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                      <input type="text" placeholder="Postal Code" className="border p-2 rounded text-sm w-full" value={newAddress.postalCode} onChange={e => setNewAddress({...newAddress, postalCode: e.target.value})} />
                    </div>
                    <button onClick={handleAddAddress} className="bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold">Save Address</button>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4">{addresses.length === 0 && <p className="text-sm text-gray-400 italic">No addresses saved.</p>}{addresses.map((addr) => (<div key={addr._id} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors group"><div className="flex justify-between items-start"><div><div className="flex items-center gap-3 mb-2"><span className="font-bold text-gray-800 text-sm">{userInfo?.name}</span><span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Home</span></div><p className="text-sm text-gray-600 leading-relaxed">{addr.address}<br />{addr.city}, {addr.postalCode} - {addr.country}</p></div><div className="flex gap-3"><button onClick={() => handleDeleteAddress(addr._id)} className="text-gray-400 hover:text-red-500 transition"><FaTrash size={14} /></button></div></div></div>))}</div>
              </div>
            </div>
          )}

          {/* --- TAB 2: ORDER HISTORY --- */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in">
              {loading ? (
                <p>Loading orders...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : orders.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl"><FaBoxOpen /></div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">No orders yet</h3>
                  <Link to="/shop" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">Start Shopping</Link>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-medium text-xs">Order ID</th>
                        <th className="px-6 py-4 font-medium text-xs">Date</th>
                        <th className="px-6 py-4 font-medium text-xs">Total</th>
                        <th className="px-6 py-4 font-medium text-xs">Status</th>
                        <th className="px-6 py-4 font-medium text-xs text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 font-mono text-xs font-bold text-gray-600">
                            #{order._id.substring(0, 8)}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-800">
                            ₹{order.totalPrice}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              {order.isPaid ? <span className="text-green-600 flex items-center gap-1 text-[10px] uppercase font-bold"><FaCheckCircle /> Paid</span> : <span className="text-orange-500 flex items-center gap-1 text-[10px] uppercase font-bold">Pending</span>}
                              {order.isDelivered ? <span className="text-green-600 flex items-center gap-1 text-[10px] uppercase font-bold"><FaCheckCircle /> Delivered</span> : <span className="text-blue-600 flex items-center gap-1 text-[10px] uppercase font-bold"><FaTruck /> Processing</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Link to={`/order/${order._id}`} className="text-gray-400 hover:text-blue-600 p-2" title="View Order"><FaEye /></Link>
                              {/* === UPDATED: Direct Link to Invoice Page === */}
                              <Link
                                to={`/order/${order._id}/invoice`}
                                target="_blank"
                                className="text-gray-400 hover:text-green-600 p-2"
                                title="Download Invoice"
                              >
                                <FaDownload />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserProfilePage;