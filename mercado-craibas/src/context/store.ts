import { create } from 'zustand';
import { Order, AppPage, OrderStatus, WishlistItem, Promotion } from '../types';
import { MOCK_USERS, MOCK_ORDERS } from '../data/users';
import { PRODUCTS, PROMOTIONS as INITIAL_PROMOS } from '../data/products';
import { Product } from '../models/Product';
import { CartItem } from '../models/Cart';
import { User } from '../models/User';
import { persist } from 'zustand/middleware';
import { ApiService } from '../config/api';
interface AppState {
  ShowProduct: (selectedProductId: number | null) => void;
  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Navigation
  currentPage: AppPage;
  Pages: string;

  selectedProductId: number | null;
  selectedCategory: string | null;
  searchQuery: string;
  navigateTo: (page: AppPage, productId?: number, category?: string) => void;
  navigatePages: (page: string, productId: number | null, category: string | null) => void;
  setSearchQuery: (q: string) => void;

  // Auth
  user: User | null;
  login: (email: string, password: string) => {
    success: boolean;
    role?: 'admin' | 'delivery' | 'customer';
  };
  logout: () => void;
  saveUser: (user: User) => boolean;
  updateUser: (updates: Partial<User>) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;

  // Wishlist
  wishlist: WishlistItem[];
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: number) => boolean;

  // Orders
  orders: Order[];
  placeOrder: (paymentMethod: string) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Products
  products: Product[];
  setListProducts: (products: Product[]) => void;
  loadProducts: () => Promise<void>;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: number) => void;
  applyPromoToProduct: (productId: number, discount: number) => void;

  // Promotions
  promotions: Promotion[];
  addPromotion: (promo: Promotion) => void;
  updatePromotion: (promo: Promotion) => void;
  deletePromotion: (promoId: string) => void;
  togglePromotion: (promoId: string) => void;

  // UI
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;


}
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      darkMode: false,
      toggleDarkMode: () => {
        const next = !get().darkMode;
        set({ darkMode: next });
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      // Navigation
      currentPage: 'home',
      Pages: 'home',
      selectedProductId: null,
      selectedCategory: null,
      searchQuery: '',
      navigateTo: (page, productId, category) => {
        set({ currentPage: page, selectedProductId: productId || null, selectedCategory: category || null });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      navigatePages: (page, productId, category) => {
        set({ Pages: page, selectedProductId: productId || null, selectedCategory: category || null });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      ShowProduct: (selectedProductId: number | null) => {
        set({ selectedProductId });
      },

      setSearchQuery: (q) => set({ searchQuery: q }),

      // Auth
      user: null,
      login: (email: string, password: string) => {
        const found = MOCK_USERS.find(
          u => u.email === email && u.senha === password
        );

        if (!found) {
          return { success: false };
        }
        set({ user: found });

        return {
          success: true,
          role: found.role,
        };
      },
      logout: () => set({ user: null, currentPage: 'home' }),
      saveUser: (User: User) => {
        // const newUser: User = {
        //   id: `u${Date.now()}`,
        //   name: '',
        //   email: '',
        //   role: 'customer',
        //   phone: '',
        //   //bio: '',
        //   Insert_date: new Date().toLocaleDateString('pt-BR'),
        //   preferences: { notifications: true, newsletter: false, darkMode: false, language: 'pt-BR' },
        //   address: { street: '', number: '', neighborhood: '', city: 'Craibas', state: 'AL', zipCode: '' },
        // };
        set({ user: User }); return true;
      },
      updateUser: (updates) => set(s => ({ user: s.user ? { ...s.user, ...updates } : null })),

      // Cart
      cart: [],
      addToCart: (item) => {
        const { cart } = get();
        const existing = cart.find(c => c.product.id === item.product.id && c.selectedVariation?.id === item.selectedVariation?.id);
        if (existing) {
          set({ cart: cart.map(c => c.product.id === item.product.id && c.selectedVariation?.id === item.selectedVariation?.id ? { ...c, quantity: c.quantity + item.quantity } : c) });
        } else {
          set({ cart: [...cart, item] });
        }
        get().showNotification(`${item.product.name.substring(0, 30)}... adicionado ao carrinho!`, 'success');
      },
      removeFromCart: (productId) => set({ cart: get().cart.filter(c => c.product.id !== productId) }),
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) { get().removeFromCart(productId); return; }
        set({ cart: get().cart.map(c => c.product.id === productId ? { ...c, quantity } : c) });
      },
      clearCart: () => set({ cart: [] }),
      cartTotal: () => get().cart.reduce((sum, item) => sum + item.product.price_Unic * item.quantity, 0),
      cartCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),

      // Wishlist
      wishlist: [],
      toggleWishlist: (product) => {
        const { wishlist } = get();
        const exists = wishlist.find(w => w.product.id === product.id);
        if (exists) {
          set({ wishlist: wishlist.filter(w => w.product.id !== product.id) });
          get().showNotification('Removido dos favoritos', 'info');
        } else {
          set({ wishlist: [...wishlist, { product, addedAt: new Date() }] });
          get().showNotification('Adicionado aos favoritos! ❤️', 'success');
        }
      },
      isWishlisted: (productId) => get().wishlist.some(w => w.product.id === productId),

      // Orders
      orders: MOCK_ORDERS,
      placeOrder: (paymentMethod) => {
        const { cart, user } = get();
        if (!user || cart.length === 0) return null;
        const total = get().cartTotal();
        const order: Order = {
          id: `ORD-${String(Date.now()).slice(-6)}`,
          userId: user.id, items: [...cart], total,
          status: 'confirmado', createdAt: new Date(), updatedAt: new Date(),
          address: user.address || { street: 'Rua das Flores', number: '123', neighborhood: 'Centro', city: 'Craibas', state: 'AL', zipCode: '57465-000' },
          paymentMethod, trackingCode: `MC${String(Date.now()).slice(-9)}BR`,
          deliveryCommission: +(total * 0.05).toFixed(2),
        };
        set({ orders: [order, ...get().orders] });
        get().clearCart();
        return order;
      },
      updateOrderStatus: (orderId, status) => set({
        orders: get().orders.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date() } : o)
      }),

      // Products
      products: [],

      setListProducts: (products: Product[]) =>
        set({ products }),

      loadProducts: async () => {
        const result = await ApiService.getListProducts();
        if (result.success) {
          set({
            products: result.data || []
          });
        } else {
          set({
            products: []
          });

          get().showNotification(
            result.error || "Erro ao carregar produtos",
            "error"
          );
        }
      },
      addProduct: (product) => set({ products: [product, ...get().products] }),
      updateProduct: (product) => set({ products: get().products.map(p => p.id === product.id ? product : p) }),
      deleteProduct: (productId) => set({ products: get().products.filter(p => p.id !== productId) }),
      applyPromoToProduct: (productId, discount) => {
        const products = get().products;
        const product = products.find(p => p.id === productId);
        if (!product) return;
        const originalPrice = product.origin_Price || product.price_Unic;
        const newPrice = +(originalPrice * (1 - discount / 100)).toFixed(2);
        set({
          products: products.map(p => p.id === productId
            ? { ...p, originalPrice: originalPrice, price: newPrice, badge: 'oferta' as const }
            : p
          )
        });
      },

      // Promotions
      promotions: INITIAL_PROMOS as Promotion[],
      addPromotion: (promo) => {
        set({ promotions: [promo, ...get().promotions] });
        if (promo.productIds && promo.productIds.length > 0) {
          promo.productIds.forEach(pid => get().applyPromoToProduct(pid, promo.discount));
        }
        get().showNotification(`Promoção "${promo.code}" criada com sucesso!`, 'success');
      },
      updatePromotion: (promo) => set({ promotions: get().promotions.map(p => p.id === promo.id ? promo : p) }),
      deletePromotion: (promoId) => set({ promotions: get().promotions.filter(p => p.id !== promoId) }),
      togglePromotion: (promoId) => set({
        promotions: get().promotions.map(p => p.id === promoId ? { ...p, active: !p.active } : p)
      }),

      // UI
      cartOpen: false,
      setCartOpen: (open) => set({ cartOpen: open }),
      notification: null,
      showNotification: (message, type = 'success') => {
        set({ notification: { message, type } });
        setTimeout(() => set({ notification: null }), 3200);
      },
    }),
    {
      name: '@app-storage',
      partialize: (state) => ({
        user: state.user, // 🔥 só salva user
      }),
    }
  )
);
