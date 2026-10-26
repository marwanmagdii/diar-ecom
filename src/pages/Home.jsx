import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useStore } from '../store';
import ProductCard from '../components/ProductCard';
import CustomerReviewsMarquee from '../components/CustomerReviewsMarquee';
import { Clock, ArrowRight } from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';

const CountdownTimer = ({ targetDate, t }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};
    if (difference > 0) {
      timeLeft = {
        d: Math.floor(difference / (1000 * 60 * 60 * 24)),
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
    return <span style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', fontWeight: 600, padding: '8px 16px', borderRadius: '8px' }}>{t('saleEnded')}</span>;
  }

  const TimeBlock = ({ value, label }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'white', color: 'var(--primary)', padding: '8px 12px', borderRadius: '12px', minWidth: '64px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <span style={{ fontSize: '24px', fontWeight: 900, lineHeight: 1 }}>{value.toString().padStart(2, '0')}</span>
      <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', opacity: 0.8, marginTop: '6px' }}>{t(label.toLowerCase())}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: 'bold', fontSize: '18px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
        <Clock size={24} />
        <span>{t('endsIn')}:</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '10px', minWidth: 'max-content' }} dir="ltr">
          {timeLeft.d > 0 && <TimeBlock value={timeLeft.d} label="days" />}
          <TimeBlock value={timeLeft.h} label="hours" />
          <TimeBlock value={timeLeft.m} label="mins" />
          <TimeBlock value={timeLeft.s} label="secs" />
        </div>
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
      <main className="container pt-4">
        <div className="product-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
              <Skeleton height="250px" borderRadius="12px" />
              <Skeleton height="24px" width="80%" />
              <Skeleton height="20px" width="40%" />
              <Skeleton height="40px" width="100%" borderRadius="8px" style={{ marginTop: '12px' }} />
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container pt-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fef2f2', borderRadius: '16px', border: '1px solid #fecaca', color: '#ef4444', maxWidth: '500px' }}>
          <p style={{ fontWeight: '600', marginBottom: '8px', fontSize: '18px' }}>{language === 'ar' ? 'تعذر تحميل المتجر.' : 'Could not load the store catalog.'}</p>
          <p style={{ fontSize: '14px', color: '#b91c1c' }}>{language === 'ar' ? 'تأكد من اتصالك بالإنترنت وحاول مرة أخرى.' : 'Please check your internet connection and try again.'}</p>
        </div>
      </main>
    );
  }

  return (
    <main className={`container pt-4 pb-4 ${location.state?.direction === 'down' ? 'page-slide-down' : ''}`}>
      
      {/* Dynamic Collections (Flash Sale) First */}
      {config.collections.filter(c => !c.hidden).map(collection => {
        const pIds = collection.productIds || [];
        let collectionProducts = pIds.map(id => products.find(p => p.id === id && p.isActive !== false)).filter(Boolean).slice(0, collection.count);

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
          <section key={collection.id} className={collection.endDate ? 'flash-sale-section' : ''} style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '32px', gap: '24px', position: 'relative', zIndex: 10 }}>
              <h2 className="headline-lg m-0" style={{ color: collection.endDate ? 'white' : 'var(--on-surface)', textShadow: collection.endDate ? '0 2px 4px rgba(0,0,0,0.2)' : 'none' }}>
                {t(collection.name) !== collection.name ? t(collection.name) : collection.name}
              </h2>
              {collection.endDate && <CountdownTimer targetDate={collection.endDate} t={t} />}
            </div>
            <div className="product-grid" style={{ position: 'relative', zIndex: 10 }}>
              {collectionProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        );
      })}

      {/* Other Offers Section */}
      {otherOffers.length > 0 && (
        <section style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 className="headline-lg m-0">
              {language === 'ar' ? 'المزيد من العروض' : 'More Offers'}
            </h2>
          </div>
          <div className="product-grid" style={{ paddingBottom: '16px' }}>
            {otherOffers.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Global Customer Reviews */}
      <section style={{ margin: '64px 0' }}>
        <CustomerReviewsMarquee reviews={config.globalReviewImages} />
      </section>

      {otherOffers.length > 0 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '48px', gap: '24px', backgroundColor: 'var(--surface-container-lowest)', padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '16px', fontStyle: 'italic', maxWidth: '500px' }}>
            {language === 'ar' 
              ? 'استمر في التمرير لأسفل لاستكشاف المتجر، أو قم بالتمرير لأعلى لرؤية أفضل العروض.' 
              : 'Keep scrolling down to explore our shop, or scroll up for top offers.'}
          </p>
          <button 
            type="button"
            onClick={() => { window.scrollTo(0, 0); navigate('/shop'); }}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '999px', padding: '16px 32px', fontSize: '18px', fontWeight: 600 }}
          >
            <span>{language === 'ar' ? 'الذهاب إلى المتجر' : 'Go to Shop'}</span>
            <ArrowRight size={20} style={{ transform: language === 'ar' ? 'rotate(180deg)' : 'none' }} />
          </button>
        </div>
      )}

      <div ref={bottomRef} style={{ textAlign: 'center', margin: '64px 0' }}>
        <Link to="/shop" className="btn btn-primary" style={{ display: 'inline-block', borderRadius: '999px', padding: '16px 32px', fontSize: '18px', fontWeight: 600 }}>
          {t('shopAll')}
        </Link>
      </div>
    </main>
  );
}
