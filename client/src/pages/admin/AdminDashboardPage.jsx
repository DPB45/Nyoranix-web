import { API_URL } from '../../config/api';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { confirmToast } from '../../utils/confirmToast';
import {
  FaBox, FaUsers, FaShoppingCart, FaWallet,
  FaPlus, FaClipboardList, FaTrash, FaTimes,
  FaSearch, FaEdit, FaArrowUp, FaArrowDown, FaUpload, FaTimesCircle,
  FaCog, FaImage, FaCheck, FaTruck, FaSave, FaExclamationTriangle, FaEye,
  FaCloudUploadAlt, FaFileCsv, FaCheckCircle, // 1. Added Bulk Upload Icons
  FaEnvelopeOpenText, FaCircle, FaBars // 6. Added Messages Tab Icons + mobile menu
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import QRCode from 'react-qr-code';

// ... (CATEGORY_DATA remains unchanged) ...
const CATEGORY_DATA = {
  "NYORAI": ["General"],
  "Core Electronix": ["Semiconductors", "Resistors", "Capacitors", "Active Components", "General"],
  "Controllers": ["Microcontrollers", "PLCs", "Logic Units", "General"],
  "Sensor & Modules": ["Sensors", "Communication Modules", "IoT", "General"],
  "Power & Battery": ["Batteries", "BMS", "Chargers", "Solar", "General"],
  "Motion Control & Robotics": ["Motors", "Servos", "Drivers", "Actuators", "Chassis", "General"],
  "Tools & Instruments": ["Soldering", "Multimeters", "Oscilloscopes", "Hand Tools", "General"],
  "Displays & Interfaces": ["LCD", "OLED", "Touchscreens", "HMI", "General"],
  "Panels, Enclosures & Mounting": ["Chassis", "Project Boxes", "DIN Rails", "General"],
  "Cables & Connectors": ["Wires", "Headers", "Jumpers", "Connectors", "General"],
  "Electronics Kits": ["DIY Kits", "STEM", "Starter Bundles", "General"]
};

const AdminDashboardPage = () => {
  const { userInfo } = useSelector((state) => state.user);

  // === STATE ===
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // === SETTINGS STATE ===
  const [banners, setBanners] = useState([]);
  const [upiId, setUpiId] = useState('');
  const [upiPayeeName, setUpiPayeeName] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Order Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // === 2. BULK UPLOAD STATE ===
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkSuccess, setBulkSuccess] = useState(false);
  const [bulkReport, setBulkReport] = useState(null); // { created, skipped: [{row, reason}], failed: [{row, name, reason}] }

  // === FORM STATE ===
  const [formData, setFormData] = useState({
    _id: '', name: '', brand: '', category: 'NYORAI', subCategory: 'General',
    shortDescription: '', description: '', priceExclGST: '', priceInclGST: '', price: '',
    countInStock: '', images: [], features: [], specifications: [], otherSpecifications: [], isNewArrival: false
  });

  const [tempFeature, setTempFeature] = useState('');
  const [tempSpec, setTempSpec] = useState({ key: '', value: '' });
  const [tempOtherSpec, setTempOtherSpec] = useState({ key: '', value: '' });

  // === FETCH DATA ===
  const fetchData = async () => {
    if (userInfo && userInfo.isAdmin) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const [prodRes, orderRes, userRes, settingsRes, messageRes] = await Promise.all([
          axios.get(`${API_URL}/api/products`),
          axios.get(`${API_URL}/api/orders`, config),
          axios.get(`${API_URL}/api/users`, config),
          axios.get(`${API_URL}/api/config`),
          axios.get(`${API_URL}/api/inquiry`, config)
        ]);

        setProducts(Array.isArray(prodRes.data) ? prodRes.data : prodRes.data.products || []);
        setOrders(orderRes.data);
        setUsers(userRes.data);
        setMessages(Array.isArray(messageRes.data) ? messageRes.data : []);

        if (settingsRes.data.banners && Array.isArray(settingsRes.data.banners)) {
          setBanners(settingsRes.data.banners);
        } else {
          setBanners([]);
        }
        setUpiId(settingsRes.data.upiId || '');
        setUpiPayeeName(settingsRes.data.upiPayeeName || '');
      } catch (error) { console.error("Data Load Error:", error); }
    }
  };

  useEffect(() => { fetchData(); }, [userInfo]);

  // === HANDLERS ===
  const handleDeleteUser = async (id) => {
    if (await confirmToast("Are you sure you want to delete this user?", "Delete")) {
      try {
        await axios.delete(`${API_URL}/api/users/${id}`, { headers: { Authorization: `Bearer ${userInfo.token}` } });
        fetchData();
        toast.success("User Deleted");
      } catch (e) { toast.error("Failed to delete user"); }
    }
  };

  const handleMarkDelivered = async (id) => {
    try { await axios.put(`${API_URL}/api/orders/${id}/deliver`, {}, { headers: { Authorization: `Bearer ${userInfo.token}` } }); fetchData(); } catch (e) { toast.error("Failed"); }
  };

  const handleMarkPaid = async (id) => {
    if (await confirmToast("Confirm you've verified this payment (checked the UPI transaction ID against your bank/UPI app) before marking it paid?", "Confirm")) {
      try {
        await axios.put(`${API_URL}/api/orders/${id}/pay`, {}, { headers: { Authorization: `Bearer ${userInfo.token}` } });
        fetchData();
        if (selectedOrder?._id === id) setShowOrderModal(false);
      } catch (e) { toast.error("Failed to mark order as paid"); }
    }
  };

  const handleQuickStockUpdate = async (id, newStock) => {
    try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const product = products.find(p => p._id === id);
        if(!product) return;
        await axios.put(`${API_URL}/api/products/${id}`, { ...product, countInStock: Number(newStock) }, config);
        toast.success("Stock Updated Successfully!");
        fetchData();
    } catch (e) { toast.error("Failed to update stock."); }
  };

  const handleToggleNewArrival = async (product) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`${API_URL}/api/products/${product._id}`, { ...product, isNewArrival: !product.isNewArrival }, config);
      fetchData();
    } catch (e) { toast.error("Failed to update New Arrival status"); }
  };

  // === MESSAGES (CONTACT FORM) HANDLERS ===
  const handleViewMessage = async (msg) => {
    setSelectedMessage(msg);
    setShowMessageModal(true);
    if (!msg.isRead) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.put(`${API_URL}/api/inquiry/${msg._id}/read`, {}, config);
        setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isRead: true } : m));
      } catch (e) { console.error('Failed to mark message read', e); }
    }
  };

  const handleDeleteMessage = async (id) => {
    if (await confirmToast('Delete this message permanently?', 'Delete')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`${API_URL}/api/inquiry/${id}`, config);
        setMessages(prev => prev.filter(m => m._id !== id));
        setShowMessageModal(false);
      } catch (e) { toast.error('Failed to delete message'); }
    }
  };

  // === 3. BULK UPLOAD HANDLERS ===
  const handleBulkFileChange = (e) => {
    setBulkFile(e.target.files[0]);
    setBulkSuccess(false);
    setBulkReport(null);
  };

  const handleBulkUploadSubmit = () => {
    if (!bulkFile) return;
    setBulkUploading(true);
    setBulkReport(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      if (!text || !text.trim()) {
        setBulkUploading(false);
        setBulkReport({ created: 0, skipped: [{ row: '-', reason: 'File is empty' }], failed: [] });
        return;
      }

      // Skip Header Row - CSV must start with a header row or the first real product gets silently dropped
      const rows = text.slice(text.indexOf('\n') + 1).split('\n');
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const skipped = []; // rows we never attempted to upload (bad data)
      const jobs = []; // { rowNum, name, request: Promise }

      rows.forEach((rowStr, i) => {
        const rowNum = i + 2; // +1 for 0-index, +1 for the header row we skipped
        if (!rowStr.trim()) return; // truly blank line, not worth reporting

        const row = rowStr.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const clean = (str) => str ? str.replace(/^"|"$/g, '').trim() : '';

        // COLUMN MAPPING:
        // 0: Images (URLs separated by |)  1: Name  2: Brand  3: Category
        // 4: Short Desc  5: Features (| sep)  6: Tech Specs (Key:Value | sep)
        // 7: Other Specs (Key:Value | sep)  8: Price Excl  9: Price Incl  10: Stock

        const images = clean(row[0]) ? clean(row[0]).split('|') : [];
        const features = clean(row[5]) ? clean(row[5]).split('|') : [];
        const name = clean(row[1]);

        const parseSpecs = (str) => {
          if (!str) return [];
          return str.split('|').map(s => {
            const parts = s.split(':');
            if (parts.length < 2) return null;
            return { key: parts[0].trim(), value: parts.slice(1).join(':').trim() };
          }).filter(i => i);
        };

        const priceIncl = parseFloat(clean(row[9])) || 0;
        const priceExcl = parseFloat(clean(row[8])) || (priceIncl / 1.18);

        // Validate against the actual NUMBER, not the formatted string - a
        // formatted "0.00" is a non-empty string and is always truthy, so
        // checking !payload.price never catches a missing/zero price.
        if (!name) {
          skipped.push({ row: rowNum, reason: 'Missing product name' });
          return;
        }
        if (priceIncl <= 0) {
          skipped.push({ row: rowNum, reason: `Missing or invalid price for "${name}"` });
          return;
        }

        const payload = {
          images,
          image: images[0] || '',
          name,
          brand: clean(row[2]),
          category: clean(row[3]) || 'NYORAI',
          subCategory: 'General',
          shortDescription: clean(row[4]),
          description: clean(row[4]),
          features,
          specifications: parseSpecs(clean(row[6])),
          otherSpecifications: parseSpecs(clean(row[7])),
          priceExclGST: priceExcl.toFixed(2),
          priceInclGST: priceIncl.toFixed(2),
          price: priceIncl.toFixed(2),
          countInStock: parseInt(clean(row[10])) || 0,
        };

        jobs.push({ rowNum, name, request: axios.post(`${API_URL}/api/products`, payload, config) });
      });

      // Use allSettled instead of all - one bad row should not wipe out the
      // report for every other row, and it lets us tell the admin exactly
      // which products were created vs which failed, so they don't have to
      // guess and risk re-uploading the whole file (which would duplicate
      // the rows that already succeeded).
      const results = await Promise.allSettled(jobs.map(j => j.request));
      const failed = [];
      let created = 0;
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          created += 1;
        } else {
          const job = jobs[idx];
          const serverMsg = result.reason?.response?.data?.message;
          failed.push({ row: job.rowNum, name: job.name, reason: serverMsg || 'Upload failed' });
        }
      });

      setBulkReport({ created, skipped, failed });
      setBulkUploading(false);
      if (created > 0) fetchData();

      // Only auto-close on a fully clean run - if anything was skipped or
      // failed, leave the modal open so the admin can actually read why.
      if (skipped.length === 0 && failed.length === 0 && created > 0) {
        setBulkSuccess(true);
        setTimeout(() => { setShowBulkModal(false); setBulkSuccess(false); setBulkFile(null); setBulkReport(null); }, 2500);
      }
    };
    reader.readAsText(bulkFile);
  };

  // ... (Banner, Settings, Product Handlers remain unchanged) ...
  const handleBannerUpload = (e, index) => { const file = e.target.files[0]; if (file) { const r = new FileReader(); r.onloadend = () => { const newBanners = [...banners]; newBanners[index].image = r.result; setBanners(newBanners); }; r.readAsDataURL(file); } };
  const handleBannerChange = (index, field, value) => { const newBanners = [...banners]; newBanners[index][field] = value; setBanners(newBanners); };
  const addBannerSlide = () => { setBanners([...banners, { image: '', title: '', subtitle: '' }]); };
  const removeBannerSlide = async (index) => { if (await confirmToast("Are you sure you want to delete this slide permanently?", "Delete")) { const newBanners = banners.filter((_, i) => i !== index); setBanners(newBanners); try { const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }; await axios.put(`${API_URL}/api/config`, { banners: newBanners }, config); } catch (e) { toast.error("Error deleting slide from database. Refreshing..."); fetchData(); } } };
  const handleUpdateSettings = async (e) => { e.preventDefault(); try { const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }; await axios.put(`${API_URL}/api/config`, { banners, upiId, upiPayeeName }, config); toast.success("Settings Saved Successfully!"); fetchData(); } catch (e) { toast.error("Failed to save settings"); console.error(e); } };

  const handleFileUpload = (e) => { const files = Array.from(e.target.files); files.forEach(file => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onloadend = () => { setFormData(prev => ({ ...prev, images: [...prev.images, reader.result] })); }; }); };
  const removeImage = (index) => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  const moveImage = (index, direction) => { const newImages = [...formData.images]; if (direction === 'up' && index > 0) [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]]; else if (direction === 'down' && index < newImages.length - 1) [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]; setFormData({ ...formData, images: newImages }); };

  const addFeature = () => { if(tempFeature.trim()) { setFormData(prev => ({...prev, features: [...prev.features, tempFeature]})); setTempFeature(''); }};
  const removeFeature = (idx) => setFormData(prev => ({...prev, features: prev.features.filter((_, i) => i !== idx)}));
  const addSpec = () => { if(tempSpec.key && tempSpec.value) { setFormData(prev => ({...prev, specifications: [...prev.specifications, tempSpec]})); setTempSpec({key:'', value:''}); }};
  const removeSpec = (idx) => setFormData(prev => ({...prev, specifications: prev.specifications.filter((_, i) => i !== idx)}));
  const addOtherSpec = () => { if(tempOtherSpec.key && tempOtherSpec.value) { setFormData(prev => ({...prev, otherSpecifications: [...prev.otherSpecifications, tempOtherSpec]})); setTempOtherSpec({key:'', value:''}); }};
  const removeOtherSpec = (idx) => setFormData(prev => ({...prev, otherSpecifications: prev.otherSpecifications.filter((_, i) => i !== idx)}));

  const handleDeleteProduct = async (id) => { if (await confirmToast("Delete this product?", "Delete")) { try { await axios.delete(`${API_URL}/api/products/${id}`, { headers: { Authorization: `Bearer ${userInfo.token}` } }); fetchData(); } catch (e) { toast.error("Failed"); } } };
  const handlePriceExclChange = (e) => { const ex = e.target.value; const incl = ex ? (parseFloat(ex) * 1.18).toFixed(2) : ''; setFormData(prev => ({ ...prev, priceExclGST: ex, priceInclGST: incl, price: incl })); };
  const handlePriceInclChange = (e) => { const incl = e.target.value; const ex = incl ? (parseFloat(incl) / 1.18).toFixed(2) : ''; setFormData(prev => ({ ...prev, priceExclGST: ex, priceInclGST: incl, price: incl })); };
  const openAddModal = () => { setIsEditing(false); setFormData({ _id: '', name: '', brand: '', category: 'NYORAI', subCategory: 'General', countInStock: '', shortDescription: '', description: '', priceExclGST: '', priceInclGST: '', price: '', images: [], features: [], specifications: [], otherSpecifications: [], isNewArrival: false }); setShowModal(true); };

  const openEditModal = (p) => {
    setIsEditing(true);
    const safeCat = CATEGORY_DATA[p.category] ? p.category : 'NYORAI';
    const priceIncl = p.price;
    const priceExcl = (p.price / 1.18).toFixed(2);
    setFormData({ _id: p._id, name: p.name, brand: p.brand, category: safeCat, subCategory: p.subCategory || 'General', price: p.price, priceInclGST: priceIncl, priceExclGST: priceExcl, countInStock: p.countInStock || p.stock, shortDescription: p.shortDescription || p.description, description: p.description, images: p.images || (p.image ? [p.image] : []), features: p.features || [], specifications: p.specifications || [], otherSpecifications: p.otherSpecifications || [], isNewArrival: !!p.isNewArrival });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => { e.preventDefault(); try { const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }; const payload = { ...formData, image: formData.images[0] || '' }; if (isEditing) await axios.put(`${API_URL}/api/products/${formData._id}`, payload, config); else await axios.post(`${API_URL}/api/products`, payload, config); toast.success(isEditing ? "Updated!" : "Created!"); setShowModal(false); fetchData(); } catch (error) { toast.error("Operation Failed"); } };
  const handleChange = (e) => { const { name, value, type, checked } = e.target; if (name === 'category') { const newSubs = CATEGORY_DATA[value] || []; setFormData(prev => ({ ...prev, category: value, subCategory: newSubs[0] || '' })); } else { setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); } };

  const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

  // Build a real revenue-by-day series from actual orders instead of fake placeholder data
  const chartData = (() => {
    if (orders.length === 0) return [];
    const revenueByDate = {};
    orders.forEach((order) => {
      const dateKey = new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + (order.totalPrice || 0);
    });
    return Object.entries(revenueByDate)
      .map(([name, revenue]) => ({ name, revenue: Math.round(revenue * 100) / 100, _sortKey: new Date(name + ' ' + new Date().getFullYear()) }))
      .sort((a, b) => a._sortKey - b._sortKey)
      .map(({ name, revenue }) => ({ name, revenue }));
  })();

  const ADMIN_TABS = ['Dashboard', 'Products', 'Inventory', 'Orders', 'Messages', 'Users', 'Settings'];
  const tabIcon = (item) => {
    if (item === 'Dashboard') return <FaBox />;
    if (item === 'Products') return <FaBox />;
    if (item === 'Inventory') return <FaClipboardList />;
    if (item === 'Orders') return <FaShoppingCart />;
    if (item === 'Messages') return <FaEnvelopeOpenText />;
    if (item === 'Users') return <FaUsers />;
    if (item === 'Settings') return <FaCog />;
    return null;
  };

  const NavLinks = ({ onNavigate }) => (
    <nav className="mt-6 px-4 space-y-2">
      {ADMIN_TABS.map((item) => (
        <button
          key={item}
          onClick={() => { setActiveTab(item); onNavigate && onNavigate(); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors relative ${activeTab === item ? 'bg-gray-100 text-nyoranixRed' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          {tabIcon(item)}
          {item}
          {item === 'Messages' && messages.filter(m => !m.isRead).length > 0 && (
            <span className="ml-auto bg-nyoranixRed text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {messages.filter(m => !m.isRead).length}
            </span>
          )}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800 relative">
      {/* Mobile top bar with hamburger - only visible below lg */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="bg-nyoranixRed w-8 h-8 rounded flex items-center justify-center text-white font-bold">N</div>
          <span className="font-bold text-gray-800">Nyoranix Admin</span>
        </div>
        <button
          onClick={() => setMobileNavOpen(true)}
          className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          aria-label="Open admin menu"
        >
          <FaBars size={20} />
        </button>
      </div>

      {/* Mobile slide-in nav drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)}></div>
          <aside className="relative w-72 max-w-[80%] bg-white h-full shadow-xl overflow-y-auto">
            <div className="p-6 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="bg-nyoranixRed w-8 h-8 rounded flex items-center justify-center text-white font-bold">N</div>
                <span className="text-lg font-bold text-gray-800">Nyoranix Admin</span>
              </div>
              <button onClick={() => setMobileNavOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <FaTimes />
              </button>
            </div>
            <NavLinks onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      )}

      {/* Sidebar and Main Content Wrapper */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:block fixed h-full z-10">
        <div className="p-6 flex items-center gap-2 border-b border-gray-100">
          <div className="bg-nyoranixRed w-8 h-8 rounded flex items-center justify-center text-white font-bold">N</div>
          <span className="text-xl font-bold text-gray-800">Nyoranix Admin</span>
        </div>
        <NavLinks />
      </aside>

      <main className="flex-1 lg:ml-64 p-4 pt-20 lg:pt-8 lg:p-8">
        <header className="flex justify-between items-center mb-8 flex-wrap gap-2">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{activeTab}</h1>
          <div className="flex items-center gap-4"><span className="font-bold text-xs lg:text-sm truncate max-w-[150px] lg:max-w-none">Admin: {userInfo?.name}</span></div>
        </header>

        {activeTab === 'Dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
              <StatCard title="Total Sales" value={`₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<FaWallet />} color="green" />
              <StatCard title="Orders" value={orders.length} icon={<FaShoppingCart />} color="blue" />
              <StatCard title="Users" value={users.length} icon={<FaUsers />} color="orange" />
              <StatCard title="Products" value={products.length} icon={<FaBox />} color="purple" />
              <StatCard title="New Messages" value={messages.filter(m => !m.isRead).length} icon={<FaEnvelopeOpenText />} color="red" />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
              <h3 className="font-bold text-gray-800 mb-4">Revenue Overview</h3>
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">No orders yet - revenue will appear here once orders come in.</div>
              ) : (
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']} /><Line type="monotone" dataKey="revenue" stroke="#dc2626" strokeWidth={3} /></LineChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Products' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
              <div className="relative w-full sm:w-64"><FaSearch className="absolute left-3 top-3 text-gray-400" /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg text-sm w-full focus:outline-none focus:border-nyoranixRed" /></div>
              <div className="flex gap-2">
                {/* 4. NEW BULK UPLOAD BUTTON */}
                <button onClick={() => setShowBulkModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700 transition-colors shadow-sm">
                  <FaCloudUploadAlt /> Bulk Upload
                </button>
                <button onClick={openAddModal} className="bg-nyoranixRed text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90"><FaPlus /> Add Product</button>
              </div>
            </div>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-500 uppercase font-medium"><tr><th className="px-6 py-3">Image</th><th className="px-6 py-3">Name</th><th className="px-6 py-3">Category</th><th className="px-6 py-3">Price (Incl GST)</th><th className="px-6 py-3">Stock</th><th className="px-6 py-3">New Arrival</th><th className="px-6 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{filteredProducts.map((p) => (<tr key={p._id} className="hover:bg-gray-50"><td className="px-6 py-4"><img src={p.images?.[0] || p.image} alt="" className="w-10 h-10 object-cover rounded border" /></td><td className="px-6 py-4 font-bold text-gray-800">{p.name}</td><td className="px-6 py-4"><span className="block font-semibold">{p.category}</span></td><td className="px-6 py-4">₹{p.price}</td><td className="px-6 py-4">{p.countInStock || p.stock}</td><td className="px-6 py-4"><button onClick={() => handleToggleNewArrival(p)} className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${p.isNewArrival ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>{p.isNewArrival ? 'Yes' : 'No'}</button></td><td className="px-6 py-4 text-right"><button onClick={() => openEditModal(p)} className="text-blue-600 hover:underline mr-4"><FaEdit /></button><button onClick={() => handleDeleteProduct(p._id)} className="text-red-600 hover:underline"><FaTrash /></button></td></tr>))}</tbody></table></div>
          </div>
        )}

        {/* ... (Inventory Tab, Users Tab, Orders Tab, Settings Tab remain unchanged) ... */}
        {activeTab === 'Inventory' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><FaClipboardList className="text-blue-600" /> Inventory Management</h3>
              <div className="relative w-full sm:w-64"><FaSearch className="absolute left-3 top-3 text-gray-400" /><input type="text" placeholder="Search SKU or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg text-sm w-full focus:outline-none focus:border-blue-500" /></div>
            </div>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-500 uppercase font-medium"><tr><th className="px-6 py-3">Product Name</th><th className="px-6 py-3">SKU / ID</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Current Stock</th><th className="px-6 py-3 text-right">Quick Update</th></tr></thead><tbody className="divide-y divide-gray-100">{filteredProducts.map((p) => { const stock = p.countInStock || 0; const isLow = stock > 0 && stock < 10; const isOut = stock === 0; return (<tr key={p._id} className="hover:bg-gray-50 group"><td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-3"><div className="w-10 h-10 rounded border bg-gray-50 flex items-center justify-center overflow-hidden"><img src={p.images?.[0] || p.image} className="w-full h-full object-cover" alt="" /></div><div><p>{p.name}</p><p className="text-xs text-gray-400 font-normal">{p.category}</p></div></td><td className="px-6 py-4 text-xs text-gray-500 font-mono">{p._id.substring(p._id.length - 8).toUpperCase()}</td><td className="px-6 py-4">{isOut ? (<span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FaTimesCircle /> Out of Stock</span>) : isLow ? (<span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FaExclamationTriangle /> Low Stock</span>) : (<span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FaCheck /> In Stock</span>)}</td><td className="px-6 py-4"><input type="number" min="0" defaultValue={stock} id={`stock-input-${p._id}`} className={`border rounded w-24 p-2 text-center font-bold focus:ring-2 outline-none ${isOut ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} /></td><td className="px-6 py-4 text-right"><button onClick={() => { const val = document.getElementById(`stock-input-${p._id}`).value; handleQuickStockUpdate(p._id, val); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm">Save</button></td></tr>); })}</tbody></table>{filteredProducts.length === 0 && <div className="p-10 text-center text-gray-400">No products found matching your search.</div>}</div>
          </div>
        )}

        {activeTab === 'Users' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100"><h3 className="font-bold text-gray-800">User Management</h3></div>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-500 uppercase font-medium"><tr><th className="px-6 py-3">ID</th><th className="px-6 py-3">Name</th><th className="px-6 py-3">Email</th><th className="px-6 py-3">Admin</th><th className="px-6 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{users.map((user) => (<tr key={user._id} className="hover:bg-gray-50"><td className="px-6 py-4 text-gray-500">{user._id.substring(0, 10)}...</td><td className="px-6 py-4 font-bold text-gray-800">{user.name}</td><td className="px-6 py-4"><a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">{user.email}</a></td><td className="px-6 py-4">{user.isAdmin ? (<span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FaCheck size={10}/> Admin</span>) : (<span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs font-bold">User</span>)}</td><td className="px-6 py-4 text-right"><button onClick={() => handleDeleteUser(user._id)} className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors" title="Delete User"><FaTrash /></button></td></tr>))}</tbody></table>{users.length === 0 && <div className="p-8 text-center text-gray-500">No users found.</div>}</div>
          </div>
        )}

        {activeTab === 'Orders' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100"><h3 className="font-bold text-gray-800">Order Management</h3></div>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-500 uppercase font-medium"><tr><th className="px-6 py-3">ID</th><th className="px-6 py-3">User</th><th className="px-6 py-3">Date</th><th className="px-6 py-3">Total</th><th className="px-6 py-3">Paid</th><th className="px-6 py-3">Delivered</th><th className="px-6 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{orders.map((order) => (<tr key={order._id} className="hover:bg-gray-50"><td className="px-6 py-4 text-gray-500">{order._id.substring(0, 10)}...</td><td className="px-6 py-4 font-bold text-gray-800">{order.user && order.user.name}</td><td className="px-6 py-4 text-gray-500">{order.createdAt.substring(0, 10)}</td><td className="px-6 py-4 font-bold">₹{order.totalPrice}</td><td className="px-6 py-4">{order.isPaid ? (<span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Paid</span>) : (<span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Not Paid</span>)}</td><td className="px-6 py-4">{order.isDelivered ? (<span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Delivered</span>) : (<span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">Processing</span>)}</td><td className="px-6 py-4 text-right flex items-center justify-end gap-2"><button onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }} className="bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200 transition-colors" title="View Details"><FaEye /></button>{!order.isPaid && (<button onClick={() => handleMarkPaid(order._id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center gap-1"><FaWallet /> Mark Paid</button>)}{!order.isDelivered && (<button onClick={() => handleMarkDelivered(order._id)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors flex items-center gap-1"><FaTruck /> Mark Delivered</button>)}</td></tr>))}</tbody></table>{orders.length === 0 && <div className="p-8 text-center text-gray-500">No orders found.</div>}</div>
          </div>
        )}

        {activeTab === 'Messages' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><FaEnvelopeOpenText className="text-blue-600" /> Contact Form Messages</h3>
              <span className="text-xs text-gray-400">{messages.length} total &middot; {messages.filter(m => !m.isRead).length} unread</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                  <tr>
                    <th className="px-6 py-3 w-8"></th>
                    <th className="px-6 py-3">From</th>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">Received</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {messages.map((msg) => (
                    <tr key={msg._id} className={`hover:bg-gray-50 cursor-pointer ${!msg.isRead ? 'bg-blue-50/40' : ''}`} onClick={() => handleViewMessage(msg)}>
                      <td className="px-6 py-4">{!msg.isRead && <FaCircle className="text-blue-500" size={8} />}</td>
                      <td className="px-6 py-4">
                        <p className={`font-bold ${!msg.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{msg.name}</p>
                        <p className="text-xs text-gray-400">{msg.email}</p>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">{msg.subject}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{new Date(msg.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleDeleteMessage(msg._id)} className="text-red-600 hover:underline"><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {messages.length === 0 && <div className="p-10 text-center text-gray-400">No messages received yet.</div>}
            </div>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleUpdateSettings}>
              <div className="mb-10 pb-10 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Payment Settings (UPI QR)</h2>
                <p className="text-sm text-gray-500 mb-6">Until Razorpay (or another gateway) is set up, customers pay via a UPI QR code at checkout, enter their transaction ID, and you verify + mark the order paid from the Orders tab.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Your UPI ID (VPA)</label>
                    <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full border rounded-lg p-3 text-sm" placeholder="e.g. nyoranix@okhdfcbank" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Payee / Business Name</label>
                    <input type="text" value={upiPayeeName} onChange={(e) => setUpiPayeeName(e.target.value)} className="w-full border rounded-lg p-3 text-sm" placeholder="e.g. Nyoranix Electronics" />
                  </div>
                </div>
                {upiId ? (
                  <div className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="bg-white p-2 rounded border"><QRCode value={`upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiPayeeName || 'Merchant')}&cu=INR`} size={72} /></div>
                    <div className="text-sm text-green-800">
                      <p className="font-bold">Online payment is live</p>
                      <p>Customers will see a QR like this at checkout, pre-filled with their exact order amount.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-800 font-bold flex items-center gap-2">
                    <FaExclamationTriangle /> Add a UPI ID above and save to enable online payment. Until then, checkout only offers Cash on Delivery.
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Homepage Banners</h2>
                <button type="button" onClick={addBannerSlide} className="bg-nyoranixRed text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90"><FaPlus /> Add New Slide</button>
              </div>
              {banners.map((banner, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6 relative group">
                  <button type="button" onClick={() => removeBannerSlide(index)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><FaTimes size={20} /></button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Slide Image (Desktop)</label>
                      <div className="relative w-full h-40 bg-gray-200 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                        {banner.image ? (<img src={banner.image} alt={`Slide ${index}`} className="w-full h-full object-cover" />) : (<span className="text-gray-400 text-sm">No image selected</span>)}
                        <label className="absolute inset-0 cursor-pointer flex items-center justify-center hover:bg-black/10 transition-colors"><input type="file" className="hidden" accept="image/*" onChange={(e) => handleBannerUpload(e, index)} /></label>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title / Main Heading</label><input type="text" value={banner.title} onChange={(e) => handleBannerChange(index, 'title', e.target.value)} className="w-full border rounded-lg p-2 text-sm" placeholder="e.g. New Arrivals" /></div>
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subtitle / Description</label><input type="text" value={banner.subtitle} onChange={(e) => handleBannerChange(index, 'subtitle', e.target.value)} className="w-full border rounded-lg p-2 text-sm" placeholder="e.g. Check out our latest modules" /></div>
                    </div>
                  </div>
                </div>
              ))}
              {banners.length === 0 && (<div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl mb-6">No banners added yet. Click "Add New Slide" to start.</div>)}
              <div className="flex justify-end pt-4 border-t border-gray-100"><button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-green-700 flex items-center gap-2 shadow-lg transition-transform active:scale-95"><FaSave /> Save Settings</button></div>
            </form>
          </div>
        )}
      </main>

      {/* ... (Existing Product Modal & Order Modal remain unchanged) ... */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8 animate-fade-in max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
               <h2 className="text-2xl font-bold text-gray-800">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500"><FaTimesCircle size={24} /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200"><label className="block text-xs font-bold text-gray-500 uppercase mb-4">1. Product Images</label><div className="flex items-center gap-4 mb-4"><label className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer text-sm font-bold"><FaUpload /> Upload<input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" /></label></div><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{formData.images.map((img, idx) => (<div key={idx} className="flex items-center gap-3 bg-white p-2 border rounded-lg"><span className="font-bold text-gray-400 w-6 text-center">{idx + 1}</span><img src={img} alt="" className="w-12 h-12 object-cover rounded border" /><div className="flex-1"></div><div className="flex gap-1"><button type="button" onClick={() => moveImage(idx, 'up')} className="p-2 text-gray-500"><FaArrowUp /></button><button type="button" onClick={() => moveImage(idx, 'down')} className="p-2 text-gray-500"><FaArrowDown /></button><button type="button" onClick={() => removeImage(idx)} className="p-2 text-red-400"><FaTrash /></button></div></div>))}</div></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">2. Product Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border rounded-lg p-3 text-sm" /></div><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">3. Brand / Manufacturer</label><input type="text" name="brand" value={formData.brand} onChange={handleChange} required className="w-full border rounded-lg p-3 text-sm" /></div></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">4. Category</label><select name="category" value={formData.category} onChange={handleChange} className="w-full border rounded-lg p-3 text-sm bg-white">{Object.keys(CATEGORY_DATA).map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">5. Short Description</label><textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows="3" required className="w-full border rounded-lg p-3 text-sm"></textarea><p className="text-xs text-gray-400 mt-1">Short teaser shown right under the product title.</p></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">5b. Full Description</label><textarea name="description" value={formData.description} onChange={handleChange} rows="6" required className="w-full border rounded-lg p-3 text-sm"></textarea><p className="text-xs text-gray-400 mt-1">Full write-up shown in the product page's "Description" tab.</p></div>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200"><label className="block text-xs font-bold text-gray-500 uppercase mb-3">6. Key Features / Highlights</label><div className="flex gap-2 mb-3"><input type="text" placeholder="e.g. 'Low Power Consumption'" value={tempFeature} onChange={(e) => setTempFeature(e.target.value)} className="flex-1 border rounded-lg p-2 text-sm" /><button type="button" onClick={addFeature} className="bg-gray-800 text-white px-4 rounded-lg font-bold text-sm">Add</button></div><ul className="space-y-2">{formData.features.map((feat, idx) => (<li key={idx} className="flex justify-between items-center bg-white px-3 py-2 rounded border text-sm"><span>• {feat}</span><button type="button" onClick={() => removeFeature(idx)} className="text-red-400"><FaTimes /></button></li>))}</ul></div>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200"><label className="block text-xs font-bold text-gray-500 uppercase mb-3">7. Technical Specifications (Table Format)</label><div className="flex gap-2 mb-3"><input type="text" placeholder="Key (e.g. Input Voltage)" value={tempSpec.key} onChange={(e) => setTempSpec({...tempSpec, key: e.target.value})} className="flex-1 border rounded-lg p-2 text-sm" /><input type="text" placeholder="Value (e.g. 5V)" value={tempSpec.value} onChange={(e) => setTempSpec({...tempSpec, value: e.target.value})} className="flex-1 border rounded-lg p-2 text-sm" /><button type="button" onClick={addSpec} className="bg-gray-800 text-white px-4 rounded-lg font-bold text-sm">Add Row</button></div><div className="border rounded-lg overflow-hidden"><table className="w-full text-sm text-left bg-white"><tbody>{formData.specifications.map((spec, idx) => (<tr key={idx} className="border-b last:border-none"><td className="px-4 py-2 font-bold bg-gray-50 w-1/3">{spec.key}</td><td className="px-4 py-2">{spec.value}</td><td className="px-2 py-2 text-right"><button type="button" onClick={() => removeSpec(idx)} className="text-red-400 hover:text-red-600"><FaTimes /></button></td></tr>))}</tbody></table>{formData.specifications.length === 0 && <div className="p-4 text-center text-gray-400 text-xs">No specifications added yet</div>}</div></div>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200"><label className="block text-xs font-bold text-gray-500 uppercase mb-3">8. Other Specifications (Table Format)</label><div className="flex gap-2 mb-3"><input type="text" placeholder="Key (e.g. Warranty)" value={tempOtherSpec.key} onChange={(e) => setTempOtherSpec({...tempOtherSpec, key: e.target.value})} className="flex-1 border rounded-lg p-2 text-sm" /><input type="text" placeholder="Value (e.g. 1 Year)" value={tempOtherSpec.value} onChange={(e) => setTempOtherSpec({...tempOtherSpec, value: e.target.value})} className="flex-1 border rounded-lg p-2 text-sm" /><button type="button" onClick={addOtherSpec} className="bg-gray-800 text-white px-4 rounded-lg font-bold text-sm">Add Row</button></div><div className="border rounded-lg overflow-hidden"><table className="w-full text-sm text-left bg-white"><tbody>{formData.otherSpecifications.map((spec, idx) => (<tr key={idx} className="border-b last:border-none"><td className="px-4 py-2 font-bold bg-gray-50 w-1/3">{spec.key}</td><td className="px-4 py-2">{spec.value}</td><td className="px-2 py-2 text-right"><button type="button" onClick={() => removeOtherSpec(idx)} className="text-red-400 hover:text-red-600"><FaTimes /></button></td></tr>))}</tbody></table>{formData.otherSpecifications.length === 0 && <div className="p-4 text-center text-gray-400 text-xs">No other specs added yet</div>}</div></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">9a. Price (Excl. GST)</label><input type="number" name="priceExclGST" value={formData.priceExclGST} onChange={handlePriceExclChange} required className="w-full border rounded-lg p-3 text-sm" placeholder="₹" /></div><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">9b. Price (Incl. GST )</label><input type="number" name="priceInclGST" value={formData.priceInclGST} onChange={handlePriceInclChange} required className="w-full border rounded-lg p-3 text-sm font-bold text-green-700" placeholder="₹" /></div><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">10. Stock Availability</label><input type="number" name="countInStock" value={formData.countInStock} onChange={handleChange} required className="w-full border rounded-lg p-3 text-sm" /></div></div>
              <label className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg p-4 cursor-pointer w-fit">
                <input type="checkbox" name="isNewArrival" checked={formData.isNewArrival} onChange={handleChange} className="w-5 h-5 accent-nyoranixRed" />
                <span className="text-sm font-bold text-gray-800">Show in "New Arrivals" on the homepage</span>
              </label>
              <div className="flex justify-end gap-4 pt-6 border-t"><button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button><button type="submit" className="px-8 py-3 bg-nyoranixRed text-white font-bold rounded-lg hover:opacity-90 shadow-lg">{isEditing ? 'Update' : 'Create Product'}</button></div>
            </form>
          </div>
        </div>
      )}

      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-8 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div><h2 className="text-2xl font-bold text-gray-800">Order Details</h2><p className="text-sm text-gray-500">ID: {selectedOrder._id}</p></div>
              <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-red-500"><FaTimesCircle size={24} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100"><h3 className="font-bold text-gray-700 mb-3 uppercase text-xs flex items-center gap-2"><FaTruck /> Shipping Information</h3>{selectedOrder.shippingAddress ? (<div className="space-y-1 text-sm text-gray-600"><p className="font-bold text-gray-900">{selectedOrder.user?.name || "Guest"}</p><p>{selectedOrder.shippingAddress.address}</p><p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p><p>{selectedOrder.shippingAddress.country}</p><p className="pt-2 text-xs">Email: <a href={`mailto:${selectedOrder.user?.email}`} className="text-blue-600">{selectedOrder.user?.email}</a></p></div>) : <p className="text-sm text-gray-500 italic">No shipping info available</p>}</div>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100"><h3 className="font-bold text-gray-700 mb-3 uppercase text-xs flex items-center gap-2"><FaClipboardList /> Order Status</h3><div className="space-y-3 text-sm"><div className="flex justify-between"><span>Payment:</span>{selectedOrder.isPaid ? <span className="text-green-600 font-bold flex items-center gap-1"><FaCheck /> Paid on {selectedOrder.paidAt?.substring(0, 10)}</span> : <span className="text-red-600 font-bold flex items-center gap-1"><FaTimesCircle /> Not Paid</span>}</div>{selectedOrder.paymentMethod === 'Online' && selectedOrder.paymentReference && (<div className="flex justify-between items-center bg-blue-50 border border-blue-100 rounded-lg px-3 py-2"><span className="text-xs text-blue-700">UPI Ref / UTR:</span><span className="font-mono font-bold text-blue-900 text-xs">{selectedOrder.paymentReference}</span></div>)}{!selectedOrder.isPaid && (<button onClick={() => handleMarkPaid(selectedOrder._id)} className="w-full bg-green-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"><FaWallet /> Verify &amp; Mark as Paid</button>)}<div className="flex justify-between"><span>Delivery:</span>{selectedOrder.isDelivered ? <span className="text-green-600 font-bold flex items-center gap-1"><FaCheck /> Delivered</span> : <span className="text-yellow-600 font-bold flex items-center gap-1"><FaTruck /> Processing</span>}</div><div className="pt-2 border-t mt-2 flex justify-between text-lg font-bold text-gray-900"><span>Total Amount:</span><span>₹{selectedOrder.totalPrice}</span></div></div></div>
            </div>
            <div><h3 className="font-bold text-gray-700 mb-3 uppercase text-xs">Items to Pack ({selectedOrder.orderItems?.length || 0})</h3><div className="overflow-hidden border border-gray-200 rounded-lg"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-500 font-medium"><tr><th className="px-4 py-2">Image</th><th className="px-4 py-2">Product Name</th><th className="px-4 py-2 text-center">Qty</th><th className="px-4 py-2 text-right">Price</th></tr></thead><tbody className="divide-y divide-gray-100">{selectedOrder.orderItems && selectedOrder.orderItems.map((item, index) => (<tr key={index}><td className="px-4 py-2"><img src={item.image} alt={item.name} className="w-10 h-10 object-contain border rounded bg-white" /></td><td className="px-4 py-2 font-medium text-gray-800">{item.name}</td><td className="px-4 py-2 text-center font-bold">{item.quantity}</td><td className="px-4 py-2 text-right">₹{(item.price * item.quantity).toFixed(2)}</td></tr>))}</tbody></table></div></div>
            <div className="mt-8 flex justify-end"><button onClick={() => setShowOrderModal(false)} className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-900 transition">Close Details</button></div>
          </div>
        </div>
      )}

      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">Message Details</h2>
              <button onClick={() => setShowMessageModal(false)} className="text-gray-400 hover:text-red-500"><FaTimesCircle size={24} /></button>
            </div>
            <div className="space-y-4 text-sm">
              <div><p className="text-xs font-bold text-gray-500 uppercase mb-1">From</p><p className="font-bold text-gray-900">{selectedMessage.name}</p><a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:underline">{selectedMessage.email}</a></div>
              <div><p className="text-xs font-bold text-gray-500 uppercase mb-1">Subject</p><p className="text-gray-800">{selectedMessage.subject}</p></div>
              <div><p className="text-xs font-bold text-gray-500 uppercase mb-1">Received</p><p className="text-gray-500">{new Date(selectedMessage.createdAt).toLocaleString()}</p></div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Message</p>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => handleDeleteMessage(selectedMessage._id)} className="px-4 py-2 text-red-600 font-bold hover:bg-red-50 rounded-lg flex items-center gap-2"><FaTrash /> Delete</button>
              <a href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`} className="px-6 py-2 bg-nyoranixRed text-white font-bold rounded-lg hover:opacity-90 shadow-lg flex items-center gap-2"><FaEnvelopeOpenText /> Reply by Email</a>
            </div>
          </div>
        </div>
      )}

      {/* === 5. BULK UPLOAD MODAL === */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 animate-fade-in relative">
            <button onClick={() => setShowBulkModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
              <FaTimesCircle size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bulk Product Import</h2>
            <p className="text-gray-500 mb-4 text-xs leading-relaxed border-b pb-4">
              <strong>Required CSV Column Order:</strong><br/>
              1. Images (URL) | 2. Name | 3. Brand | 4. Category | 5. Short Desc | 6. Features (pipe | sep) | 7. Tech Specs (Key:Val | sep) | 8. Other Specs | 9. Price (Excl GST) | 10. Price (Incl GST) | 11. Stock
              <br/><br/>
              <strong>Note:</strong> the first row must be a header (it's always skipped). Don't put line breaks inside a cell - keep descriptions on one line.
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors mb-6">
              <FaCloudUploadAlt className="text-5xl text-gray-300 mb-3" />
              <input
                type="file"
                accept=".csv"
                onChange={handleBulkFileChange}
                className="hidden"
                id="bulk-file-upload"
              />
              <label htmlFor="bulk-file-upload" className="cursor-pointer text-blue-600 font-bold hover:underline">
                Click to browse CSV
              </label>
              {bulkFile && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-700 bg-white px-3 py-1 rounded border shadow-sm">
                  <FaFileCsv className="text-green-600" /> {bulkFile.name}
                </div>
              )}
            </div>

            {bulkSuccess ? (
              <div className="p-4 bg-green-100 text-green-700 rounded-lg flex items-center gap-2 mb-4 border border-green-200">
                <FaCheckCircle /> Upload Successful! Refreshing list...
              </div>
            ) : bulkReport ? (
              <div className="mb-4 space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 font-bold flex items-center gap-2">
                  <FaCheckCircle /> {bulkReport.created} product{bulkReport.created === 1 ? '' : 's'} created
                </div>
                {bulkReport.skipped.length > 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800 max-h-32 overflow-y-auto">
                    <p className="font-bold flex items-center gap-2 mb-1"><FaExclamationTriangle /> {bulkReport.skipped.length} row{bulkReport.skipped.length === 1 ? '' : 's'} skipped</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {bulkReport.skipped.map((s, i) => <li key={i}>Row {s.row}: {s.reason}</li>)}
                    </ul>
                  </div>
                )}
                {bulkReport.failed.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 max-h-32 overflow-y-auto">
                    <p className="font-bold flex items-center gap-2 mb-1"><FaTimesCircle /> {bulkReport.failed.length} row{bulkReport.failed.length === 1 ? '' : 's'} failed to upload</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {bulkReport.failed.map((f, i) => <li key={i}>Row {f.row} ({f.name}): {f.reason}</li>)}
                    </ul>
                    <p className="text-xs mt-2 italic">Fix these rows in your CSV and re-upload just this file - the {bulkReport.created} products already created above won't be duplicated since you'll only be retrying the fixed rows.</p>
                  </div>
                )}
                <button onClick={() => { setShowBulkModal(false); setBulkReport(null); setBulkFile(null); }} className="w-full py-3 rounded-lg font-bold text-white bg-gray-800 hover:bg-gray-900">
                  Done
                </button>
              </div>
            ) : (
              <button
                onClick={handleBulkUploadSubmit}
                disabled={!bulkFile || bulkUploading}
                className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-md ${
                  !bulkFile ? 'bg-gray-300 cursor-not-allowed' : 'bg-nyoranixRed hover:bg-red-700 active:scale-95'
                }`}
              >
                {bulkUploading ? 'Uploading...' : 'Start Import'}
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between gap-2">
    <div className="min-w-0"><p className="text-gray-500 text-xs sm:text-sm font-medium truncate">{title}</p><h3 className="text-lg sm:text-2xl font-bold text-gray-900 break-words">{value}</h3></div>
    <div className={`text-${color}-500 text-xl sm:text-2xl flex-shrink-0`}>{icon}</div>
  </div>
);

export default AdminDashboardPage;