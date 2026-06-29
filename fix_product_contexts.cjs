const fs = require('fs');

let content = fs.readFileSync('src/pages/Product.jsx', 'utf8');

// Replace imports
content = content.replace(/import \{ useProducts \} from '\.\.\/context\/ProductContext';\s*/, '');
content = content.replace(/import \{ useCart \} from '\.\.\/context\/CartContext';\s*/, '');
content = content.replace(/import \{ useCustomerTracking \} from '\.\.\/context\/CustomerTrackingContext';\s*/, '');

// Fix hook calls inside Product()
content = content.replace(/const \{ products, loading, error \} = useProducts\(\);/, 'const { products, productsLoading: loading, productsError: error } = useStore();');
content = content.replace(/const \{ cart, addToCart, updateQuantity \} = useCart\(\);/, 'const { cart, addToCart, updateQuantity } = useStore();');
content = content.replace(/const \{ trackEvent \} = useCustomerTracking\(\);/, 'const trackEvent = useStore(state => state.trackEvent);');

fs.writeFileSync('src/pages/Product.jsx', content, 'utf8');
console.log('Fixed contexts in Product.jsx');
