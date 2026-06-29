import React from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp, BarChart2, Eye, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportToExcel } from '../../utils/excelExport';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../../store';
export default function Dashboard() {
  const { orders, users, ordersError, usersError, ordersLoading: loading } = useStore();
  const error = ordersError || usersError;
  const { language } = useStore();
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
        <div style={{ margin: '0 auto 16px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca', color: '#ef4444', textAlign: 'center' }}>
        <h2>Error Loading Dashboard Data</h2>
        <p>{error}</p>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const totalUsers = users.length;
  const aov = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  // Calculate real data for the chart (last 7 days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const chartData = last7Days.map(date => {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    const dayOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= date && orderDate < nextDate;
    });

    const value = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    
    // Arabic weekday:
    const dayNameAr = new Intl.DateTimeFormat('ar-EG', { weekday: 'short' }).format(date);
    const dayNameEn = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);

    return { 
      day: dayNameEn, 
      dayAr: dayNameAr,
      value 
    };
  });
  
  const maxChartValue = Math.max(...chartData.map(d => d.value), 10);

  // Get 5 most recent orders
  const recentOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

  const handleExport = () => {
    const columns = [
      { header: 'Order ID', key: 'id', width: 25 },
      { header: 'Customer', key: 'customer', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Total (EGP)', key: 'total', width: 15 },
      { header: 'Date', key: 'date', width: 25 },
    ];
    
    const data = recentOrders.map(o => ({
      id: o.id,
      customer: o.customer,
      status: o.status,
      total: o.total,
      date: new Date(o.createdAt).toLocaleString()
    }));

    exportToExcel({ data, columns, filename: 'Recent_Orders' });
  };

  return (
    <div>
      <div className="metric-grid">
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="metric-title">Total Revenue</div>
              <div className="metric-value">{totalRevenue.toLocaleString()} EGP</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: 'var(--primary-container)', color: 'var(--on-primary-container)', borderRadius: '8px' }}>
              <DollarSign size={24} />
            </div>
          </div>
          <div style={{ marginTop: '16px', fontSize: '14px', color: 'var(--on-surface-variant)' }}>
            Lifetime revenue
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="metric-title">Average Order Value</div>
              <div className="metric-value">{aov.toFixed(0)} EGP</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: 'var(--secondary-container)', color: 'var(--on-secondary-container)', borderRadius: '8px' }}>
              <BarChart2 size={24} />
            </div>
          </div>
          <div style={{ marginTop: '16px', fontSize: '14px', color: 'var(--on-surface-variant)' }}>
            Across {totalOrders} total orders
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="metric-title">Active Orders</div>
              <div className="metric-value">{orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length}</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: 'var(--primary-container)', color: 'var(--primary)', borderRadius: '8px' }}>
              <ShoppingBag size={24} />
            </div>
          </div>
          <div style={{ marginTop: '16px', fontSize: '14px', color: 'var(--on-surface-variant)' }}>
            Pending or Shipped
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="metric-title">Total Customers</div>
              <div className="metric-value">{totalUsers}</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: 'var(--secondary-container)', color: 'var(--secondary)', borderRadius: '8px' }}>
              <Users size={24} />
            </div>
          </div>
          <div style={{ marginTop: '16px', fontSize: '14px', color: 'var(--on-surface-variant)' }}>
            Total registered
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Revenue Chart */}
        <div 
          className="metric-card" 
          style={{ display: 'flex', flexDirection: 'column', overflowX: 'auto', cursor: 'pointer', transition: 'box-shadow 0.2s', ':hover': { boxShadow: 'var(--elevation-2)' } }}
          onClick={() => navigate('/admin/orders')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 className="title-md m-0">{language === 'ar' ? 'نظرة عامة على الإيرادات (آخر 7 أيام)' : 'Revenue Overview (Last 7 Days)'}</h2>
            <div style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 600 }}>
              {language === 'ar' ? 'عرض كل الإيرادات' : 'View All Revenue'} &rarr;
            </div>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey={language === 'ar' ? 'dayAr' : 'day'} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }}
                  tickFormatter={(value) => `${value} EGP`}
                  dx={-10}
                />
                <CartesianGrid vertical={false} stroke="var(--outline-variant)" strokeDasharray="3 3" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface-container)', borderRadius: '8px', border: 'none', boxShadow: 'var(--elevation-2)', color: 'var(--on-surface)' }}
                  itemStyle={{ color: 'var(--primary)', fontWeight: 600 }}
                  formatter={(value) => [`${value} EGP`, language === 'ar' ? 'الإيرادات' : 'Revenue']}
                  labelStyle={{ color: 'var(--on-surface-variant)', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="admin-table-container" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="title-md m-0">Recent Orders</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleExport}>
                <Download size={16} /> Export
              </button>
              <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '14px' }} onClick={() => navigate('/admin/orders')}>View All</button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>No orders yet.</td></tr>
                ) : (
                  recentOrders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600 }}>{order.id.slice(0, 8).toUpperCase()}</td>
                      <td>{order.customer}</td>
                      <td>
                        <span className={`status-pill status-${order.status?.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{order.total?.toFixed(2)} EGP</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="icon-btn" onClick={() => navigate(`/admin/orders/${encodeURIComponent(order.id)}`)}><Eye size={16} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
