import { User } from '../types/auth';
import { Coupon } from '../types/coupon';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-01',
    name: 'المهندس المشرف (مدير النظام)',
    email: 'admin@secureshop.edu',
    // كلمة المرور الافتراضية: Admin@123456
    passwordHash: '2600fc73ca89dfbb3e70b75eb72a642306f6cb7072f2c218ae31c19addb4679b',
    salt: 'salt_secureshop_admin_2026',
    role: 'admin',
    isConfirmed: true,
    confirmationCode: '999999',
    storeCredit: 0,
    phone: '01000000001',
    city: 'القاهرة',
    address: 'جامعة السويدي التكنولوجية، فرع الهندسة',
    governorate: 'cairo',
    createdAt: '2026-10-01T08:00:00Z',
    failedAttempts: 0
  },
  {
    id: 'user-customer-01',
    name: 'أحمد علي (عميل متجر)',
    email: 'user@secureshop.edu',
    // كلمة المرور الافتراضية: User@123456
    passwordHash: '1563ab57508234cbc48fb37ab8df3843f5767c3c062a9804e971341cc9d42b37',
    salt: 'salt_secureshop_user_2026',
    role: 'user',
    isConfirmed: true,
    confirmationCode: '123456',
    storeCredit: 5000,
    phone: '01012345678',
    city: 'مدينة نصر',
    address: 'شارع عباس العقاد، مبنى 14',
    governorate: 'cairo',
    createdAt: '2026-10-15T10:00:00Z',
    failedAttempts: 0
  },
  {
    id: 'user-newbie-01',
    name: 'سارة خالد (حساب قيد التفعيل)',
    email: 'newbie@secureshop.edu',
    passwordHash: 'e6c273f5fed899b82a47f4f6e438c8c7f2129c5421fa7564d3068e42f9b87002',
    salt: 'salt_secureshop_new_2026',
    role: 'user',
    isConfirmed: false,
    confirmationCode: '789012',
    storeCredit: 1000,
    phone: '01123456789',
    city: 'المعادي',
    address: 'شارع النصر، دجلة',
    governorate: 'cairo',
    createdAt: '2026-11-01T14:00:00Z',
    failedAttempts: 0
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-welcome-15',
    code: 'WELCOME15',
    discountPercent: 15,
    maxDiscount: 200,
    minOrderAmount: 250,
    expiryDate: '2027-12-31T23:59:59Z',
    usedByUsers: [],
    isActive: true,
    isSingleUsePerUser: true,
    descriptionAr: 'كوبون الترحيب للمشتركين الجدد في النشرة البريدية (خصم 15% بحد أقصى 200 ج.م)'
  },
  {
    id: 'coup-secure-10',
    code: 'SECURE10',
    discountPercent: 10,
    maxDiscount: 150,
    minOrderAmount: 200,
    expiryDate: '2027-12-31T23:59:59Z',
    usedByUsers: [],
    isActive: true,
    isSingleUsePerUser: false,
    descriptionAr: 'كوبون أمان المتجر لجميع العملاء (خصم 10%)'
  },
  {
    id: 'coup-expired-50',
    code: 'EXPIRED50',
    discountPercent: 50,
    maxDiscount: 500,
    minOrderAmount: 100,
    expiryDate: '2025-01-01T00:00:00Z',
    usedByUsers: [],
    isActive: true,
    isSingleUsePerUser: true,
    descriptionAr: 'كوبون منتهي الصلاحية لاختبار فحص الصلاحية الزمني ومنع التلاعب'
  }
];
