import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Tag, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Percent,
  Calendar,
  X
} from 'lucide-react';
import { formatEGP, formatArabicDate } from '../../utils/formatters';
import { Coupon } from '../../types/coupon';

export const CouponManager: React.FC = () => {
  const { 
    coupons, 
    createCoupon, 
    deleteCoupon, 
    toggleCouponActive 
  } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [maxDiscount, setMaxDiscount] = useState<number>(200);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(150);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [isSingleUse, setIsSingleUse] = useState(true);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    createCoupon({
      code: code.trim().toUpperCase(),
      discountPercent: Number(discountPercent),
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      minOrderAmount: Number(minOrderAmount),
      expiryDate: new Date(expiryDate).toISOString(),
      isActive: true,
      isSingleUsePerUser: isSingleUse,
      descriptionAr: descriptionAr.trim() || `كوبون خصم ${discountPercent}%`
    });

    setShowAddModal(false);
    setCode('');
    setDescriptionAr('');
  };

  return (
    <div className="admin-content-box animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Tag size={22} color="var(--primary)" />
            <span>إدارة كوبونات الخصم والعروض (Coupon Management)</span>
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            إنشاء أكواد الخصم، تحديد نسب التخفيض، تواريخ الانتهاء، ومتابعة معدل الاستخدام لمنع التلاعب.
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowAddModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Plus size={16} />
          <span>إنشاء كوبون جديد</span>
        </button>
      </div>

      {/* جدول الكوبونات */}
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>كود الكوبون</th>
              <th>نسبة الخصم</th>
              <th>الحد الأدنى للطلب</th>
              <th>تاريخ الصلاحية</th>
              <th>نوع الاستخدام</th>
              <th>مرات الاستخدام</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(coupon => {
              const isExpired = new Date(coupon.expiryDate) < new Date();

              return (
                <tr key={coupon.id}>
                  <td>
                    <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--primary)', letterSpacing: '1px' }}>
                      {coupon.code}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {coupon.descriptionAr}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-emerald" style={{ fontWeight: 800 }}>
                      {coupon.discountPercent}%
                    </span>
                    {coupon.maxDiscount && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                        بحد أقصى {formatEGP(coupon.maxDiscount)}
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700 }}>{formatEGP(coupon.minOrderAmount)}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: isExpired ? '#ef4444' : 'var(--text-main)', fontWeight: isExpired ? 800 : 500 }}>
                      {formatArabicDate(coupon.expiryDate)}
                      {isExpired && <span style={{ display: 'block', color: '#b91c1c', fontSize: '0.7rem' }}>منتهي الصلاحية</span>}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem' }}>
                      {coupon.isSingleUsePerUser ? 'مرة واحدة لكل عميل' : 'متعدد الاستخدام'}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-blue">
                      {coupon.usedByUsers.length} عملاء
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${coupon.isActive && !isExpired ? 'badge-emerald' : 'badge-slate'}`}>
                      {coupon.isActive && !isExpired ? 'نشط وفعال' : 'معطل'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                        onClick={() => toggleCouponActive(coupon.id)}
                      >
                        {coupon.isActive ? 'تعطيل' : 'تفعيل'}
                      </button>

                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '0.75rem', color: '#ef4444', padding: '2px 8px' }}
                        onClick={() => deleteCoupon(coupon.id)}
                        title="حذف الكوبون"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* نافذة إضافة كوبون جديد */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" style={{ maxWidth: '480px', padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              إنشاء كوبون خصم جديد
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              حدد كود الخصم ونسبة التخفيض والشروط المقيدة لمنع التلاعب
            </p>

            <form onSubmit={handleCreateCoupon}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  كود الخصم (Coupon Code) *
                </label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px' }}
                  placeholder="مثال: WINTER2026"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    نسبة الخصم (%) *
                  </label>
                  <input
                    type="number"
                    className="search-input"
                    style={{ width: '100%' }}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    min={1}
                    max={100}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    أقصى قيمة للخصم (ج.م)
                  </label>
                  <input
                    type="number"
                    className="search-input"
                    style={{ width: '100%' }}
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    min={10}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    الحد الأدنى للطلب (ج.م)
                  </label>
                  <input
                    type="number"
                    className="search-input"
                    style={{ width: '100%' }}
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    min={0}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    تاريخ انتهاء الصلاحية
                  </label>
                  <input
                    type="date"
                    className="search-input"
                    style={{ width: '100%' }}
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  الوصف التوضيحي للكوبون
                </label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%' }}
                  placeholder="مثال: خصم خاص للطلاب على الأجهزة الذكية"
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={isSingleUse}
                    onChange={(e) => setIsSingleUse(e.target.checked)}
                  />
                  <span>صالح للاستخدام مرة واحدة فقط لكل مستخدم (حماية من Replay Attack)</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 800 }}>
                  إنشاء الكوبون الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
