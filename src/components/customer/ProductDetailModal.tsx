import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  Star, 
  CheckCircle2, 
  ShoppingBag, 
  Zap, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  Plus, 
  Minus,
  Sparkles,
  Flame
} from 'lucide-react';
import { formatEGP, calculateDiscountPercentage } from '../../utils/formatters';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProduct, 
    setSelectedProduct, 
    addToCart, 
    openCheckoutWithSingleProduct 
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!selectedProduct) return null;

  const savings = selectedProduct.originalPrice - selectedProduct.sellingPrice;
  const discountPercent = calculateDiscountPercentage(selectedProduct.originalPrice, selectedProduct.sellingPrice);

  return (
    <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}>
      <div 
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* زر الإغلاق */}
        <button 
          className="modal-close-btn"
          onClick={() => setSelectedProduct(null)}
          title="إغلاق"
        >
          <X size={20} />
        </button>

        <div className="product-detail-grid">
          {/* معرض الصور */}
          <div>
            <div className="gallery-main">
              <img 
                src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]} 
                alt={selectedProduct.titleAr} 
              />
              {savings > 0 && (
                <div className="card-discount-badge" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
                  وفر {savings} ج.م ({discountPercent}%)
                </div>
              )}
            </div>

            {/* المصغرات */}
            {selectedProduct.images.length > 1 && (
              <div className="gallery-thumbs">
                {selectedProduct.images.map((img, idx) => (
                  <div 
                    key={idx}
                    className={`gallery-thumb ${activeImageIndex === idx ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={img} alt="مصغرة" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* مميزات سريعة تحت المعرض */}
            <div style={{ 
              marginTop: '1.25rem', 
              padding: '1rem', 
              background: 'var(--bg-subtle)', 
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}>
              <div className="flex items-center gap-2" style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                <ShieldCheck size={18} color="var(--accent-emerald)" />
                <span>معاينة وفحص المنتج أمام مندوب الشحن قبل دفع أي أموال</span>
              </div>
              <div className="flex items-center gap-2" style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                <Truck size={18} color="var(--primary)" />
                <span>شحن وتوصيل سريع لباب البيت لكافة محافظات مصر</span>
              </div>
              <div className="flex items-center gap-2" style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                <RefreshCw size={18} color="var(--accent-amber)" />
                <span>ضمان استبدال واسترجاع خلال 14 يوماً في حالة عيوب الصناعة</span>
              </div>
            </div>
          </div>

          {/* تفاصيل ووصف ومميزات المنتج */}
          <div className="flex flex-col">
            <div className="detail-badge-row">
              <span className="badge badge-blue">{selectedProduct.categoryAr}</span>
              {selectedProduct.dealBadge && (
                <span className="badge badge-amber">
                  <Flame size={12} />
                  {selectedProduct.dealBadge}
                </span>
              )}
            </div>

            <h2 className="detail-title">{selectedProduct.titleAr}</h2>

            {/* التقييم */}
            <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
              <div className="flex items-center gap-1" style={{ color: '#f59e0b' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" />
                ))}
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{selectedProduct.rating}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                ({selectedProduct.reviewsCount} تقييم مشترٍ موثق)
              </span>
            </div>

            {/* بوكس السعر */}
            <div className="detail-pricing-box">
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>السعر الحالي</div>
                <div className="flex items-baseline gap-2">
                  <span style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--primary)' }}>
                    {formatEGP(selectedProduct.sellingPrice)}
                  </span>
                  {selectedProduct.originalPrice > selectedProduct.sellingPrice && (
                    <span style={{ textDecoration: 'line-through', color: 'var(--text-light)', fontSize: '1.1rem' }}>
                      {formatEGP(selectedProduct.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {savings > 0 && (
                <div style={{ textAlign: 'left' }}>
                  <span className="badge badge-emerald" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                    وفرت اليوم {savings} ج.م!
                  </span>
                </div>
              )}
            </div>

            {/* الوصف وحل المشكلة */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={16} color="var(--primary)" />
                <span>لماذا ستحب هذا المنتج؟</span>
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {selectedProduct.descriptionAr}
              </p>
            </div>

            {/* قائمة المميزات */}
            {selectedProduct.features && selectedProduct.features.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.65rem' }}>المميزات الرئيسية:</h4>
                <ul className="features-list">
                  {selectedProduct.features.map((feature, i) => (
                    <li key={i} className="feature-item">
                      <CheckCircle2 size={18} className="feature-check-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* جدول المواصفات */}
            {selectedProduct.specifications && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.5rem' }}>المواصفات الفنية:</h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                  gap: '0.5rem',
                  fontSize: '0.825rem'
                }}>
                  {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                    <div key={key} style={{ background: 'var(--bg-subtle)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>{key}</span>
                      <strong style={{ color: 'var(--text-main)' }}>{value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* عداد الكمية وأزرار الشراء */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>الكمية:</span>
                <div className="flex items-center" style={{ 
                  border: '1.5px solid var(--border-color)', 
                  borderRadius: 'var(--radius-md)', 
                  overflow: 'hidden',
                  background: 'var(--bg-card)'
                }}>
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ padding: '0.4rem 0.75rem', background: 'var(--bg-subtle)' }}
                  >
                    <Minus size={16} />
                  </button>
                  <span style={{ width: '40px', textAlign: 'center', fontWeight: 800 }}>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                    style={{ padding: '0.4rem 0.75rem', background: 'var(--bg-subtle)' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  (المتوفر: {selectedProduct.stock} قطعة)
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  className="btn btn-emerald btn-lg flex items-center justify-center gap-2"
                  onClick={() => {
                    openCheckoutWithSingleProduct(selectedProduct, quantity);
                    setSelectedProduct(null);
                  }}
                  style={{ width: '100%' }}
                >
                  <Zap size={20} fill="currentColor" />
                  <span>اطلب الآن — الدفع عند الاستلام ({formatEGP(selectedProduct.sellingPrice * quantity)})</span>
                </button>

                <button
                  className="btn btn-outline flex items-center justify-center gap-2"
                  onClick={() => {
                    addToCart(selectedProduct, quantity);
                    setSelectedProduct(null);
                  }}
                  style={{ width: '100%', padding: '0.75rem' }}
                >
                  <ShoppingBag size={18} />
                  <span>إضافة إلى سلة المشتريات</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
