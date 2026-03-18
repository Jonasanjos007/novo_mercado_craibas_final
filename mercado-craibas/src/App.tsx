import { useEffect } from 'react';
import { useStore } from './context/store';
import Header from './components/Header';
import CartSidebar from './components/CartSidebar';
import Notification from './components/Notification';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import AuthPage from './pages/AuthPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import CategoryPage from './pages/CategoryPage';
import AdminPage from './pages/AdminPage';
import DeliveryPage from './pages/DeliveryPage';
import WishlistPage from './pages/WishlistPage';
import FlashSalePage from './pages/FlashSalePage';
import BrandsPage from './pages/BrandsPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const { currentPage, user, darkMode } = useStore();
  const noHeader = ['login', 'register', 'admin-dashboard', 'admin-products', 'admin-orders', 'admin-promotions', 'delivery-dashboard'];
  const showHeader = !noHeader.includes(currentPage);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.setProperty('--bg-page', '#0a0a0f');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.removeProperty('--bg-page');
    }
  }, [darkMode]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />;
      case 'product': return <ProductPage />;
      case 'login': case 'register': return <AuthPage />;
      case 'cart': case 'checkout': return user ? <CheckoutPage /> : <AuthPage />;
      case 'orders': return user ? <OrdersPage /> : <AuthPage />;
      case 'category': case 'search': return <CategoryPage />;
      case 'wishlist': return <WishlistPage />;
      case 'flash-sale': return <FlashSalePage />;
      case 'brands': return <BrandsPage />;
      case 'about': return <AboutPage />;
      case 'profile': return user ? <ProfilePage /> : <AuthPage />;
      case 'admin-dashboard': case 'admin-products': case 'admin-orders': case 'admin-promotions': return <AdminPage />;
      case 'delivery-dashboard': return <DeliveryPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className={`min-h-screen font-body transition-colors ${darkMode ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      {showHeader && <Header />}
      <main className="animate-fade-in">{renderPage()}</main>
      <CartSidebar />
      <Notification />
    </div>
  );
}
