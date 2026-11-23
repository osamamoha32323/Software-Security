import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types/ecommerce';
import { 
  Search, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Package, 
  XCircle, 
  Phone, 
  MapPin, 
  DollarSign, 
  Eye, 
  X,
  FileText
} from 'lucide-react';
import { formatEGP, formatArabicDate, getOrderStatusInfo, createWhatsAppOrderLink } from '../../utils/formatters';

export const OrderManager: React.FC = () => {
  const { orders, updateOrderStatus } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // تصفية الطلبات
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.includes(searchQuery) ||
      order.customerPhone.includes(searchQuery) ||
      order.governorate.includes(searchQuery);

    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const note = `تحديث الحالة إلى: ${getOrderStatusInfo(newStatus).labelAr}`;
    updateOrderStatus(orderId, newStatus, note);
  };

  return (
    <div>
      <div className="admin-table-card">
        {/* هيدر إدارة الطلبات */}
        <div className="admin-table-header">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>إدارة ومتابعة طلبات الزبائن</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              تأكيد الطلبات، ربطها بحساب تاجر، التواصل عبر واتساب، وتحديث دورة حياة الشحن
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge badge-emerald">
              إجمالي الأرباح المحققة: {formatEGP(orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.estimatedProfit, 0))}
            </span>
          </div>
        </div>

        {/* فلاتر الحالات والبحث */}
        <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* شريط أزرار تصفية الحالات */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {[
              { id: 'all', label: 'كافة الطلبات', count: orders.length },
              { id: 'pending', label: 'قيد المراجعة', count: orders.filter(o => o.status === 'pending').length },
              { id: 'confirmed', label: 'تم التأكيد', count: orders.filter(o => o.status === 'confirmed').length },
              { id: 'processing', label: 'قيد التجهيز بتاجر', count: orders.filter(o => o.status === 'processing').length },
              { id: 'shipped', label: 'تم الشحن مع المندوب', count: orders.filter(o => o.status === 'shipped').length },
              { id: 'delivered', label: 'تم التسليم بنجاح', count: orders.filter(o => o.status === 'delivered').length },
              { id: 'cancelled', label: 'ملغي', count: orders.filter(o => o.status === 'cancelled').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  background: selectedStatus === tab.id ? 'var(--primary)' : '#ffffff',
                  color: selectedStatus === tab.id ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: selectedStatus === tab.id ? 'var(--primary)' : 'var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span>{tab.label}</span>
                <span style={{ 
                  fontSize: '0.7rem', 
                  padding: '0.05rem 0.4rem', 
                  borderRadius: '10px',
                  background: selectedStatus === tab.id ? 'rgba(255, 255, 255, 0.3)' : '#f1f5f9' 
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* حقل البحث */}
          <div className="search-input-wrapper" style={{ maxWidth: '480px', background: '#ffffff' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              className="search-input"
              placeholder="ابحث برقم الطلب، اسم العميل، رقم الهاتف، أو المحافظة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* جدول الطلبات */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>رقم الطلب والتاريخ</th>
                <th>العميل والموبايل</th>
                <th>المحافظة والعنوان</th>
                <th>المنتجات المطلوبة</th>
                <th>المبلغ المطلوب</th>
                <th>ربحك الصافي</th>
                <th>حالة الطلب</th>
                <th>إجراءات وتواصل</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    لا توجد طلبات مطابقة للبحث أو الفلتر المحدد حالياً.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const statusInfo = getOrderStatusInfo(order.status);
                  const itemsSummary = order.items.map(i => `${i.product.titleAr} (×${i.quantity})`).join(', ');

                  return (
                    <tr key={order.id}>
                      <td>
                        <strong style={{ fontSize: '0.925rem', color: 'var(--primary)' }}>{order.id}</strong>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {formatArabicDate(order.createdAt)}
                        </div>
                      </td>

                      <td>
                        <strong>{order.customerName}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }} dir="ltr">
                          {order.customerPhone}
                        </div>
                      </td>

                      <td>
                        <span className="badge badge-blue">{order.governorate}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {order.city} - {order.address}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.8rem', maxWidth: '200px' }}>
                          {order.items.map((it, idx) => (
                            <div key={idx} style={{ marginBottom: '2px' }}>
                              • {it.product.titleAr} <strong style={{ color: 'var(--primary)' }}>×{it.quantity}</strong>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                          {formatEGP(order.total)}
                        </strong>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          (شامل {order.shippingCost} ج.م شحن)
                        </div>
                      </td>

                      <td>
                        <span className="badge badge-emerald" style={{ fontSize: '0.825rem', padding: '0.25rem 0.6rem' }}>
                          +{formatEGP(order.estimatedProfit)}
                        </span>
                      </td>

                      {/* محدد الحالة السريع */}
                      <td>
                        <select
                          className="form-select"
                          style={{ 
                            fontSize: '0.8rem', 
                            padding: '0.35rem 0.65rem',
                            fontWeight: 700,
                            borderColor: statusInfo.color,
                            color: statusInfo.color,
                            backgroundColor: statusInfo.bg
                          }}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        >
                          <option value="pending">قيد المراجعة</option>
                          <option value="confirmed">تم التأكيد</option>
                          <option value="processing">قيد التجهيز في تاجر</option>
                          <option value="shipped">تم الشحن مع المندوب</option>
                          <option value="delivered">تم التسليم بنجاح</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                      </td>

                      {/* زر الواتساب وعرض التفاصيل */}
                      <td>
                        <div className="flex items-center gap-1">
                          {/* زر واتساب السريع */}
                          <a
                            href={createWhatsAppOrderLink(
                              order.customerPhone,
                              order.id,
                              order.customerName,
                              order.total,
                              itemsSummary
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-emerald btn-sm"
                            style={{ padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}
                            title="تواصل مع العميل عبر واتساب"
                          >
                            <MessageCircle size={15} />
                            <span>واتساب</span>
                          </a>

                          {/* زر تفاصيل الطلب */}
                          <button
                            onClick={() => setSelectedOrderDetails(order)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '4px 8px', color: 'var(--primary)' }}
                            title="عرض تفاصيل الطلب الكاملة"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* نافذة تفاصيل الطلب الكاملة (Modal) */}
      {selectedOrderDetails && (
        <div className="modal-backdrop" onClick={() => setSelectedOrderDetails(null)}>
          <div 
            className="modal-container"
            style={{ maxWidth: '620px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="modal-close-btn"
              onClick={() => setSelectedOrderDetails(null)}
              title="إغلاق"
            >
              <X size={20} />
            </button>

            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>تفاصيل الطلب:</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)' }}>
                  {selectedOrderDetails.id}
                </h3>
              </div>
              <div>
                {(() => {
                  const info = getOrderStatusInfo(selectedOrderDetails.status);
                  return (
                    <span className="badge" style={{ backgroundColor: info.bg, color: info.color, fontSize: '0.85rem' }}>
                      {info.labelAr}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* بيانات العميل والشحن */}
            <div style={{ background: 'var(--bg-subtle)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>اسم العميل:</span> <strong>{selectedOrderDetails.customerName}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>رقم الموبايل:</span> <strong dir="ltr">{selectedOrderDetails.customerPhone}</strong>
                </div>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>المحافظة والمدينة:</span> <strong>{selectedOrderDetails.governorate} - {selectedOrderDetails.city}</strong>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>العنوان بالتفصيل:</span> <strong>{selectedOrderDetails.address}</strong>
              </div>
              {selectedOrderDetails.notes && (
                <div style={{ color: '#d97706' }}>
                  <span>ملاحظات العميل:</span> <em>{selectedOrderDetails.notes}</em>
                </div>
              )}
            </div>

            {/* تفاصيل المنتجات وتكلفة تاجر وهامش الربح */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.65rem' }}>المنتجات وتفاصيل أرباح تاجر:</h4>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.25rem' }}>
              {selectedOrderDetails.items.map((it, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderBottom: idx < selectedOrderDetails.items.length - 1 ? '1px solid var(--border-color)' : 'none',
                  fontSize: '0.85rem'
                }}>
                  <div>
                    <strong>{it.product.titleAr}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      الكمية: {it.quantity} قطعة • تكلفة تاجر للقطعة: {formatEGP(it.taagerCost)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800 }}>{formatEGP(it.price * it.quantity)}</div>
                    <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
                      ربحك: +{formatEGP((it.price - it.taagerCost) * it.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ملخص الحساب */}
            <div style={{ background: '#ecfdf5', border: '1px solid #10b981', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '0.35rem' }}>
                <span>إجمالي سعر المنتجات:</span>
                <strong>{formatEGP(selectedOrderDetails.subtotal)}</strong>
              </div>
              <div className="flex items-center justify-between" style={{ marginBottom: '0.35rem' }}>
                <span>مصاريف الشحن ({selectedOrderDetails.governorate}):</span>
                <strong>{formatEGP(selectedOrderDetails.shippingCost)}</strong>
              </div>
              <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                <span>تكلفة بضاعة تاجر:</span>
                <span style={{ color: '#b91c1c' }}>-{formatEGP(selectedOrderDetails.totalTaagerCost)}</span>
              </div>
              <div style={{ borderTop: '1px dashed #10b981', paddingTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800 }}>صافي أرباحك في جيبك من هذا الطلب:</span>
                <strong style={{ fontSize: '1.2rem', color: '#059669', marginRight: 'auto' }}>
                  +{formatEGP(selectedOrderDetails.estimatedProfit)}
                </strong>
              </div>
            </div>

            {/* إجراءات سريعة */}
            <div className="flex items-center gap-2">
              <a
                href={createWhatsAppOrderLink(
                  selectedOrderDetails.customerPhone,
                  selectedOrderDetails.id,
                  selectedOrderDetails.customerName,
                  selectedOrderDetails.total,
                  selectedOrderDetails.items.map(i => i.product.titleAr).join(', ')
                )}
                target="_blank"
                rel="noreferrer"
                className="btn btn-emerald flex items-center justify-center gap-2"
                style={{ flex: 1 }}
              >
                <MessageCircle size={18} />
                <span>مراسلة وتأكيد مع العميل واتساب</span>
              </a>

              <button 
                className="btn btn-outline"
                onClick={() => setSelectedOrderDetails(null)}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
