import React, { Suspense, lazy } from 'react'; // 1. Import Suspense & lazy
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/common/WhatsAppButton';
import ScrollToTop from './components/common/ScrollToTop'; // 2. Import ScrollToTop
import AdminRoute from './components/admin/AdminRoute';

// 3. LAZY LOAD PAGES (Replaces static imports)
const HomePage = lazy(() => import('./pages/HomePage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const OrderDetailsPage = lazy(() => import('./pages/OrderDetailsPage'));
const SolutionsPage = lazy(() => import('./pages/SolutionsPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const InvoicePage = lazy(() => import('./pages/InvoicePage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsAndConditionsPage = lazy(() => import('./pages/TermsAndConditionsPage'));
const RefundPolicyPage = lazy(() => import('./pages/RefundPolicyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
  </div>
);

function App() {
  // The admin dashboard has its own dedicated layout (sidebar/topbar) - the
  // public site chrome (Navbar/Footer/WhatsApp button) shouldn't wrap it,
  // otherwise the public footer renders directly under the admin content on
  // mobile, which reads as the dashboard being cut off / broken.
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen font-sans bg-nyoranixWhite relative">
      <Toaster position="top-center" reverseOrder={false} />
      <ScrollToTop /> {/* 4. Add ScrollToTop here */}

      {!isAdminRoute && <Navbar />}

      <main className="flex-grow">
        {/* 5. Wrap Routes in Suspense */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/order/:id" element={<OrderDetailsPage />} />
            <Route path="/solutions" element={<SolutionsPage />} />

            {/* User Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/orders" element={<OrdersPage />} />

            {/* Info Routes */}
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/order/:id/invoice" element={<InvoicePage />} />

            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsAndConditionsPage />} />
            <Route path="/shipping" element={<RefundPolicyPage />} />

            {/* Protected Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            </Route>

            {/* Catch-all - must stay last */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <WhatsAppButton />}
    </div>
  );
}

export default App;