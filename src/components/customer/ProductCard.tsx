import React from 'react';
import { Product } from '../../types/ecommerce';
import { useStore } from '../../context/StoreContext';
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  Zap, 
  Flame,
  CheckCircle2
} from 'lucide-react';
import { formatEGP, calculateDiscountPercentage } from '../../utils/formatters';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    setSelectedProduct, 
    addToCart, 
    openCheckoutWithSingleProduct, 
    wishlist, 
    toggleWishlist 
  } = useStore();

  const isWishlisted = wishlist.includes(product.id);
  const discountPercent = calculateDiscountPercentage(product.originalPrice, product.sellingPrice);
  const savings = product.originalPrice - product.sellingPrice;

  return (
    <div className="product-card">
      {/* غلاف الصورة والشارات */}
      <div 
        className="card-image-wrapper"
        onClick={() => setSelectedProduct(product)}
        style={{ cursor: 'pointer' }}
      >
        <img 
          src={product.images[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80'} 
          alt={product.titleAr} 
          className="card-img"
          loading="lazy"
        />

        {/* شارة التوفير والخصم */}
        {savings > 0 && (
          <div className="card-discount-badge">
            وفّر {savings} ج.م
          </div>
        )}

        {/* زر المفضلة */}
        <button
          className={`card-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          title={isWishlisted ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
        >
          <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* تفاصيل المنتج */}
      <div className="card-body">
        <div className="card-category">
          {product.categoryAr}
        </div>

        <h3 
          className="card-title"
          onClick={() => setSelectedProduct(product)}
          style={{ cursor: 'pointer' }}
          title={product.titleAr}
        >
          {product.titleAr}
        </h3>

        {/* التقييم */}
        <div className="card-rating-row">
          <Star size={14} fill="#f59e0b" color="#f59e0b" />
          <span>{product.rating}</span>
          <span className="rating-count">({product.reviewsCount} تقييم)</span>
          {product.isDeal && (
            <span className="badge badge-amber" style={{ marginRight: 'auto', fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
              <Flame size={12} />
              عرض اليوم
            </span>
          )}
        </div>

        {/* مؤشر المخزون */}
        {product.stock <= 25 && (
          <div className="stock-indicator">
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#d97706' }}></span>
            <span>متبقي {product.stock} قطع فقط في المخزن</span>
          </div>
        )}

        {/* الأسعار */}
        <div className="card-price-row">
          <span className="price-current">
            {formatEGP(product.sellingPrice)}
          </span>
          {product.originalPrice > product.sellingPrice && (
            <span className="price-original">
              {formatEGP(product.originalPrice)}
            </span>
          )}
        </div>

        {/* أزرار الإجراء السريع */}
        <div className="card-actions">
          {/* زر الشراء المباشر الفوري */}
          <button 
            className="btn btn-card-buy flex items-center justify-center gap-1"
            onClick={() => openCheckoutWithSingleProduct(product, 1)}
            title="اطلب الآن والدفع عند الاستلام"
          >
            <Zap size={15} fill="currentColor" />
            <span>اشتري الآن</span>
          </button>

          {/* زر إضافة للسلة */}
          <button 
            className="btn btn-card-cart flex items-center justify-center gap-1"
            onClick={() => addToCart(product, 1)}
            title="إضافة المنتج لسلة المشتريات"
          >
            <ShoppingBag size={15} />
            <span>أضف للسلة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
