import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tag, Search, ShoppingBag, User } from 'lucide-react';
import { useStore } from '../store';

export default function BottomNav() {
  const location = useLocation();
  const { cartCount } = useStore();
  const { t } = useStore();

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    if (path === '/' && location.pathname === '/') return true;
    return false;
  };

  return (
    <div className="mobile-bottom-nav">
      <Link to="/" className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}>
        <div className="nav-icon-wrapper">
          <Tag size={22} />
        </div>
        <span>{t('home')}</span>
      </Link>
      <Link to="/shop" className={`bottom-nav-item ${isActive('/shop') ? 'active' : ''}`}>
        <div className="nav-icon-wrapper">
          <Search size={22} />
        </div>
        <span>{t('shop')}</span>
      </Link>
      <Link to="/cart" className={`bottom-nav-item ${isActive('/cart') || isActive('/checkout') ? 'active' : ''}`}>
        <div className="nav-icon-wrapper">
          <ShoppingBag size={22} />
          {cartCount > 0 && (
            <span className="cart-badge-bottom">
              {cartCount}
            </span>
          )}
        </div>
        <span>{t('cart')}</span>
      </Link>
      <Link to="/page/contact" className={`bottom-nav-item ${isActive('/page/contact') ? 'active' : ''}`}>
        <div className="nav-icon-wrapper">
          <User size={22} />
        </div>
        <span>{t('contactUs')}</span>
      </Link>
    </div>
  );
}
