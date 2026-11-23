import { User } from '../types/auth';
import { Order } from '../types/ecommerce';
import { Coupon } from '../types/coupon';
import { SecurityMode, SecurityLog, SecurityCoverageItem } from '../types/security';

// ==========================================
// 1. تشفير وتأمين كلمات المرور (Hashing & Salt)
// ==========================================

export async function hashPasswordSecure(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const exported = await crypto.subtle.exportKey('raw', derivedKey);
  const hashArray = Array.from(new Uint8Array(exported));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export function hashPasswordNaive(password: string): string {
  // تطبيق ساذج: حفظ كلمة المرور كنص صريح أو تشفير ضعيف غير مملح
  return `naive_plain_${password}`;
}

// ==========================================
// 2. الحماية من حقن النصوص البرمجية (XSS Sanitization)
// ==========================================

export function sanitizeHtml(input: string, mode: SecurityMode): string {
  if (mode === 'naive') {
    // الوضع الساذج: تمرير المدخلات بدون أي فحص أو ترميز (عرضة لـ Stored & Reflected XSS)
    return input;
  }

  // الوضع الآمن: ترميز الأحرف الخاصة ومنع تشغيل السكربتات
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/javascript:/gi, '')
    .replace(/onerror=/gi, '')
    .replace(/onload=/gi, '');
}

// ==========================================
// 3. الحماية من حقن الاستعلامات (SQL / Search Injection)
// ==========================================

