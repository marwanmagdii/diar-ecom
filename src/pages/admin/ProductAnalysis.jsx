import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Users, ShoppingCart, Eye, DollarSign, Calendar, Target, Activity, Download } from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';
import { useStore } from '../../store';

export default function ProductAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useStore();
  const { orders } = useStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('All Time');

  // Mock data for the detailed dashboard
  const [stats, setStats] = useState({
    totalSales: 0,
    revenue: 0,
    pageViews: 12450,
    conversionRate: 11.6,
    cartAbandonment: 24.5,
    avgTimeOnPage: '2m 14s'
  });

  const productOrders = React.useMemo(() => {
    return orders
      .filter(o => o.items && o.items.some(i => i.id === id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, id]);

  const filteredOrders = React.useMemo(() => {
    const now = new Date();
    return productOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      if (timeRange === 'Last 30 Days') return (now - orderDate) / (1000 * 60 * 60 * 24) <= 30;
      if (timeRange === 'Last 90 Days') return (now - orderDate) / (1000 * 60 * 60 * 24) <= 90;
      if (timeRange === 'This Year') return orderDate.getFullYear() === now.getFullYear();
      return true; // 'All Time'
    });
  }, [productOrders, timeRange]);

  useEffect(() => {
    let sales = 0;
    let rev = 0;
    filteredOrders.forEach(o => {
      const item = o.items.find(i => i.id === id);
      if (item) {
        sales += item.qty || 1;
        rev += (item.qty || 1) * (item.price || 0);
      }
    });
    setStats(prev => ({ ...prev, totalSales: sales, revenue: rev }));
  }, [filteredOrders, id]);

  const handleExport = () => {
    const columns = [
      { header: 'Order ID', key: 'id', width: 20 },
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Customer', key: 'customer', width: 30 },
      { header: 'Quantity (Units)', key: 'qty', width: 15 },
      { header: 'Order Total (EGP)', key: 'total', width: 20 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    const data = filteredOrders.map(order => {
      const item = order.items.find(i => i.id === id);
      return {
        id: order.id,
        date: new Date(order.createdAt).toLocaleDateString(),
        customer: order.customer,
        qty: item ? item.qty : 0,
        total: order.total,
        status: order.status
      };
    });

    exportToExcel({ data, columns, filename: `Product_${id}_Orders` });
  };

  useEffect(() => {
    if (products && products.length > 0) {
      const foundProduct = products.find(p => p.id === id);
      setProduct(foundProduct || null);
      setLoading(false);
    }
  }, [id, products]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!product) {
    return <div>Product not found.</div>;
  }

  return (
    <div style={{ width: '100%', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '32px' }}>
        <button className="icon-btn" onClick={() => navigate(`/admin/products/edit/${id}`)} style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flex: 1 }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
            <img src={product.images?.[0] || product.image || ''} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h2 className="headline-md m-0" style={{ marginBottom: '4px' }}>{product.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '14px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Target size={16} /> Product Analytics Dashboard</span>
              <span>•</span>
              <span style={{ color: product.isActive ? '#10b981' : '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: product.isActive ? '#10b981' : '#cbd5e1' }}></span>
                {product.isActive ? 'Active' : 'Draft'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        <div className="premium-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#eff6ff', color: '#3b82f6', borderRadius: '12px' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Total Revenue</p>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{stats.revenue.toLocaleString()} EGP</h3>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <TrendingUp size={14} /> +14.2% this month
            </p>
          </div>
        </div>

        <div className="premium-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#f0fdf4', color: '#10b981', borderRadius: '12px' }}>
            <ShoppingCart size={24} />
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Units Sold</p>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{stats.totalSales.toLocaleString()}</h3>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <TrendingUp size={14} /> +8.4% this month
            </p>
          </div>
        </div>

        <div className="premium-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '12px' }}>
            <Eye size={24} />
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Page Views</p>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{stats.pageViews.toLocaleString()}</h3>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
              Avg time: {stats.avgTimeOnPage}
            </p>
          </div>
        </div>

        <div className="premium-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#fdf4ff', color: '#d946ef', borderRadius: '12px' }}>
            <Activity size={24} />
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Conversion Rate</p>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{stats.conversionRate}%</h3>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
              Abandonment: {stats.cartAbandonment}%
            </p>
          </div>
        </div>

      </div>

      {/* Charts & Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Main Chart Area */}
        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#0f172a' }}>Sales Performance</h3>
            <select 
              className="premium-input" 
              style={{ width: 'auto', padding: '8px 16px', minHeight: 'auto', height: '40px' }}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="All Time">All Time</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
              <option value="This Year">This Year</option>
            </select>
          </div>
          
          <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
            {/* Mock Bar Chart */}
            {[40, 60, 45, 80, 55, 90, 75, 100, 65, 85, 70, 95].map((height, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '100%', 
                  height: `${height}%`, 
                  backgroundColor: i === 11 ? 'var(--primary)' : '#cbd5e1', 
                  borderRadius: '6px 6px 0 0',
                  transition: 'all 0.3s'
                }}></div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{i+1}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', color: '#64748b', fontSize: '14px' }}>
            <span>May 1</span>
            <span>May 15</span>
            <span>May 30</span>
          </div>
        </div>

        {/* Variant Performance */}
        <div className="premium-card">
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px 0', color: '#0f172a' }}>Top Variants</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {product.variants && product.variants.length > 0 ? (
              product.variants.slice(0, 5).map((v, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                      <img src={v.image || (v.images && v.images[0]) || product.images?.[0]} alt="variant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
                        {Object.values(v.attributes || {}).join(' - ') || 'Default'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Stock: {v.stock}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {Math.floor(Math.random() * 300) + 50} sold
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                No variants available for this product.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="premium-card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#0f172a' }}>Recent Orders</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', height: '40px' }}>
              <Download size={16} /> Export
            </button>
            <select 
              className="premium-input" 
              style={{ width: 'auto', padding: '8px 16px', minHeight: 'auto', height: '40px' }}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="All Time">All Time</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
              <option value="This Year">This Year</option>
            </select>
          </div>
        </div>
        
        <div className="admin-table-container">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Order Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? filteredOrders.map(order => {
                  const item = order.items.find(i => i.id === id);
                  return (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600 }}>{order.id}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>{order.customer}</td>
                      <td>{item ? item.qty : 0} units</td>
                      <td style={{ fontWeight: 600 }}>{order.total} EGP</td>
                      <td>
                        <span style={{ 
                          backgroundColor: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Cancelled' ? '#fee2e2' : '#fef9c3', 
                          color: order.status === 'Delivered' ? '#166534' : order.status === 'Cancelled' ? '#991b1b' : '#854d0e', 
                          padding: '4px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 
                        }}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No orders found for this product.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
