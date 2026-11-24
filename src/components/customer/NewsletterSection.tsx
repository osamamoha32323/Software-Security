import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Gift, CheckCircle2, ShieldCheck, AlertCircle, Lock, UserCheck } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const { 
    subscribeNewsletter, 
    hasClaimedNewsletter, 
    currentUser, 
    setIsAuthModalOpen, 
    setAuthModalTab 
  } = useStore();

  const [email, setEmail] = useState('');
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // إخفاء قسم النشرة البريدية بالكامل إذا كان المستخدم الحالي مديراً للنظام (Admin)
  if (currentUser?.role === 'admin') {
    return null;
  }

  // التحقق هل استلم المستخدم الكوبون بالفعل مسبقاً
  const isAlreadyClaimed = hasClaimedNewsletter(currentUser?.email);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // إذا لم يكن المستخدم مسجلاً للدخول، يتم توجيهه لتسجيل الدخول أولاً
    if (!currentUser) {
      setErrorMsg('يرجى تسجيل الدخول بحسابك أولاً للحصول على كوبون الخصم الخاص بك.');
      setIsAuthModalOpen(true);
      setAuthModalTab('login');
      return;
    }

    const cleanInputEmail = email.trim().toLowerCase();
    const cleanUserEmail = currentUser.email.trim().toLowerCase();

    // التحقق الصارم من تطابق البريد الإلكتروني مع بريد الحساب المسجل به (ممنوع أي إيميل آخر)
    if (cleanInputEmail !== cleanUserEmail) {
      setErrorMsg(`ممنوع استخدام بريد إلكتروني مختلف! يجب إدخال نفس البريد الإلكتروني المسجل به حسابك الحالي (${currentUser.email}) فقط.`);
      return;
    }

    const res = subscribeNewsletter(email);
    if (res.success) {
      setIssuedCode(res.code || 'WELCOME15');
      setErrorMsg(null);
      setEmail('');
    } else {
      setErrorMsg(res.message);
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

          {/* إذا استلم المستخدم الكوبون مسبقاً أو تم إصداره الآن */}
          {(isAlreadyClaimed || issuedCode) ? (
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              backdropFilter: 'blur(10px)',
              maxWidth: '520px',
              margin: '0 auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#4ade80', fontWeight: 800, marginBottom: '0.5rem' }}>
                <CheckCircle2 size={22} />
                <span style={{ fontSize: '1.1rem' }}>
                  {issuedCode ? 'تم إصدار الكوبون بنجاح!' : 'لقد حصلت بالفعل على كوبون الخصم الترحيبي الخاص بك 🎉'}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '0.85rem' }}>
                كود الخصم المربوط بحسابك ({currentUser?.email || 'حسابك'}):
              </p>
              <div style={{
                display: 'inline-block',
                background: '#ffffff',
                color: '#1e3a8a',
                fontWeight: 900,
                fontSize: '1.5rem',
                letterSpacing: '2px',
                padding: '0.6rem 2rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
              }}>
                {issuedCode || 'WELCOME15'}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#93c5fd', marginTop: '0.85rem', marginBottom: 0 }}>
                💡 خصم 15% متاح للاستخدام لمرة واحدة فقط لكل حساب عند إتمام الطلب في سلة المشتريات.
              </p>
            </div>
          ) : (
            <div>
              {/* رسالة خطأ التحقق */}
              {errorMsg && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  color: '#fca5a5',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={18} color="#ef4444" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ flex: '1 1 280px', maxWidth: '380px', position: 'relative' }}>
                  <input
                    type="email"
                    placeholder={currentUser ? `أدخل بريدك المسجل: ${currentUser.email}` : "أدخل بريدك الإلكتروني (سجل أولاً)"}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1.25rem',
                      borderRadius: 'var(--radius-full)',
                      border: errorMsg ? '2px solid #ef4444' : 'none',
                      outline: 'none',
                      fontSize: '0.9rem',
                      background: '#ffffff',
                      color: '#0f172a'
                    }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    borderRadius: 'var(--radius-full)',
                    padding: '0.85rem 1.75rem',
                    fontWeight: 800,
                    background: '#2563eb',
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
                    cursor: 'pointer'
                  }}
                >
                  <span>اشترك واكسب الكوبون</span>
                </button>
              </form>

              {/* تنبيه إرشادي للمستخدم المسجل */}
              {currentUser && (
                <div style={{
                  marginTop: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.78rem',
                  color: '#93c5fd',
                  background: 'rgba(37, 99, 235, 0.25)',
                  padding: '0.3rem 0.85rem',
                  borderRadius: 'var(--radius-full)'
                }}>
                  <UserCheck size={14} color="#60a5fa" />
                  <span>يجب إدخال بريدك المسجل الحالي: <strong>{currentUser.email}</strong> للحصول على الكوبون</span>
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontSize: '0.75rem', color: '#94a3b8', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} color="#60a5fa" />
              <span>مكافحة البريد العشوائي XSS & CSRF</span>
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={13} color="#60a5fa" />
              <span>كوبون حصري للاستخدام الفردي (مرة واحدة فقط لكل حساب)</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
