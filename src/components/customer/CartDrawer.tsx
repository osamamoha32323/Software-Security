import React from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowLeft, 
  ShieldCheck,
  Truck
} from 'lucide-react';
import { formatEGP } from '../../utils/formatters';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    cartCount, 
    cartSubtotal, 
    isCartOpen, 
    setIsCartOpen, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    setIsCheckoutOpen 
  } = useStore();

  if (!isCartOpen) return null;

  return (
    <>
      {/* خلفية معتمة */}
      <div 
        className="drawer-backdrop"
        onClick={() => setIsCartOpen(false)}
      />

      {/* لوحة السلة المنزلقة */}
      <div className="drawer-container">
        {/* هيدر السلة */}
        <div className="drawer-header">
          <div className="flex items-center gap-2">
            <ShoppingBag size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>سلة المشتريات</h3>
            <span className="badge badge-blue">
              {cartCount} منتجات
            </span>
          </div>

          <button 
            onClick={() => setIsCartOpen(false)}
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'var(--bg-subtle)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* محتوى السلة */}
        {cart.length === 0 ? (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '2rem', 
            textAlign: 'center' 
          }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: 'var(--bg-subtle)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'var(--text-light)', 
              marginBottom: '1rem' 
            }}>
              <ShoppingBag size={40} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>سلتك فارغة حالياً</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '240px' }}>
              تصفح أحدث المنتجات والعروض الرائعة وأضف ما يعجبك بضغطة زر واحدة.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => setIsCartOpen(false)}
            >
              ابدأ التسوق الآن
            </button>
          </div>
        ) : (
          <div className="drawer-items-list">
            {cart.map((item) => (
              <div key={item.product.id} className="drawer-item">
                <img 
                  src={item.product.images[0]} 
                  alt={item.product.titleAr} 
                  className="drawer-item-img" 
                />

                <div className="flex flex-col" style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-start justify-between gap-1" style={{ marginBottom: '0.35rem' }}>
                    <h5 style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: 700, 
                      lineHeight: 1.3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.product.titleAr}
                    </h5>
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      style={{ color: '#ef4444', padding: '2px' }}
                      title="حذف"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {formatEGP(item.product.sellingPrice)} للقطعة
                  </div>

                  <div className="flex items-center justify-between" style={{ marginTop: 'auto' }}>
                    {/* تحكم في الكمية مع دعم الإدخال المباشر لاختبار ثغرة الكميات السالبة */}
                    <div className="flex items-center" style={{ 
                      border: '1px solid var(--border-color)', 
                      borderRadius: 'var(--radius-sm)',
                      background: '#ffffff'
                    }}>
                      <button 
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        style={{ padding: '0.2rem 0.5rem' }}
                      >
                        <Minus size={13} />
                      </button>
                      <input 
                        type="number"
                        style={{ 
                          width: '44px', 
                          textAlign: 'center', 
                          border: 'none', 
                          fontSize: '0.85rem', 
                          fontWeight: 800, 
                          outline: 'none',
                          padding: '2px 0' 
                        }}
                        value={item.quantity}
                        onChange={(e) => updateCartQuantity(item.product.id, Number(e.target.value))}
                      />
                      <button 
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        style={{ padding: '0.2rem 0.5rem' }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* إجمالي سعر البند */}
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--primary)' }}>
                      {formatEGP(item.product.sellingPrice * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button 
              onClick={clearCart}
              style={{ 
                alignSelf: 'center', 
                color: 'var(--text-muted)', 
                fontSize: '0.78rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                marginTop: '0.5rem'
              }}
            >
              <Trash2 size={13} />
              <span>تفريغ محتويات السلة</span>
            </button>
          </div>
        )}

        {/* تذييل السلة ومجموع الحساب */}
        {cart.length > 0 && (
          <div className="drawer-footer">
            <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>المجموع الفرعي:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {formatEGP(cartSubtotal)}
              </span>
            </div>

            <div className="flex items-center gap-1" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              <Truck size={14} color="var(--primary)" />
              <span>يتم احتساب مصاريف الشحن بدقة حسب محافظتك في الخطوة التالية.</span>
            </div>

            <button
              className="btn btn-emerald btn-lg flex items-center justify-center gap-2"
              style={{ width: '100%' }}
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
            >
              <span>متابعة إتمام الطلب (الدفع عند الاستلام)</span>
              <ArrowLeft size={18} />
            </button>

            <div className="flex items-center justify-center gap-1" style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#059669' }}>
              <ShieldCheck size={14} />
              <span>تسوق آمن • الدفع كاش عند استلام ومعاينة الطلب</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
