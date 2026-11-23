import React, { useState } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  Sparkles, 
  HelpCircle,
  BarChart2,
  PieChart
} from 'lucide-react';
import { formatEGP } from '../../utils/formatters';

export const TaagerProfitCalculator: React.FC = () => {
  // مدخلات الحاسبة
  const [taagerCost, setTaagerCost] = useState<number>(180);
  const [sellingPrice, setSellingPrice] = useState<number>(350);
  const [shippingCost, setShippingCost] = useState<number>(50);
  const [adSpendPerOrder, setAdSpendPerOrder] = useState<number>(65); // تكلفة الإعلان للطلب (CAC)
  const [returnRate, setReturnRate] = useState<number>(15); // نسبة المرتجعات في مصر %
  const [monthlyOrdersTarget, setMonthlyOrdersTarget] = useState<number>(200);

  // العمليات الحسابية
  const grossMargin = sellingPrice - taagerCost;
  const grossMarginPercent = sellingPrice > 0 ? Math.round((grossMargin / sellingPrice) * 100) : 0;

  // تأثير المرتجعات: تكلفة شحن راجع وخسارة إعلان
  const returnDeductionPerOrder = Math.round((shippingCost * 0.5 + adSpendPerOrder) * (returnRate / 100));

  // صافي الربح الحقيقي لكل طلب يتم تسليمه
  const netProfitPerOrder = Math.max(0, grossMargin - adSpendPerOrder - returnDeductionPerOrder);
  const netMarginPercent = sellingPrice > 0 ? Math.round((netProfitPerOrder / sellingPrice) * 100) : 0;

  // التوقعات الشهرية
  const successfulOrders = Math.round(monthlyOrdersTarget * (1 - returnRate / 100));
  const monthlyRevenue = monthlyOrdersTarget * sellingPrice;
  const monthlyTaagerCosts = monthlyOrdersTarget * taagerCost;
  const monthlyAdSpend = monthlyOrdersTarget * adSpendPerOrder;
  const monthlyNetProfit = successfulOrders * netProfitPerOrder;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div className="admin-table-card">
        <div className="admin-table-header">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calculator size={20} color="var(--primary)" />
              <span>حاسبة أرباح وهوامش دروبشيبينغ تاجر في مصر (Taager Profit Engine)</span>
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              احسب صافي ربحك الحقيقي بعد خصم تكلفة إعلانات التيك توك والفيسبوك ونسبة المرتجعات في السوق المصري
            </span>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* شبكة المدخلات والنتائج */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* بطاقة المدخلات */}
            <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>
                ⚙️ بيانات المنتج والتسويق:
              </h3>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.825rem' }}>
                  سعر تكلفة المنتج على تاجر (ج.م) *
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={taagerCost}
                  onChange={(e) => setTaagerCost(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.825rem' }}>
                  سعر البيع المقترح للعميل بالمتجر (ج.م) *
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.825rem' }}>
                  تكلفة الإعلان المتوقعة لجلب الطلب الواحد (CAC / CPA) ج.م
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={adSpendPerOrder}
                  onChange={(e) => setAdSpendPerOrder(Number(e.target.value))}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  (لو شغال Organic مجاناً ضع 0، لو إعلانات ممولة متوسطها 50-80 ج.م)
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.825rem' }}>
                  نسبة المرتجعات وعدم الاستلام المتوقعة (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={returnRate}
                    onChange={(e) => setReturnRate(Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontWeight: 800, width: '45px', textAlign: 'center' }}>{returnRate}%</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  (المتوسط في مصر عادة بين 10% إلى 20% عند استخدام تأكيد الواتساب)
                </span>
              </div>
            </div>

            {/* بطاقة النتائج الفورية لكل طلب */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #064e3b, #047857)', 
                color: '#ffffff', 
                borderRadius: 'var(--radius-lg)', 
                padding: '1.5rem',
                boxShadow: 'var(--shadow-md)'
              }}>
                <div style={{ fontSize: '0.825rem', color: '#a7f3d0' }}>صافي ربحك في جيبك لكل طلب مُسلّم:</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, margin: '0.35rem 0', fontFamily: 'var(--font-latin), var(--font-arabic)' }}>
                  +{formatEGP(netProfitPerOrder)}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#d1fae5' }}>
                  هامش صافي: <strong style={{ color: '#ffffff' }}>{netMarginPercent}%</strong> من سعر البيع
                </div>
              </div>

              {/* تفاصيل التوزيع */}
              <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '0.75rem' }}>تشريح سعر البيع ({formatEGP(sellingPrice)}):</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem' }}>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>1. تكلفة المنتج لتاجر:</span>
                    <strong style={{ color: '#ef4444' }}>-{formatEGP(taagerCost)}</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>2. الهامش الإجمالي المبدئي:</span>
                    <strong style={{ color: '#2563eb' }}>+{formatEGP(grossMargin)} ({grossMarginPercent}%)</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>3. تكلفة الإعلان لكل مبيعة:</span>
                    <strong style={{ color: '#d97706' }}>-{formatEGP(adSpendPerOrder)}</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>4. مخصص مخاطرة المرتجعات ({returnRate}%):</span>
                    <strong style={{ color: '#64748b' }}>-{formatEGP(returnDeductionPerOrder)}</strong>
                  </div>

                  <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 800 }}>الصافي النهائي للطلب:</span>
                    <strong style={{ fontSize: '1.05rem', color: '#059669' }}>+{formatEGP(netProfitPerOrder)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* سيناريوهات الربح الشهري حسب عدد الطلبات (كما في دراسة الجدوى) */}
          <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={18} color="var(--primary)" />
              <span>سيناريوهات الأرباح الشهرية المتوقعة (دراسة الجدوى):</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              بناءً على تحقيق متوسط {formatEGP(netProfitPerOrder)} صافي لكل طلب ناجح:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {/* مستوى البداية */}
              <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <div className="badge badge-amber" style={{ marginBottom: '0.5rem' }}>مستوى البداية (Organic)</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>50 طلب شهرياً (1-2 طلب/يوم)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', margin: '0.35rem 0' }}>
                  {formatEGP(Math.round(50 * (1 - returnRate/100) * netProfitPerOrder))}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#059669' }}>صافي ربح شهري تقريبي</span>
              </div>

              {/* مستوى متوسط وجيد */}
              <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '2px solid var(--primary)' }}>
                <div className="badge badge-blue" style={{ marginBottom: '0.5rem' }}>مستوى جيد ومستقر ⭐</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>200 طلب شهرياً (6-7 طلبات/يوم)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', margin: '0.35rem 0' }}>
                  {formatEGP(Math.round(200 * (1 - returnRate/100) * netProfitPerOrder))}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#059669' }}>صافي ربح شهري تقريبي</span>
              </div>

              {/* مستوى متقدم وتوسع */}
              <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <div className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>مستوى توسع قوي 🚀</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>500 طلب شهرياً (15-17 طلب/يوم)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669', margin: '0.35rem 0' }}>
                  {formatEGP(Math.round(500 * (1 - returnRate/100) * netProfitPerOrder))}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#059669' }}>صافي ربح شهري تقريبي</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
