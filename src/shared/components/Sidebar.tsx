import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeSection: 'ventas' | 'productos' | 'stock' | 'promociones' | 'gastos' | 'categorias';
  onSectionChange: (section: 'ventas' | 'productos' | 'stock' | 'promociones' | 'gastos' | 'categorias') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSectionChange = (section: 'ventas' | 'productos' | 'stock' | 'promociones' | 'gastos' | 'categorias') => {
    onSectionChange(section);
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { id: 'ventas' as const, label: 'Ventas', icon: '📊' },
    { id: 'productos' as const, label: 'Productos', icon: '📦' },
    { id: 'stock' as const, label: 'Stock', icon: '📈' },
    { id: 'promociones' as const, label: 'Promociones', icon: '🎁' },
    { id: 'gastos' as const, label: 'Gastos', icon: '💰' },
    { id: 'categorias' as const, label: 'Categorías', icon: '🏷️' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      <button 
        className="hamburger-btn" 
        onClick={toggleMobileMenu}
        aria-label="Menú"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={toggleMobileMenu}></div>
      )}

      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <nav className="sidebar-nav">
          <div className="sidebar-header">
            <h1 className="sidebar-logo">Panel</h1>
          </div>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => handleSectionChange(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
          <div className="sidebar-footer">
            <button className="nav-item logout-btn" onClick={handleLogout}>
              <span className="nav-icon">🚪</span>
              <span className="nav-label">Cerrar Sesión</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};