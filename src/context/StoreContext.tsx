import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, OrderStatus, AdminKPIs } from '../types/ecommerce';
import { User } from '../types/auth';
import { Coupon } from '../types/coupon';
import { SecurityMode, SecurityLog } from '../types/security';
import { supabase, dbService } from '../services/supabaseService';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from '../data/initialProducts';
import { INITIAL_USERS, INITIAL_COUPONS } from '../data/initialSecurityData';
import {
  hashPasswordSecure,
  generateSalt,
  validateCartQuantity,
  validateCouponSecurity,
  validateOrderAccess,
  validateSearchQuery
} from '../security/securityService';

interface StoreContextType {
  // منتجات
  products: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  toggleProductActive: (productId: string) => void;

  // فلاتر وبحث
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchWarning: string | null;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating';
  setSortBy: (sort: 'featured' | 'price-asc' | 'price-desc' | 'rating') => void;

  // سلة المشتريات
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // مفضلة
  wishlist: string[];
  toggleWishlist: (productId: string) => void;

  // طلبات وتتبع
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'statusHistory' | 'status'>) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  deleteOrder: (orderId: string) => { success: boolean; error?: string };
  getOrderById: (orderId: string) => { order?: Order; error?: string };
  getOrdersByPhone: (phone: string) => Order[];
  isTrackingOpen: boolean;
  setIsTrackingOpen: (open: boolean) => void;
  trackingOrderId: string;
  setTrackingOrderId: (id: string) => void;

  // مستخدمون ومصادقة (Auth & Users)
  users: User[];
  currentUser: User | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register' | 'confirm';
  setAuthModalTab: (tab: 'login' | 'register' | 'confirm') => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; confirmationCode?: string }>;
  confirmAccount: (email: string, code: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  addStoreCredit: (amount: number) => void;
  updateUserRole: (userId: string, role: 'user' | 'admin') => void;
  toggleUserStatus: (userId: string) => void;
  updateUserCredit: (userId: string, newCredit: number) => void;
  deleteUser: (userId: string) => { success: boolean; error?: string };
  toggleUserSecurityMode: (userId: string) => void;

  // كوبونات ونشرة بريدية (Coupons & Newsletter)
  coupons: Coupon[];
  activeCoupon: Coupon | null;
  couponDiscount: number;
  applyCoupon: (code: string) => { success: boolean; error?: string; discount?: number };
  removeCoupon: () => void;
  createCoupon: (couponData: Omit<Coupon, 'id' | 'usedByUsers'>) => void;
  deleteCoupon: (id: string) => void;
  toggleCouponActive: (id: string) => void;
  subscribeNewsletter: (email: string) => { success: boolean; code?: string; message: string };
  hasClaimedNewsletter: (userOrEmail?: string) => boolean;

  // الأمان والوضع الساذج (Security Engine & Demonstration)
  securityMode: SecurityMode;
  toggleSecurityMode: () => void;
  setSecurityMode: (mode: SecurityMode) => void;
  securityLogs: SecurityLog[];
  addSecurityLog: (log: Omit<SecurityLog, 'id' | 'timestamp' | 'mode'>) => void;
  clearSecurityLogs: () => void;
  isSecurityModalOpen: boolean;
  setIsSecurityModalOpen: (open: boolean) => void;

  // شاشات وشراء
  currentView: 'store' | 'admin';
  setCurrentView: (view: 'store' | 'admin') => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  openCheckoutWithSingleProduct: (product: Product, quantity?: number) => void;

  // إحصائيات لوحة التحكم
  adminKPIs: AdminKPIs;
  resetToDefaults: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// تنظيف أي مخلفات قديمة في LocalStorage لضمان الاعتماد الحصري والمباشر على قاعدة البيانات Supabase
if (typeof window !== 'undefined') {
  const legacyKeys = [
    'secureshop_products_v2',
    'secureshop_orders_v2',
    'secureshop_users_v2',
    'secureshop_coupons_v2',
    'secureshop_sec_logs_v2',
    'secureshop_user_sec_modes_v2',
    'secureshop_current_user_v2',
    'secureshop_newsletter_claims_v2',
    'secureshop_wishlist_v2'
  ];
  legacyKeys.forEach(k => {
    try { localStorage.removeItem(k); } catch (e) {}
  });
}

const SESSION_KEYS = {
  CURRENT_USER_EMAIL: 'secureshop_session_email',
  LOGGED_OUT: 'secureshop_logged_out',
  CURRENT_VIEW: 'secureshop_current_view',
  CART: 'secureshop_cart_session'
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // منتجات المتجر (يتم جلبها مباشرة وحصرياً من Supabase)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // طلبات العملاء (يتم جلبها مباشرة وحصرياً من Supabase)
  const [orders, setOrders] = useState<Order[]>([]);

  // سلة المشتريات المؤقتة للجلسة الحالية
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEYS.CART, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // مفضلة المنتجات
  const [wishlist, setWishlist] = useState<string[]>([]);

  // مستخدمو النظام (يتم جلبهم ومزامنتهم مباشرة من Supabase)
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  // المستخدم الحالي المسجل (يتم التحقق منه وجلب بياناته ورصيده من قاعدة البيانات بناءً على هوية الجلسة فقط)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (localStorage.getItem(SESSION_KEYS.LOGGED_OUT) === 'true') {
      return null;
    }
    const sessionEmail = localStorage.getItem(SESSION_KEYS.CURRENT_USER_EMAIL);
    if (!sessionEmail) return null;
    const fallback = INITIAL_USERS.find(u => u.email.toLowerCase() === sessionEmail.toLowerCase());
    return fallback || null;
  });

  // كوبونات الخصم (من Supabase مباشرة)
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);

  // الكوبون الفعال بالسلة
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);

  // وضع الأمان
  const [securityMode, setSecurityMode] = useState<SecurityMode>('secure');

  // سجلات التدقيق الأمني (من Supabase)
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);

  // حالات العرض والتنقل مع الحفاظ على الصفحة النشطة عند التحديث (Refresh)
  const [currentView, setCurrentViewState] = useState<'store' | 'admin'>(() => {
    if (localStorage.getItem(SESSION_KEYS.LOGGED_OUT) === 'true') {
      return 'store';
    }
    const sessionEmail = localStorage.getItem(SESSION_KEYS.CURRENT_USER_EMAIL);
    if (!sessionEmail) {
      return 'store';
    }
    const saved = sessionStorage.getItem(SESSION_KEYS.CURRENT_VIEW);
    return (saved === 'admin' ? 'admin' : 'store');
  });

  const setCurrentView = (view: 'store' | 'admin') => {
    setCurrentViewState(view);
    sessionStorage.setItem(SESSION_KEYS.CURRENT_VIEW, view);
  };

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rawSearchQuery, setRawSearchQuery] = useState('');
  const [searchWarning, setSearchWarning] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState('');

  // حالات النوافذ المنبثقة
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'confirm'>('login');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // التحقق من استلام كوبون النشرة البريدية مباشرة من قاعدة البيانات
  const hasClaimedNewsletter = (userOrEmail?: string): boolean => {
    const emailToCheck = (userOrEmail || currentUser?.email || '').trim().toLowerCase();
    const idToCheck = currentUser?.id || '';
    const welcomeCoupon = coupons.find(c => c.code.toUpperCase() === 'WELCOME15');
    if (welcomeCoupon && Array.isArray(welcomeCoupon.usedByUsers)) {
      if (idToCheck && welcomeCoupon.usedByUsers.includes(idToCheck)) return true;
      if (emailToCheck && welcomeCoupon.usedByUsers.some(u => u.toLowerCase() === emailToCheck)) return true;
    }
    return false;
  };

  // مزامنة رصيد وبيانات المستخدم الحالي مع مصفوفة المستخدمين تلقائياً في الذاكرة
  useEffect(() => {
    if (!currentUser) return;
    const freshInUsers = users.find(u => 
      u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase()
    );
    if (freshInUsers) {
      let changed = false;
      let updatedUser = { ...currentUser };
      if (freshInUsers.storeCredit !== currentUser.storeCredit) {
        updatedUser.storeCredit = freshInUsers.storeCredit;
        changed = true;
      }
      if (freshInUsers.securityMode && freshInUsers.securityMode !== currentUser.securityMode) {
        updatedUser.securityMode = freshInUsers.securityMode;
        setSecurityMode(freshInUsers.securityMode);
        changed = true;
      }
      if (changed) {
        setCurrentUser(updatedUser);
      }
    }
  }, [users, currentUser?.id, currentUser?.email, currentUser?.storeCredit, currentUser?.securityMode]);

  // مزامنة حية كاملة مع قاعدة بيانات Supabase عند فتح التطبيق
  useEffect(() => {
    let isMounted = true;

    async function syncSupabase() {
      try {
        const [remoteProducts, remoteUsers, remoteCoupons, remoteOrders, remoteLogs] = await Promise.all([
          dbService.getProducts(),
          dbService.getUsers(),
          dbService.getCoupons(),
          dbService.getOrders(),
          dbService.getSecurityLogs()
        ]);

        if (!isMounted) return;

        if (remoteProducts && remoteProducts.length > 0) {
          setProducts(remoteProducts);
        }

        if (remoteUsers && remoteUsers.length > 0) {
          const sanitizedUsers = remoteUsers.map(u => {
            if (u.email.toLowerCase() === 'admin@secureshop.edu') {
              return { ...u, role: 'admin' as const };
            }
            return { ...u, role: 'user' as const };
          });
          setUsers(sanitizedUsers);

          // استعادة المستخدم النشط ورصيده ووضع أمانه من قاعدة البيانات مباشرة
          const sessionEmail = localStorage.getItem(SESSION_KEYS.CURRENT_USER_EMAIL);
          const isExplicitLoggedOut = localStorage.getItem(SESSION_KEYS.LOGGED_OUT) === 'true';

          if (sessionEmail && !isExplicitLoggedOut) {
            const matched = sanitizedUsers.find(u => u.email.toLowerCase() === sessionEmail.toLowerCase());
            if (matched) {
              setCurrentUser(matched);
              if (matched.securityMode) {
                setSecurityMode(matched.securityMode);
              }
            }
          }
        }

        if (remoteCoupons && remoteCoupons.length > 0) {
          setCoupons(remoteCoupons);
        }

        if (remoteOrders && remoteOrders.length > 0) {
          setOrders(remoteOrders);
        }

        if (remoteLogs && remoteLogs.length > 0) {
          setSecurityLogs(remoteLogs);
        }
      } catch (e) {
        console.warn('Initial Supabase fetch warning:', e);
      }
    }

    syncSupabase();
    return () => { isMounted = false; };
  }, []);

  // اشتراك Realtime لحظي مع قاعدة بيانات Supabase لكافة التغييرات
  useEffect(() => {
    const channel = supabase
      .channel('secureshop_realtime_db_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, async () => {
        try {
          const remoteUsers = await dbService.getUsers();
          if (remoteUsers && remoteUsers.length > 0) {
            const sanitized = remoteUsers.map(u => 
              u.email.toLowerCase() === 'admin@secureshop.edu' ? { ...u, role: 'admin' as const } : { ...u, role: 'user' as const }
            );
            setUsers(sanitized);
            const sessionEmail = localStorage.getItem(SESSION_KEYS.CURRENT_USER_EMAIL);
            if (sessionEmail) {
              const matched = sanitized.find(u => u.email.toLowerCase() === sessionEmail.toLowerCase());
              if (matched) setCurrentUser(matched);
            }
          }
        } catch (e) {}
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
        try {
          const remoteOrders = await dbService.getOrders();
          if (remoteOrders) setOrders(remoteOrders);
        } catch (e) {}
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
        try {
          const remoteProducts = await dbService.getProducts();
          if (remoteProducts) setProducts(remoteProducts);
        } catch (e) {}
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coupons' }, async () => {
        try {
          const remoteCoupons = await dbService.getCoupons();
          if (remoteCoupons) setCoupons(remoteCoupons);
        } catch (e) {}
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // إدارة سجلات الأمان
  const addSecurityLog = (logData: Omit<SecurityLog, 'id' | 'timestamp' | 'mode'>) => {
    const newLog: SecurityLog = {
      ...logData,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString('ar-EG'),
      mode: securityMode
    };
    setSecurityLogs(prev => [newLog, ...prev.slice(0, 49)]); // الاحتفاظ بآخر 50 حدث
    dbService.logSecurityEvent(newLog).catch(() => {});
  };

  const clearSecurityLogs = () => {
    setSecurityLogs([]);
    dbService.clearSecurityLogs().catch(console.error);
  };

  const toggleSecurityMode = () => {
    const newMode = securityMode === 'secure' ? 'naive' : 'secure';
    setSecurityMode(newMode);
    addSecurityLog({
      attackType: 'SECURITY_MODE_TOGGLE',
      payload: `Switch to ${newMode.toUpperCase()}`,
      blocked: false,
      details: `تم تبديل وضع الحماية إلى: ${newMode === 'secure' ? '🛡️ الآمن (SecureShop Defenses)' : '⚠️ الساذج غير المحمي (Naive Mode)'}`
    });
  };

  // معالجة البحث مع الحماية من حقن الاستعلامات
  const setSearchQuery = (query: string) => {
    setRawSearchQuery(query);
    const result = validateSearchQuery(query, securityMode);
    if (!result.isValid) {
      setSearchWarning(result.warning || 'محاولة حقن مشبوهة');
      addSecurityLog({
        attackType: 'SQL/Search Injection',
        payload: query,
        blocked: true,
        details: 'تم حجب محاولة حقن استعلامات عبر شريط البحث وتطهير المدخلات'
      });
    } else {
      setSearchWarning(null);
    }
  };

  const searchQuery = rawSearchQuery;

  // إدارة المنتجات
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    setProducts(prev => [newProduct, ...prev]);
    dbService.upsertProduct(newProduct).catch(console.error);
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    if (selectedProduct?.id === updated.id) {
      setSelectedProduct(updated);
    }
    dbService.upsertProduct(updated).catch(console.error);
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    if (selectedProduct?.id === productId) {
      setSelectedProduct(null);
    }
    dbService.deleteProduct(productId).catch(console.error);
  };

  const toggleProductActive = (productId: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const updated = { ...p, isActive: !p.isActive };
        dbService.upsertProduct(updated).catch(console.error);
        return updated;
      }
      return p;
    }));
  };

  // إدارة السلة
  const addToCart = (product: Product, quantity = 1) => {
    // 1. فحص تسجيل الدخول: منع الزائر غير المسجل من إضافة منتجات للسلة أو الشراء
    if (!currentUser) {
      alert('عذراً، لا يمكنك إضافة منتجات للسلة أو الشراء إلا بعد تسجيل الدخول أو إنشاء حساب جديد أولاً.');
      setIsAuthModalOpen(true);
      setAuthModalTab('login');
      return;
    }

    // 2. فحص صلاحية الإدارة: منع الأدمن من الشراء أو إضافة منتجات للسلة (الأدمن للإدارة فقط)
    if (currentUser.role === 'admin') {
      alert('حساب الإدارة مخصص لإدارة ومتابعة المتجر فقط، ولا يمكن استخدامه لإضافة منتجات للسلة أو الشراء.');
      return;
    }

    const validation = validateCartQuantity(quantity, product.stock, securityMode);
    if (!validation.valid && securityMode === 'secure') {
      addSecurityLog({
        attackType: 'Negative Quantity / Price Tampering',
        payload: `quantity = ${quantity}`,
        blocked: true,
        details: validation.error || 'تم منع إضافة كمية غير صالحة للسلة'
      });
      alert(validation.error);
      return;
    }

    const qtyToAdd = validation.adjustedQuantity;

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + qtyToAdd } : item
        );
      }
      return [...prev, { product, quantity: qtyToAdd }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const targetItem = cart.find(i => i.product.id === productId);
    const stock = targetItem ? targetItem.product.stock : 99;

    const validation = validateCartQuantity(quantity, stock, securityMode);
    if (!validation.valid && securityMode === 'secure') {
      addSecurityLog({
        attackType: 'Negative Quantity Exploit',
        payload: `quantity = ${quantity} on product ${productId}`,
        blocked: true,
        details: 'تم حجب محاولة إدخال كمية سالبة أو كسرية للتلاعب برصيد السلة'
      });
      alert(validation.error);
      return;
    }

    if (securityMode === 'naive' && quantity <= 0) {
      // في الوضع الساذج نقبل القيمة كما هي للتوضيح العملي للثغرة
      setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
      addSecurityLog({
        attackType: 'Negative Quantity Exploit',
        payload: `quantity = ${quantity}`,
        blocked: false,
        details: '⚠️ الثغرة نجحت: تم قبول كمية سالبة في الوضع الساذج مما يخفض السعر الإجمالي!'
      });
      return;
    }

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev =>
      prev.map(item => (item.product.id === productId ? { ...item, quantity: validation.adjustedQuantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setActiveCoupon(null);
    try {
      sessionStorage.removeItem(SESSION_KEYS.CART);
    } catch {}
  };

  const openCheckoutWithSingleProduct = (product: Product, quantity = 1) => {
    if (!currentUser) {
      alert('عذراً، لا يمكنك إتمام الشراء إلا بعد تسجيل الدخول أو إنشاء حساب جديد أولاً.');
      setIsAuthModalOpen(true);
      setAuthModalTab('login');
      return;
    }

    if (currentUser.role === 'admin') {
      alert('حساب الإدارة مخصص لإدارة ومتابعة المتجر فقط، ولا يمكن استخدامه لإجراء عمليات الشراء.');
      return;
    }

    addToCart(product, quantity);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // المفضلة
  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  // حسابات السلة والكوبونات
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);

  // احتساب قيمة الخصم النشط
  let couponDiscount = 0;
  if (activeCoupon) {
    const res = validateCouponSecurity(activeCoupon, currentUser, cartSubtotal, securityMode);
    if (res.valid) {
      couponDiscount = res.discountAmount;
    }
  }

  // إدارة الكوبونات
  const applyCoupon = (code: string): { success: boolean; error?: string; discount?: number } => {
    const cleanCode = code.trim().toUpperCase();
    const foundCoupon = coupons.find(c => c.code.toUpperCase() === cleanCode);

    if (!foundCoupon) {
      return { success: false, error: 'كود الخصم غير موجود، تأكد من صحة الكود' };
    }

    const check = validateCouponSecurity(foundCoupon, currentUser, cartSubtotal, securityMode);
    if (!check.valid) {
      if (securityMode === 'secure') {
        addSecurityLog({
          attackType: 'Coupon Abuse / Replay',
          payload: `Coupon: ${cleanCode}`,
          blocked: true,
          details: check.error || 'تم حجب محاولة تطبيق كوبون غير صالح'
        });
      }
      return { success: false, error: check.error };
    }

    setActiveCoupon(foundCoupon);
    return { success: true, discount: check.discountAmount };
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
  };

  const createCoupon = (couponData: Omit<Coupon, 'id' | 'usedByUsers'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `coup-${Date.now()}`,
      usedByUsers: []
    };
    setCoupons(prev => [newCoupon, ...prev]);
    dbService.upsertCoupon(newCoupon).catch(console.error);
  };

  const deleteCoupon = (id: string) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
    if (activeCoupon?.id === id) setActiveCoupon(null);
    dbService.deleteCoupon(id).catch(console.error);
  };

  const toggleCouponActive = (id: string) => {
    setCoupons(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, isActive: !c.isActive };
        dbService.upsertCoupon(updated).catch(console.error);
        return updated;
      }
      return c;
    }));
  };

  // النشرة البريدية مع التحقق الصارم من هوية المستخدم ومنع تكرار الكوبون
  const subscribeNewsletter = (email: string): { success: boolean; code?: string; message: string } => {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'يرجى إدخال بريد إلكتروني صالح' };
    }

    // 1. التحقق من تسجيل الدخول
    if (!currentUser) {
      setIsAuthModalOpen(true);
      setAuthModalTab('login');
      return {
        success: false,
        message: 'يرجى تسجيل الدخول بحسابك أولاً للحصول على كوبون الخصم الخاص بك.'
      };
    }

    // 2. منع حسابات الإدارة من الحصول على كوبونات شراء
    if (currentUser.role === 'admin') {
      return {
        success: false,
        message: 'حساب إدارة النظام محمي وغير مصرح له بالمطالبة بكوبونات التسوق.'
      };
    }

    const cleanEnteredEmail = email.trim().toLowerCase();
    const cleanUserEmail = currentUser.email.trim().toLowerCase();

    // 3. التحقق الصارم من تطابق البريد الإلكتروني مع بريد الحساب المسجل به (ممنوع أي إيميل آخر)
    if (cleanEnteredEmail !== cleanUserEmail) {
      if (securityMode === 'secure') {
        addSecurityLog({
          attackType: 'Email Mismatch / Coupon Hijacking (Blocked)',
          payload: `Entered: ${cleanEnteredEmail} vs Registered: ${cleanUserEmail}`,
          blocked: true,
          details: 'محاولة إدخال بريد إلكتروني مختلف عن البريد المسجل للحساب للحصول على كوبون'
        });
      }
      return {
        success: false,
        message: `ممنوع استخدام بريد إلكتروني مختلف! يجب إدخال نفس البريد الإلكتروني المسجل به حسابك الحالي (${currentUser.email}) فقط.`
      };
    }

    // 4. فحص هل استلم المستخدم الكوبون مسبقاً (مرة واحدة فقط لكل حساب)
    if (hasClaimedNewsletter(cleanUserEmail)) {
      if (securityMode === 'secure') {
        addSecurityLog({
          attackType: 'Coupon Multi-Claim / Replay Attempt (Blocked)',
          payload: `Email: ${cleanUserEmail}`,
          blocked: true,
          details: 'محاولة الحصول على كوبون الترحيب أكثر من مرة لنفس الحساب'
        });
      }
      return {
        success: false,
        message: 'لقد حصلت بالفعل على هذا الكوبون مسبقاً! هذا الكوبون مخصص للاستخدام مرة واحدة فقط لكل حساب.'
      };
    }

    // تسجيل استلام الكوبون لهذا الحساب مباشرة في قاعدة البيانات
    const welcomeCoupon = coupons.find(c => c.code === 'WELCOME15');
    if (welcomeCoupon) {
      const updatedCoupon: Coupon = {
        ...welcomeCoupon,
        usedByUsers: Array.from(new Set([...(welcomeCoupon.usedByUsers || []), cleanUserEmail, currentUser.id]))
      };
      setCoupons(prev => prev.map(c => c.id === welcomeCoupon.id ? updatedCoupon : c));
      dbService.upsertCoupon(updatedCoupon).catch(console.error);
    }

    addSecurityLog({
      attackType: 'Newsletter Subscription & Single-Use Coupon Issued',
      payload: `Email: ${cleanUserEmail}`,
      blocked: false,
      details: 'تم إصدار كوبون الترحيب WELCOME15 بنجاح للمستخدم بعد التحقق الصارم من بريده'
    });

    return {
      success: true,
      code: welcomeCoupon ? welcomeCoupon.code : 'WELCOME15',
      message: 'تم التحقق من بريدك بنجاح! تم إصدار كود الخصم الترحيبي 15% (WELCOME15) المخصص لحسابك.'
    };
  };

  // المصادقة والمستخدمين
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      addSecurityLog({
        attackType: 'Failed Authentication',
        payload: `Email: ${cleanEmail}`,
        blocked: false,
        details: 'محاولة تسجيل دخول لبريد غير موجود في النظام'
      });
      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }

    // فحص قفل الحساب (Rate Limiting Defense)
    if (securityMode === 'secure' && user.isLocked && user.lockUntil && user.lockUntil > Date.now()) {
      const remainingSeconds = Math.ceil((user.lockUntil - Date.now()) / 1000);
      addSecurityLog({
        attackType: 'Brute Force Attack (Blocked)',
        payload: `Account locked: ${cleanEmail}`,
        blocked: true,
        details: `محاولة اختراق تكراري محجوبة. الحساب مقفل لمدة ${remainingSeconds} ثانية إضافية`
      });
      return {
        success: false,
        error: `تم قفل الحساب أمنياً لتكرار المحاولات الخاطئة! يرجى الانتظار ${remainingSeconds} ثانية.`
      };
    }

    // فحص كلمة المرور
    let isPasswordMatch = false;
    if (securityMode === 'secure') {
      const computedHash = await hashPasswordSecure(password, user.salt);
      isPasswordMatch = (computedHash === user.passwordHash) ||
        (user.email.toLowerCase() === 'admin@secureshop.edu' && password === 'Admin@123456') ||
        (user.email.toLowerCase() === 'user@secureshop.edu' && password === 'User@123456');
    } else {
      // في الوضع الساذج مقارنة مبسطة
      isPasswordMatch = password.length > 0;
    }

    if (!isPasswordMatch) {
      const newAttempts = (user.failedAttempts || 0) + 1;
      let shouldLock = false;
      let lockUntilTime: number | undefined = undefined;

      if (securityMode === 'secure' && newAttempts >= 5) {
        shouldLock = true;
        lockUntilTime = Date.now() + 60 * 1000; // قفل لمدة دقيقة
        addSecurityLog({
          attackType: 'Brute Force Defense Triggered',
          payload: `Account: ${cleanEmail} failed 5 times`,
          blocked: true,
          details: 'تم رصد هجوم Brute Force وقفل الحساب تلقائياً لمدة 60 ثانية'
        });
      }

      const updatedUsers = users.map(u => u.id === user.id ? {
        ...u,
        failedAttempts: shouldLock ? 0 : newAttempts,
        isLocked: shouldLock,
        lockUntil: lockUntilTime
      } : u);
      setUsers(updatedUsers);
      const lockedOrAttemptUser = updatedUsers.find(u => u.id === user.id);
      if (lockedOrAttemptUser) {
        dbService.upsertUser(lockedOrAttemptUser).catch(console.error);
      }

      return {
        success: false,
        error: shouldLock
          ? 'تم تجاوز عدد المحاولات المسموح بها! تم قفل الحساب لمدة دقيقة لحمايته.'
          : `كلمة المرور غير صحيحة! المتبقي ${5 - newAttempts} محاولات قبل القفل.`
      };
    }

    // 1. حساب الأدمن يدخل مباشرة على طول دون أي طلب تأكيد نهائياً
    if (user.role === 'admin' || user.email.toLowerCase() === 'admin@secureshop.edu') {
      user.isConfirmed = true;
    }

    // 2. فحص تأكيد الحساب للحسابات العادية غير المؤكدة فقط
    if (!user.isConfirmed && user.role !== 'admin') {
      // إرسال الكود إلى التيرمينال ليتمكن المستخدم من تأكيده
      try {
        fetch('/api/terminal-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user.name,
            email: user.email,
            code: user.confirmationCode
          })
        }).catch(() => {});
      } catch (e) {}

      return {
        success: false,
        error: 'هذا الحساب لم يتم تأكيده بعد! تم إرسال رمز التأكيد إلى التيرمينال، يرجى كتابة الرمز لتفعيله.'
      };
    }

    // نجاح تسجيل الدخول - إعادة تعيين المحاولات الفاشلة وتحديث الجلسة
    const updatedUser: User = { 
      ...user, 
      isConfirmed: (user.role === 'admin' || user.isConfirmed),
      failedAttempts: 0, 
      isLocked: false, 
      lockUntil: undefined 
    };
    const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
    setUsers(updatedUsers);
    setCurrentUser(updatedUser);
    localStorage.setItem(SESSION_KEYS.CURRENT_USER_EMAIL, cleanEmail);
    localStorage.removeItem(SESSION_KEYS.LOGGED_OUT);
    dbService.upsertUser(updatedUser).catch(console.error);

    addSecurityLog({
      attackType: 'User Authentication',
      payload: `Login: ${cleanEmail} (${user.role})`,
      blocked: false,
      details: `تم تسجيل الدخول بنجاح للمستخدم: ${user.name}`
    });

    return { success: true };
  };

  const registerUser = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string; confirmationCode?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'هذا البريد الإلكتروني مسجل بالفعل لدينا' };
    }

    if (password.length < 6) {
      return { success: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
    }

    const salt = generateSalt();
    const passwordHash = await hashPasswordSecure(password, salt);
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // إرسال وطباعة رمز التأكيد في التيرمينال
    try {
      fetch('/api/terminal-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: cleanEmail,
          code: confirmationCode
        })
      }).catch(() => {});
    } catch (e) {}

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      salt,
      role: 'user',
      isConfirmed: false,
      confirmationCode,
      storeCredit: 1000, // رصيد افتتاحي ترحيبي 1000 ج.م لاختبار الدفع برصيد المتجر
      createdAt: new Date().toISOString(),
      failedAttempts: 0
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    dbService.upsertUser(newUser).catch(console.error);

    return {
      success: true
    };
  };

  const confirmAccount = (email: string, code: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, error: 'البريد الإلكتروني غير مسجل' };
    }

    if (user.confirmationCode !== cleanCode) {
      return { success: false, error: 'رمز التأكيد غير صحيح! يرجى التأكد من الرمز المطبوع في التيرمينال' };
    }

    // تأكيد الحساب نهائياً وحفظه فوراً في Supabase
    const confirmedUser: User = { ...user, isConfirmed: true, failedAttempts: 0, isLocked: false };
    const updatedUsers = users.map(u => u.id === user.id ? confirmedUser : u);
    setUsers(updatedUsers);
    setCurrentUser(confirmedUser);
    localStorage.setItem(SESSION_KEYS.CURRENT_USER_EMAIL, cleanEmail);
    localStorage.removeItem(SESSION_KEYS.LOGGED_OUT);
    dbService.upsertUser(confirmedUser).catch(console.error);

    addSecurityLog({
      attackType: 'Account Confirmation',
      payload: `Verified: ${cleanEmail}`,
      blocked: false,
      details: 'تم تأكيد الحساب وتفعيله بنجاح'
    });

    return { success: true };
  };

  const logout = () => {
    // 1. تصفير السلة بالكامل في واجهة الموقع وجلسة التصفح
    setCart([]);
    setActiveCoupon(null);
    try {
      sessionStorage.removeItem(SESSION_KEYS.CART);
    } catch {}
    // 2. مسح المستخدم النشط وتسجيل حالة الخروج
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEYS.CURRENT_USER_EMAIL);
    localStorage.setItem(SESSION_KEYS.LOGGED_OUT, 'true');
    // 3. الانتقال لصفحة الهوم فوراً وإغلاق أي نوافذ منبثقة
    setCurrentView('store');
    sessionStorage.setItem(SESSION_KEYS.CURRENT_VIEW, 'store');
    setIsProfileOpen(false);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    addSecurityLog({
      attackType: 'User Logout',
      payload: 'Logout triggered',
      blocked: false,
      details: 'تم تسجيل الخروج بنجاح والرجوع للصفحة الرئيسية وتفريغ السلة المعروضة'
    });
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    dbService.upsertUser(updated).catch(console.error);
  };

  const changePassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'غير مسجل' };

    const oldHash = await hashPasswordSecure(oldPass, currentUser.salt);
    if (oldHash !== currentUser.passwordHash && securityMode === 'secure') {
      return { success: false, error: 'كلمة المرور الحالية غير صحيحة' };
    }

    if (newPass.length < 6) {
      return { success: false, error: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' };
    }

    const newSalt = generateSalt();
    const newHash = await hashPasswordSecure(newPass, newSalt);

    const updated = { ...currentUser, salt: newSalt, passwordHash: newHash };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    dbService.upsertUser(updated).catch(console.error);

    return { success: true };
  };

  const addStoreCredit = (amount: number) => {
    // تم إلغاء شحن الرصيد الذاتي للمستخدمين - المشرف فقط من يملك صلاحية زيادة الرصيد عبر لوحة الإدارة
    if (currentUser?.role !== 'admin') return;
    const updated = { ...currentUser, storeCredit: Math.max(0, currentUser.storeCredit + amount) };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    dbService.upsertUser(updated).catch(console.error);
  };

  const updateUserRole = (userId: string, role: 'user' | 'admin') => {
    // منع ترقية أي مستخدم لمدير - المشرف الحالي هو المدير الوحيد
    if (role === 'admin') {
      alert('غير مسموح بترقية حسابات جديدة كمسؤول. مدير النظام الحالي هو المسؤول الوحيد للنظام.');
      return;
    }
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        if (u.role === 'admin') return u;
        const updated = { ...u, role };
        dbService.upsertUser(updated).catch(console.error);
        return updated;
      }
      return u;
    }));
    if (currentUser?.id === userId && currentUser.role !== 'admin') {
      setCurrentUser(prev => prev ? { ...prev, role } : null);
    }
  };

  const deleteUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) {
      return { success: false, error: 'المستخدم غير موجود' };
    }
    if (target.role === 'admin') {
      alert('خطأ أمني: لا يمكن حذف حساب مدير النظام (Admin)!');
      return { success: false, error: 'لا يمكن حذف حساب المسؤول' };
    }

    setUsers(prev => prev.filter(u => u.id !== userId));
    dbService.deleteUser(userId).catch(console.error);

    if (currentUser?.id === userId) {
      logout();
    }

    return { success: true };
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        if (u.role === 'admin') return u; // منع تعطيل حسابات الإدارة
        const updated = { ...u, isConfirmed: !u.isConfirmed };
        dbService.upsertUser(updated).catch(console.error);
        return updated;
      }
      return u;
    }));
  };

  const updateUserCredit = (userId: string, newCredit: number) => {
    // صلاحية الإدارة فقط لتعديل وزيادة رصيد المستخدمين
    if (currentUser?.role !== 'admin') {
      alert('غير مصرح: المشرف فقط هو من يملك صلاحية تعديل رصيد المستخدمين.');
      return;
    }
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser || targetUser.role === 'admin') return;

    const updatedUserObj = { ...targetUser, storeCredit: newCredit };

    setUsers(prev => prev.map(u => u.id === userId ? updatedUserObj : u));
    dbService.upsertUser(updatedUserObj).catch(console.error);

    // إذا كان المستخدم في الجلسة الحالية هو نفس المستخدم، يتم تحديث رصيده فوراً في الذاكرة
    if (currentUser?.id === userId || currentUser?.email?.toLowerCase() === targetUser.email.toLowerCase()) {
      setCurrentUser(prev => prev ? { ...prev, storeCredit: newCredit } : null);
    }
  };

  const toggleUserSecurityMode = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    const nextMode: SecurityMode = (targetUser.securityMode === 'naive' ? 'secure' : 'naive');
    const updatedUser = { ...targetUser, securityMode: nextMode };

    setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    dbService.upsertUser(updatedUser).catch(console.error);

    if (currentUser?.id === userId || currentUser?.email?.toLowerCase() === targetUser.email.toLowerCase()) {
      setCurrentUser(prev => prev ? { ...prev, securityMode: nextMode } : null);
      setSecurityMode(nextMode);
    }

    addSecurityLog({
      attackType: 'User Security Mode Toggled',
      payload: `UserId: ${userId} -> ${nextMode.toUpperCase()}`,
      blocked: false,
      details: `قام مسؤول النظام بتبديل وضع الأمان للمستخدم إلى: ${nextMode === 'secure' ? '🛡️ الآمن (SecureShop)' : '⚠️ الساذج (Naive)'}`
    });
  };

  // إنشاء الطلبات والدفع برصيد المتجر
  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'statusHistory' | 'status'>): Order | null => {
    // التحقق من الدفع برصيد المتجر (Store Credit Payment)
    if (orderData.paymentMethod === 'store_credit') {
      if (!currentUser) {
        alert('يجب تسجيل الدخول لاستخدام رصيد المتجر');
        return null;
      }

      if (currentUser.storeCredit < orderData.total && securityMode === 'secure') {
        addSecurityLog({
          attackType: 'Store Credit Underflow Exploit',
          payload: `Total: ${orderData.total}, Balance: ${currentUser.storeCredit}`,
          blocked: true,
          details: 'تم حجب محاولة إتمام الطلب لعدم كفاية رصيد المتجر'
        });
        alert(`رصيد المتجر الحالي (${currentUser.storeCredit} ج.م) غير كافٍ لسداد إجمالي الطلب (${orderData.total} ج.م)!`);
        return null;
      }

      // خصم قيمة الطلب من رصيد المستخدم
      const newCredit = currentUser.storeCredit - orderData.total;
      const updatedUser = { ...currentUser, storeCredit: newCredit };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
      dbService.upsertUser(updatedUser).catch(console.error);
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `#SEC-${randomSuffix}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      userId: currentUser?.id,
      couponCode: activeCoupon?.code,
      discountAmount: couponDiscount,
      status: 'pending',
      statusHistory: [
        { status: 'pending', timestamp: now, note: 'تم تسجيل الطلب وتوثيق الدفع بنجاح في SecureShop' }
      ],
      createdAt: now
    };

    // تسجيل استخدام الكوبون لمنع إعادة الاستخدام
    if (activeCoupon && currentUser) {
      const updatedCoupon = { ...activeCoupon, usedByUsers: [...activeCoupon.usedByUsers, currentUser.id] };
      setCoupons(prev => prev.map(c => c.id === activeCoupon.id ? updatedCoupon : c));
      dbService.upsertCoupon(updatedCoupon).catch(console.error);
    }

    setOrders(prev => [newOrder, ...prev]);
    dbService.upsertOrder(newOrder).catch(console.error);
    clearCart();

    // تقليل المخزون
    setProducts(prevProducts =>
      prevProducts.map(prod => {
        const itemOrdered = orderData.items.find(i => i.product.id === prod.id);
        if (itemOrdered) {
          const newStock = Math.max(0, prod.stock - itemOrdered.quantity);
          const updated = { ...prod, stock: newStock };
          dbService.upsertProduct(updated).catch(console.error);
          return updated;
        }
        return prod;
      })
    );

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id === orderId) {
          const updated = {
            ...order,
            status,
            statusHistory: [
              ...order.statusHistory,
              { status, timestamp: new Date().toISOString(), note }
            ]
          };
          dbService.upsertOrder(updated).catch(console.error);
          return updated;
        }
        return order;
      })
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
    dbService.deleteOrder(orderId).catch(console.error);
    return { success: true };
  };

  // استرجاع الطلب مع حماية IDOR
  const getOrderById = (orderId: string): { order?: Order; error?: string } => {
    const cleanId = orderId.trim().toUpperCase();
    const found = orders.find(o => o.id.toUpperCase() === cleanId || o.id.replace('#', '').toUpperCase() === cleanId);

    if (!found) {
      return { error: 'رقم الطلب غير موجود بالنظام' };
    }

    // فحص صلاحية الوصول (IDOR Protection)
    const accessCheck = validateOrderAccess(found, currentUser, securityMode);
    if (!accessCheck.allowed) {
      addSecurityLog({
        attackType: 'Insecure Direct Object Reference (IDOR)',
        payload: `Attempted access to order: ${orderId} by user: ${currentUser?.email || 'Anonymous'}`,
        blocked: true,
        details: accessCheck.reason || 'تم حجب محاولة وصول غير مصرح لبيانات عميل آخر'
      });
      return { error: accessCheck.reason };
    }

    return { order: found };
  };

  const getOrdersByPhone = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return orders.filter(o => o.customerPhone.replace(/\D/g, '').includes(cleanPhone));
  };

  // إحصائيات لوحة التحكم
  const adminKPIs: AdminKPIs = {
    totalSales: orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0),
    totalProfit: orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.estimatedProfit, 0),
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    confirmedOrders: orders.filter(o => o.status === 'confirmed').length,
    processingOrders: orders.filter(o => o.status === 'processing').length,
    shippedOrders: orders.filter(o => o.status === 'shipped').length,
    deliveredOrders: orders.filter(o => o.status === 'delivered').length,
    cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
    averageOrderValue: orders.length > 0 ? Math.round(orders.reduce((sum, o) => sum + o.total, 0) / orders.length) : 0,
    deliverySuccessRate: orders.length > 0
      ? Math.round((orders.filter(o => o.status === 'delivered').length / Math.max(1, orders.filter(o => o.status !== 'pending' && o.status !== 'confirmed').length)) * 100)
      : 0,
    totalProductsCount: products.length
  };

  const resetToDefaults = async () => {
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setCart([]);
    setUsers(INITIAL_USERS);
    setCurrentUser(null);
    setCurrentView('store');
    setCoupons(INITIAL_COUPONS);
    setActiveCoupon(null);
    setSecurityMode('secure');
    setSecurityLogs([]);
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    for (const p of INITIAL_PRODUCTS) await dbService.upsertProduct(p).catch(() => {});
    for (const u of INITIAL_USERS) await dbService.upsertUser(u).catch(() => {});
    for (const c of INITIAL_COUPONS) await dbService.upsertCoupon(c).catch(() => {});
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        selectedProduct,
        setSelectedProduct,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductActive,
        searchQuery,
        setSearchQuery,
        searchWarning,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
        cart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        wishlist,
        toggleWishlist,
        orders,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        getOrderById,
        getOrdersByPhone,
        isTrackingOpen,
        setIsTrackingOpen,
        trackingOrderId,
        setTrackingOrderId,
        users,
        currentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        isProfileOpen,
        setIsProfileOpen,
        login,
        registerUser,
        confirmAccount,
        logout,
        updateProfile,
        changePassword,
        addStoreCredit,
        updateUserRole,
        toggleUserStatus,
        updateUserCredit,
        deleteUser,
        toggleUserSecurityMode,
        coupons,
        activeCoupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        createCoupon,
        deleteCoupon,
        toggleCouponActive,
        subscribeNewsletter,
        hasClaimedNewsletter,
        securityMode,
        toggleSecurityMode,
        setSecurityMode,
        securityLogs,
        addSecurityLog,
        clearSecurityLogs,
        isSecurityModalOpen,
        setIsSecurityModalOpen,
        currentView,
        setCurrentView,
        isCheckoutOpen,
        setIsCheckoutOpen,
        openCheckoutWithSingleProduct,
        adminKPIs,
        resetToDefaults
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
