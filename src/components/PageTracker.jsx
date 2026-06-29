import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCustomerTracking } from '../context/CustomerTrackingContext';

export default function PageTracker() {
  const location = useLocation();
  const { trackEvent } = useCustomerTracking();

  useEffect(() => {
    // Only track store pages, ignore admin
    if (!location.pathname.startsWith('/admin')) {
      trackEvent('view_page', {
        pagePath: location.pathname,
        pageSearch: location.search
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  return null;
}
