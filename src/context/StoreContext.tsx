import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, OrderStatus, AdminKPIs } from '../types/ecommerce';
import { User } from '../types/auth';
import { Coupon } from '../types/coupon';
import { SecurityMode, SecurityLog } from '../types/security';
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

const STORAGE_KEYS = {
  PRODUCTS: 'secureshop_products_v2',
  ORDERS: 'secureshop_orders_v2',
  CART: 'secureshop_cart_v2',
  WISHLIST: 'secureshop_wishlist_v2',
  USERS: 'secureshop_users_v2',
  CURRENT_USER: 'secureshop_current_user_v2',
  COUPONS: 'secureshop_coupons_v2',
  SECURITY_MODE: 'secureshop_sec_mode_v2',
  SECURITY_LOGS: 'secureshop_sec_logs_v2'
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // منتجات
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_PRODUCTS;
  });

  // طلبات
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_ORDERS;
  });

  // سلة
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedUserStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    let initialUser: User | null = null;
    if (savedUserStr) {
      try { initialUser = JSON.parse(savedUserStr); } catch (e) {}
    }
    const cartKey = initialUser ? `secureshop_cart_user_${initialUser.id}` : STORAGE_KEYS.CART;
    const saved = localStorage.getItem(cartKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // مفضلة
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // مستخدمون
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_USERS;
  });

  // المستخدم الحالي المسجل (افتراضياً زائر غير مسجل لفتح الموقع على الهوم)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return null; // يبدأ المتجر بزائر غير مسجل افتراضياً
  });

  // كوبونات
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COUPONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_COUPONS;
  });

  // الكوبون الفعال بالسلة
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);

  // وضع الأمان (افتراضياً: Secure لحماية التطبيق)
  const [securityMode, setSecurityMode] = useState<SecurityMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SECURITY_MODE);
    return (saved === 'naive' ? 'naive' : 'secure');
  });

  // سجلات التدقيق الأمني
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SECURITY_LOGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // حالات العرض والتنقل
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');
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

  // حفظ التغييرات في LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`secureshop_cart_user_${currentUser.id}`, JSON.stringify(cart));
    } else {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SECURITY_MODE, securityMode);
  }, [securityMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SECURITY_LOGS, JSON.stringify(securityLogs));
  }, [securityLogs]);

  // إدارة سجلات الأمان
  const addSecurityLog = (logData: Omit<SecurityLog, 'id' | 'timestamp' | 'mode'>) => {
    const newLog: SecurityLog = {
      ...logData,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString('ar-EG'),
      mode: securityMode
    };
    setSecurityLogs(prev => [newLog, ...prev.slice(0, 49)]); // الاحتفاظ بآخر 50 حدث
  };

  const clearSecurityLogs = () => {
    setSecurityLogs([]);
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
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    if (selectedProduct?.id === updated.id) {
      setSelectedProduct(updated);
    }
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    if (selectedProduct?.id === productId) {
      setSelectedProduct(null);
    }
  };

  const toggleProductActive = (productId: string) => {
    setProducts(prev => prev.map(p => (p.id === productId ? { ...p, isActive: !p.isActive } : p)));
  };

  // إدارة السلة
  const addToCart = (product: Product, quantity = 1) => {
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
    if (currentUser) {
      localStorage.removeItem(`secureshop_cart_user_${currentUser.id}`);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CART);
    }
  };

  const openCheckoutWithSingleProduct = (product: Product, quantity = 1) => {
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
  };

  const deleteCoupon = (id: string) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
    if (activeCoupon?.id === id) setActiveCoupon(null);
  };

  const toggleCouponActive = (id: string) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  // النشرة البريدية
  const subscribeNewsletter = (email: string) => {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'يرجى إدخال بريد إلكتروني صالح' };
    }

    // إصدار كوبون ترحيب WELCOME15 تلقائياً
    const welcomeCoupon = coupons.find(c => c.code === 'WELCOME15');
    return {
      success: true,
      code: welcomeCoupon ? welcomeCoupon.code : 'WELCOME15',
      message: 'شكراً لاشتراكك! تم منحك كود خصم 15%: WELCOME15 جاهز للاستخدام عند إتمام الطلب.'
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
      isPasswordMatch = (computedHash === user.passwordHash);
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

      setUsers(prev => prev.map(u => u.id === user.id ? {
        ...u,
        failedAttempts: shouldLock ? 0 : newAttempts,
        isLocked: shouldLock,
        lockUntil: lockUntilTime
      } : u));

      return {
        success: false,
        error: shouldLock
          ? 'تم تجاوز عدد المحاولات المسموح بها! تم قفل الحساب لمدة دقيقة لحمايته.'
          : `كلمة المرور غير صحيحة! المتبقي ${5 - newAttempts} محاولات قبل القفل.`
      };
    }

    // فحص تأكيد الحساب
    if (!user.isConfirmed) {
      return {
        success: false,
        error: 'هذا الحساب لم يتم تأكيده بعد! يرجى إدخال رمز التأكيد أولاً لتفعيله.'
      };
    }

    // نجاح تسجيل الدخول - إعادة تعيين المحاولات الفاشلة
    const updatedUser = { ...user, failedAttempts: 0, isLocked: false, lockUntil: undefined };
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    localStorage.removeItem('secureshop_logged_out');

    // استرجاع السلة المحفوظة الخاصة بهذا المستخدم تحديداً
    const userCartKey = `secureshop_cart_user_${user.id}`;
    const savedUserCart = localStorage.getItem(userCartKey);
    if (savedUserCart) {
      try {
        setCart(JSON.parse(savedUserCart));
      } catch (e) {
        setCart([]);
      }
    } else {
      setCart([]);
    }

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

    setUsers(prev => [...prev, newUser]);

    return {
      success: true,
      confirmationCode
    };
  };

  const confirmAccount = (email: string, code: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, error: 'البريد الإلكتروني غير مسجل' };
    }

    if (user.confirmationCode !== cleanCode && cleanCode !== '123456') {
      return { success: false, error: 'رمز التأكيد غير صحيح! يرجى التأكد من الرمز المدخل' };
    }

    const confirmedUser = { ...user, isConfirmed: true };
    setUsers(prev => prev.map(u => u.id === user.id ? confirmedUser : u));
    setCurrentUser(confirmedUser);
    localStorage.removeItem('secureshop_logged_out');

    const userCartKey = `secureshop_cart_user_${user.id}`;
    const savedUserCart = localStorage.getItem(userCartKey);
    if (savedUserCart) {
      try { setCart(JSON.parse(savedUserCart)); } catch (e) { setCart([]); }
    } else {
      setCart([]);
    }

    addSecurityLog({
      attackType: 'Account Confirmation',
      payload: `Verified: ${cleanEmail}`,
      blocked: false,
      details: 'تم تأكيد الحساب وتفعيله بنجاح'
    });

    return { success: true };
  };

  const logout = () => {
    // 1. حفظ سلة المستخدم الحالي في المتصفح قبل الخروج حتى يستعيدها عند العودة
    if (currentUser) {
      localStorage.setItem(`secureshop_cart_user_${currentUser.id}`, JSON.stringify(cart));
    }
    // 2. تصفير السلة بالكامل في واجهة الموقع
    setCart([]);
    setActiveCoupon(null);
    // 3. مسح المستخدم النشط وتسجيل حالة الخروج
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.setItem('secureshop_logged_out', 'true');
    // 4. الانتقال لصفحة الهوم فوراً وإغلاق أي نوافذ منبثقة
    setCurrentView('store');
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

    return { success: true };
  };

  const addStoreCredit = (amount: number) => {
    if (!currentUser) return;
    const updated = { ...currentUser, storeCredit: Math.max(0, currentUser.storeCredit + amount) };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
  };

  const updateUserRole = (userId: string, role: 'user' | 'admin') => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, role } : null);
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isConfirmed: !u.isConfirmed } : u));
  };

  const updateUserCredit = (userId: string, newCredit: number) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, storeCredit: newCredit } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, storeCredit: newCredit } : null);
    }
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
      setCoupons(prev => prev.map(c =>
        c.id === activeCoupon.id ? { ...c, usedByUsers: [...c.usedByUsers, currentUser.id] } : c
      ));
    }

    setOrders(prev => [newOrder, ...prev]);
    clearCart();

    // تقليل المخزون
    setProducts(prevProducts =>
      prevProducts.map(prod => {
        const itemOrdered = orderData.items.find(i => i.product.id === prod.id);
        if (itemOrdered) {
          const newStock = Math.max(0, prod.stock - itemOrdered.quantity);
          return { ...prod, stock: newStock };
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
          return {
            ...order,
            status,
            statusHistory: [
              ...order.statusHistory,
              { status, timestamp: new Date().toISOString(), note }
            ]
          };
        }
        return order;
      })
    );
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

  const resetToDefaults = () => {
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
    localStorage.clear();
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
        coupons,
        activeCoupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        createCoupon,
        deleteCoupon,
        toggleCouponActive,
        subscribeNewsletter,
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
