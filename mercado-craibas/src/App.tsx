import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
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
import DeliveryPage from './pages/DeliveryPage';
import CartSidebar from './components/CartSidebar';
import { MainLayout } from './routes/MainLayout';
import { AdminLayout } from './routes/AdminLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import CheckoutAutUser from './pages/CheckoutAutUser';


export default function App() {
  return (
    <>
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

        {/* ROTAS COM HEADER */}
        <Route element={<ProtectedRoute allowedRoles={["CLIENTE"]} />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route element={<MainLayout />}>
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/flash-sale" element={<FlashSalePage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>



        {/* ROTAS SEM HEADER */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["DELIVERY"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/delivery" element={<DeliveryPage />} />
          </Route>
        </Route>
      </Routes>
      <CartSidebar />
    </>

  );
}
{/* <Header />

<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/product/:id" element={<ProductPage />} />
  <Route path="/login" element={<AuthPage />} />
  <Route path="/register" element={<AuthPage />} />

  <Route path="/checkout" element={<CheckoutPage />} />
  <Route path="/orders" element={<OrdersPage />} />

  <Route path="/category/:id" element={<CategoryPage />} />
  <Route path="/wishlist" element={<WishlistPage />} />
  <Route path="/flash-sale" element={<FlashSalePage />} />
  <Route path="/brands" element={<BrandsPage />} />
  <Route path="/about" element={<AboutPage />} />
  <Route path="/profile" element={<ProfilePage />} />

  <Route path="/admin" element={<AdminPage />} />
  <Route path="/delivery" element={<DeliveryPage />} />
</Routes>

<CartSidebar /> */}