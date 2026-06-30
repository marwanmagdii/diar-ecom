import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, LogOut, Globe, Settings, ChevronDown, ChevronUp, Ticket, Menu, X, Star, Activity } from 'lucide-react';
import { useStore } from '../store';

export default function AdminLayout() {
  const location = useLocation();
  const { language, toggleLanguage, t } = useStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(location.pathname.startsWith('/diaradmin26/settings'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  useEffect(() => {
    if (location.pathname === '/diaradmin26/settings' && location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleLang = () => {
    toggleLanguage();
  };

  const navItems = [
    { name: t('dashboard'), path: '/diaradmin26', icon: <LayoutDashboard size={20} /> },
    { name: t('orders'), path: '/diaradmin26/orders', icon: <ShoppingCart size={20} /> },
    { name: t('users'), path: '/diaradmin26/users', icon: <Users size={20} /> },
    { name: t('products'), path: '/diaradmin26/products', icon: <Package size={20} /> },
    { name: t('promoCodes'), path: '/diaradmin26/promos', icon: <Ticket size={20} /> },
    { name: t('influencers'), path: '/diaradmin26/influencers', icon: <Star size={20} /> },
    { name: t('settings') || 'Store Settings', path: '/diaradmin26/settings', icon: <Settings size={20} /> },
  ];

  // Helper to determine the best header title
  const getHeaderTitle = () => {
    const currentItem = navItems.find(item => location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/diaradmin26'));
    return currentItem?.name || t('dashboard');
  };

  return (
    <div className="admin-theme" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="admin-layout">
        
        {/* Mobile Overlay */}
        <div 
          className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

        {/* Sidebar */}
        <aside className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''} ${isDesktopCollapsed ? 'collapsed' : ''}`} style={{ transition: 'width 0.3s ease' }}>
          <div className="admin-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 700 }}>
              <img src="/logo_transparent.svg" alt="Admin" style={{ height: '32px', width: 'auto', flexShrink: 0 }} />
              <span className="nav-link-text">Admin</span>
            </Link>
            <button className="icon-btn mobile-menu-btn" style={{ display: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="admin-nav">
            {navItems.map(item => {
              if (item.path === '/diaradmin26/settings') {
                return (
                  <div key={item.name}>
                    <button 
                      onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                      className={`admin-nav-link ${location.pathname.startsWith('/diaradmin26/settings') ? 'active' : ''}`}
                      style={{ 
                        width: '100%',
                        justifyContent: 'space-between',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        backgroundColor: location.pathname.startsWith('/diaradmin26/settings') ? 'var(--primary-container)' : 'transparent',
                        color: location.pathname.startsWith('/diaradmin26/settings') ? 'var(--on-primary-container)' : 'var(--on-surface-variant)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} title={item.name}>
                        {item.icon}
                        <span className="nav-link-text">{item.name}</span>
                      </div>
                      <span className="submenu-indicator">
                        {isSettingsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </button>
                    {isSettingsOpen && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', paddingLeft: language === 'ar' ? '0' : '44px', paddingRight: language === 'ar' ? '44px' : '0' }}>
                        <Link 
                          to="/diaradmin26/settings/general" 
                          className="admin-nav-link"
                          style={{ 
                            padding: '8px 12px', 
                            fontSize: '14px',
                            backgroundColor: 'transparent',
                            color: location.pathname.includes('/settings/general') ? 'var(--primary)' : 'inherit',
                            fontWeight: location.pathname.includes('/settings/general') ? 700 : 500
                          }}
                        >
                          <span className="nav-link-text">{language === 'ar' ? 'الإعدادات العامة' : 'General Settings'}</span>
                        </Link>
                        <Link 
                          to="/diaradmin26/settings/logs" 
                          className="admin-nav-link"
                          style={{ 
                            padding: '8px 12px', 
                            fontSize: '14px',
                            backgroundColor: 'transparent',
                            color: location.pathname.includes('/settings/logs') ? 'var(--primary)' : 'inherit',
                            fontWeight: location.pathname.includes('/settings/logs') ? 700 : 500
                          }}
                        >
                          <span className="nav-link-text">{language === 'ar' ? 'سجل النشاطات' : 'Activity Logs'}</span>
                        </Link>
                        <Link 
                          to="/diaradmin26/settings/collections" 
                          className="admin-nav-link"
                          style={{ 
                            padding: '8px 12px', 
                            fontSize: '14px',
                            backgroundColor: 'transparent',
                            color: (location.pathname.includes('/settings/collections') || location.pathname === '/diaradmin26/settings') ? 'var(--primary)' : 'inherit',
                            fontWeight: (location.pathname.includes('/settings/collections') || location.pathname === '/diaradmin26/settings') ? 700 : 500
                          }}
                        >
                          <span className="nav-link-text">{t('collectionBuilder')}</span>
                        </Link>
                        <Link 
                          to="/diaradmin26/settings/categories" 
                          className="admin-nav-link"
                          style={{ 
                            padding: '8px 12px', 
                            fontSize: '14px',
                            backgroundColor: 'transparent',
                            color: location.pathname.includes('/settings/categories') ? 'var(--primary)' : 'inherit',
                            fontWeight: location.pathname.includes('/settings/categories') ? 700 : 500
                          }}
                        >
                          <span className="nav-link-text">{t('categoryManagement')}</span>
                        </Link>
                        <Link 
                          to="/diaradmin26/settings/locations" 
                          className="admin-nav-link"
                          style={{ 
                            padding: '8px 12px', 
                            fontSize: '14px',
                            backgroundColor: 'transparent',
                            color: location.pathname.includes('/settings/locations') ? 'var(--primary)' : 'inherit',
                            fontWeight: location.pathname.includes('/settings/locations') ? 700 : 500
                          }}
                        >
                          <span className="nav-link-text">{t('locationsShipping')}</span>
                        </Link>
                        <Link 
                          to="/diaradmin26/settings/options" 
                          className="admin-nav-link"
                          style={{ 
                            padding: '8px 12px', 
                            fontSize: '14px',
                            backgroundColor: 'transparent',
                            color: location.pathname.includes('/settings/options') ? 'var(--primary)' : 'inherit',
                            fontWeight: location.pathname.includes('/settings/options') ? 700 : 500
                          }}
                        >
                          <span className="nav-link-text">{t('productOptions')}</span>
                        </Link>
                        <Link 
                          to="/diaradmin26/settings/reviews" 
                          className="admin-nav-link"
                          style={{ 
                            padding: '8px 12px', 
                            fontSize: '14px',
                            backgroundColor: 'transparent',
                            color: location.pathname.includes('/settings/reviews') ? 'var(--primary)' : 'inherit',
                            fontWeight: location.pathname.includes('/settings/reviews') ? 700 : 500
                          }}
                        >
                          <span className="nav-link-text">{t('globalReviews')}</span>
                        </Link>
                        <Link 
                          to="/diaradmin26/settings/calculator" 
                          className="admin-nav-link"
                          style={{ 
                            padding: '8px 12px', 
                            fontSize: '14px',
                            backgroundColor: 'transparent',
                            color: location.pathname.includes('/settings/calculator') ? 'var(--primary)' : 'inherit',
                            fontWeight: location.pathname.includes('/settings/calculator') ? 700 : 500
                          }}
                        >
                          {language === 'ar' ? 'حاسبة الأرباح' : 'Profit Calculator'}
                        </Link>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  className={`admin-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  title={item.name}
                >
                  {item.icon}
                  <span className="nav-link-text">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="admin-sidebar-footer">
            <Link to="/" className="admin-nav-link" title={language === 'ar' ? 'العودة للمتجر' : 'Back to Store'}>
              <LogOut size={20} />
              <span className="nav-link-text">{language === 'ar' ? 'العودة للمتجر' : 'Back to Store'}</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          <header className="admin-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                className="icon-btn" 
                style={{ padding: '8px', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => {
                  if (window.innerWidth <= 992) {
                    setIsMobileMenuOpen(true);
                  } else {
                    setIsDesktopCollapsed(!isDesktopCollapsed);
                  }
                }}
              >
                <Menu size={24} />
              </button>
              <h1 className="headline-md m-0">
                {getHeaderTitle()}
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button className="btn btn-secondary" onClick={toggleLang} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px' }}>
                <Globe size={18} />
                {language === 'en' ? 'عربي' : 'English'}
              </button>
              <div className="admin-user-avatar">
                A
              </div>
            </div>
          </header>
          <div className="admin-content" style={{ overflowY: 'auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

