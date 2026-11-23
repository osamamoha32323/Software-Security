import React from 'react';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Headphones, 
  PhoneCall, 
  HeartHandshake
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { setCurrentView, setIsTrackingOpen, currentUser } = useStore();

  return (
    <footer style={{ background: '#0f172a', color: '#f8fafc', marginTop: '4rem', borderTop: '1px solid #1e293b' }}>
      {/* شريط مميزات الثقة والضمانات */}
      <div style={{ borderBottom: '1px solid #1e293b', padding: '2rem 0' }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '1.5rem' 
          }}>
            <div className="flex items-center gap-3">
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: 'var(--radius-md)', 
                background: 'rgba(5, 150, 105, 0.15)', 
                color: '#10b981', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>الدفع عند الاستلام</h4>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>عاين منتجك وتأكد منه قبل دفع أي مليم</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: 'var(--radius-md)', 
                background: 'rgba(37, 99, 235, 0.15)', 
                color: '#38bdf8', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Truck size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>شحن لجميع المحافظات</h4>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>توصيل سريع لباب بيتك أينما كنت في مصر</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: 'var(--radius-md)', 
                background: 'rgba(245, 158, 11, 0.15)', 
                color: '#fbbf24', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <RefreshCw size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>ضمان استبدال 14 يوم</h4>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>استبدال فوري للمنتج في حال وجود أي عيب</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: 'var(--radius-md)', 
                background: 'rgba(139, 92, 246, 0.15)', 
                color: '#c084fc', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Headphones size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>دعم عبر واتساب</h4>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>فريق مبيعات ودعم فني متاح لخدمتك</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* الروابط الأساسية والمعلومات */}
      <div className="container" style={{ padding: '3rem 1rem 2rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* نبذة عن SecureShop */}
          <div style={{ maxWidth: '340px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
              <div className="brand-icon-box" style={{ width: '36px', height: '36px', background: '#2563eb' }}>
                <ShieldCheck size={20} color="#ffffff" />
              </div>
              <span style={{ fontSize: '1.35rem', fontWeight: 900 }}>SecureShop</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '1rem' }}>
              مشروع مادة أمن البرمجيات (CET431 - Fall 2026) - قسم تكنولوجيا هندسة الحاسبات بجامعة السويدي التكنولوجية (Elsewedy University of Technology). متجر إلكتروني محصن بالكامل مع مصفوفة تغطية أمنية ودفاعات مضمنة.
            </p>
            <div className="badge badge-emerald" style={{ padding: '0.35rem 0.75rem' }}>
              <HeartHandshake size={14} />
              <span>مشروع تخرج Phase 1 معتمد • 6 أعضاء</span>
            </div>
          </div>

          {/* روابط سريعة */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', color: '#ffffff' }}>روابط المتجر</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              <li>
                <a href="#featured-products" style={{ transition: 'color 0.2s' }}>عروض اليوم المميزة</a>
              </li>
              <li>
                <a href="#categories-section" style={{ transition: 'color 0.2s' }}>تصفح كافة الأقسام</a>
              </li>
              {currentUser?.role !== 'admin' && (
                <li>
                  <button onClick={() => setIsTrackingOpen(true)} style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    تتبع حالة شحنتك
                  </button>
                </li>
              )}
              {currentUser?.role === 'admin' && (
                <li>
                  <button onClick={() => setCurrentView('admin')} style={{ color: '#38bdf8', fontWeight: 700 }}>
                    دخول لوحة تحكم الإدارة 💼
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* سياسات الشحن والطلب */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', color: '#ffffff' }}>الشحن والسياسات</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              <li>التوصيل لجميع مدن وقرى مصر</li>
              <li>فترة الشحن: 24 ساعة للقاهرة والجيزة و 2-4 أيام للمحافظات</li>
              <li>حق فحص ومعاينة المنتج أمام المندوب</li>
              <li>سياسة استبدال واسترجاع مرنة وسريعة</li>
            </ul>
          </div>

          {/* خدمة العملاء والتواصل */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', color: '#ffffff' }}>تواصل معنا</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1rem' }}>
              هل لديك استفسار أو ترغب في طلب كميات؟ فريقنا متواجد للرد عليك.
            </p>
            <a 
              href="https://wa.me/201012345678?text=مرحباً، أود الاستفسار عن منتجات متجر دكان" 
              target="_blank" 
              rel="noreferrer"
              className="btn btn-emerald btn-sm"
              style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
            >
              <PhoneCall size={16} />
              <span>تواصل فوري عبر واتساب</span>
            </a>
          </div>
        </div>

        {/* حقوق النشر */}
        <div style={{ 
          borderTop: '1px solid #1e293b', 
          paddingTop: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          <div>
            © {new Date().getFullYear()} SecureShop - CET431 Software Security Project. All rights reserved.
          </div>
          <div>
            Department of Computer Engineering Technology • Elsewedy University of Technology
          </div>
        </div>
      </div>
    </footer>
  );
};
