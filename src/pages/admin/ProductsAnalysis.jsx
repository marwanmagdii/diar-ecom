import React, { useMemo, useState } from 'react';
import { ArrowLeft, Search, TrendingUp, Package, DollarSign, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportToExcel } from '../../utils/excelExport';
import { useStore } from '../../store';

export default function ProductsAnalysis() {
  const { orders } = useStore();
  const { products } = useStore();
  const navigate = useNavigate();
  const { t, language } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('revenue-desc');
  const [stockFilter, setStockFilter] = useState('all');

  const analysisData = useMemo(() => {
    // Initialize stats map
    const statsMap = {};
    products.forEach(p => {
      statsMap[p.id] = {
        id: p.id,
        image: p.image,
        title: p.title,
        category: p.category || 'Uncategorized',
        price: p.price,
        stock: p.stock !== undefined ? p.stock : 0,
        unitsSold: 0,
        orderCount: 0,
        totalRevenue: 0
      };
    });

    // Populate from orders
    orders.forEach(order => {
      if (order.status !== 'Cancelled') {
        (order.items || []).forEach(item => {
          if (statsMap[item.id]) {
            statsMap[item.id].unitsSold += item.qty;
            statsMap[item.id].orderCount += 1;
            statsMap[item.id].totalRevenue += item.qty * Number(statsMap[item.id].price || 0);
          }
        });
      }
    });

    return Object.values(statsMap).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [orders, products]);

  const filteredData = useMemo(() => {
    let result = analysisData.filter(item => {
      if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase()) && !item.category.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }
      if (stockFilter === 'out' && item.stock > 0) return false;
      if (stockFilter === 'low' && (item.stock === 0 || item.stock > 5)) return false;
      if (stockFilter === 'in' && item.stock <= 0) return false;
      
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'revenue-desc') return b.totalRevenue - a.totalRevenue;
      if (sortBy === 'revenue-asc') return a.totalRevenue - b.totalRevenue;
      if (sortBy === 'units-desc') return b.unitsSold - a.unitsSold;
      if (sortBy === 'units-asc') return a.unitsSold - b.unitsSold;
      if (sortBy === 'stock-asc') return a.stock - b.stock;
      if (sortBy === 'stock-desc') return b.stock - a.stock;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'name-asc') return a.title.localeCompare(b.title);
      if (sortBy === 'name-desc') return b.title.localeCompare(a.title);
      return 0;
    });

    return result;
  }, [analysisData, searchTerm, categoryFilter, stockFilter, sortBy]);

  const totalStoreRevenue = analysisData.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalUnitsSold = analysisData.reduce((sum, item) => sum + item.unitsSold, 0);

  const handleExport = () => {
    const columns = [
      { header: 'Product ID', key: 'id', width: 20 },
      { header: 'Product Name', key: 'title', width: 40 },
      { header: 'Category', key: 'category', width: 25 },
      { header: 'Price (EGP)', key: 'price', width: 15 },
      { header: 'Units Sold', key: 'unitsSold', width: 15 },
      { header: 'Total Revenue (EGP)', key: 'totalRevenue', width: 20 },
      { header: 'Current Stock', key: 'stock', width: 15 }
    ];

    const data = filteredData.map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      price: item.price || 0,
      unitsSold: item.unitsSold || 0,
      totalRevenue: item.totalRevenue || 0,
      stock: item.stock || 0
    }));

    exportToExcel({ data, columns, filename: 'Products_Analysis' });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button className="icon-btn" onClick={() => navigate('/diaradmin26/products')} style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="headline-md m-0">Global Products Analysis</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Overview of sales performance across all products.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="metric-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--primary-container)', padding: '16px', borderRadius: '50%' }}>
            <DollarSign size={28} color="var(--primary)" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: 600 }}>{language === 'ar' ? 'إجمالي إيرادات المتجر' : 'Total Store Revenue'}</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{totalStoreRevenue.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}</p>
          </div>
        </div>
        <div className="metric-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#e2e8f0', padding: '16px', borderRadius: '50%' }}>
            <Package size={28} color="#475569" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: 600 }}>{language === 'ar' ? 'إجمالي الوحدات المباعة' : 'Total Units Sold'}</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{totalUnitsSold}</p>
          </div>
        </div>
        <div className="metric-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#e0e7ff', padding: '16px', borderRadius: '50%' }}>
            <TrendingUp size={28} color="#4f46e5" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: 600 }}>{language === 'ar' ? 'المنتجات النشطة' : 'Active Products'}</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{analysisData.length}</p>
          </div>
        </div>
      </div>

      <div className="metric-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '8px', flex: '1 1 250px' }}>
            <Search size={20} color="var(--on-surface-variant)" />
            <input 
              type="text" 
              placeholder={language === 'ar' ? 'بحث بالمنتج أو الفئة...' : "Search by product or category..."}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="input-field" 
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--outline-variant)', flex: '1 1 150px' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">{language === 'ar' ? 'كل الفئات' : 'All Categories'}</option>
            {Array.from(new Set(products.map(p => p.category).filter(Boolean))).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select 
            className="input-field" 
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--outline-variant)', flex: '1 1 150px' }}
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="all">All Stock Status</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock (≤5)</option>
            <option value="out">{t('outOfStock')}</option>
          </select>

          <select 
            className="input-field" 
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--outline-variant)', flex: '1 1 200px' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="revenue-desc">Revenue (High to Low)</option>
            <option value="revenue-asc">Revenue (Low to High)</option>
            <option value="units-desc">Units Sold (High to Low)</option>
            <option value="units-asc">Units Sold (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="stock-asc">Stock (Low to High)</option>
            <option value="stock-desc">Stock (High to Low)</option>
            <option value="name-asc">Name (A to Z)</option>
            <option value="name-desc">Name (Z to A)</option>
          </select>
          <button className="btn btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px' }}>
            <Download size={18} /> {language === 'ar' ? 'تصدير' : 'Export'}
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{language === 'ar' ? 'المنتج' : 'Product'}</th>
                <th>{language === 'ar' ? 'الفئة' : 'Category'}</th>
                <th>{language === 'ar' ? 'السعر' : 'Price'}</th>
                <th>{language === 'ar' ? 'المخزون الحالي' : 'Current Stock'}</th>
                <th>{language === 'ar' ? 'الوحدات المباعة' : 'Units Sold'}</th>
                <th>{language === 'ar' ? 'الطلبات' : 'Orders'}</th>
                <th style={{ textAlign: 'right' }}>{language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={item.image || 'https://via.placeholder.com/40'} alt={item.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      <span style={{ fontWeight: 500 }}>{item.title}</span>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.price} EGP</td>
                  <td>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: 600, backgroundColor: item.stock <= 5 ? '#fee2e2' : '#f1f5f9', color: item.stock <= 5 ? '#dc2626' : '#475569' }}>
                      {item.stock}
                    </span>
                  </td>
                  <td style={{ fontWeight: 'bold', color: '#0f172a' }}>{item.unitsSold}</td>
                  <td>{item.orderCount}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>{item.totalRevenue.toFixed(2)} EGP</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No data found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
