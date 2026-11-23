import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Home, Grid, ShoppingBag, Truck, LayoutDashboard } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    cartCount, 
    setIsCartOpen, 
    setIsTrackingOpen,
    setSelectedCategory,
    currentUser
  } = useStore();

  return (
    <nav className="mobile-bottom-nav">
      <button 
        className={`mobile-nav-item ${currentView === 'store' ? 'active' : ''}`}
        onClick={() => {
          setCurrentView('store');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <Home size={20} />
        <span>الرئيسية</span>
      </button>

      <button 
        className="mobile-nav-item"
        onClick={() => {
          setCurrentView('store');
          setSelectedCategory('all');
          const el = document.getElementById('categories-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <Grid size={20} />
        <span>الأقسام</span>
      </button>

      <button 
        className="mobile-nav-item"
        onClick={() => setIsCartOpen(true)}
      >
        <div style={{ position: 'relative' }}>
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <span 
              className="cart-badge" 
              style={{ top: '-6px', right: '-8px', left: 'auto', width: '17px', height: '17px', fontSize: '0.65rem' }}
            >
              {cartCount}
            </span>
          )}
        </div>
        <span>السلة</span>
      </button>

      <button 
        className="mobile-nav-item"
        onClick={() => setIsTrackingOpen(true)}
      >
        <Truck size={20} />
        <span>تتبع طلبك</span>
      </button>

      {currentUser?.role === 'admin' && (
        <button 
          className={`mobile-nav-item ${currentView === 'admin' ? 'active' : ''}`}
          onClick={() => setCurrentView('admin')}
        >
          <LayoutDashboard size={20} />
          <span>لوحة الإدارة</span>
        </button>
      )}
    </nav>
  );
};
