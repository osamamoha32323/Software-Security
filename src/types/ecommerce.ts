export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Product {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  categoryAr: string;
  taagerPrice: number;       // سعر التكلفة من منصة تاجر بالجنيه
  sellingPrice: number;      // سعر البيع المعروض للعميل بالجنيه
  originalPrice: number;     // السعر القديم قبل الخصم (للعروض والإلحاح)
  stock: number;             // المخزون المتوفر
  sku: string;               // كود المنتج في تاجر
  images: string[];          // روابط الصور
  rating: number;            // التقييم من 5
  reviewsCount: number;      // عدد التقييمات
  features: string[];        // مميزات المنتج وحلوله
  specifications?: Record<string, string>; // مواصفات تفصيلية
  videoUrl?: string;         // فيديو توضيحي (تيك توك / ريلز)
  isFeatured?: boolean;      // منتج مميز
  isDeal?: boolean;          // عرض اليوم
  dealBadge?: string;        // شارة مثل (خصم 40% - الأكثر طلباً)
  createdAt: string;
  isActive: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;             // سعر البيع وقت الطلب
  taagerCost: number;        // تكلفة تاجر وقت الطلب
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;                // مثل #DK-1001
  customerName: string;
  customerPhone: string;
  governorate: string;       // المحافظة
  city: string;              // المدينة أو المنطقة
  address: string;           // العنوان بالتفصيل
  notes?: string;            // ملاحظات التوصيل
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  totalTaagerCost: number;   // إجمالي تكلفة تاجر للطلب
  estimatedProfit: number;   // صافي الربح المتوقع = (subtotal - totalTaagerCost)
  paymentMethod: 'cod' | 'instapay' | 'vodafone_cash' | 'store_credit';
  userId?: string;           // معرف المستخدم صاحب الطلب (لمنع IDOR)
  couponCode?: string;       // كود الخصم المستخدم
  discountAmount?: number;   // قيمة الخصم المالي المطبق
  status: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  createdAt: string;
}

export interface Governorate {
  id: string;
  nameAr: string;
  nameEn: string;
  shippingCost: number;
  deliveryDays: string;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  color: string;
  image: string;
  description: string;
}

export interface AdminKPIs {
  totalSales: number;
  totalProfit: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  deliverySuccessRate: number;
  totalProductsCount: number;
}
