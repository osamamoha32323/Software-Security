import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  PlusCircle, 
  Store, 
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  Users,
  Tag,
  ShieldAlert,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { formatEGP } from '../../utils/formatters';
import { ProductManager } from './ProductManager';
import { OrderManager } from './OrderManager';
import { UserManager } from './UserManager';
import { CouponManager } from './CouponManager';

export const AdminDashboard: React.FC = () => {
  const { 
    adminKPIs, 
    setCurrentView, 
    resetToDefaults, 
    orders, 
    products, 
    currentUser, 
    securityMode,
    setIsAuthModalOpen,
    setAuthModalTab
  } = useStore();

  const [activeTab, setActiveTabState] = useState<'overview' | 'products' | 'orders' | 'users' | 'coupons'>(() => {
    const saved = localStorage.getItem('secureshop_admin_tab_v2');
    const validTabs = ['overview', 'products', 'orders', 'users', 'coupons'];
    if (saved && validTabs.includes(saved)) {
      return saved as any;
    }
    return 'overview';
  });

  const setActiveTab = (tab: 'overview' | 'products' | 'orders' | 'users' | 'coupons') => {
    setActiveTabState(tab);
    localStorage.setItem('secureshop_admin_tab_v2', tab);
  };
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // التحقق الأمني من صلاحيات المدير (RBAC Defense)
  const isAccessDenied = (securityMode === 'secure') && (!currentUser || currentUser.role !== 'admin');

  if (isAccessDenied) {
    return (
      <div className="admin-wrapper" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{
          maxWidth: '560px',
          width: '100%',
          background: '#ffffff',
          border: '2px solid #ef4444',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25)'
        }}>
          <div style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: '#fee2e2',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#b91c1c',
            marginBottom: '1.25rem'
          }}>
            <ShieldAlert size={42} />
          </div>

          <span className="badge badge-amber" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            403 Forbidden • Access Control Guard
          </span>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#991b1b', marginBottom: '0.75rem' }}>
            تم حجب الوصول: يتطلب حساب مدير النظام (Admin Only)
          </h2>

          <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            تم حجب محاولة الدخول إلى لوحة الإدارة! تطبيق SecureShop يفرض جدار حماية <strong>Role-Based Access Control (RBAC)</strong> لمنع ثغرات التصعيد الرأسي للصلاحيات (Vertical Privilege Escalation).
            حسابك الحالي: <strong>{currentUser ? `${currentUser.name} (${currentUser.role})` : 'زائر غير مسجل'}</strong>.
          </p>

          <div style={{
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.75rem',
            textAlign: 'right',
            fontSize: '0.8rem',
            color: '#334155'
          }}>
            <div style={{ fontWeight: 800, marginBottom: '4px', color: '#1e293b' }}>
              💡 لاختبار الدخول للمناقشة والتقييم:
            </div>
            <div>
              البريد: <code style={{ color: '#2563eb', fontWeight: 700 }}>admin@secureshop.edu</code> • كلمة المرور: <code style={{ color: '#2563eb', fontWeight: 700 }}>Admin@123456</code>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.5rem', fontWeight: 800 }}
              onClick={() => {
                setIsAuthModalOpen(true);
                setAuthModalTab('login');
              }}
            >
              تسجيل الدخول كمدير (Admin)
            </button>
            <button 
              className="btn btn-outline"
              style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}
              onClick={() => setCurrentView('store')}
            >
              الرجوع إلى المتجر
            </button>
          </div>
        </div>
      </div>
    );
  }

  // حساب معدل الربح الإجمالي
  const profitMarginRate = adminKPIs.totalSales > 0 
    ? Math.round((adminKPIs.totalProfit / adminKPIs.totalSales) * 100) 
    : 0;

  return (
    <div className="admin-wrapper">
      {/* هيدر لوحة الإدارة */}
      <header className="admin-header">
        <div className="container">
          <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div className="flex items-center gap-3">
              <div style={{ 
                width: '42px', 
                height: '42px', 
                borderRadius: 'var(--radius-md)', 
                background: 'linear-gradient(135deg, #2563eb, #38bdf8)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <ShoppingBag size={22} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.2 }}>
                  لوحة تحكم إدارة SecureShop 🛡️
                </h1>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  إدارة المستخدمين، المنتجات، الكوبونات، ومتابعة الطلبات والأمان
                </span>
              </div>
            </div>

            {/* أزرار الإجراء السريع والرجوع للمتجر */}
            <div className="flex items-center gap-2">
              <button
                className="btn btn-outline btn-sm"
                onClick={resetToDefaults}
                title="إعادة تعيين البيانات النموذجية"
                style={{ borderColor: '#334155', color: '#94a3b8' }}
              >
                <RotateCcw size={14} />
                <span>إعادة ضبط البيانات</span>
              </button>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => setCurrentView('store')}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                <Store size={15} />
                <span>الرجوع للمتجر</span>
              </button>
            </div>
          </div>

          {/* تبويبات لوحة التحكم */}
          <div style={{ marginTop: '1.25rem' }}>
            <div className="admin-nav-tabs">
              <button
                className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <TrendingUp size={16} />
                <span>نظرة عامة والتحليلات</span>
              </button>

              <button
                className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <Users size={16} />
                <span>إدارة المستخدمين والأدوار</span>
              </button>

              <button
                className={`admin-tab-btn ${activeTab === 'coupons' ? 'active' : ''}`}
                onClick={() => setActiveTab('coupons')}
              >
                <Tag size={16} />
                <span>إدارة الكوبونات والخصومات</span>
              </button>

              <button
                className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={16} />
                <span>إدارة الطلبات ({adminKPIs.totalOrders})</span>
                {adminKPIs.pendingOrders > 0 && (
                  <span style={{ 
                    background: '#ef4444', 
                    color: '#fff', 
                    fontSize: '0.65rem', 
                    padding: '0.1rem 0.45rem', 
                    borderRadius: '10px' 
                  }}>
                    {adminKPIs.pendingOrders} جديد
                  </span>
                )}
              </button>

              <button
                className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <ShoppingBag size={16} />
                <span>إدارة المنتجات ({adminKPIs.totalProductsCount})</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* محتوى التبويبات */}
      <main className="container" style={{ padding: '2rem 1rem' }}>
        {activeTab === 'overview' && (
          <div>
            {/* بطاقات الإحصائيات (KPIs) */}
            <div className="kpi-grid">
              {/* إجمالي المبيعات */}
              <div className="kpi-card">
                <div>
                  <div className="kpi-label">إجمالي حجم المبيعات</div>
                  <div className="kpi-value" style={{ color: 'var(--primary)' }}>
                    {formatEGP(adminKPIs.totalSales)}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                    معدل السلة: {formatEGP(adminKPIs.averageOrderValue)}
                  </span>
                </div>
                <div className="kpi-icon-box" style={{ background: '#eff6ff', color: 'var(--primary)' }}>
                  <DollarSign size={24} />
                </div>
              </div>

              {/* صافي الأرباح */}
              <div className="kpi-card">
                <div>
                  <div className="kpi-label">صافي الأرباح المتوقعة</div>
                  <div className="kpi-value" style={{ color: '#059669' }}>
                    {formatEGP(adminKPIs.totalProfit)}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                    هامش ربح تقديري: {profitMarginRate}%
                  </span>
                </div>
                <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
                  <TrendingUp size={24} />
                </div>
              </div>

              {/* إجمالي عدد الطلبات */}
              <div className="kpi-card">
                <div>
                  <div className="kpi-label">إجمالي الطلبات المسجلة</div>
                  <div className="kpi-value">
                    {adminKPIs.totalOrders}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                    {adminKPIs.deliveredOrders} تم تسليمه بنجاح
                  </span>
                </div>
                <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
                  <Package size={24} />
                </div>
              </div>

              {/* الطلبات بانتظار التأكيد */}
              <div className="kpi-card">
                <div>
                  <div className="kpi-label">طلبات بانتظار التأكيد</div>
                  <div className="kpi-value" style={{ color: '#d97706' }}>
                    {adminKPIs.pendingOrders}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#d97706' }}>
                    تحتاج اتصال بالعميل لتأكيد الشحن
                  </span>
                </div>
                <div className="kpi-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <Clock size={24} />
                </div>
              </div>
            </div>

            {/* ملخص أحدث الطلبات */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="admin-table-card" style={{ marginBottom: 0 }}>
                <div className="admin-table-header">
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>أحدث طلبات الزبائن</h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>أحدث 4 طلبات تم تسجيلها بالمتجر</span>
                  </div>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => setActiveTab('orders')}
                  >
                    <span>عرض كل الطلبات</span>
                    <ArrowUpRight size={15} />
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>الطلب</th>
                        <th>العميل</th>
                        <th>المحافظة</th>
                        <th>المبلغ</th>
                        <th>طريقة الدفع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 4).map(order => (
                        <tr key={order.id}>
                          <td><strong>{order.id}</strong></td>
                          <td>{order.customerName}</td>
                          <td>{order.governorate}</td>
                          <td><strong style={{ color: 'var(--primary)' }}>{formatEGP(order.total)}</strong></td>
                          <td>
                            <span className="badge badge-blue">
                              {order.paymentMethod === 'store_credit' ? 'رصيد المتجر' : 'كاش استلام'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* بطاقة معلومات الحماية وتوزيع الفريق */}
              <div style={{ 
                background: '#ffffff', 
                borderRadius: 'var(--radius-xl)', 
                border: '1px solid var(--border-color)', 
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={18} color="#2563eb" />
                  <span>حالة الدفاعات الأمنية • CET431 Project Phase 1</span>
                </h3>

                <ul style={{ paddingRight: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  <li>
                    <strong style={{ color: 'var(--text-main)' }}>إدارة المستخدمين (RBAC):</strong> حظر الوصول غير المصرح به للوحة التحكم وتأكيد الحسابات.
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-main)' }}>حماية الطلبات (IDOR):</strong> تشفير الوصول لبيانات الفواتير بحسب معرف المستخدم (User ID).
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-main)' }}>سلامة المعاملات المالية:</strong> حظر الكميات السالبة والتحقق من رصيد المتجر (Store Credit).
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-main)' }}>تأمين الكوبونات:</strong> التحقق من تواريخ الصلاحية ومنع إعادة الاستخدام المتكرر.
                  </li>
                </ul>

                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => setActiveTab('users')}
                  >
                    <Users size={15} />
                    <span>فحص المستخدمين</span>
                  </button>
                  <button 
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => setActiveTab('coupons')}
                  >
                    <Tag size={15} />
                    <span>فحص الكوبونات</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* تبويب إدارة المستخدمين */}
        {activeTab === 'users' && <UserManager />}

        {/* تبويب إدارة الكوبونات */}
        {activeTab === 'coupons' && <CouponManager />}

        {/* تبويب إدارة الطلبات */}
        {activeTab === 'orders' && <OrderManager />}

        {/* تبويب إدارة المنتجات */}
        {activeTab === 'products' && (
          <ProductManager 
            showAddModal={showAddProductModal} 
            setShowAddModal={setShowAddProductModal} 
          />
        )}
      </main>
    </div>
  );
};
