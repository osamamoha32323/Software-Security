import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authModalTab, 
    setAuthModalTab, 
    login, 
    registerUser, 
    confirmAccount,
    securityMode 
  } = useStore();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('user@secureshop.edu');
  const [loginPassword, setLoginPassword] = useState('User@123456');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Confirmation state
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmCode, setConfirmCode] = useState('');

  // Status & loading
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setError(null);
    setSuccessMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        handleClose();
      } else {
        if (res.error?.includes('تأكيد') || res.error?.includes('رمز')) {
          setConfirmEmail(loginEmail);
          setConfirmCode('');
          setAuthModalTab('confirm');
        }
        setError(res.error || 'فشل تسجيل الدخول');
      }
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!regName.trim()) {
      setError('يرجى كتابة الاسم بالكامل');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setError('يرجى كتابة بريد إلكتروني صالح');
      return;
    }
    if (regPassword.length < 6) {
      setError('كلمة المرور يجب ألا تقل عن 6 خانات وتكون قوية');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser(regName, regEmail, regPassword);
      if (res.success) {
        setConfirmEmail(regEmail);
        setConfirmCode(''); // يظل الحقل فارغاً ولا يتم عرض الكود في الموقع
        setSuccessMsg('تم إنشاء الحساب بنجاح! تم إرسال رمز التأكيد السري إلى التيرمينال (Terminal). يرجى إدخاله في المربع أدناه:');
        setAuthModalTab('confirm');
      } else {
        setError(res.error || 'فشل إنشاء الحساب');
      }
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!confirmEmail.trim() || !confirmCode.trim()) {
      setError('يرجى ملء البريد الإلكتروني ورمز التأكيد المكون من 6 أرقام');
      return;
    }

    const res = confirmAccount(confirmEmail, confirmCode);
    if (res.success) {
      setSuccessMsg('تهانينا! تم تأكيد وتفعيل حسابك بنجاح.');
      setTimeout(() => {
        handleClose();
      }, 1000);
    } else {
      setError(res.error || 'رمز التأكيد غير صحيح');
    }
  };

  // أزرار سريعة لاختبار المصحح والمشرف (Quick Demo Presets)
  const setDemoUser = () => {
    setLoginEmail('user@secureshop.edu');
    setLoginPassword('User@123456');
    setError(null);
  };

  const setDemoAdmin = () => {
    setLoginEmail('admin@secureshop.edu');
    setLoginPassword('Admin@123456');
    setError(null);
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div 
        className="modal-container"
        style={{ maxWidth: '480px', padding: '1.75rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={handleClose}>
          <X size={20} />
        </button>

        {/* رأس النافذة */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '0.75rem',
            boxShadow: '0 8px 16px rgba(37,99,235,0.25)'
          }}>
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)' }}>
            بوابة الأمان والمصادقة • SecureShop
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            نظام حماية الحسابات وتشفير كلمات المرور (PBKDF2 & Salt)
          </p>
        </div>

        {/* التبويبات */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '4px',
          marginBottom: '1.25rem'
        }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 700,
              background: authModalTab === 'login' ? '#ffffff' : 'transparent',
              color: authModalTab === 'login' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: authModalTab === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
            onClick={() => { setAuthModalTab('login'); setError(null); }}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 700,
              background: authModalTab === 'register' ? '#ffffff' : 'transparent',
              color: authModalTab === 'register' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: authModalTab === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
            onClick={() => { setAuthModalTab('register'); setError(null); }}
          >
            إنشاء حساب جديد
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 700,
              background: authModalTab === 'confirm' ? '#ffffff' : 'transparent',
              color: authModalTab === 'confirm' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: authModalTab === 'confirm' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
            onClick={() => { setAuthModalTab('confirm'); setError(null); }}
          >
            تأكيد الحساب
          </button>
        </div>

        {/* رسائل التنبيه والخطأ */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #f87171',
            color: '#b91c1c',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.825rem'
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: '#dcfce7',
            border: '1px solid #86efac',
            color: '#15803d',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.825rem'
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* نموذج تسجيل الدخول */}
        {authModalTab === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                البريد الإلكتروني
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="search-input"
                  style={{ width: '100%', paddingRight: '2.25rem', borderColor: 'var(--border-subtle)' }}
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '12px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                كلمة المرور
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="search-input"
                  style={{ width: '100%', paddingRight: '2.25rem', borderColor: 'var(--border-subtle)' }}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '12px' }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: '100%', padding: '0.85rem', fontWeight: 800 }}
            >
              {isLoading ? 'جاري التحقق والتشفير...' : 'تسجيل الدخول الآمن'}
            </button>

            {/* أزرار التجربة السريعة للاختبار والمناقشة */}
            <div style={{
              marginTop: '1.25rem',
              padding: '0.85rem',
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={13} color="#2563eb" />
                <span>حسابات الاختبار الجاهزة للمناقشة والتقييم:</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, fontSize: '0.75rem' }}
                  onClick={setDemoUser}
                >
                  حساب عميل (User)
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, fontSize: '0.75rem', borderColor: '#2563eb', color: '#2563eb' }}
                  onClick={setDemoAdmin}
                >
                  حساب مدير (Admin)
                </button>
              </div>
            </div>
          </form>
        )}

        {/* نموذج إنشاء الحساب */}
        {authModalTab === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                الاسم الكامل
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%', paddingRight: '2.25rem', borderColor: 'var(--border-subtle)' }}
                  placeholder="محمد أحمد"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '12px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                البريد الإلكتروني
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="search-input"
                  style={{ width: '100%', paddingRight: '2.25rem', borderColor: 'var(--border-subtle)' }}
                  placeholder="mohamed@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '12px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                كلمة المرور (تشفير قوي PBKDF2)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="search-input"
                  style={{ width: '100%', paddingRight: '2.25rem', borderColor: 'var(--border-subtle)' }}
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '12px' }} />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
                * سيتم منحك رصيد ترحيبي 1,000 ج.م لاختبار الدفع برصيد المتجر (Store Credit).
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: '100%', padding: '0.85rem', fontWeight: 800 }}
            >
              {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب وإرسال رمز التأكيد'}
            </button>
          </form>
        )}

        {/* نموذج تأكيد الحساب - المربع الصغير لإدخال الكود */}
        {authModalTab === 'confirm' && (
          <form onSubmit={handleConfirmSubmit}>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.25rem',
              textAlign: 'center'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.25rem 0.75rem',
                background: '#e0e7ff',
                color: '#3730a3',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '0.5rem'
              }}>
                <Mail size={13} />
                <span>البريد المراد تأكيده: {confirmEmail || 'الحساب الجديد'}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 0.5rem 0', lineHeight: 1.5 }}>
                ⚡ تم توليد رمز التحقق السري وإرساله إلى شاشة <strong>التيرمينال (Terminal)</strong>.
              </p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                (افتح شاشة Terminal وانسخ الرمز المكون من 6 أرقام ثم اكتبه في المربع بالأسفل)
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.65rem', color: 'var(--text-main)' }}>
                أدخل رمز التأكيد (6 أرقام):
              </label>
              <div style={{ maxWidth: '280px', margin: '0 auto', position: 'relative' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="search-input"
                  style={{ 
                    width: '100%', 
                    textAlign: 'center',
                    borderColor: 'var(--primary)',
                    letterSpacing: '10px',
                    fontWeight: 900,
                    fontSize: '1.6rem',
                    padding: '0.75rem 0.5rem',
                    background: '#ffffff',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.12)',
                    borderRadius: 'var(--radius-md)'
                  }}
                  placeholder="••••••"
                  maxLength={6}
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontWeight: 800, fontSize: '0.95rem' }}
            >
              تأكيد وتفعيل الحساب الآن
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => { setAuthModalTab('login'); setError(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                العودة إلى تسجيل الدخول
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
