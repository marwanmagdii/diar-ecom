import React from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp, BarChart2, Eye, Download, Server, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportToExcel } from '../../utils/excelExport';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../../store';
import DataTable from '../../components/admin/DataTable';
import Skeleton from '../../components/ui/Skeleton';
import PullToRefresh from '../../components/ui/PullToRefresh';

export default function Dashboard() {
  const { orders, users, ordersError, usersError, ordersLoading: loading } = useStore();
  const { fetchOrders, fetchUsers } = useStore();
  const error = ordersError || usersError;
  const { language } = useStore();
  const navigate = useNavigate();

  const handleRefresh = async () => {
    if (fetchOrders) await fetchOrders();
    if (fetchUsers) await fetchUsers();
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '16px' }}>
        <div className="metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <Skeleton width="40px" height="12px" />
                <Skeleton width="32px" height="32px" borderRadius="8px" />
              </div>
              <Skeleton width="80%" height="24px" style={{ marginBottom: '8px' }} />
              <Skeleton width="40%" height="12px" />
            </div>
          ))}
        </div>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9' }}>
          <Skeleton width="120px" height="20px" style={{ marginBottom: '24px' }} />
          <Skeleton height="200px" />
        </div>
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
    const exportColumns = [
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

    exportToExcel({ data, columns: exportColumns, filename: 'Recent_Orders' });
  };

  const columns = [
    { 
      id: 'id', 
      label: language === 'ar' ? 'رقم الطلب' : 'Order ID', 
      render: (order) => <span style={{ fontWeight: 600 }}>{order.id.slice(0, 8).toUpperCase()}</span> 
    },
    { id: 'customer', label: language === 'ar' ? 'العميل' : 'Customer', render: (order) => order.customer },
    { 
      id: 'status', 
      label: language === 'ar' ? 'الحالة' : 'Status', 
      render: (order) => (
        <span className={`status-pill status-${order.status?.toLowerCase()}`}>
          {order.status}
        </span>
      ) 
    },
    { id: 'total', label: language === 'ar' ? 'المجموع' : 'Total', render: (order) => `${order.total?.toFixed(2)} EGP` },
    {
      id: 'actions',
      label: '',
      align: 'right',
      render: (order) => (
        <button className="icon-btn" onClick={(e) => { e.stopPropagation(); navigate(`/diaradmin26/orders/${encodeURIComponent(order.id)}`); }}>
          <Eye size={16} />
        </button>
      )
    }
  ];

  const actionsNode = (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleExport}>
        <Download size={16} /> {language === 'ar' ? 'تصدير' : 'Export'}
      </button>
      <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '14px' }} onClick={() => navigate('/diaradmin26/orders')}>
        {language === 'ar' ? 'عرض الكل' : 'View All'}
      </button>
    </div>
  );

  return (
    <PullToRefresh onRefresh={handleRefresh}>
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
        {/* Server Capacity Widget */}
        <div className="metric-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="title-md" style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={20} color="var(--primary)" /> 
              {language === 'ar' ? 'سعة الخادم الحالية (Vercel)' : 'Server Capacity (Vercel)'}
            </h2>
            <p style={{ margin: 0, color: 'var(--on-surface-variant)', fontSize: '14px' }}>
              {language === 'ar' ? 'الحد الأقصى للزوار النشطين في نفس الوقت: ~1,000 زائر' : 'Max Concurrent Visitors: ~1,000 visitors'}
            </p>
            <p style={{ margin: '4px 0 0 0', color: 'var(--on-surface-variant)', fontSize: '14px' }}>
              {language === 'ar' ? 'نقل البيانات المسموح: 100 جيجابايت / شهر' : 'Monthly Bandwidth Limit: 100 GB / month'}
            </p>
          </div>
          <div style={{ padding: '12px 24px', backgroundColor: '#ecfdf5', borderRadius: '12px', textAlign: 'center', border: '1px solid #a7f3d0' }}>
            <div style={{ fontSize: '12px', color: '#065f46', fontWeight: 600, marginBottom: '4px' }}>{language === 'ar' ? 'حالة الخادم' : 'Status'}</div>
            <div style={{ color: '#047857', fontWeight: 'bold', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={18} />
              {language === 'ar' ? 'ممتاز' : 'Excellent'}
            </div>
          </div>
        </div>
        {/* Revenue Chart */}
        <div 
          className="metric-card" 
          style={{ display: 'flex', flexDirection: 'column', overflowX: 'auto', cursor: 'pointer', transition: 'box-shadow 0.2s', ':hover': { boxShadow: 'var(--elevation-2)' } }}
          onClick={() => navigate('/diaradmin26/orders')}
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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className="title-md" style={{ marginBottom: '16px' }}>{language === 'ar' ? 'أحدث الطلبات' : 'Recent Orders'}</h2>
          <div className="metric-card" style={{ padding: '24px' }}>
            <DataTable
              tableId="dashboardRecentOrders"
              columns={columns}
              data={recentOrders}
              searchPlaceholder={language === 'ar' ? "بحث في الطلبات..." : "Search orders..."}
              actions={actionsNode}
              emptyMessage={language === 'ar' ? 'لا توجد طلبات بعد.' : 'No orders yet.'}
              onRowClick={(order) => navigate(`/diaradmin26/orders/${encodeURIComponent(order.id)}`)}
            />
          </div>
        </div>
      </div>
      </div>
    </PullToRefresh>
  );
}
