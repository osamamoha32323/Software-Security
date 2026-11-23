import React from 'react';
import { STORE_CATEGORIES } from '../../data/egyptGovernorates';
import { useStore } from '../../context/StoreContext';
import { 
  LayoutGrid, 
  Sparkles, 
  Home, 
  Headphones, 
  HeartPulse, 
  Car 
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  LayoutGrid: <LayoutGrid size={16} />,
  Sparkles: <Sparkles size={16} />,
  Home: <Home size={16} />,
  Headphones: <Headphones size={16} />,
  HeartPulse: <HeartPulse size={16} />,
  Car: <Car size={16} />
};

export const CategoryPills: React.FC = () => {
  const { selectedCategory, setSelectedCategory, products } = useStore();

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return products.filter(p => p.isActive).length;
    return products.filter(p => p.category === categoryId && p.isActive).length;
  };

  return (
    <div id="categories-section" style={{ margin: '1rem 0 1.5rem' }}>
      <div className="container">
        <div className="categories-bar">
          {STORE_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const count = getCategoryCount(cat.id);

            return (
              <button
                key={cat.id}
                className={`category-pill ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  {iconMap[cat.icon] || <LayoutGrid size={16} />}
                </span>
                <span>{cat.nameAr}</span>
                <span 
                  style={{ 
                    fontSize: '0.72rem', 
                    padding: '0.1rem 0.45rem', 
                    borderRadius: 'var(--radius-full)', 
                    background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-subtle)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
