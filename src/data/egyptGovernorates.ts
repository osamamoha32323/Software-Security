import { Governorate } from '../types/ecommerce';

export const EGYPT_GOVERNORATES: Governorate[] = [
  { id: 'cairo', nameAr: 'القاهرة', nameEn: 'Cairo', shippingCost: 0, deliveryDays: 'خلال 24-48 ساعة' },
  { id: 'giza', nameAr: 'الجيزة', nameEn: 'Giza', shippingCost: 0, deliveryDays: 'خلال 24-48 ساعة' },
  { id: 'alexandria', nameAr: 'الإسكندرية', nameEn: 'Alexandria', shippingCost: 0, deliveryDays: 'خلال 2-3 أيام' },
  { id: 'qalyubia', nameAr: 'القليوبية', nameEn: 'Qalyubia', shippingCost: 0, deliveryDays: 'خلال 2-3 أيام' },
  { id: 'sharqia', nameAr: 'الشرقية', nameEn: 'Sharqia', shippingCost: 0, deliveryDays: 'خلال 2-3 أيام' },
  { id: 'daqahliya', nameAr: 'الدقهلية (المنصورة)', nameEn: 'Dakahlia', shippingCost: 0, deliveryDays: 'خلال 2-3 أيام' },
  { id: 'gharbia', nameAr: 'الغربية (طنطا)', nameEn: 'Gharbia', shippingCost: 0, deliveryDays: 'خلال 2-3 أيام' },
  { id: 'monufia', nameAr: 'المنوفية', nameEn: 'Monufia', shippingCost: 0, deliveryDays: 'خلال 2-3 أيام' },
  { id: 'beheira', nameAr: 'البحيرة (دمنهور)', nameEn: 'Beheira', shippingCost: 0, deliveryDays: 'خلال 2-3 أيام' },
  { id: 'kafr_el_sheikh', nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh', shippingCost: 0, deliveryDays: 'خلال 2-3 أيام' },
  { id: 'damietta', nameAr: 'دمياط', nameEn: 'Damietta', shippingCost: 0, deliveryDays: 'خلال 2-3 أيام' },
  { id: 'port_said', nameAr: 'بورسعيد', nameEn: 'Port Said', shippingCost: 0, deliveryDays: 'خلال 2-3 أيام' },
  { id: 'ismailia', nameAr: 'الإسماعيلية', nameEn: 'Ismailia', shippingCost: 0, deliveryDays: 'خلال 2-3 أيام' },
  { id: 'suez', nameAr: 'السويس', nameEn: 'Suez', shippingCost: 0, deliveryDays: 'خلال 2-3 أيام' },
  { id: 'fayoum', nameAr: 'الفيوم', nameEn: 'Fayoum', shippingCost: 0, deliveryDays: 'خلال 2-4 أيام' },
  { id: 'beni_suef', nameAr: 'بني سويف', nameEn: 'Beni Suef', shippingCost: 0, deliveryDays: 'خلال 3-4 أيام' },
  { id: 'minya', nameAr: 'المنيا', nameEn: 'Minya', shippingCost: 0, deliveryDays: 'خلال 3-4 أيام' },
  { id: 'assiut', nameAr: 'أسيوط', nameEn: 'Assiut', shippingCost: 0, deliveryDays: 'خلال 3-5 أيام' },
  { id: 'sohag', nameAr: 'سوهاج', nameEn: 'Sohag', shippingCost: 0, deliveryDays: 'خلال 3-5 أيام' },
  { id: 'qena', nameAr: 'قنا', nameEn: 'Qena', shippingCost: 0, deliveryDays: 'خلال 3-5 أيام' },
  { id: 'luxor', nameAr: 'الأقصر', nameEn: 'Luxor', shippingCost: 0, deliveryDays: 'خلال 3-5 أيام' },
  { id: 'aswan', nameAr: 'أسوان', nameEn: 'Aswan', shippingCost: 0, deliveryDays: 'خلال 3-5 أيام' },
  { id: 'red_sea', nameAr: 'البحر الأحمر (الغردقة)', nameEn: 'Red Sea', shippingCost: 0, deliveryDays: 'خلال 3-5 أيام' },
  { id: 'matrouh', nameAr: 'مطروح والساحل الشمالي', nameEn: 'Matrouh', shippingCost: 0, deliveryDays: 'خلال 3-5 أيام' },
];

export const STORE_CATEGORIES = [
  {
    id: 'all',
    nameAr: 'جميع الأقسام',
    nameEn: 'All Categories',
    icon: 'LayoutGrid',
    color: '#3b82f6',
    image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80',
    description: 'تصفح كافة المنتجات الرابحة والعروض الحصرية'
  },
  {
    id: 'gadgets',
    nameAr: 'أدوات ذكية وتريند',
    nameEn: 'Smart Gadgets',
    icon: 'Sparkles',
    color: '#8b5cf6',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
    description: 'أحدث الابتكارات الذكية التي تحل مشاكلك اليومية وتوفر وقتك'
  },
  {
    id: 'home',
    nameAr: 'المنزل والمطبخ',
    nameEn: 'Home & Kitchen',
    icon: 'Home',
    color: '#10b981',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    description: 'أجهزة وأدوات لتسهيل الطبخ والترتيب المنزلي العصري'
  },
  {
    id: 'electronics',
    nameAr: 'إلكترونيات وإكسسوارات',
    nameEn: 'Electronics',
    icon: 'Headphones',
    color: '#06b6d4',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    description: 'سماعات، شواحن، إكسسوارات موبايل وسيارات عالية الجودة'
  },
  {
    id: 'beauty',
    nameAr: 'العناية والصحة',
    nameEn: 'Health & Beauty',
    icon: 'HeartPulse',
    color: '#ec4899',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    description: 'أجهزة العناية الشخصية، ماكينات التزيين ومساج الاسترخاء'
  },
  {
    id: 'car',
    nameAr: 'إكسسوارات السيارات',
    nameEn: 'Car Accessories',
    icon: 'Car',
    color: '#f59e0b',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80',
    description: 'معدات تنظيف وأمان وتثبيت الهواتف للسيارات'
  }
];
