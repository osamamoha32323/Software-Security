import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { EGYPT_GOVERNORATES } from '../../data/egyptGovernorates';
import { 
  X, 
  ShieldCheck, 
  Truck, 
  Phone, 
  MapPin, 
  User, 
  FileText, 
  CheckCircle2, 
  CreditCard, 
  Banknote, 
  ArrowRight,
  MessageCircle,
  Copy,
  Check,
  Wallet,
  Tag,
  AlertTriangle
} from 'lucide-react';
import { formatEGP, createWhatsAppOrderLink } from '../../utils/formatters';
import confetti from 'canvas-confetti';
import { Order } from '../../types/ecommerce';

export const CheckoutModal: React.FC = () => {
  const { 
    cart, 
    cartSubtotal, 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    createOrder,
    setIsTrackingOpen,
    setTrackingOrderId,
    currentUser,
    setIsAuthModalOpen,
    activeCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon
  } = useStore();

  // نموذج البيانات
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [selectedGovId, setSelectedGovId] = useState('cairo');
  const [city, setCity] = useState(currentUser?.city || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'store_credit' | 'cod' | 'instapay' | 'vodafone_cash'>('store_credit');

  // إدخال الكوبون
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // حالة الخطأ والتأكيد
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // تحديث البيانات إذا سجل العميل الدخول
  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name);
      if (!customerPhone && currentUser.phone) setCustomerPhone(currentUser.phone);
      if (!city && currentUser.city) setCity(currentUser.city);
      if (!address && currentUser.address) setAddress(currentUser.address);
    }
  }, [currentUser]);

  if (!isCheckoutOpen) return null;

  if (!currentUser) {
    return (
      <div className="modal-backdrop" onClick={() => setIsCheckoutOpen(false)}>
        <div 
          className="modal-container"
          style={{ maxWidth: '440px', padding: '2rem', textAlign: 'center' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close-btn" onClick={() => setIsCheckoutOpen(false)}>
            <X size={20} />
          </button>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#eff6ff',
            color: '#2563eb',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <User size={30} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            تسجيل الدخول مطلوب للشراء
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            عذراً، لا يمكنك متابعة إتمام الطلب إلا بعد تسجيل الدخول أو إنشاء حساب جديد لحفظ بيانات الشحن وسجل الطلبات.
          </p>
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontWeight: 800 }}
            onClick={() => {
              setIsCheckoutOpen(false);
              setIsAuthModalOpen(true);
            }}
          >
            تسجيل الدخول / إنشاء حساب
          </button>
        </div>
      </div>
    );
  }

  if (currentUser.role === 'admin') {
    return (
      <div className="modal-backdrop" onClick={() => setIsCheckoutOpen(false)}>
        <div 
          className="modal-container"
          style={{ maxWidth: '440px', padding: '2rem', textAlign: 'center' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close-btn" onClick={() => setIsCheckoutOpen(false)}>
            <X size={20} />
          </button>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#fee2e2',
            color: '#ef4444',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <ShieldCheck size={30} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#b91c1c' }}>
            تنبيه صلاحيات الإدارة
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            حساب الأدمن مخصص لإدارة المتجر ومتابعة الطلبات فقط، ولا يمكن استخدام هذا الحساب لإجراء طلبات شراء.
          </p>
          <button
            className="btn btn-outline"
            style={{ width: '100%', padding: '0.85rem', fontWeight: 800 }}
            onClick={() => setIsCheckoutOpen(false)}
          >
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  // جلب معلومات المحافظة وسعر الشحن
  const currentGov = EGYPT_GOVERNORATES.find(g => g.id === selectedGovId) || EGYPT_GOVERNORATES[0];
  const shippingCost = currentGov.shippingCost;
  const subtotalAfterDiscount = Math.max(0, cartSubtotal - couponDiscount);
  const totalAmount = subtotalAfterDiscount + shippingCost;

  // حساب تكلفة تاجر والربح المتوقع
  const totalTaagerCost = cart.reduce((sum, item) => sum + item.product.taagerPrice * item.quantity, 0);
  const estimatedProfit = subtotalAfterDiscount - totalTaagerCost;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    if (!couponInput.trim()) return;

    const res = applyCoupon(couponInput);
    if (res.success) {
      setCouponSuccess(`تم تفعيل الكوبون بنجاح وخصم ${formatEGP(res.discount || 0)}!`);
      setCouponInput('');
    } else {
      setCouponError(res.error || 'فشل تطبيق الكوبون');
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // التحقق من الحقول
    if (!customerName.trim()) {
      setError('من فضلك اكتب اسمك بالكامل');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 11) {
      setError('من فضلك اكتب رقم هاتف مصري صحيح (مثال: 01012345678)');
      return;
    }

    if (!city.trim()) {
      setError('من فضلك اكتب اسم المدينة أو المنطقة');
      return;
    }

    if (!address.trim()) {
      setError('من فضلك اكتب العنوان بالتفصيل (اسم الشارع، رقم العمارة، الشقة)');
      return;
    }

    // فحص الرصيد إذا كان الدفع برصيد المتجر (Store Credit)
    if (paymentMethod === 'store_credit') {
      if (!currentUser) {
        setError('يرجى تسجيل الدخول أولاً لتتمكن من الدفع برصيد المتجر');
        setIsAuthModalOpen(true);
        return;
      }

      if (currentUser.storeCredit < totalAmount) {
        setError(`رصيدك المتوفر في المتجر (${formatEGP(currentUser.storeCredit)}) غير كافٍ لسداد إجمالي الفاتورة (${formatEGP(totalAmount)}). يمكنك اختيار الدفع عند الاستلام أو شحن رصيدك.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // إعداد بنود الطلب
      const orderItems = cart.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.product.sellingPrice,
        taagerCost: item.product.taagerPrice
      }));

      // إنشاء الطلب في النظام
      const newOrder = createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        governorate: currentGov.nameAr,
        city: city.trim(),
        address: address.trim(),
        notes: notes.trim() || undefined,
        items: orderItems,
        subtotal: cartSubtotal,
        shippingCost,
        total: totalAmount,
        totalTaagerCost,
        estimatedProfit,
        paymentMethod
      });

      if (newOrder) {
        setCreatedOrder(newOrder);

        // إطلاق احتفال Confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (err) {
          console.error(err);
        }
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء حفظ الطلب، برجاء المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const itemsSummary = cart.map(i => `${i.product.titleAr} (${i.quantity} قطعة)`).join(' + ');

  return (
    <div className="modal-backdrop" onClick={() => !createdOrder && setIsCheckoutOpen(false)}>
      <div 
        className="checkout-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="modal-close-btn"
          onClick={() => {
            setIsCheckoutOpen(false);
            setCreatedOrder(null);
          }}
          title="إغلاق"
        >
          <X size={20} />
        </button>

        {!createdOrder ? (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>
                <ShieldCheck size={14} />
                <span>إتمام الطلب والدفع الآمن • SecureShop</span>
              </span>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>بيانات التوصيل وسداد الطلب</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                ادخل بياناتك وسنقوم بتوصيل طلبك لباب بيتك مع خيارات دفع متعددة ورصيد المتجر المباشر.
              </p>
            </div>

            {error && (
              <div style={{ 
                padding: '0.75rem 1rem', 
                background: '#fee2e2', 
                border: '1px solid #ef4444', 
                borderRadius: 'var(--radius-md)', 
                color: '#b91c1c', 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                marginBottom: '1rem' 
              }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmitOrder}>
              {/* الاسم بالكامل */}
              <div className="form-group">
                <label className="form-label">
                  <User size={16} color="var(--primary)" />
                  <span>الاسم بالكامل *</span>
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="مثال: أحمد محمد مصطفى" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  required 
                />
              </div>

              {/* رقم الهاتف */}
              <div className="form-group">
                <label className="form-label">
                  <Phone size={16} color="var(--primary)" />
                  <span>رقم الموبايل (واتساب متاح) *</span>
                </label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="مثال: 01012345678" 
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)} 
                  required 
                  dir="ltr"
                  style={{ textAlign: 'right' }}
                />
              </div>

              {/* المحافظة والمدينة */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    <MapPin size={16} color="var(--primary)" />
                    <span>المحافظة *</span>
                  </label>
                  <select 
                    className="form-select"
                    value={selectedGovId}
                    onChange={(e) => setSelectedGovId(e.target.value)}
                  >
                    {EGYPT_GOVERNORATES.map(gov => (
                      <option key={gov.id} value={gov.id}>
                        {gov.nameAr} (شحن مجاني)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>المدينة / المنطقة *</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="مثال: مدينة نصر / الدقي" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              {/* العنوان بالتفصيل */}
              <div className="form-group">
                <label className="form-label">
                  <span>العنوان بالتفصيل *</span>
                </label>
                <textarea 
                  className="form-textarea" 
                  rows={2} 
                  placeholder="اسم الشارع، رقم العمارة، رقم الشقة، علامة مميزة بجوارك..." 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  required 
                />
              </div>

              {/* قسم كوبونات الخصم (Coupons) */}
              <div style={{
                background: '#f8fafc',
                border: '1px dashed #cbd5e1',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                margin: '1rem 0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.825rem', fontWeight: 700 }}>
                  <Tag size={16} color="var(--primary)" />
                  <span>هل لديك كود خصم أو كوبون؟</span>
                </div>

                {activeCoupon ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#dcfce7',
                    border: '1px solid #86efac',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem 0.75rem'
                  }}>
                    <div>
                      <span style={{ fontWeight: 800, color: '#15803d' }}>كود الخصم الفعال: {activeCoupon.code}</span>
                      <span style={{ fontSize: '0.75rem', color: '#166534', display: 'block' }}>
                        وفرت {formatEGP(couponDiscount)} ({activeCoupon.discountPercent}%)
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ color: '#ef4444', fontSize: '0.75rem' }}
                      onClick={removeCoupon}
                    >
                      إلغاء الكوبون
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.85rem', textTransform: 'uppercase' }}
                        placeholder="أدخل الكود (مثل: WELCOME15 أو SECURE10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleApplyCoupon}
                        style={{ padding: '0.45rem 1rem' }}
                      >
                        تطبيق
                      </button>
                    </div>
                    {couponError && (
                      <span style={{ fontSize: '0.75rem', color: '#b91c1c', display: 'block', marginTop: '4px' }}>
                        {couponError}
                      </span>
                    )}
                    {couponSuccess && (
                      <span style={{ fontSize: '0.75rem', color: '#15803d', display: 'block', marginTop: '4px' }}>
                        {couponSuccess}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* اختيار طريقة الدفع (يشمل رصيد المتجر Store Credit) */}
              <div style={{ margin: '1.25rem 0' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                  <span>طريقة السداد المفضلة:</span>
                </label>
                
                <div className="payment-method-selector">
                  {/* الخيار الأول: الدفع برصيد المتجر (Store Credit) */}
                  <div 
                    className={`payment-option ${paymentMethod === 'store_credit' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('store_credit')}
                    style={{
                      border: paymentMethod === 'store_credit' ? '2px solid #2563eb' : '1px solid var(--border-color)',
                      background: paymentMethod === 'store_credit' ? 'rgba(37,99,235,0.04)' : '#ffffff'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#eff6ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563eb'
                      }}>
                        <Wallet size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>الدفع برصيد المتجر (Store Credit)</span>
                          <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>موصى به</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {currentUser ? (
                            <span style={{ color: currentUser.storeCredit >= totalAmount ? '#059669' : '#b91c1c', fontWeight: 700 }}>
                              رصيدك المتاح: {formatEGP(currentUser.storeCredit)} {currentUser.storeCredit < totalAmount && '(غير كافٍ)'}
                            </span>
                          ) : (
                            <span style={{ color: '#b91c1c' }}>يرجى تسجيل الدخول لاستخدام رصيد حسابك</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <CheckCircle2 size={20} color={paymentMethod === 'store_credit' ? '#2563eb' : '#cbd5e1'} />
                  </div>

                  {/* الخيار الثاني: الدفع عند الاستلام */}
                  <div 
                    className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <div className="flex items-center gap-3">
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#ecfdf5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#059669'
                      }}>
                        <Banknote size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>الدفع نقداً عند الاستلام (COD)</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ادفع كاش للمندوب بعد استلام ومعاينة الطلب</div>
                      </div>
                    </div>
                    <CheckCircle2 size={20} color={paymentMethod === 'cod' ? '#059669' : '#cbd5e1'} />
                  </div>
                </div>
              </div>

              {/* ملخص الحساب والتكلفة */}
              <div style={{ 
                background: 'var(--bg-subtle)', 
                padding: '1.25rem', 
                borderRadius: 'var(--radius-lg)', 
                marginBottom: '1.5rem',
                border: '1px solid var(--border-color)'
              }}>
                <div className="flex items-center justify-between" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <span>المجموع للمنتجات ({cart.length} أنواع):</span>
                  <span style={{ fontWeight: 700 }}>{formatEGP(cartSubtotal)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex items-center justify-between" style={{ fontSize: '0.875rem', color: '#16a34a', marginBottom: '0.5rem' }}>
                    <span className="flex items-center gap-1">
                      <Tag size={14} />
                      <span>خصم الكوبون ({activeCoupon?.code}):</span>
                    </span>
                    <span style={{ fontWeight: 800 }}>- {formatEGP(couponDiscount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  <span className="flex items-center gap-1">
                    <Truck size={14} color="#16a34a" />
                    <span>مصاريف الشحن ({currentGov.nameAr}):</span>
                  </span>
                  <span style={{ fontWeight: 800, color: '#16a34a' }}>مجاناً (0 ج.م)</span>
                </div>

                <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>الإجمالي النهائي:</span>
                  <span style={{ fontWeight: 900, fontSize: '1.4rem', color: paymentMethod === 'store_credit' ? '#2563eb' : '#059669' }}>
                    {formatEGP(totalAmount)}
                  </span>
                </div>
              </div>

              {/* زر تأكيد الطلب الفوري */}
              <button 
                type="submit" 
                className={`btn ${paymentMethod === 'store_credit' ? 'btn-primary' : 'btn-emerald'} btn-lg`}
                style={{ width: '100%', fontSize: '1.1rem' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span>جاري تسجيل طلبك وخصم الرصيد...</span>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 size={22} />
                    <span>
                      {paymentMethod === 'store_credit' 
                        ? `سداد برصيد المتجر وتأكيد الطلب (${formatEGP(totalAmount)})` 
                        : `تأكيد الطلب الآن (${formatEGP(totalAmount)})`}
                    </span>
                  </div>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* شاشة نجاح الطلب */
          <div className="order-success-box">
            <div className="success-check-bubble">
              <Check size={42} strokeWidth={3} />
            </div>

            <span className="badge badge-emerald" style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              تم توثيق وتأكيد طلبك بنجاح! 🎉
            </span>

            <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              شكراً لطلبك من SecureShop، يا {createdOrder.customerName}!
            </h2>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              تم تسجيل الطلب وتوثيق طريقة السداد ({createdOrder.paymentMethod === 'store_credit' ? 'رصيد المتجر Store Credit' : 'الدفع عند الاستلام'}) وجاري تجهيز الشحنة إلى <strong style={{ color: 'var(--text-main)' }}>{createdOrder.governorate}</strong>.
            </p>

            {/* بوكس كود الطلب */}
            <div style={{ 
              background: 'var(--bg-subtle)', 
              border: '1.5px dashed var(--primary)', 
              borderRadius: 'var(--radius-lg)', 
              padding: '1.25rem', 
              maxWidth: '380px', 
              margin: '0 auto 1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>رقم الطلب الخاص بك:</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '1px' }}>
                  {createdOrder.id}
                </div>
              </div>

              <button
                className="btn btn-outline btn-sm"
                onClick={() => copyToClipboard(createdOrder.id)}
                title="نسخ رقم الطلب"
              >
                {copiedOrderId ? <Check size={16} color="green" /> : <Copy size={16} />}
                <span>{copiedOrderId ? 'تم النسخ' : 'نسخ'}</span>
              </button>
            </div>

            {/* أزرار خيارات أخرى */}
            <div className="flex items-center justify-center gap-3" style={{ flexWrap: 'wrap' }}>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setTrackingOrderId(createdOrder.id);
                  setIsCheckoutOpen(false);
                  setCreatedOrder(null);
                  setIsTrackingOpen(true);
                }}
              >
                <Truck size={18} />
                <span>تتبع حالة شحنتي الآن</span>
              </button>

              <button
                className="btn btn-ghost"
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setCreatedOrder(null);
                }}
              >
                <span>متابعة التسوق</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
