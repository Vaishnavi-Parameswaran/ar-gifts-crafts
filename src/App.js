// Main App Component with Complete Routing
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';

// Common Components
import { Navbar, Footer } from './components/common';
import { PrivateRoute, VendorRoute, AdminRoute, GuestRoute } from './components/common/ProtectedRoute';
import { SettingsProvider } from './contexts/SettingsContext';

// Pages - Home
import Home from './pages/Home/Home';

// Pages - Auth
import { Login, Register, ForgotPassword } from './pages/Auth';

// Pages - Products
import ProductDetail from './pages/Product/ProductDetail';

// Pages - Categories
import Categories from './pages/Categories/Categories';
import CategoryProducts from './pages/Categories/CategoryProducts';

// Pages - Search
import Search from './pages/Search/Search';

// Pages - Cart & Checkout
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';

// Pages - Wishlist
import Wishlist from './pages/Wishlist/Wishlist';

// Pages - Account
import Account from './pages/Account/Account';

// Pages - Orders
import Orders from './pages/Orders/Orders';
import OrderDetail from './pages/Orders/OrderDetail';

// Pages - Notifications
import Notifications from './pages/Notifications/Notifications';

// Pages - Vendor
import VendorDashboard from './pages/Vendor/VendorDashboard';
import VendorProfile from './pages/Vendor/VendorProfile';
import VendorRegister from './pages/Vendor/VendorRegister';
import VendorDiagnostics from './pages/Vendor/VendorDiagnostics';
import VendorQuickFix from './pages/Vendor/VendorQuickFix';

// Pages - Admin
import AdminDashboard from './pages/Admin/AdminDashboard';
import Seeder from './pages/Admin/Seeder';
import FirestoreDiagnostics from './pages/Admin/FirestoreDiagnostics';
import DebugCorporateGifts from './pages/Admin/DebugCorporateGifts';

// Pages - Static
import { About, FAQ, Privacy, Terms, Shipping, TrackOrder, Help } from './pages/Static/Static';
import Contact from './pages/Contact/Contact';
import Returns from './pages/Returns/Returns';

// Layout Component for pages with Navbar and Footer
const MainLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="main-content">
      {children}
    </main>
    <Footer />
  </>
);

// Layout for Dashboard pages (no main navbar/footer)
const DashboardLayout = ({ children }) => (
  <div className="dashboard-layout">
    {children}
  </div>
);