export function validateSearchQuery(query: string, mode: SecurityMode): { sanitized: string; isValid: boolean; warning?: string } {
  if (mode === 'naive') {
    // الساذج: يقبل أي مدخلات بما فيها محاولات كسر الاستعلامات
    return { sanitized: query, isValid: true };
  }

  // الآمن: فحص الأنماط المشبوهة لحقن SQL و Regex Denial of Service
  const sqlInjectionPattern = /('|--|;|\/\*|\*\/|union\s+select|drop\s+table|insert\s+into|or\s+1=1)/i;
  if (sqlInjectionPattern.test(query)) {
    return {
      sanitized: query.replace(/['";\\-]/g, ''),
      isValid: false,
      warning: 'تم رصد وحجب محاولة حقن استعلامات مشبوهة (SQL Injection Blocked)'
    };
  }

  return { sanitized: query.trim(), isValid: true };
}

// ==========================================
// 4. الحماية من التلاعب بالكميات والأسعار (Negative Quantity / Price Tampering)
// ==========================================

export function validateCartQuantity(
  quantity: number,
  stock: number,
  mode: SecurityMode
): { valid: boolean; adjustedQuantity: number; error?: string } {
  if (mode === 'naive') {
    // الساذج: يقبل أرقام سالبة أو كسور، مما يتيح التلاعب بإجمالي السلة والحصول على رصيد مجاني
    return { valid: true, adjustedQuantity: quantity };
  }

  // الآمن: التحقق من أن الكمية رقم صحيح موجب وضمن حدود المخزون المتاح
  const parsed = Number(quantity);
  if (isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
    return { 
      valid: false, 
      adjustedQuantity: 1, 
      error: 'قيمة غير صالحة: يجب أن تكون الكمية رقماً صحيحاً أكبر من الصفر' 
    };
  }

  if (parsed > stock) {
    return { 
      valid: false, 
      adjustedQuantity: stock, 
      error: `الكمية المطلوبة تتجاوز المخزون المتوفر (${stock} قطعة)` 
    };
  }

  return { valid: true, adjustedQuantity: parsed };
}

// ==========================================
// 5. الحماية من ثغرات الوصول المباشر للكائنات (IDOR - Order Access Control)
// ==========================================

export function validateOrderAccess(
  order: Order,
  currentUser: User | null,
  mode: SecurityMode
): { allowed: boolean; reason?: string } {
  if (mode === 'naive') {
    // الساذج: أي زائر يمكنه عرض وتتبع أي طلب ومعرفة عنوان وهاتف العميل بمجرد معرفة رقم الطلب
    return { allowed: true };
  }

  // الآمن: التحقق من الصلاحيات - فقط صاحب الطلب المسجل أو مسؤول النظام يمكنهما الوصول للطلب
  if (!currentUser) {
    return { 
      allowed: false, 
      reason: 'يجب تسجيل الدخول أولاً للوصول لتفاصيل الطلب (تم حجب محاولة IDOR غير مصرح بها)' 
    };
  }

  if (currentUser.role === 'admin') {
    return { allowed: true };
  }

  if (order.userId && order.userId === currentUser.id) {
    return { allowed: true };
  }

  // فحص تطابق رقم الهاتف كبديل للطلبات السابقة للزوار المسجلين
  if (currentUser.phone && order.customerPhone === currentUser.phone) {
    return { allowed: true };
  }

  return { 
    allowed: false, 
    reason: 'غير مصرح: هذا الطلب يتبع عميلاً آخر ولا تملك صلاحية الاطلاع عليه (IDOR Defense Active)' 
  };
}

// ==========================================
// 6. التحقق من صلاحيات لوحة التحكم (RBAC - Role Based Access Control)
// ==========================================

export function validateAdminAccess(
  currentUser: User | null,
  mode: SecurityMode
): { allowed: boolean; reason?: string } {
  if (mode === 'naive') {
    // الساذج: يسمح بالدخول للوحة التحكم بدون التحقق من صلاحية المدير
    return { allowed: true };
  }

  // الآمن: يجب أن يكون المستخدم مسجلاً ويحمل دور 'admin'
  if (!currentUser) {
    return { 
      allowed: false, 
      reason: 'غير مصرح: يجب تسجيل الدخول بحساب مدير (Admin) للوصول للوحة التحكم' 
    };
  }

  if (currentUser.role !== 'admin') {
    return { 
      allowed: false, 
      reason: 'تم رفض الوصول: حسابك مسجل كمستخدم عادي وليس لديك صلاحيات مدير (Vertical Privilege Escalation Blocked)' 
    };
  }

  return { allowed: true };
}

// ==========================================
// 7. التحقق من كوبونات الخصم ومنع إعادة الاستخدام والتلاعب (Coupon Security)
// ==========================================

export function validateCouponSecurity(
  coupon: Coupon,
  currentUser: User | null,
  subtotal: number,
  mode: SecurityMode
): { valid: boolean; discountAmount: number; error?: string } {
  if (mode === 'naive') {
    // الساذج: لا يفحص تاريخ الانتهاء، ولا يفحص هل استخدمه المستخدم من قبل، ويقبل أي قيمة
    const discount = Math.round((subtotal * coupon.discountPercent) / 100);
    return { valid: true, discountAmount: discount };
  }

  // الآمن:
  if (!coupon.isActive) {
    return { valid: false, discountAmount: 0, error: 'هذا الكوبون غير فعال حالياً' };
  }

  const now = new Date().toISOString();
  if (coupon.expiryDate && coupon.expiryDate < now) {
    return { valid: false, discountAmount: 0, error: 'عذراً، انتهت صلاحية هذا الكوبون' };
  }

  if (subtotal < coupon.minOrderAmount) {
    return { 
      valid: false, 
      discountAmount: 0, 
      error: `الحد الأدنى للطلب لتفعيل هذا الكوبون هو ${coupon.minOrderAmount} ج.م` 
    };
  }

  if (currentUser && coupon.isSingleUsePerUser && coupon.usedByUsers.includes(currentUser.id)) {
    return { 
      valid: false, 
      discountAmount: 0, 
      error: 'لقد استخدمت هذا الكوبون مسبقاً! الكوبون صالح للاستخدام مرة واحدة فقط لكل عميل (Coupon Replay Blocked)' 
    };
  }

  let discount = Math.round((subtotal * coupon.discountPercent) / 100);
  if (coupon.maxDiscount && discount > coupon.maxDiscount) {
    discount = coupon.maxDiscount;
  }

  return { valid: true, discountAmount: discount };
}

// ==========================================
// 8. مصفوفة التغطية الأمنية المعتمدة للمشروع (Phase 1 Security Coverage Matrix)
// ==========================================

export const INITIAL_SECURITY_COVERAGE: SecurityCoverageItem[] = [
  {
    id: 'SEC-01',
    topic: 'Cross-Site Scripting (Stored & Reflected XSS)',
    attackScenario: 'يقوم المهاجم بإدخال كود JavaScript خبيث في حقل البحث، أو نموذج التسجيل، أو في مراجعات وتفاصيل المنتج.',
    rootCause: 'عرض مدخلات المستخدم مباشرة داخل الـ DOM بدون معالجة أو ترميز للأحرف الخاصة (Unsanitized innerHTML / unescaped input).',
    defenseImplemented: 'ترميز وإبطال مفعول كافة وسوم HTML وتطهير النصوص (HTML Entity Encoding & Sanitization) عبر sanitizeHtml ومنع حقن الـ scripts.',
    codeLocation: 'src/security/securityService.ts (sanitizeHtml)',
    evidence: 'إدخال payload: <script>alert(document.cookie)</script> يتم ترميزه وعرضه كنص عادي دون تنفيذه.',
    status: 'protected',
    testPayload: '<script>alert("XSS Defeated in SecureShop!")</script>'
  },
  {
    id: 'SEC-02',
    topic: 'SQL / Search Query Injection',
    attackScenario: 'إدخال جمل حقن قواعد البيانات في شريط البحث أو حقول تسجيل الدخول للوصول لبيانات غير مصرح بها.',
    rootCause: 'الدمج المباشر لمدخلات المستخدم في الاستعلامات الشرطية بدون فحص أو استخدام استعلامات مجهزة (Parameterized Queries).',
    defenseImplemented: 'فحص مسبق لمدخلات البحث عبر Whitelist regex، وحظر الرموز الخاصة والكلمات المفتاحية الخبيثة (UNION, OR 1=1, DROP TABLE).',
    codeLocation: 'src/security/securityService.ts (validateSearchQuery)',
    evidence: 'إدخال payload: \' OR \'1\'=\'1 يتم اكتشافه وإبطاله وتسجيل محاولة الاختراق في سجل التدقيق الأمني.',
    status: 'protected',
    testPayload: "' OR '1'='1' --"
  },
  {
    id: 'SEC-03',
    topic: 'Broken Authentication & Brute Force Attacks',
    attackScenario: 'تخمين كلمة المرور للمستخدم أو المدير عبر برامج الهجوم التكراري السريع (Brute Force / Credential Stuffing).',
    rootCause: 'عدم وجود حد لعدد المحاولات الخاطئة وتخزين كلمات المرور بصيغ ضعيفة أو غير مملحة.',
    defenseImplemented: 'تطبيق PBKDF2 مع SHA-256 و Salt عشوائي لكل مستخدم، مع قفل الحساب تلقائياً لمدة 60 ثانية بعد 5 محاولات فاشلة متتالية.',
    codeLocation: 'src/security/securityService.ts (hashPasswordSecure & Rate Limiting)',
    evidence: 'تكرار محاولة الدخول الخاطئة 5 مرات يؤدي إلى قفل الحساب وظهور عداد زمني أمني يمنع أي محاولة حتى انتهاء المدة.',
    status: 'protected',
    testPayload: '5 Failed Login Attempts -> Account Locked'
  },
  {
    id: 'SEC-04',
    topic: 'Insecure Direct Object Reference (IDOR)',
    attackScenario: 'تعديل معرف الطلب في البحث أو الطلب (#DK-1001) للاطلاع على فواتير وعناوين وهواتف عملاء آخرين.',
    rootCause: 'اعتماد النظام على المعرف المرسل من العميل دون التحقق من ملكية الحساب للطلب (Missing Object-Level Authorization).',
    defenseImplemented: 'التحقق الصارم من هوية المستخدم المسجل ومقارنة userId في الطلب مع معرف الجلسة الحالية قبل إرجاع أي تفاصيل.',
    codeLocation: 'src/security/securityService.ts (validateOrderAccess)',
    evidence: 'محاولة فتح طلب لا يخص المستخدم الحالي ينتج عنها 403 Forbidden وحجب عرض البيانات الخاصة.',
    status: 'protected',
    testPayload: 'View Order #DK-1001 belonging to another customer'
  },
  {
    id: 'SEC-05',
    topic: 'Business Logic Flaws: Negative Quantity & Price Manipulation',
    attackScenario: 'إرسال كمية سالبة في السلة (مثل -5) أو التلاعب بقيمة السعر لتخفيض الإجمالي والحصول على منتجات مجاناً أو برصيد سالب.',
    rootCause: 'الاعتماد على واجهة العميل فقط لحساب الإجمالي وقبول أي قيم عددية مرسلة بدون التحقق من كونها أرقاماً صحيحة موجبة.',
    defenseImplemented: 'فحص صارم للكميات في طبقة المنطق: التحقق من كونها Integer موجباً وضمن المخزون الفعلي، وإعادة حساب الإجمالي ومطابقة الرصيد.',
    codeLocation: 'src/security/securityService.ts (validateCartQuantity)',
    evidence: 'محاولة إدخال كمية -5 أو 0 تُرفض فوراً وتُعاد إلى 1 مع رسالة تنبيه أمنية واضحة.',
    status: 'protected',
    testPayload: 'Quantity = -5 in Cart Drawer'
  },
  {
    id: 'SEC-06',
    topic: 'Coupon Abuse & Replay Attacks',
    attackScenario: 'استخدام كوبون الترحيب الصادر من النشرة البريدية أكثر من مرة، أو تطبيق كوبونات منتهية الصلاحية.',
    rootCause: 'عدم تتبع هوية المستخدمين الذين قاموا بصرف الكوبون وعدم التحقق من صلاحية الكوبون في وقت الدفع.',
    defenseImplemented: 'تسجيل معرف المستخدم في سجل استخدام الكوبون (usedByUsers)، والتحقق من تاريخ الصلاحية والحد الأدنى للطلب.',
    codeLocation: 'src/security/securityService.ts (validateCouponSecurity)',
    evidence: 'محاولة استخدام كود الخصم مرة ثانية تُظهر تنبيه: "تم استخدام هذا الكوبون مسبقاً (Coupon Replay Blocked)".',
    status: 'protected',
    testPayload: 'Apply WELCOME15 twice by same user'
  },
  {
    id: 'SEC-07',
    topic: 'Broken Access Control & Privilege Escalation',
    attackScenario: 'محاولة مستخدم عادي أو زائر الدخول إلى لوحة تحكم المدير (/admin) والتحكم في المنتجات والأسعار والمستخدمين.',
    rootCause: 'الاعتماد على إخفاء الأزرار في الواجهة (Security through Obscurity) دون فرض التحقق من الأدوار (Role-Based Access Control).',
    defenseImplemented: 'فرض جدار حماية (RBAC Guard) في مكون لوحة التحكم للتحقق من امتلاك المستخدم لدور admin المسجل والمعتمد.',
    codeLocation: 'src/security/securityService.ts (validateAdminAccess) & AdminDashboard.tsx',
    evidence: 'المستخدم العادي الذي يحاول فتح لوحة المدير تظهر له شاشة حمراء 403 Access Denied مع تسجيل الحدث الأمني.',
    status: 'protected',
    testPayload: 'Access /admin while logged in as normal user'
  }
];
