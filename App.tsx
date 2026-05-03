
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';
import { CartProvider } from './contexts/CartContext';
import { SettingsProvider } from './contexts/SettingsContext';

import Storefront from './pages/client/Storefront';
import ProductDetails from './pages/client/ProductDetails';
import CartPage from './pages/client/CartPage';
import CheckoutPage from './pages/client/CheckoutPage';
import ClientAuthPage from './pages/client/ClientAuthPage';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductForm from './pages/admin/ProductForm';
import AdminLayout from './components/admin/AdminLayout';
import ClientLayout from './components/client/ClientLayout';
import OrderConfirmation from './pages/client/OrderConfirmation';
import OrdersPage from './pages/client/OrdersPage';
import SalesReport from './pages/admin/SalesReport';
import AdminSettings from './pages/admin/AdminSettings';

const AdminProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ProductProvider>
          <CartProvider>
            <HashRouter>
              <Routes>
                <Route path="/admin/login" element={<AdminLogin />} />
                
                <Route element={<AdminProtectedRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/products/new" element={<ProductForm />} />
                    <Route path="/admin/products/edit/:id" element={<ProductForm />} />
                    <Route path="/admin/sales" element={<SalesReport />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  </Route>
                </Route>
                
                <Route path="/" element={<ClientLayout />}>
                  <Route index element={<Storefront />} />
                  <Route path="product/:id" element={<ProductDetails />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="login" element={<ClientAuthPage />} />
                  <Route path="order-confirmation" element={<OrderConfirmation />} />
                  <Route path="orders" element={<OrdersPage />} />
                </Route>
                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </HashRouter>
          </CartProvider>
        </ProductProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;