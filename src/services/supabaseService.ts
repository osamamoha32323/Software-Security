import { createClient } from '@supabase/supabase-js';
import { Product, Order } from '../types/ecommerce';
import { User } from '../types/auth';
import { Coupon } from '../types/coupon';
import { SecurityLog } from '../types/security';

const supabaseUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || 'https://nojbpgdtlrcdyxsvmluh.supabase.co';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || 'sb_publishable_g8qFBCfqxyza6W2p0aIIkg_PEyxfmdl';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==========================================
// Mappers: Database (snake_case) <-> Frontend (camelCase)
// ==========================================

export function mapProductFromDb(row: any): Product {
  return {
    id: row.id,
    title: row.title_en || row.title_ar,
    titleAr: row.title_ar,
    description: row.description_en || row.description_ar,
    descriptionAr: row.description_ar,
    category: row.category,
    categoryAr: row.category_ar,
    taagerPrice: Number(row.taager_price || 0),
    sellingPrice: Number(row.selling_price || 0),
    originalPrice: Number(row.original_price || 0),
    stock: Number(row.stock || 0),
    sku: row.sku || `SKU-${row.id}`,
    images: Array.isArray(row.images) ? row.images : [],
    features: Array.isArray(row.features) ? row.features : [],
    specifications: typeof row.specifications === 'object' && row.specifications !== null ? row.specifications : {},
    isFeatured: Boolean(row.is_featured),
    isDeal: Boolean(row.is_deal),
    dealBadge: row.deal_badge || undefined,
    rating: Number(row.rating || 5),
    reviewsCount: Number(row.reviews_count || 0),
    createdAt: row.created_at || new Date().toISOString(),
    isActive: row.is_active ?? true
  };
}

export function mapProductToDb(p: Product): any {
  return {
    id: p.id,
    title_ar: p.titleAr,
    title_en: p.title || null,
    description_ar: p.descriptionAr,
    description_en: p.description || null,
    category: p.category,
    category_ar: p.categoryAr,
    taager_price: p.taagerPrice,
    selling_price: p.sellingPrice,
    original_price: p.originalPrice,
    stock: p.stock,
    images: p.images || [],
    features: p.features || [],
    specifications: p.specifications || {},
    is_featured: !!p.isFeatured,
    is_deal: !!p.isDeal,
    deal_badge: p.dealBadge || null,
    rating: p.rating || 5,
    reviews_count: p.reviewsCount || 0,
    is_active: p.isActive ?? true,
    created_at: p.createdAt || new Date().toISOString()
  };
}

export function mapUserFromDb(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    salt: row.salt,
    role: row.role as 'admin' | 'user',
    isConfirmed: Boolean(row.is_confirmed),
    confirmationCode: row.confirmation_code || '',
    storeCredit: Number(row.store_credit || 0),
    phone: row.phone || undefined,
    city: row.city || undefined,
    address: row.address || undefined,
    governorate: row.governorate || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    failedAttempts: Number(row.failed_attempts || 0),
    isLocked: Boolean(row.is_locked),
    lockUntil: row.lock_until ? Number(row.lock_until) : undefined
  };
}

export function mapUserToDb(u: User): any {
  return {
    id: u.id,
    name: u.name,
    email: u.email.toLowerCase(),
    password_hash: u.passwordHash,
    salt: u.salt,
    role: u.role,
    is_confirmed: u.isConfirmed,
    confirmation_code: u.confirmationCode,
    store_credit: u.storeCredit || 0,
    phone: u.phone || null,
    city: u.city || null,
    address: u.address || null,
    governorate: u.governorate || null,
    failed_attempts: u.failedAttempts || 0,
    is_locked: !!u.isLocked,
    lock_until: u.lockUntil || null,
    created_at: u.createdAt || new Date().toISOString()
  };
}

export function mapCouponFromDb(row: any): Coupon {
  return {
    id: row.id,
    code: row.code,
    discountPercent: Number(row.discount_percent || 0),
    maxDiscount: Number(row.max_discount || 0),
    minOrderAmount: Number(row.min_order_amount || 0),
    expiryDate: row.expiry_date,
    usedByUsers: Array.isArray(row.used_by_users) ? row.used_by_users : [],
    isActive: Boolean(row.is_active),
    isSingleUsePerUser: Boolean(row.is_single_use_per_user),
    descriptionAr: row.description_ar || `خصم ${row.discount_percent}%`
  };
}

