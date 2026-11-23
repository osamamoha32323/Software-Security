import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  Wallet, 
  Plus, 
  Search, 
  Key,
  Shield,
  Clock
} from 'lucide-react';
import { formatEGP, formatArabicDate } from '../../utils/formatters';
import { User, UserRole } from '../../types/auth';

export const UserManager: React.FC = () => {
  const { 
    users, 
    updateUserRole, 
    toggleUserStatus, 
    updateUserCredit,
    currentUser 
  } = useStore();

  const [search, setSearch] = useState('');
  const [selectedUserForCredit, setSelectedUserForCredit] = useState<User | null>(null);
  const [newCreditAmount, setNewCreditAmount] = useState<number>(0);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForCredit || selectedUserForCredit.role === 'admin') return;
    updateUserCredit(selectedUserForCredit.id, Number(newCreditAmount));
    setSelectedUserForCredit(null);
  };

  return (
    <div className="admin-content-box animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={22} color="var(--primary)" />
            <span>إدارة المستخدمين والصلاحيات (User & RBAC Management)</span>
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            التحكم في أدوار الحسابات (Admin / User)، تفعيل الحسابات، وتعديل أرصدة المتجر.
          </p>
        </div>

        {/* شريط البحث عن المستخدمين */}
        <div style={{ minWidth: '240px' }}>
          <input
            type="text"
            className="search-input"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', width: '100%' }}
            placeholder="بحث بالاسم أو البريد الإلكتروني..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* جدول المستخدمين */}
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>المستخدم</th>
              <th>البريد الإلكتروني</th>
              <th>الدور (Role)</th>
              <th>حالة التأكيد</th>
              <th>رصيد المتجر</th>
              <th>تاريخ التسجيل</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const isAdmin = user.role === 'admin';
              const isCurrent = currentUser?.id === user.id;

              return (
                <tr key={user.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {user.name}
                      {isCurrent && <span style={{ fontSize: '0.7rem', color: '#2563eb', marginRight: '4px' }}>(أنت)</span>}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {user.email}
                  </td>
                  <td>
                    <span className={`badge ${isAdmin ? 'badge-blue' : 'badge-slate'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Shield size={12} />
                      <span>{isAdmin ? 'مدير نظام (Admin)' : 'مستخدم (User)'}</span>
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.isConfirmed ? 'badge-emerald' : 'badge-amber'}`}>
                      {user.isConfirmed ? 'مؤكد ومفعل' : 'قيد التأكيد (Pending)'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: isAdmin ? 'var(--text-muted)' : '#059669' }}>
                      {isAdmin ? '—' : formatEGP(user.storeCredit)}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {formatArabicDate(user.createdAt)}
                  </td>
                  <td>
                    {isAdmin ? (
                      <span className="badge badge-slate" style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        حساب محمي 🛡️
                      </span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {/* تبديل الرتبة */}
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                          title="ترقية إلى مدير نظام"
                          onClick={() => updateUserRole(user.id, 'admin')}
                        >
                          ترقية لمدير
                        </button>

                        {/* تعديل الرصيد */}
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '0.75rem', padding: '2px 8px', color: '#059669' }}
                          onClick={() => {
                            setSelectedUserForCredit(user);
                            setNewCreditAmount(user.storeCredit);
                          }}
                          title="تعديل رصيد المتجر"
                        >
                          <Wallet size={14} />
                          <span>الرصيد</span>
                        </button>

                        {/* تفعيل / تعطيل */}
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '0.75rem', padding: '2px 8px', color: user.isConfirmed ? '#ef4444' : '#059669' }}
                          onClick={() => toggleUserStatus(user.id)}
                          title={user.isConfirmed ? 'إلغاء تفعيل الحساب' : 'تفعيل الحساب مباشرة'}
                        >
                          {user.isConfirmed ? 'تعطيل' : 'تفعيل'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* نافذة تعديل الرصيد */}
      {selectedUserForCredit && (
        <div className="modal-backdrop" onClick={() => setSelectedUserForCredit(null)}>
          <div className="modal-container" style={{ maxWidth: '400px', padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              تعديل رصيد المتجر للمستخدم
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              المستخدم: <strong>{selectedUserForCredit.name}</strong> ({selectedUserForCredit.email})
            </p>

            <form onSubmit={handleSaveCredit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  الرصيد الجديد بالجنيه (EGP)
                </label>
                <input
                  type="number"
                  className="search-input"
                  style={{ width: '100%', borderColor: 'var(--border-subtle)', fontWeight: 800 }}
                  value={newCreditAmount}
                  onChange={(e) => setNewCreditAmount(Number(e.target.value))}
                  min={0}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setSelectedUserForCredit(null)}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  حفظ الرصيد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
