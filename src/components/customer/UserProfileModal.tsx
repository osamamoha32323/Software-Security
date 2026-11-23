import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  User, 
  Wallet, 
  ShoppingBag, 
  KeyRound, 
  MapPin, 
  Phone, 
  Mail, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { formatEGP, formatArabicDate, getOrderStatusInfo } from '../../utils/formatters';

export const UserProfileModal: React.FC = () => {
  const { 
    currentUser, 
    isProfileOpen, 
    setIsProfileOpen, 
    updateProfile, 
    changePassword, 
    addStoreCredit, 
    logout,
    orders,
    setIsTrackingOpen,
    setTrackingOrderId
  } = useStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'credit' | 'orders' | 'password'>('profile');

  // تعديل الملف الشخصي
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [address, setAddress] = useState(currentUser?.address || '');

  // تغيير كلمة المرور
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // رسائل
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isProfileOpen || !currentUser) return null;

  // جلب طلبات المستخدم المسجل فقط (IDOR Prevention Verification)
  const userOrders = orders.filter(o => o.userId === currentUser.id || (currentUser.phone && o.customerPhone === currentUser.phone));

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, phone, city, address });
    setMessage('تم تحديث البيانات الشخصية بنجاح');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmNewPassword) {
      setError('كلمة المرور الجديدة غير متطابقة مع التأكيد');
      return;
    }

    const res = await changePassword(oldPassword, newPassword);
    if (res.success) {
      setMessage('تم تغيير كلمة المرور وتحديث التشفير بنجاح');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      setError(res.error || 'حدث خطأ أثناء تغيير كلمة المرور');
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsProfileOpen(false)}>
      <div 
        className="modal-container"
        style={{ maxWidth: '650px', padding: '1.75rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={() => setIsProfileOpen(false)}>
          <X size={20} />
        </button>

        {/* رأس الملف الشخصي */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.25rem'
            }}>
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{currentUser.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>{currentUser.email}</span>
                <span className={`badge ${currentUser.role === 'admin' ? 'badge-blue' : 'badge-green'}`}>
                  {currentUser.role === 'admin' ? 'مدير نظام (Admin)' : 'عميل معتمد (Verified)'}
                </span>
              </div>
            </div>
          </div>

          <button 
            className="btn btn-outline btn-sm"
            onClick={() => { logout(); setIsProfileOpen(false); }}
            style={{ color: '#ef4444', borderColor: '#fca5a5' }}
          >
            تسجيل الخروج
          </button>
        </div>

        {/* بطاقة رصيد المتجر (Store Credit) */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Wallet size={15} color="#38bdf8" />
              <span>رصيد المتجر المتاح للشراء (Store Credit)</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>
              {formatEGP(currentUser.storeCredit)}
            </div>
          </div>
          <button
            className="btn btn-sm"
            style={{ background: '#38bdf8', color: '#0f172a', fontWeight: 800, borderRadius: 'var(--radius-full)' }}
            onClick={() => addStoreCredit(500)}
            title="إضافة 500 ج.م لرصيد المتجر للاختبار التجريبي"
          >
            <PlusCircle size={15} />
            <span>شحن +500 ج.م (Demo)</span>
          </button>
        </div>

        {/* تبويبات الشاشة */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.25rem',
          gap: '1rem'
        }}>
          <button
            style={{
              padding: '0.65rem 0.5rem',
              fontWeight: 700,
              fontSize: '0.875rem',
              borderBottom: activeTab === 'profile' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)'
            }}
            onClick={() => setActiveTab('profile')}
          >
            البيانات والعنوان
          </button>
          <button
            style={{
              padding: '0.65rem 0.5rem',
              fontWeight: 700,
              fontSize: '0.875rem',
              borderBottom: activeTab === 'orders' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'orders' ? 'var(--primary)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setActiveTab('orders')}
          >
            <span>طلباتي ({userOrders.length})</span>
          </button>
          <button
            style={{
              padding: '0.65rem 0.5rem',
              fontWeight: 700,
              fontSize: '0.875rem',
              borderBottom: activeTab === 'password' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'password' ? 'var(--primary)' : 'var(--text-muted)'
            }}
            onClick={() => setActiveTab('password')}
          >
            تغيير كلمة المرور
          </button>
        </div>

        {/* رسائل التنبيه */}
        {message && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.825rem' }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.825rem' }}>
            {error}
          </div>
        )}

        {/* تبويب تعديل الملف الشخصي */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>الاسم بالكامل</label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%', borderColor: 'var(--border-subtle)' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>رقم الهاتف</label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%', borderColor: 'var(--border-subtle)' }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>المدينة / المنطقة</label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%', borderColor: 'var(--border-subtle)' }}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="مدينة نصر"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>العنوان التفصيلي</label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%', borderColor: 'var(--border-subtle)' }}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="الشارع، رقم العمارة"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>
              حفظ التعديلات
            </button>
          </form>
        )}

        {/* تبويب طلباتي (المحمي من IDOR) */}
        {activeTab === 'orders' && (
          <div>
            {userOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <ShoppingBag size={42} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                <p>لم تقم بإجراء أي طلبات حتى الآن.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
                {userOrders.map(order => {
                  const statusInfo = getOrderStatusInfo(order.status);
                  return (
                    <div 
                      key={order.id}
                      style={{
                        padding: '1rem',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#ffffff'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{order.id}</span>
                          <span className={`badge ${statusInfo.badgeClass}`}>
                            {statusInfo.labelAr}
                          </span>
                          {order.paymentMethod === 'store_credit' && (
                            <span className="badge badge-blue">سداد برصيد المتجر</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {formatArabicDate(order.createdAt)} • {order.items.length} منتجات
                        </div>
                      </div>

                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                          {formatEGP(order.total)}
                        </div>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '0.75rem', color: 'var(--primary)', padding: '2px 6px', marginTop: '2px' }}
                          onClick={() => {
                            setTrackingOrderId(order.id);
                            setIsTrackingOpen(true);
                            setIsProfileOpen(false);
                          }}
                        >
                          <Truck size={14} />
                          <span>تتبع الشحنة</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* تبويب تغيير كلمة المرور */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>كلمة المرور الحالية</label>
              <input
                type="password"
                className="search-input"
                style={{ width: '100%', borderColor: 'var(--border-subtle)' }}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>كلمة المرور الجديدة</label>
              <input
                type="password"
                className="search-input"
                style={{ width: '100%', borderColor: 'var(--border-subtle)' }}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>تأكيد كلمة المرور الجديدة</label>
              <input
                type="password"
                className="search-input"
                style={{ width: '100%', borderColor: 'var(--border-subtle)' }}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>
              تحديث كلمة المرور والتشفير
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
