import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StoreLayout from './layouts/StoreLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Shop from './pages/Shop';
import Success from './pages/Success';
import ContentPage from './pages/ContentPage';
import InfluencerTracker from './pages/InfluencerTracker';

import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import CreateOrder from './pages/admin/CreateOrder';
import OrderDetails from './pages/admin/OrderDetails';
import Products from './pages/admin/Products';
import ProductForm from './pages/admin/ProductForm';
import ProductAnalysis from './pages/admin/ProductAnalysis';
import ActivityLogs from './pages/admin/ActivityLogs';
import Users from './pages/admin/Users';
import UserDetails from './pages/admin/UserDetails';
import UsersAnalysis from './pages/admin/UsersAnalysis';
import CustomerAnalytics from './pages/admin/CustomerAnalytics';
import CustomerJourneyDetail from './pages/admin/CustomerJourneyDetail';
import GeneralSettings from './pages/admin/GeneralSettings';
import CollectionSettings from './pages/admin/CollectionSettings';
import CategorySettings from './pages/admin/CategorySettings';
import LocationSettings from './pages/admin/LocationSettings';
import ProductOptionsSettings from './pages/admin/ProductOptionsSettings';
import PromoSettings from './pages/admin/PromoSettings';
import PushNotifications from './pages/admin/PushNotifications';
import Influencers from './pages/admin/Influencers';
import InfluencersAnalysis from './pages/admin/InfluencersAnalysis';
import CreateInfluencer from './pages/admin/CreateInfluencer';

import ProductsAnalysis from './pages/admin/ProductsAnalysis';
import ReviewSettings from './pages/admin/ReviewSettings';
import ProfitCalculator from './pages/admin/ProfitCalculator';

import PageTracker from './components/PageTracker';
import ToastContainer from './components/ToastContainer';
import { useStore } from './store';
import { useEffect } from 'react';
import { messaging, onMessage } from './firebase';

function App() {
  const fetchConfig = useStore(state => state.fetchConfig);
  const fetchProducts = useStore(state => state.fetchProducts);
  const fetchOrders = useStore(state => state.fetchOrders);
  const setLanguage = useStore(state => state.setLanguage);

  useEffect(() => {
    // Force Service Worker Update to fix aggressive mobile caching
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then(registration => {
          registration.update(); // Forces the browser to check for a new version
        })
        .catch(err => console.log('SW registration failed: ', err));
    }

    fetchConfig();
    fetchProducts();
    fetchOrders();
    const savedLang = localStorage.getItem('storeLanguage');
    if (savedLang) setLanguage(savedLang);
    else setLanguage('ar');

    // Handle foreground messages
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground message received: ", payload);
        const addToast = useStore.getState().addToast;
        if (addToast) {
          // Firebase Web SDK sometimes abstracts the notification object when webpush block is used
          const title = payload?.notification?.title || payload?.data?.title || 'New Notification Received';
          addToast(title, 'success');
        }
      });
      return () => unsubscribe();
    }
  }, [fetchConfig, setLanguage]);

  const clarityProjectId = useStore(state => state.config?.clarityProjectId);

  useEffect(() => {
    if (clarityProjectId && typeof window !== 'undefined') {
      if (!window.clarity) {
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", clarityProjectId);
      }
    }
  }, [clarityProjectId]);

  return (
          <BrowserRouter>
          <PageTracker />
          <Routes>
            {/* Storefront Routes */}
            <Route element={<StoreLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<Product />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/success" element={<Success />} />
              <Route path="/page/:pageId" element={<ContentPage />} />
              <Route path="/partner" element={<InfluencerTracker />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/diaradmin26/login" element={<Login />} />
            <Route path="/diaradmin26" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/new" element={<CreateOrder />} />
              <Route path="orders/:id" element={<OrderDetails />} />
              <Route path="products" element={<Products />} />
              <Route path="products/analysis" element={<ProductsAnalysis />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id" element={<ProductForm />} />
              <Route path="products/:id/analysis" element={<ProductAnalysis />} />
              <Route path="users" element={<Users />} />
              <Route path="users/analysis" element={<UsersAnalysis />} />
              <Route path="users/tracking" element={<CustomerAnalytics />} />
              <Route path="users/tracking/journey/:orderId" element={<CustomerJourneyDetail />} />
              <Route path="users/:id" element={<UserDetails />} />
              <Route path="settings/general" element={<GeneralSettings />} />
              <Route path="settings/collections" element={<CollectionSettings />} />
              <Route path="settings/categories" element={<CategorySettings />} />
              <Route path="settings/locations" element={<LocationSettings />} />
              <Route path="settings/options" element={<ProductOptionsSettings />} />
              <Route path="settings/reviews" element={<ReviewSettings />} />
              <Route path="settings/calculator" element={<ProfitCalculator />} />
              <Route path="settings/logs" element={<ActivityLogs />} />
              <Route path="promos" element={<PromoSettings />} />
              <Route path="notifications" element={<PushNotifications />} />
              <Route path="influencers" element={<Influencers />} />
              <Route path="influencers/analysis" element={<InfluencersAnalysis />} />
              <Route path="influencers/new" element={<CreateInfluencer />} />
              <Route path="influencers/edit/:id" element={<CreateInfluencer />} />
              {/* Fallback settings page to collections */}
              <Route path="settings" element={<Navigate to="/diaradmin26/settings/collections" replace />} />
            </Route>
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer />
          </BrowserRouter>
  );
}

export default App;
