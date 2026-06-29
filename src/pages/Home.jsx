import React, { useState, useEffect, useRef } from 'react';
import ProductCard from '../components/ProductCard';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Clock, LayoutGrid, ArrowRight } from 'lucide-react';
import { useStore } from '../store';
import CustomerReviewsMarquee from '../components/CustomerReviewsMarquee';

const CountdownTimer = ({ targetDate, t }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60)
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  if (!Object.keys(timeLeft).length) {
    return <span style={{ color: '#ffffff', fontWeight: 600, padding: '8px 16px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>{t('saleEnded')}</span>;
  }

  const TimeBlock = ({ value, label }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#ffffff', color: '#be123c', padding: '10px 12px', borderRadius: '12px', minWidth: '64px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
      <span style={{ fontSize: '24px', fontWeight: 800, lineHeight: 1 }}>{value.toString().padStart(2, '0')}</span>
      <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', opacity: 0.8, marginTop: '6px' }}>{t(label.toLowerCase())}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 700, fontSize: '18px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
        <Clock size={24} />
        <span>{t('endsIn')}:</span>
      </div>
      <div style={{ display: 'flex', gap: '10px' }} dir="ltr">
        {timeLeft.d > 0 && <TimeBlock value={timeLeft.d} label="days" />}
        <TimeBlock value={timeLeft.h} label="hours" />
        <TimeBlock value={timeLeft.m} label="mins" />
        <TimeBlock value={timeLeft.s} label="secs" />
      </div>
    </div>
  );
};

export default function Home() {
  const { products, productsLoading: loading, productsError: error } = useStore();
  const { config } = useStore();
  const { t, language } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const bottomRef = useRef(null);

  useEffect(() => {
    if (!bottomRef.current || loading || error) return;
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        navigate('/shop', { state: { direction: 'up' } });
        window.scrollTo(0, 0);
      }
    }, { threshold: 0.1 });
    
    observer.observe(bottomRef.current);
    
    return () => observer.disconnect();
  }, [loading, error, navigate]);

  const flashSaleIds = new Set();
  if (config && config.collections && products) {
    config.collections.filter(c => !c.hidden).forEach(c => {
      const pIds = c.productIds || [];
      const cProds = pIds.map(id => products.find(p => p.id === id && p.isActive !== false)).filter(Boolean).slice(0, c.count);
      cProds.forEach(p => flashSaleIds.add(p.id));
    });
  }

  const otherOffers = products ? products.filter(p => p.isActive !== false && (p.hasOffer || p.offerPrice) && !flashSaleIds.has(p.id)) : [];

  if (loading) {
    return (
      <main className="container pb-4 pt-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: '#64748b' }}>
        <div className="spinner" style={{ margin: '0 auto 16px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <h2>Loading products...</h2>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container pb-4 pt-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca', color: '#ef4444', maxWidth: '500px' }}>
          <p style={{ fontWeight: '500', marginBottom: '8px', fontSize: '18px' }}>Oops! Could not load the store catalog.</p>
          <p style={{ fontSize: '14px', color: '#b91c1c' }}>Please check your internet connection or try again later. ({error})</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className={`container pb-4 pt-4 ${location.state?.direction === 'down' ? 'page-slide-down' : ''}`}>
        
        {/* Dynamic Collections (Flash Sale) First */}
        {config.collections.filter(c => !c.hidden).map(collection => {
          const pIds = collection.productIds || [];
          let collectionProducts = pIds.map(id => products.find(p => p.id === id && p.isActive !== false)).filter(Boolean);

          collectionProducts = collectionProducts.slice(0, collection.count);

          if (collectionProducts.length === 0) return null;

          if (collection.prices) {
            collectionProducts = collectionProducts.map(p => {
              if (collection.prices[p.id] !== undefined) {
                return { ...p, hasOffer: true, offerPrice: collection.prices[p.id] };
              }
              return p;
            });
          }

          return (
            <section key={collection.id} className={`mb-4 ${collection.endDate ? 'flash-sale-section' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '32px', gap: '24px', position: 'relative', zIndex: 1 }}>
                <h2 className="headline-lg m-0" style={{ color: collection.endDate ? '#ffffff' : 'inherit', textShadow: collection.endDate ? '0 2px 8px rgba(0,0,0,0.3)' : 'none', fontWeight: 800 }}>{t(collection.name) !== collection.name ? t(collection.name) : collection.name}</h2>
                {collection.endDate && <CountdownTimer targetDate={collection.endDate} t={t} />}
              </div>
              <div className="product-grid" style={{ position: 'relative', zIndex: 1 }}>
                {collectionProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          );
        })}

        {/* Other Offers */}
        {otherOffers.length > 0 && (
          <section className="mb-4" style={{ paddingBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="headline-lg m-0" style={{ fontWeight: 800 }}>
                {language === 'ar' ? 'المزيد من العروض' : 'More Offers'}
              </h2>
            </div>
            <div className="product-grid" style={{ paddingBottom: '16px' }}>
              {otherOffers.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            </section>
        )}

        

        {/* Global Customer Reviews */}
        <CustomerReviewsMarquee reviews={config.globalReviewImages} />

        {otherOffers.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '24px', gap: '16px' }}>
              <p style={{ color: '#64748b', fontSize: '15px', textAlign: 'center', margin: 0, fontStyle: 'italic' }}>
                {language === 'ar' ? 'استمر في التمرير لأسفل لاستكشاف المتجر، أو مرر لأعلى لمشاهدة أفضل العروض' : 'Keep scrolling down to explore our shop, or scroll up for top offers'}
              </p>
              <button 
                type="button"
                onClick={() => {
                  window.scrollTo(0, 0);
                  navigate('/shop');
                }}
                style={{
                  backgroundColor: '#0f172a', color: '#ffffff',
                  padding: '14px 32px', borderRadius: '12px',
                  fontWeight: 600, fontSize: '16px',
                  border: 'none', cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  boxShadow: '0 4px 12px rgba(15,23,42,0.1)'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1e293b'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#0f172a'}
              >
                {language === 'ar' ? 'اذهب إلى المتجر' : 'Go to Shop'}
              </button>
            </div>
          
        )}
        


        <div ref={bottomRef} style={{ textAlign: 'center', margin: '48px 0' }}>
          <Link to="/shop" className="btn btn-primary" style={{ backgroundColor: 'var(--on-surface)', padding: '16px 32px', fontSize: '16px', borderRadius: '999px' }}>
            {t('shopAll')}
          </Link>
        </div>
      </main>
    </>
  );
}