export function mapCouponToDb(c: Coupon): any {
  return {
    id: c.id,
    code: c.code,
    discount_percent: c.discountPercent,
    max_discount: c.maxDiscount || 0,
    min_order_amount: c.minOrderAmount,
    expiry_date: c.expiryDate,
    used_by_users: c.usedByUsers || [],
    is_active: c.isActive,
    is_single_use_per_user: c.isSingleUsePerUser,
    description_ar: c.descriptionAr
  };
}

export function mapOrderFromDb(row: any): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    governorate: row.governorate || row.governorate_ar || 'القاهرة',
    city: row.city,
    address: row.address,
    notes: row.notes || undefined,
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal || 0),
    shippingCost: Number(row.shipping_cost || 0),
    total: Number(row.total || row.total_amount || 0),
    totalTaagerCost: Number(row.total_taager_cost || row.taager_cost || 0),
    estimatedProfit: Number(row.estimated_profit || row.net_profit || 0),
    paymentMethod: row.payment_method,
    userId: row.user_id || undefined,
    couponCode: row.coupon_code || undefined,
    discountAmount: Number(row.discount_amount || row.coupon_discount || 0),
    status: row.status,
    statusHistory: Array.isArray(row.status_history || row.timeline) ? (row.status_history || row.timeline) : [],
    createdAt: row.created_at || new Date().toISOString()
  };
}

export function mapOrderToDb(o: Order): any {
  return {
    id: o.id,
    order_number: o.id,
    user_id: o.userId || null,
    customer_name: o.customerName,
    customer_phone: o.customerPhone,
    governorate_id: o.governorate || 'cairo',
    governorate_ar: o.governorate,
    city: o.city,
    address: o.address,
    notes: o.notes || null,
    items: o.items || [],
    subtotal: o.subtotal,
    shipping_cost: o.shippingCost,
    coupon_discount: o.discountAmount || 0,
    total_amount: o.total,
    taager_cost: o.totalTaagerCost || 0,
    net_profit: o.estimatedProfit || 0,
    status: o.status,
    payment_method: o.paymentMethod,
    timeline: o.statusHistory || [],
    created_at: o.createdAt || new Date().toISOString()
  };
}

// ==========================================
// Database Services
// ==========================================

export const dbService = {
  // المنتجات
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch products warning:', error);
      return [];
    }
    return (data || []).map(mapProductFromDb);
  },

  async upsertProduct(product: Product): Promise<void> {
    const row = mapProductToDb(product);
    await supabase.from('products').upsert(row);
  },

  async deleteProduct(id: string): Promise<void> {
    await supabase.from('products').delete().eq('id', id);
  },

  // المستخدمين
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetch users warning:', error);
      return [];
    }
    return (data || []).map(mapUserFromDb);
  },

  async upsertUser(user: User): Promise<void> {
    const row = mapUserToDb(user);
    await supabase.from('users').upsert(row);
  },

  // الكوبونات
  async getCoupons(): Promise<Coupon[]> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch coupons warning:', error);
      return [];
    }
    return (data || []).map(mapCouponFromDb);
  },

  async upsertCoupon(coupon: Coupon): Promise<void> {
    const row = mapCouponToDb(coupon);
    await supabase.from('coupons').upsert(row);
  },

  async deleteCoupon(id: string): Promise<void> {
    await supabase.from('coupons').delete().eq('id', id);
  },

  // الطلبات
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch orders warning:', error);
      return [];
    }
    return (data || []).map(mapOrderFromDb);
  },

  async upsertOrder(order: Order): Promise<void> {
    const row = mapOrderToDb(order);
    await supabase.from('orders').upsert(row);
  },

  // سجلات الأمان
  async logSecurityEvent(log: SecurityLog): Promise<void> {
    try {
      await supabase.from('security_logs').insert({
        id: log.id,
        attack_type: log.attackType,
        payload: log.payload,
        blocked: log.blocked,
        details: log.details,
        created_at: new Date().toISOString()
      });
    } catch (e) {
      // Non-blocking log
    }
  }
};
