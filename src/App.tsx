import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Footer } from './components/layout/Footer';
import { HeroBanner } from './components/customer/HeroBanner';
import { CategoryPills } from './components/customer/CategoryPills';
import { ProductCard } from './components/customer/ProductCard';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { OrderTrackingModal } from './components/customer/OrderTrackingModal';
import { NewsletterSection } from './components/customer/NewsletterSection';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/customer/UserProfileModal';
import { SecurityInspectorModal } from './components/security/SecurityInspectorModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { 
  Sparkles, 
  Flame, 
  ArrowUpDown, 
  PackageOpen
} from 'lucide-react';

const StoreContent: React.FC = () => {
  const { 
    currentView, 
    products, 
    searchQuery, 
    setSearchQuery,
    selectedCategory, 
    sortBy, 
    setSortBy 
  } = useStore();

  // تصفية المنتجات النشطة
  const activeProducts = products.filter(p => p.isActive);

  // التصفية حسب البحث والتصنيف
  const filteredProducts = activeProducts.filter(product => {
    const matchesSearch = 
      product.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.features && product.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // الترتيب
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.sellingPrice - b.sellingPrice;
    if (sortBy === 'price-desc') return b.sellingPrice - a.sellingPrice;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  // منتجات عروض اليوم
  const dealProducts = activeProducts.filter(p => p.isDeal);

  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {currentView === 'admin' ? (
        <AdminDashboard />
      ) : (
        <main style={{ flex: 1 }}>
          {/* بانر العروض فقط إذا لم يكن هناك بحث نشط */}
          {!searchQuery && selectedCategory === 'all' && <HeroBanner />}

          {/* شريط الأقسام */}
          <CategoryPills />

          {/* قسم عروض اليوم الخاطفة */}
          {!searchQuery && selectedCategory === 'all' && dealProducts.length > 0 && (
            <section style={{ marginBottom: '2.5rem' }}>
              <div className="container">
                <div className="section-header">
                  <div>
                    <h2 className="section-title">
                      <Flame size={22} color="#f59e0b" />
                      <span>عروض وتخفيضات اليوم الحصرية 🔥</span>
                    </h2>
                    <p className="section-subtitle">
                      أعلى المنتجات طلباً مع خصومات تصل إلى 40% وضمان معاينة قبل الاستلام
                    </p>
                  </div>
                </div>

                <div className="products-grid">
                  {dealProducts.slice(0, 4).map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* قسم جميع المنتجات مع الفلترة والترتيب */}
          <section id="featured-products" style={{ marginBottom: '3.5rem' }}>
            <div className="container">
              <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 className="section-title">
                    <Sparkles size={22} color="var(--primary)" />
                    <span>
                      {searchQuery ? `نتائج البحث عن "${searchQuery}"` : 'أحدث المنتجات والأجهزة الإلكترونية'}
                    </span>
                  </h2>
                  <p className="section-subtitle">
                    تم العثور على {sortedProducts.length} منتج متوفر للشحن الفوري
                  </p>
                </div>

                {/* أداة الترتيب */}
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <ArrowUpDown size={15} />
                    <span>ترتيب حسب:</span>
                  </span>
                  <select 
                    className="form-select"
                    style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.825rem' }}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <option value="featured">المميز والأكثر طلباً</option>
                    <option value="rating">الأعلى تقييماً ★</option>
                    <option value="price-asc">السعر: من الأقل للأعلى</option>
                    <option value="price-desc">السعر: من الأعلى للأقل</option>
                  </select>
                </div>
              </div>

              {/* شبكة المنتجات */}
              {sortedProducts.length > 0 ? (
                <div className="products-grid">
                  {sortedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div style={{ 
                  background: '#ffffff', 
                  borderRadius: 'var(--radius-xl)', 
                  border: '1px solid var(--border-color)', 
                  padding: '3rem 1.5rem', 
                  textAlign: 'center',
                  margin: '1.5rem 0'
                }}>
                  <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '50%', 
                    background: 'var(--bg-subtle)', 
                    color: 'var(--text-muted)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <PackageOpen size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    لم نجد منتجات مطابقة لخيارات البحث
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    جرب البحث بكلمات أخرى أو اختر قسماً آخر من الأقسام المتاحة.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setSearchQuery('')}
                  >
                    عرض جميع المنتجات
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* قسم النشرة البريدية والكوبونات الترحيبية */}
          <div className="container">
            <NewsletterSection />
          </div>
        </main>
      )}

      <Footer />
      <MobileBottomNav />

      {/* النوافذ التفاعلية والدرج */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderTrackingModal />
      <AuthModal />
      <UserProfileModal />
      <SecurityInspectorModal />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <StoreContent />
    </StoreProvider>
  );
}
