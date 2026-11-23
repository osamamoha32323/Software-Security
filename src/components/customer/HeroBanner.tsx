import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Flame, ShieldCheck, ArrowDown } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  // عداد تنازلي حقيقي لعروض اليوم
  const [timeLeft, setTimeLeft] = useState({
    hours: 7,
    minutes: 42,
    seconds: 19
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const scrollToProducts = () => {
    const el = document.getElementById('featured-products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-banner">
          {/* محتوى البانر */}
          <div className="hero-content">
            <div className="hero-tag">
              <Sparkles size={16} />
              <span>موسم التخفيضات الكبرى في مصر 🇪🇬</span>
            </div>

            <h1 className="hero-title">
              تسوق أذكى منتجات تريند <br />
              <span className="hero-title-highlight">بأفضل سعر وادفع عند الاستلام</span>
            </h1>

            <p className="hero-desc">
              أفضل الابتكارات لحل المشاكل اليومية في منزلك، سيارتك، وحياتك الشخصية. نوفر لك جودة أصلية مجربة مع فحص ومعاينة الشحنة قبل الاستلام.
            </p>

            <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
              <button 
                className="btn btn-amber btn-lg"
                onClick={scrollToProducts}
              >
                <Flame size={20} />
                <span>اكتشف عروض اليوم</span>
                <ArrowDown size={18} />
              </button>

              <div className="flex items-center gap-1" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                <ShieldCheck size={18} color="#10b981" />
                <span>شحن مضمون 100%</span>
              </div>
            </div>

            <div className="hero-badges">
              <div className="hero-badge-item">
                <span>🚚 توصيل خلال 24-48 ساعة</span>
              </div>
              <div className="hero-badge-item">
                <span>💵 الدفع كاش عند الباب</span>
              </div>
              <div className="hero-badge-item">
                <span>🔄 استبدال واسترجاع مجاني</span>
              </div>
            </div>
          </div>

          {/* بوكس العداد التنازلي الحصري */}
          <div className="hero-visual">
            <div className="hero-countdown-box">
              <div className="flex items-center justify-center gap-2" style={{ color: '#fcd34d', fontWeight: 800, fontSize: '0.9rem' }}>
                <Clock size={18} />
                <span>ينتهي العرض الخاطف خلال</span>
              </div>

              <div className="countdown-digits">
                <div className="countdown-block">
                  <div className="countdown-num">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="countdown-label">ثانية</div>
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b' }}>:</span>
                <div className="countdown-block">
                  <div className="countdown-num">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="countdown-label">دقيقة</div>
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b' }}>:</span>
                <div className="countdown-block">
                  <div className="countdown-num">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="countdown-label">ساعة</div>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                خصومات تصل إلى <span style={{ color: '#fcd34d', fontWeight: 800 }}>50%</span> على تشكيلة اليوم
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
