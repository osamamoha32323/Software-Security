import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  Search, 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Wallet
} from 'lucide-react';
import { formatEGP, formatArabicDate, getOrderStatusInfo } from '../../utils/formatters';
import { Order, OrderStatus } from '../../types/ecommerce';

const ORDER_STEPS: { status: OrderStatus; labelAr: string; desc: string }[] = [
  { status: 'pending', labelAr: 'تم استلام الطلب', desc: 'تم تسجيل طلبك وتوثيقه في SecureShop' },
  { status: 'confirmed', labelAr: 'تم التأكيد', desc: 'تم مراجعة الطلب والموافقة عليه' },
  { status: 'processing', labelAr: 'قيد التجهيز', desc: 'جاري فحص وتغليف المنتج من المستودع' },
  { status: 'shipped', labelAr: 'خرج مع المندوب', desc: 'الشحنة في طريقها إليك الآن' },
  { status: 'delivered', labelAr: 'تم التسليم بنجاح', desc: 'تم تسليم الطلب وإتمام العملية' }
];

export const OrderTrackingModal: React.FC = () => {
  const { 
    isTrackingOpen, 
    setIsTrackingOpen, 
    getOrderById, 
    trackingOrderId,
    setTrackingOrderId,
    currentUser,
    securityMode
  } = useStore();

  const [inputQuery, setInputQuery] = useState(trackingOrderId || '');
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (trackingOrderId) {
      setInputQuery(trackingOrderId);
      const res = getOrderById(trackingOrderId);
      if (res.order) {
        setMatchedOrder(res.order);
        setErrorMessage(null);
      } else {
        setMatchedOrder(null);
        setErrorMessage(res.error || 'تعذر جلب تفاصيل الطلب');
      }
      setSearched(true);
    }
  }, [trackingOrderId, isTrackingOpen]);

  if (!isTrackingOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    setErrorMessage(null);
    const res = getOrderById(inputQuery);
    if (res.order) {
      setMatchedOrder(res.order);
    } else {
      setMatchedOrder(null);
      setErrorMessage(res.error || 'رقم الطلب غير موجود بالنظام');
    }
    setSearched(true);
  };

  const getStepIndex = (status: OrderStatus) => {
    return ORDER_STEPS.findIndex(s => s.status === status);
  };

  const currentStepIdx = matchedOrder ? getStepIndex(matchedOrder.status) : -1;

  return (
    <div className="modal-backdrop" onClick={() => setIsTrackingOpen(false)}>
      <div 
        className="modal-container"
        style={{ maxWidth: '640px', padding: '1.75rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="modal-close-btn"
          onClick={() => {
            setIsTrackingOpen(false);
            setTrackingOrderId('');
          }}
          title="إغلاق"
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '50%', 
            background: 'var(--primary-subtle)', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--primary)',
            marginBottom: '0.75rem'
          }}>
            <Truck size={28} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>تتبع شحنتك والتحقق من الطلب</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            نظام استعلام محمي ضد ثغرات الوصول المباشر (IDOR Protected)
          </p>
        </div>

        {/* شريط البحث */}
        <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
          <div className="flex gap-2">
            <div className="search-input-wrapper" style={{ flex: 1 }}>
              <Search size={18} color="var(--text-muted)" />
              <input 
                type="text" 
                className="search-input" 
                placeholder="أدخل رقم الطلب (مثال: #SEC-1001 أو #DK-1001)..." 
                value={inputQuery} 
                onChange={(e) => setInputQuery(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}>
              بحث
            </button>
          </div>
        </form>

        {/* عرض رسالة الحجب الأمني عند حدوث IDOR */}
        {errorMessage && (
          <div style={{
            background: '#fee2e2',
            border: '1.5px solid #ef4444',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            <ShieldAlert size={36} color="#b91c1c" style={{ margin: '0 auto 0.5rem' }} />
            <h4 style={{ color: '#991b1b', fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.35rem' }}>
              تم رصد محاولة وصول غير مصرح بها (IDOR Defense Triggered)
            </h4>
            <p style={{ color: '#b91c1c', fontSize: '0.85rem', lineHeight: 1.5 }}>
              {errorMessage}
            </p>
            <div style={{ fontSize: '0.75rem', color: '#7f1d1d', marginTop: '0.5rem', background: 'rgba(255,255,255,0.5)', padding: '4px', borderRadius: '4px' }}>
              الحماية مفعلة: لا يمكن لأي مستخدم استعراض بيانات شحنات وعناوين عملاء آخرين عبر تخمين رقم الطلب.
            </div>
          </div>
        )}

        {/* تفاصيل الطلب عند العثور عليه والتأكد من الصلاحية */}
        {matchedOrder && (
          <div className="animate-fade-in">
            {/* بطاقة الطلب */}
            <div style={{ 
              background: 'var(--bg-subtle)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1.25rem', 
              marginBottom: '1.5rem',
              border: '1px solid var(--border-color)'
            }}>
              <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>رقم الطلب:</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>{matchedOrder.id}</div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span className={`badge ${getOrderStatusInfo(matchedOrder.status).badgeClass}`} style={{ fontSize: '0.85rem' }}>
                    {getOrderStatusInfo(matchedOrder.status).labelAr}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    تاريخ الطلب: {formatArabicDate(matchedOrder.createdAt)}
                  </div>
                </div>
              </div>

              {/* خط سير الطلب */}
              <div style={{ margin: '1.5rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                  {ORDER_STEPS.map((step, idx) => {
                    const isDone = idx <= currentStepIdx;
                    return (
                      <div key={step.status} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isDone ? '#2563eb' : '#e2e8f0',
                          color: isDone ? '#ffffff' : '#64748b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          marginBottom: '0.35rem'
                        }}>
                          {isDone ? <CheckCircle2 size={16} /> : idx + 1}
                        </div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: isDone ? 'var(--text-main)' : 'var(--text-muted)' }}>
                          {step.labelAr}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* بيانات العميل والتسليم */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.825rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>المستلم: </span>
                  <strong>{matchedOrder.customerName}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>المحافظة: </span>
                  <strong>{matchedOrder.governorate}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>طريقة الدفع: </span>
                  <strong>{matchedOrder.paymentMethod === 'store_credit' ? 'رصيد المتجر (Store Credit)' : 'الدفع عند الاستلام (COD)'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>إجمالي المبلغ: </span>
                  <strong style={{ color: '#059669' }}>{formatEGP(matchedOrder.total)}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
