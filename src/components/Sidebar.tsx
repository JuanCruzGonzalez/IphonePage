import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeSection: 'ventas' | 'productos' | 'stock' | 'promociones';
  onSectionChange: (section: 'ventas' | 'productos' | 'stock' | 'promociones') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'ventas' as const, label: 'Ventas', icon: '📊' },
    { id: 'productos' as const, label: 'Productos', icon: '📦' },
    { id: 'stock' as const, label: 'Stock', icon: '📈' },
    { id: 'promociones' as const, label: 'Promociones', icon: '🎁' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-logo">Panel</h1>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onSectionChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};