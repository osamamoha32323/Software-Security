import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Mail, Gift, CheckCircle2, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const { subscribeNewsletter, currentUser } = useStore();
  const [email, setEmail] = useState('');
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const res = subscribeNewsletter(email);
    if (res.success) {
      setIssuedCode(res.code || 'WELCOME15');
      setStatusMsg(res.message);
      setEmail('');
    } else {
      alert(res.message);
    }
  };

  return (
    <section style={{
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)',
      color: '#ffffff',
      padding: '3rem 0',
      marginTop: '3rem',
      borderRadius: 'var(--radius-lg)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            marginBottom: '1rem',
            backdropFilter: 'blur(8px)'
          }}>
            <Gift size={15} color="#60a5fa" />
            <span>كوبون فوري 15% للمشتركين الجدد</span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.75rem' }}>
            اشترك في نشرة SecureShop البريدية واحصل على خصم فوري
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            احصل على أحدث عروض المنتجات وأكواد الخصم الحصرية مع ضمان أمان كامل لبياناتك الشخصية دون أي بريد مزعج.
          </p>

          {issuedCode ? (
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#4ade80', fontWeight: 800, marginBottom: '0.5rem' }}>
                <CheckCircle2 size={20} />
                <span>تم إصدار الكوبون بنجاح!</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '0.75rem' }}>
                استخدم كود الخصم التالي عند الدفع لتطبيق خصم 15%:
              </p>
              <div style={{
                display: 'inline-block',
                background: '#ffffff',
                color: '#1e3a8a',
                fontWeight: 900,
                fontSize: '1.4rem',
                letterSpacing: '2px',
                padding: '0.5rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                {issuedCode}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input
                type="email"
                placeholder="أدخل بريدك الإلكتروني (مثال: student@secureshop.edu)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: '1 1 280px',
                  maxWidth: '380px',
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
                required
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '0.85rem 1.75rem',
                  fontWeight: 800,
                  background: '#2563eb',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.4)'
                }}
              >
                <span>اشترك واكسب الكوبون</span>
              </button>
            </form>
          )}

          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} color="#60a5fa" />
              <span>مكافحة البريد العشوائي XSS & CSRF</span>
            </span>
            <span>•</span>
            <span>كوبون حصري للاستخدام الفردي لكل حساب</span>
          </div>
        </div>
      </div>
    </section>
  );
};
