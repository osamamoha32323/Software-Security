import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types/ecommerce';
import { STORE_CATEGORIES } from '../../data/egyptGovernorates';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  DollarSign, 
  Package, 
  Sparkles, 
  X,
  CheckCircle2
} from 'lucide-react';
import { formatEGP, calculateProfitMargin } from '../../utils/formatters';

interface ProductManagerProps {
  showAddModal?: boolean;
  setShowAddModal?: (show: boolean) => void;
}

export const ProductManager: React.FC<ProductManagerProps> = () => {
  const { products, addProduct, updateProduct, deleteProduct, toggleProductActive } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // نوافذ الإضافة والتعديل
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // حقول النموذج
  const [titleAr, setTitleAr] = useState('');
  const [category, setCategory] = useState('gadgets');
  const [taagerPrice, setTaagerPrice] = useState<number>(150);
  const [sellingPrice, setSellingPrice] = useState<number>(300);
  const [originalPrice, setOriginalPrice] = useState<number>(400);
  const [stock, setStock] = useState<number>(25);
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [featuresText, setFeaturesText] = useState('');

  // فتح نافذة الإضافة
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setTitleAr('');
    setCategory('gadgets');
    setTaagerPrice(150);
    setSellingPrice(295);
    setOriginalPrice(390);
    setStock(20);
    setSku(`TG-${Math.floor(1000 + Math.random() * 9000)}`);
    setImageUrl('https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80');
    setDescriptionAr('');
    setFeaturesText('');
    setIsModalOpen(true);
  };

  // فتح نافذة التعديل
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setTitleAr(product.titleAr);
    setCategory(product.category);
    setTaagerPrice(product.taagerPrice);
    setSellingPrice(product.sellingPrice);
    setOriginalPrice(product.originalPrice);
    setStock(product.stock);
    setSku(product.sku);
    setImageUrl(product.images[0] || '');
    setDescriptionAr(product.descriptionAr);
    setFeaturesText(product.features ? product.features.join('\n') : '');
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const currentCat = STORE_CATEGORIES.find(c => c.id === category) || STORE_CATEGORIES[1];
    const features = featuresText
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const images = imageUrl.trim() ? [imageUrl.trim()] : [
      'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80'
    ];

    if (editingProduct) {
      // تعديل منتج قائم
      updateProduct({
        ...editingProduct,
        title: titleAr,
        titleAr,
        category,
        categoryAr: currentCat.nameAr,
        taagerPrice: Number(taagerPrice),
        sellingPrice: Number(sellingPrice),
        originalPrice: Number(originalPrice),
        stock: Number(stock),
        sku: sku || editingProduct.sku,
        images,
        description: descriptionAr,
        descriptionAr,
        features: features.length > 0 ? features : editingProduct.features
      });
    } else {
      // إضافة منتج جديد
      addProduct({
        title: titleAr,
        titleAr,
        description: descriptionAr,
        descriptionAr,
        category,
        categoryAr: currentCat.nameAr,
        taagerPrice: Number(taagerPrice),
        sellingPrice: Number(sellingPrice),
        originalPrice: Number(originalPrice),
        stock: Number(stock),
        sku: sku || `TG-${Date.now().toString().slice(-4)}`,
        images,
        rating: 4.8,
        reviewsCount: 1,
        features: features.length > 0 ? features : ['جودة ممتازة مطابقة للمواصفات', 'شحن وتوصيل لباب البيت'],
        isFeatured: true,
        isDeal: true,
        dealBadge: 'جديد وحصري',
        isActive: true
      });
    }

    setIsModalOpen(false);
  };

  // تصفية المنتجات
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.titleAr.includes(searchQuery) || product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // حساب الهامش في النموذج
  const currentMargin = calculateProfitMargin(Number(taagerPrice) || 0, Number(sellingPrice) || 0);

  return (
    <div>
      {/* شريط الإجراءات والبحث */}
      <div className="admin-table-card">
        <div className="admin-table-header">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>إدارة منتجات المتجر</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              إضافة وتعديل المنتجات المسحوبة من تاجر وحساب هوامش أرباحها
            </span>
          </div>

          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={handleOpenAddModal}
            >
              <Plus size={18} />
              <span>إضافة منتج من تاجر</span>
            </button>
          </div>
        </div>

        {/* فلاتر البحث والقسم */}
        <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="search-input-wrapper" style={{ flex: 1, maxWidth: '400px', background: '#ffffff' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              className="search-input"
              placeholder="ابحث باسم المنتج أو كود تاجر (SKU)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', background: '#ffffff' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {STORE_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.nameAr}</option>
            ))}
          </select>
        </div>

        {/* جدول المنتجات */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>المنتج</th>
                <th>القسم</th>
                <th>كود تاجر</th>
                <th>تكلفة تاجر</th>
                <th>سعر البيع</th>
                <th>ربحك في القطعة</th>
                <th>المخزون</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const margin = calculateProfitMargin(product.taagerPrice, product.sellingPrice);

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="flex items-center gap-2" style={{ maxWidth: '280px' }}>
                        <img
                          src={product.images[0]}
                          alt={product.titleAr}
                          style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ 
                            display: 'block', 
                            fontSize: '0.875rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis' 
                          }}>
                            {product.titleAr}
                          </strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            تقييم: ★ {product.rating} ({product.reviewsCount})
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-blue">{product.categoryAr}</span>
                    </td>

                    <td>
                      <code style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                        {product.sku}
                      </code>
                    </td>

                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                        {formatEGP(product.taagerPrice)}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
                        {formatEGP(product.sellingPrice)}
                      </span>
                    </td>

                    <td>
                      <span className="badge badge-emerald" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>
                        +{formatEGP(margin.profit)} ({margin.marginPercent}%)
                      </span>
                    </td>

                    <td>
                      <span style={{ 
                        fontWeight: 800, 
                        color: product.stock < 10 ? '#ef4444' : 'var(--text-main)' 
                      }}>
                        {product.stock} قطعة
                      </span>
                    </td>

                    <td>
                      <button
                        onClick={() => toggleProductActive(product.id)}
                        className={`badge ${product.isActive ? 'badge-emerald' : 'badge-rose'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="انقر لتفعيل أو تعطيل المنتج"
                      >
                        {product.isActive ? 'نشط بالمتجر' : 'معطل'}
                      </button>
                    </td>

                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 8px', color: 'var(--primary)' }}
                          title="تعديل المنتج والأسعار"
                        >
                          <Edit3 size={15} />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف منتج "${product.titleAr}"؟`)) {
                              deleteProduct(product.id);
                            }
                          }}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 8px', color: '#ef4444' }}
                          title="حذف المنتج"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* نافذة إضافة / تعديل منتج (Modal) */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div 
            className="modal-container"
            style={{ maxWidth: '650px', padding: '1.75rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="modal-close-btn"
              onClick={() => setIsModalOpen(false)}
              title="إغلاق"
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              {editingProduct ? 'تعديل بيانات المنتج وأسعار تاجر' : 'إضافة منتج جديد من منصة تاجر'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              حدد سعر التكلفة من تاجر وسعر البيع للعميل، وسيقوم النظام بحساب أرباحك الصافية تلقائياً.
            </p>

            <form onSubmit={handleSaveProduct}>
              {/* اسم المنتج */}
              <div className="form-group">
                <label className="form-label">اسم المنتج باللغة العربية *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="مثال: مروحة رقبة محمولة لاسلكية بـ 3 سرعات"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  required
                />
              </div>

              {/* القسم وكود تاجر */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">القسم *</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {STORE_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.nameAr}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">كود المنتج في تاجر (SKU)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="مثال: TG-FAN-01"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>
              </div>

              {/* بطاقة التسعير وحساب هامش ربح تاجر */}
              <div style={{ 
                background: '#ecfdf5', 
                border: '1.5px solid #10b981', 
                borderRadius: 'var(--radius-lg)', 
                padding: '1rem',
                margin: '1rem 0'
              }}>
                <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem', color: '#065f46', fontWeight: 800 }}>
                  <Sparkles size={18} />
                  <span>حاسبة هامش الربح المباشر:</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem', color: '#065f46' }}>
                      تكلفة تاجر (ج.م) *
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      value={taagerPrice}
                      onChange={(e) => setTaagerPrice(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem', color: '#065f46' }}>
                      سعر بيعك للعميل (ج.م) *
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem', color: '#065f46' }}>
                      السعر القديم قبل الخصم
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* المعاينة الحية للربح */}
                <div style={{ 
                  marginTop: '0.75rem', 
                  paddingTop: '0.5rem', 
                  borderTop: '1px dashed #a7f3d0', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  fontSize: '0.85rem'
                }}>
                  <span>صافي مكسبك لكل قطعة تبيعها:</span>
                  <strong style={{ fontSize: '1.1rem', color: '#047857' }}>
                    +{formatEGP(currentMargin.profit)} (هامش {currentMargin.marginPercent}%)
                  </strong>
                </div>
              </div>

              {/* رابط الصورة والكمية */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">رابط صورة المنتج (URL)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">الكمية المتوفرة *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              {/* الوصف */}
              <div className="form-group">
                <label className="form-label">وصف المنتج وحل المشكلة للعميل</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="اكتب كيف يحل هذا المنتج مشكلة العميل ولماذا يشتريه فوراً..."
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                />
              </div>

              {/* المميزات سطر بسطر */}
              <div className="form-group">
                <label className="form-label">أهم المميزات (اكتب كل ميزة في سطر منفصل)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="مقاوم للماء&#10;شحن سريع عبر USB&#10;ضمان استبدال فوري"
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                />
              </div>

              {/* زر الحفظ */}
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <CheckCircle2 size={18} />
                <span>{editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج إلى المتجر فوراً'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
