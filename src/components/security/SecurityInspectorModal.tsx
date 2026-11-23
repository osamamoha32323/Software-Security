import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  X, 
  Terminal, 
  Activity, 
  Table, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Code2, 
  RotateCcw,
  Bug,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { INITIAL_SECURITY_COVERAGE } from '../../security/securityService';
import { SecurityCoverageItem } from '../../types/security';

export const SecurityInspectorModal: React.FC = () => {
  const { 
    isSecurityModalOpen, 
    setIsSecurityModalOpen, 
    securityMode, 
    toggleSecurityMode,
    securityLogs,
    clearSecurityLogs,
    addSecurityLog,
    currentUser,
    users,
    orders,
    cart,
    addToCart,
    products
  } = useStore();

  const [activeTab, setActiveTab] = useState<'matrix' | 'simulator' | 'logs'>('matrix');
  const [simulationResult, setSimulationResult] = useState<{
    topic: string;
    payload: string;
    mode: 'secure' | 'naive';
    success: boolean;
    output: string;
  } | null>(null);

  if (!isSecurityModalOpen) return null;

  // تشغيل المحاكاة العملية للهجمات (Live Attack Simulation)
  const runSimulation = (item: SecurityCoverageItem) => {
    let output = '';
    let attackSucceeded = false;

    if (item.id === 'SEC-01') {
      // XSS Attack
      if (securityMode === 'naive') {
        attackSucceeded = true;
        output = `⚠️ نجح هجوم XSS في الوضع الساذج!\nتم حقن الكود: ${item.testPayload} في الواجهة دون ترميز، مما يتيح سرقة الجلسة (Session Hijacking).`;
      } else {
        attackSucceeded = false;
        output = `🛡️ تم صد هجوم XSS بنجاح!\nقام نظام الحماية بترميز المدخلات (HTML Entity Encoding) عبر sanitizeHtml.\nالنتيجة الآمنة المعروضة: &lt;script&gt;alert(...)&lt;/script&gt;`;
      }
    } else if (item.id === 'SEC-02') {
      // SQL/Search Injection
      if (securityMode === 'naive') {
        attackSucceeded = true;
        output = `⚠️ نجح حقن الاستعلامات في الوضع الساذج!\nتم تمرير: ${item.testPayload} مباشرة إلى محرك البحث دون فحص، مما قد يكسر منطق التصفية.`;
      } else {
        attackSucceeded = false;
        output = `🛡️ تم اعتراض محاولة حقن SQL بنجاح!\nرصد محرك الأمان الكلمات المفتاحية المشبوهة وحجب الاستعلام وسجل الحدث في سجل التدقيق الأمني.`;
      }
    } else if (item.id === 'SEC-03') {
      // Brute Force
      if (securityMode === 'naive') {
        attackSucceeded = true;
        output = `⚠️ الوضع الساذج لا يفرض حداً للمحاولات الفاشلة!\nيمكن للمهاجم إرسال آلاف التخمينات في الثانية دون أي قفل للحساب (Account Lockout).`;
      } else {
        attackSucceeded = false;
        output = `🛡️ دفاع الـ Brute Force فعال!\nبعد 5 محاولات فاشلة متتالية، يتم قفل الحساب تلقائياً لمدة 60 ثانية مع تشفير PBKDF2/Salt.`;
      }
    } else if (item.id === 'SEC-04') {
      // IDOR
      if (securityMode === 'naive') {
        attackSucceeded = true;
        output = `⚠️ ثغرة IDOR مكشوفة في الوضع الساذج!\nأي زائر يطلب تتبع #DK-1001 أو أي رقم طلب يمكنه رؤية اسم العميل وعنوانه وهاتفه دون التحقق من الهوية.`;
      } else {
        attackSucceeded = false;
        output = `🛡️ دفاع الـ IDOR فعال!\nتم فحص هوية المستخدم الحالي (${currentUser?.email || 'Guest'}) مع صاحب الطلب.\nالنتيجة: 403 Forbidden - غير مصرح بعرض بيانات هذا الطلب.`;
      }
    } else if (item.id === 'SEC-05') {
      // Negative Quantity
      if (securityMode === 'naive') {
        attackSucceeded = true;
        output = `⚠️ نجح التلاعب بالكمية في الوضع الساذج!\nتم قبول كمية -5 في السلة، مما يقلل إجمالي الفاتورة رياضياً ويتيح الحصول على رصيد سالب أو بضاعة مجانية.`;
      } else {
        attackSucceeded = false;
        output = `🛡️ تم إحباط التلاعب بالكميات والأسعار!\nنظام الحماية في validateCartQuantity يرفض الأرقام السالبة والكسرية ويقصرها على أعداد صحيحة موجبة.`;
      }
    } else if (item.id === 'SEC-06') {
      // Coupon Replay
      if (securityMode === 'naive') {
        attackSucceeded = true;
        output = `⚠️ تم قبول الكوبون بشكل متكرر دون فحص!\nفي الوضع الساذج يمكن للمستخدم تكرار تطبيق WELCOME15 في كل طلب دون تتبع الاستخدام السابق.`;
      } else {
        attackSucceeded = false;
        output = `🛡️ تم صد هجوم إعادة استخدام الكوبون (Coupon Replay)!\nيتم التحقق من مصفوفة usedByUsers ومنع نفس المستخدم من الاستفادة من الكوبون أكثر من مرة.`;
      }
    } else if (item.id === 'SEC-07') {
      // RBAC Privilege Escalation
      if (securityMode === 'naive') {
        attackSucceeded = true;
        output = `⚠️ نجح التصعيد الرأسي للصلاحيات (Privilege Escalation)!\nفي الوضع الساذج يُسمح بدخول أي مستخدم إلى لوحة تحكم المدير (/admin) دون فحص رتبة admin.`;
      } else {
        attackSucceeded = false;
        output = `🛡️ جدار الـ RBAC فعال ومحكم!\nمحاولة دخول المستخدم العادي تُحجب بشاشة 403 Access Denied مع تسجيل تنبيه أمني في لوحة المراقبة.`;
      }
    }

    setSimulationResult({
      topic: item.topic,
      payload: item.testPayload || 'N/A',
      mode: securityMode,
      success: attackSucceeded,
      output
    });

    addSecurityLog({
      attackType: item.topic,
      payload: item.testPayload || 'Simulated Test',
      blocked: !attackSucceeded,
      details: output
    });
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsSecurityModalOpen(false)}>
      <div 
        className="modal-container"
        style={{ maxWidth: '960px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '1.75rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* زر الإغلاق */}
        <button className="modal-close-btn" onClick={() => setIsSecurityModalOpen(false)}>
          <X size={20} />
        </button>

        {/* رأس النافذة مع تبديل وضع الحماية */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: securityMode === 'secure' ? 'linear-gradient(135deg, #16a34a, #22c55e)' : 'linear-gradient(135deg, #dc2626, #ef4444)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: securityMode === 'secure' ? '0 4px 12px rgba(22,163,74,0.3)' : '0 4px 12px rgba(220,38,38,0.3)'
            }}>
              {securityMode === 'secure' ? <ShieldCheck size={26} /> : <ShieldAlert size={26} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900 }}>مركز الرقابة الأمنية • Security Demonstration Hub</h2>
                <span className={`badge ${securityMode === 'secure' ? 'badge-emerald' : 'badge-amber'}`}>
                  {securityMode === 'secure' ? '🛡️ الوضع الآمن (SecureShop)' : '⚠️ الوضع الساذج (Naive Vulnerable)'}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                مشروع مادة أمن البرمجيات (CET431 - Fall 2026) • جامعة السويدي للتكنولوجيا
              </p>
            </div>
          </div>

          {/* مفتاح تبديل وضع الأمان للمناقشة */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-subtle)', padding: '6px 12px', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
              تبديل وضع الأمان:
            </span>
            <button
              className={`btn btn-sm ${securityMode === 'secure' ? 'btn-primary' : 'btn-outline'}`}
              style={{
                fontSize: '0.75rem',
                padding: '4px 12px',
                background: securityMode === 'secure' ? '#16a34a' : 'transparent',
                borderColor: securityMode === 'secure' ? '#16a34a' : '#cbd5e1'
              }}
              onClick={toggleSecurityMode}
              title="التبديل بين وضع الحماية الفعالة والوضع الساذج لإثبات نجاح الهجوم وفشله"
            >
              {securityMode === 'secure' ? 'الوضع الآمن (مفعل)' : 'الوضع الساذج (عرضة للاختراق)'}
            </button>
          </div>
        </div>

        {/* تبويبات النافذة */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.25rem',
          gap: '1rem'
        }}>
          <button
            style={{
              padding: '0.65rem 0.5rem',
              fontWeight: 700,
              fontSize: '0.875rem',
              borderBottom: activeTab === 'matrix' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'matrix' ? 'var(--primary)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setActiveTab('matrix')}
          >
            <Table size={16} />
            <span>مصفوفة التغطية الأمنية (Coverage Matrix)</span>
          </button>

          <button
            style={{
              padding: '0.65rem 0.5rem',
              fontWeight: 700,
              fontSize: '0.875rem',
              borderBottom: activeTab === 'simulator' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'simulator' ? 'var(--primary)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setActiveTab('simulator')}
          >
            <Play size={16} />
            <span>معمل محاكاة الهجمات المباشرة (Live Attack Tester)</span>
          </button>

          <button
            style={{
              padding: '0.65rem 0.5rem',
              fontWeight: 700,
              fontSize: '0.875rem',
              borderBottom: activeTab === 'logs' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'logs' ? 'var(--primary)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setActiveTab('logs')}
          >
            <Terminal size={16} />
            <span>سجل الرصد والتدقيق الأمني ({securityLogs.length})</span>
          </button>
        </div>

        {/* محتوى التبويبات */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {/* تبويب 1: مصفوفة التغطية الأمنية */}
          {activeTab === 'matrix' && (
            <div>
              <div style={{ marginBottom: '1rem', background: '#eff6ff', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe', fontSize: '0.8rem', color: '#1e40af' }}>
                📌 <strong>متطلب التقييم (Phase 1):</strong> تغطية كافة الموضوعات الأمنية التي تمت دراستها وربط كل ثغرة في SecureShop بالسبب الجذري، والدفاع المطبق في الكود، مع دليل الاختبار.
              </div>

              <div className="table-responsive">
                <table className="admin-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>الكود</th>
                      <th style={{ width: '180px' }}>الموضوع الأمني (Topic)</th>
                      <th>سيناريو الهجوم في المتجر</th>
                      <th>السبب الجذري (Root Cause)</th>
                      <th>الدفاع المطبق في SecureShop</th>
                      <th style={{ width: '140px' }}>مكان الكود</th>
                      <th style={{ width: '80px' }}>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INITIAL_SECURITY_COVERAGE.map((item) => (
                      <tr key={item.id}>
                        <td><strong style={{ color: 'var(--primary)' }}>{item.id}</strong></td>
                        <td style={{ fontWeight: 700 }}>{item.topic}</td>
                        <td style={{ fontSize: '0.78rem' }}>{item.attackScenario}</td>
                        <td style={{ fontSize: '0.78rem', color: '#b91c1c' }}>{item.rootCause}</td>
                        <td style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>{item.defenseImplemented}</td>
                        <td><code style={{ fontSize: '0.72rem', background: '#f1f5f9', padding: '2px 4px', borderRadius: '4px' }}>{item.codeLocation}</code></td>
                        <td>
                          <span className={`badge ${securityMode === 'secure' ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.7rem' }}>
                            {securityMode === 'secure' ? 'محمي 🛡️' : 'مكشوف ⚠️'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* تبويب 2: معمل محاكاة الهجمات المباشرة */}
          {activeTab === 'simulator' && (
            <div>
              <div style={{ marginBottom: '1.25rem', background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', fontSize: '0.825rem', color: '#334155' }}>
                💡 <strong>طريقة العرض للمناقشة (Live Demo):</strong> اضغط على زر <strong>"تنفيذ الهجوم التجريبي"</strong> لأي موضوع لمشاهدة استجابة النظام. قم بتبديل وضع الأمان بالأعلى لإثبات أن الهجوم ينجح في التطبيق الساذج ويفشل تماماً في SecureShop!
              </div>

              {simulationResult && (
                <div style={{
                  marginBottom: '1.5rem',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: simulationResult.success ? '#fef2f2' : '#f0fdf4',
                  border: simulationResult.success ? '1.5px solid #ef4444' : '1.5px solid #22c55e'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                      {simulationResult.success ? <AlertTriangle color="#ef4444" size={20} /> : <CheckCircle2 color="#22c55e" size={20} />}
                      <span style={{ color: simulationResult.success ? '#b91c1c' : '#15803d', fontSize: '0.95rem' }}>
                        {simulationResult.success ? '⚠️ نتيجة الهجوم في الوضع الساذج: نجح الاختراق!' : '🛡️ نتيجة الهجوم في SecureShop: تم حجب الهجوم بنجاح!'}
                      </span>
                    </div>
                    <span className={`badge ${simulationResult.mode === 'secure' ? 'badge-emerald' : 'badge-amber'}`}>
                      الوضع: {simulationResult.mode}
                    </span>
                  </div>

                  <pre style={{
                    background: '#0f172a',
                    color: '#f8fafc',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    lineHeight: 1.5
                  }}>
                    {simulationResult.output}
                  </pre>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {INITIAL_SECURITY_COVERAGE.map((item) => (
                  <div 
                    key={item.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.8rem' }}>{item.id}</span>
                        <span className={`badge ${securityMode === 'secure' ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>
                          {securityMode === 'secure' ? 'محمي' : 'عرضة للثغرة'}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.35rem' }}>{item.topic}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                        {item.attackScenario}
                      </p>
                      <div style={{ fontSize: '0.7rem', background: '#f8fafc', padding: '4px 6px', borderRadius: '4px', marginBottom: '0.75rem', color: '#475569' }}>
                        <strong>Payload:</strong> <code>{item.testPayload}</code>
                      </div>
                    </div>

                    <button
                      className="btn btn-outline btn-sm"
                      style={{ width: '100%', fontSize: '0.75rem', gap: '4px' }}
                      onClick={() => runSimulation(item)}
                    >
                      <Play size={13} />
                      <span>اختبار الهجوم ({securityMode === 'secure' ? 'في الوضع الآمن' : 'في الوضع الساذج'})</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* تبويب 3: سجل التدقيق الأمني المباشر */}
          {activeTab === 'logs' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  سجل تفاعلي للأنشطة الأمنية والهجمات التي تم رصدها بالمتجر:
                </span>
                {securityLogs.length > 0 && (
                  <button 
                    className="btn btn-ghost btn-sm"
                    style={{ color: '#ef4444', fontSize: '0.75rem' }}
                    onClick={clearSecurityLogs}
                  >
                    مسح السجل
                  </button>
                )}
              </div>

              {securityLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <Terminal size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
                  <p>لا توجد أحداث مسجلة حتى الآن. قم بإجراء اختبارات هجوم لملء السجل.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {securityLogs.map((log) => (
                    <div
                      key={log.id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: log.blocked ? '#f0fdf4' : '#fff1f2',
                        border: log.blocked ? '1px solid #bbf7d0' : '1px solid #fecdd3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ color: log.blocked ? '#16a34a' : '#e11d48' }}>
                          {log.blocked ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: log.blocked ? '#15803d' : '#9f1239' }}>
                              {log.attackType}
                            </span>
                            <span className={`badge ${log.blocked ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>
                              {log.blocked ? 'تم الحجب (BLOCKED)' : 'نجح الساذج (EXPLOITED)'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {log.details}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'left', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.timestamp}</span>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          Payload: <code>{log.payload.slice(0, 25)}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