function App() {
  return (
    <Router>
      <SettingsProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                {/* =================== PUBLIC ROUTES =================== */}

                {/* Home */}
                <Route path="/" element={<MainLayout><Home /></MainLayout>} />

                {/* Products */}
                <Route path="/product/:id" element={<MainLayout><ProductDetail /></MainLayout>} />

                {/* Categories */}
                <Route path="/categories" element={<MainLayout><Categories /></MainLayout>} />
                <Route path="/categories/:slug" element={<MainLayout><CategoryProducts /></MainLayout>} />
                <Route path="/featured" element={<MainLayout><CategoryProducts title="Featured Products" filter="featured" /></MainLayout>} />
                <Route path="/new-arrivals" element={<MainLayout><CategoryProducts title="New Arrivals" filter="new" /></MainLayout>} />
                <Route path="/best-sellers" element={<MainLayout><CategoryProducts title="Best Sellers" filter="best-selling" /></MainLayout>} />

                {/* Search */}
                <Route path="/search" element={<MainLayout><Search /></MainLayout>} />

                {/* Cart */}
                <Route path="/cart" element={<MainLayout><Cart /></MainLayout>} />

                {/* Wishlist */}
                <Route path="/wishlist" element={<MainLayout><Wishlist /></MainLayout>} />

                {/* Deals */}
                <Route path="/deals" element={<MainLayout><CategoryProducts title="Special Deals" filter="deals" /></MainLayout>} />

                {/* =================== AUTH ROUTES =================== */}

                <Route path="/login" element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                } />
                <Route path="/register" element={
                  <GuestRoute>
                    <Register />
                  </GuestRoute>
                } />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* =================== PROTECTED CUSTOMER ROUTES =================== */}

                {/* Account */}
                <Route path="/account" element={
                  <PrivateRoute>
                    <MainLayout><Account /></MainLayout>
                  </PrivateRoute>
                } />

                {/* Orders */}
                <Route path="/orders" element={
                  <PrivateRoute>
                    <MainLayout><Orders /></MainLayout>
                  </PrivateRoute>
                } />
                <Route path="/orders/:id" element={
                  <PrivateRoute>
                    <MainLayout><OrderDetail /></MainLayout>
                  </PrivateRoute>
                } />

                {/* Checkout */}
                <Route path="/checkout" element={
                  <PrivateRoute>
                    <MainLayout><Checkout /></MainLayout>
                  </PrivateRoute>
                } />

                {/* Notifications */}
                <Route path="/notifications" element={
                  <PrivateRoute>
                    <MainLayout><Notifications /></MainLayout>
                  </PrivateRoute>
                } />

                {/* =================== VENDOR ROUTES =================== */}

                {/* Vendor Registration (public) */}
                <Route path="/vendor/register" element={<VendorRegister />} />

                {/* Public Vendor Profile - Must come before protected vendor/* routes */}
                <Route path="/vendor/:id" element={<MainLayout><VendorProfile /></MainLayout>} />
                <Route path="/shop/:id" element={<MainLayout><VendorProfile /></MainLayout>} />

                {/* Vendor Dashboard (protected) */}
                <Route path="/vendor/dashboard/*" element={
                  <VendorRoute>
                    <DashboardLayout><VendorDashboard /></DashboardLayout>
                  </VendorRoute>
                } />

                {/* =================== ADMIN ROUTES =================== */}

                <Route path="/admin/dashboard/*" element={
                  <AdminRoute>
                    <DashboardLayout><AdminDashboard /></DashboardLayout>
                  </AdminRoute>
                } />
                <Route path="/admin/*" element={
                  <AdminRoute>
                    <DashboardLayout><AdminDashboard /></DashboardLayout>
                  </AdminRoute>
                } />
                <Route path="/admin/seed" element={<Seeder />} />
                <Route path="/admin/diagnostics" element={<FirestoreDiagnostics />} />
                <Route path="/admin/debug-corporate" element={<DebugCorporateGifts />} />
                <Route path="/vendor/diagnostics" element={<VendorDiagnostics />} />
                <Route path="/vendor/quick-fix" element={<VendorQuickFix />} />


                {/* =================== STATIC PAGES =================== */}

                <Route path="/about" element={<MainLayout><About /></MainLayout>} />
                <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
                <Route path="/faq" element={<MainLayout><FAQ /></MainLayout>} />
                <Route path="/help" element={<MainLayout><Help /></MainLayout>} />
                <Route path="/privacy" element={<MainLayout><Privacy /></MainLayout>} />
                <Route path="/terms" element={<MainLayout><Terms /></MainLayout>} />
                <Route path="/shipping" element={<MainLayout><Shipping /></MainLayout>} />
                <Route path="/returns" element={<MainLayout><Returns /></MainLayout>} />
                <Route path="/track-order" element={<MainLayout><TrackOrder /></MainLayout>} />

                {/* =================== 404 PAGE =================== */}

                <Route path="*" element={
                  <MainLayout>
                    <div className="not-found-page">
                      <div className="not-found-content">
                        <h1>404</h1>
                        <h2>Page Not Found</h2>
                        <p>The page you're looking for doesn't exist or has been moved.</p>
                        <a href="/" className="btn btn-primary">Go Home</a>
                      </div>
                    </div>
                  </MainLayout>
                } />
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </SettingsProvider>
    </Router>
  );
}

export default App;
