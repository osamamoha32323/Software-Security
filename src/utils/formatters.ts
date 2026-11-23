// تنسيق العملة بالجنيه المصري
export const formatEGP = (amount: number): string => {
  return `${Math.round(amount).toLocaleString('ar-EG')} ج.م`;
};

// تنسيق التاريخ والوقت العربي
export const formatArabicDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  } catch {
    return dateString;
  }
};

// إنشاء رابط محادثة واتساب احترافي ومخصص لخدمة العملاء أو تأكيد الطلب
export const createWhatsAppOrderLink = (phone: string, orderId: string, customerName: string, total: number, itemsSummary: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  const egyptianPhone = cleanPhone.startsWith('20') ? cleanPhone : (cleanPhone.startsWith('0') ? `20${cleanPhone.slice(1)}` : `20${cleanPhone}`);
  
  const text = encodeURIComponent(
    `أهلاً يا أستاذ/ة ${customerName} 👋\n\n` +
    `شكراً لطلبك من متجر *دكان* 🛍️\n` +
    `📦 *رقم الطلب:* ${orderId}\n` +
    `📋 *المنتجات:* ${itemsSummary}\n` +
    `💰 *الإجمالي شامل الشحن:* ${total} ج.م (الدفع عند الاستلام)\n\n` +
    `من فضلك أكّد لنا أن العنوان ورقم الهاتف صحيح لتجهيز شحنتك فوراً! 🚚✨`
  );

  return `https://wa.me/${egyptianPhone}?text=${text}`;
};

// حساب نسبة الخصم
export const calculateDiscountPercentage = (originalPrice: number, sellingPrice: number): number => {
  if (!originalPrice || originalPrice <= sellingPrice) return 0;
  return Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
};

// حساب نسبة هامش الربح
export const calculateProfitMargin = (taagerPrice: number, sellingPrice: number): { profit: number; marginPercent: number } => {
  const profit = sellingPrice - taagerPrice;
  const marginPercent = sellingPrice > 0 ? Math.round((profit / sellingPrice) * 100) : 0;
  return { profit, marginPercent };
};

// ترجمة حالات الطلب إلى العربية مع شارات الألوان
export const getOrderStatusInfo = (status: string): { labelAr: string; color: string; bg: string; icon: string; badgeClass: string } => {
  switch (status) {
    case 'pending':
      return { labelAr: 'قيد المراجعة', color: '#d97706', bg: '#fef3c7', icon: 'Clock', badgeClass: 'badge-amber' };
    case 'confirmed':
      return { labelAr: 'تم التأكيد', color: '#2563eb', bg: '#dbeafe', icon: 'CheckCircle2', badgeClass: 'badge-blue' };
    case 'processing':
      return { labelAr: 'قيد التجهيز', color: '#7c3aed', bg: '#ede9fe', icon: 'Package', badgeClass: 'badge-purple' };
    case 'shipped':
      return { labelAr: 'تم الشحن مع المندوب', color: '#0284c7', bg: '#e0f2fe', icon: 'Truck', badgeClass: 'badge-blue' };
    case 'delivered':
      return { labelAr: 'تم التسليم بنجاح', color: '#059669', bg: '#d1fae5', icon: 'CheckCheck', badgeClass: 'badge-emerald' };
    case 'cancelled':
      return { labelAr: 'تم الإلغاء', color: '#dc2626', bg: '#fee2e2', icon: 'XCircle', badgeClass: 'badge-rose' };
    default:
      return { labelAr: status, color: '#64748b', bg: '#f1f5f9', icon: 'HelpCircle', badgeClass: 'badge-slate' };
  }
};
