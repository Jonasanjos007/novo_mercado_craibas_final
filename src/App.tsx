import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import CategoryPage from './pages/CategoryPage';
import WishlistPage from './pages/WishlistPage';
import FlashSalePage from './pages/FlashSalePage';
import BrandsPage from './pages/BrandsPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
// import DeliveryPage from './pages/DeliveryPage';
import CheckoutAutUser from './pages/CheckoutAutUser';
import AddressPage from './pages/AddressPage';

import CartSidebar from './components/CartSidebar';
import SessionExpiredModal from './components/SessionExpiredModal';

import { MainLayout } from './routes/MainLayout';
import { AdminLayout } from './routes/AdminLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { useSessionStore } from './store/SessionStore';
import { ProductPage } from './pages/ProductPage';
import NotificationsPage from './pages/NotificationsPage';


export default function App() {

  const { expired } = useSessionStore();

  return (
    <>
      <Toaster position="top-center" />

      <Routes>

        <Route element={<AdminLayout />}>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register/:modeRegister" element={<AuthPage />} />
          <Route path="/CheckoutAutUser" element={<CheckoutAutUser />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/search/:search" element={<CategoryPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["CLIENTE"]} />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/addressPage/:Boleano" element={<AddressPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />

          <Route element={<MainLayout />}>
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/flash-sale" element={<FlashSalePage />} />
            <Route path="/brands" element={<BrandsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["DELIVERY"]} />}>
          <Route element={<AdminLayout />}>
            {/* <Route path="/delivery" element={<DeliveryPage />} /> */}
          </Route>
        </Route>

      </Routes>

      <CartSidebar />

      {/* Modal Global */}
      <SessionExpiredModal open={expired} />

    </>
  );
}