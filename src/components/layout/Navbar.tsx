import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingBag,
  Search,
  Heart,
  Truck,
  LayoutDashboard,
  Store,
  X,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  User as UserIcon,
  Wallet,
  LogIn,
  Terminal,
  AlertTriangle
} from 'lucide-react';
import { formatEGP } from '../../utils/formatters';

export const Navbar: React.FC = () => {
  const {
    cartCount,
    cartSubtotal,
    setIsCartOpen,
    wishlist,
    searchQuery,
    setSearchQuery,
    searchWarning,
    currentView,
    setCurrentView,
    setIsTrackingOpen,
    currentUser,
    setIsAuthModalOpen,
    setAuthModalTab,
    setIsProfileOpen,
    securityMode,
    toggleSecurityMode,
    setIsSecurityModalOpen
  } = useStore();

  return (
    <header className="navbar">
      {/* الشريط الإعلاني العلوي مع أزرار التحكم الأمني - يظهر فقط لغير الأدمن */}
      {currentUser?.role !== 'admin' && (
        <div className="top-announcement" style={{
          background: securityMode === 'secure'
            ? 'linear-gradient(90deg, #1e3a8a, #0f172a)'
            : 'linear-gradient(90deg, #7f1d1d, #450a0a)',
          padding: '0.45rem 1rem'
        }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#f8fafc' }}>
              <span className="top-announcement-highlight" style={{
                background: securityMode === 'secure' ? '#16a34a' : '#dc2626',
                color: '#ffffff',
                borderRadius: 'var(--radius-sm)'
              }}>
                CET431 Security Lab
              </span>
              <span>
                نظام متجر إلكتروني آمن ومحمي ضد ثغرات XSS, SQLi, IDOR, Broken Auth & Privilege Escalation
              </span>
            </div>

            {/* أزرار التحكم في وضع الأمان وفتح المعمل */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={toggleSecurityMode}
                style={{
                  background: securityMode === 'secure' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                  border: securityMode === 'secure' ? '1px solid #22c55e' : '1px solid #ef4444',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
                title="انقر لتبديل وضع الأمان وإظهار نجاح/فشل الهجوم في المناقشة"
              >
                {securityMode === 'secure' ? <ShieldCheck size={13} color="#4ade80" /> : <ShieldAlert size={13} color="#f87171" />}
                <span>الوضع: {securityMode === 'secure' ? '🛡️ الآمن (SecureShop)' : '⚠️ الساذج (Naive Mode)'}</span>
              </button>

              <button
                onClick={() => setIsSecurityModalOpen(true)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#ffffff',
                  padding: '2px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Terminal size={12} />
                <span>معمل الأمان والمصفوفة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <div className="nav-content">
          {/* الشعار */}
          <div
            className="nav-brand"
            onClick={() => {
              setCurrentView('store');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="brand-icon-box" style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)' }}>
              <ShieldCheck size={24} strokeWidth={2.5} color="#ffffff" />
            </div>
            <div>
              <div className="brand-title">
                SecureShop
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800 }}>.edu</span>
              </div>
              <div className="brand-subtitle">متجر الكتروني آمن ومحصن</div>
            </div>
          </div>

          {/* شريط البحث (للشاشات المتوسطة والكبيرة) */}
          <div className="nav-search">
            <div className="search-input-wrapper">
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                className="search-input"
                placeholder="ابحث عن أجهزة ذكية، إضاءات، أدوات منزل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ color: 'var(--text-muted)', padding: '2px' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* تحذير فحص حقن الاستعلامات */}
            {searchWarning && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                left: 0,
                background: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #f87171',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.72rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '4px',
                zIndex: 10
              }}>
                <AlertTriangle size={14} />
                <span>{searchWarning}</span>
              </div>
            )}
          </div>

          {/* أزرار الإجراءات */}
          <div className="nav-actions">
            {/* زر تتبع الطلب - يظهر فقط للعملاء والزوار ولا يظهر للأدمن */}
            {currentUser?.role !== 'admin' && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setIsTrackingOpen(true)}
                title="تتبع شحنتك"
                style={{ gap: '0.35rem' }}
              >
                <Truck size={17} />
                <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>تتبع الطلب</span>
              </button>
            )}

            {/* رصيد المتجر وحساب المستخدم */}
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {/* شارة الأدمن (تظهر للأدمن بدلاً من الرصيد) */}
                {currentUser.role === 'admin' ? (
                  <span style={{
                    background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                    border: '1px solid #38bdf8',
                    color: '#38bdf8',
                    padding: '0.3rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 800
                  }}>
                    🛡️ مشرف النظام (Admin)
                  </span>
                ) : (
                  /* حبة رصيد المتجر للعميل العادي فقط */
                  <div
                    onClick={() => setIsProfileOpen(true)}
                    style={{
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1d4ed8',
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                    title="رصيدك المتاح للشراء في المتجر"
                  >
                    <Wallet size={14} />
                    <span>{formatEGP(currentUser.storeCredit)}</span>
                  </div>
                )}

                {/* زر الملف الشخصي */}
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsProfileOpen(true)}
                  style={{
                    borderRadius: 'var(--radius-full)',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    gap: '4px'
                  }}
                >
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: '#2563eb',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem'
                  }}>
                    {currentUser.name.charAt(0)}
                  </div>
                  <span style={{ maxWidth: '85px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser.name}
                  </span>
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setAuthModalTab('login');
                }}
                style={{
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.825rem',
                  fontWeight: 800,
                  gap: '6px',
                  padding: '0.45rem 1rem',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
                }}
              >
                <LogIn size={15} />
                <span>دخول / تسجيل حساب</span>
              </button>
            )}

            {/* زر سلة المشتريات - يظهر فقط للعملاء والزوار ولا يظهر للأدمن */}
            {currentUser?.role !== 'admin' && (
              <button
                className="btn btn-outline"
                onClick={() => setIsCartOpen(true)}
                style={{ position: 'relative', borderRadius: 'var(--radius-full)', padding: '0.45rem 0.95rem' }}
              >
                <ShoppingBag size={18} color="var(--primary)" />
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                  {cartCount > 0 ? formatEGP(cartSubtotal) : 'السلة'}
                </span>
                {cartCount > 0 && (
                  <span className="cart-badge">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* التبديل بين المتجر ولوحة الإدارة - يظهر حصرياً لحساب المدير فقط */}
            {currentUser?.role === 'admin' && (
              currentView === 'store' ? (
                <button
                  className="admin-mode-pill"
                  onClick={() => setCurrentView('admin')}
                  title="لوحة تحكم إدارة المتجر والمستخدمين"
                  style={{
                    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                    color: '#38bdf8'
                  }}
                >
                  <LayoutDashboard size={16} />
                  <span>لوحة الإدارة</span>
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setCurrentView('store')}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  <Store size={16} />
                  <span>الرجوع للمتجر</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* شريط البحث السريع للموبايل */}
      <div className="mobile-search-bar">
        <div className="search-input-wrapper">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="search-input"
            placeholder="ابحث عن منتجك المفضل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
