import React, { useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Users, TrendingUp, DollarSign, Star, Calendar, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { exportToExcel } from '../../utils/excelExport';

export default function UsersAnalysis() {
  const { users, orders } = useAdmin();

  const metrics = useMemo(() => {
    const customers = users.filter(u => !u.isInfluencer);
    
    // Calculate customer metrics
    const customersWithOrders = customers.map(customer => {
      const customerOrders = orders.filter(o => o.customer.phone === customer.phone || o.customer.email === customer.email);
      const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
      const orderCount = customerOrders.length;
      return {
        ...customer,
        totalSpent,
        orderCount,
        lastOrderDate: customerOrders.length > 0 ? new Date(Math.max(...customerOrders.map(o => new Date(o.date).getTime()))) : null
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent); // Sort by highest spending

    const totalCustomers = customers.length;
    const returningCustomers = customersWithOrders.filter(c => c.orderCount > 1).length;
    const oneTimeCustomers = customersWithOrders.filter(c => c.orderCount === 1).length;
    
    const activeCustomersLast30Days = customersWithOrders.filter(c => {
      if (!c.lastOrderDate) return false;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return c.lastOrderDate >= thirtyDaysAgo;
    }).length;

    const totalRevenue = customersWithOrders.reduce((sum, c) => sum + c.totalSpent, 0);
    const averageLTV = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    return {
      totalCustomers,
      returningCustomers,
      oneTimeCustomers,
      activeCustomersLast30Days,
      averageLTV,
      topCustomers: customersWithOrders.slice(0, 10)
    };
  }, [users, orders]);

  const handleExport = () => {
    const columns = [
      { header: 'Customer', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Total Spent (EGP)', key: 'spent', width: 20 },
      { header: 'Orders', key: 'orders', width: 15 },
      { header: 'Last Active', key: 'lastActive', width: 25 }
    ];

    const data = metrics.topCustomers.map(c => ({
      name: c.name,
      email: c.email || '',
      phone: c.phone || '',
      spent: c.totalSpent || 0,
      orders: c.orderCount || 0,
      lastActive: c.lastOrderDate ? c.lastOrderDate.toLocaleDateString() : 'Never'
    }));

    exportToExcel({ data, columns, filename: 'Top_Customers_Analysis' });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h2 className="headline-lg m-0">Customer Analysis</h2>
          <p className="text-on-surface-variant m-0" style={{ marginTop: '4px' }}>Insights and metrics for your customer base.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="metric-card" style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0 }}>Total Customers</h3>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>{metrics.totalCustomers}</div>
        </div>

        <div className="metric-card" style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#fce7f3', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0 }}>Returning Rate</h3>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>
            {metrics.totalCustomers > 0 ? Math.round((metrics.returningCustomers / metrics.totalCustomers) * 100) : 0}%
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{metrics.returningCustomers} returning customers</div>
        </div>

        <div className="metric-card" style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0 }}>Avg Lifetime Value</h3>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>{metrics.averageLTV.toFixed(2)}</div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>EGP per customer</div>
        </div>

        <div className="metric-card" style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} />
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0 }}>Active (30d)</h3>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>{metrics.activeCustomersLast30Days}</div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>recent purchasers</div>
        </div>
      </div>

      <div className="card" style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={20} color="#eab308" /> Top Customers
          </h3>
          <button className="btn btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '14px' }}>
            <Download size={16} /> Export
          </button>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Total Spent</th>
                <th>Orders</th>
                <th>Last Active</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {metrics.topCustomers.length > 0 ? metrics.topCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{customer.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{customer.email} | {customer.phone}</div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#10b981' }}>{customer.totalSpent.toFixed(2)} EGP</td>
                  <td>{customer.orderCount}</td>
                  <td style={{ color: '#64748b' }}>
                    {customer.lastOrderDate ? customer.lastOrderDate.toLocaleDateString() : 'Never'}
                  </td>
                  <td>
                    <Link to={`/admin/users/${customer.id}`} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      View Profile
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>No customer data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
