import React, { useMemo } from 'react';
import { Users, TrendingUp, DollarSign, Star, Award, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { exportToExcel } from '../../utils/excelExport';
import { useStore } from '../../store';

export default function InfluencersAnalysis() {
  const { config } = useStore();
  const promos = config?.promoCodes || [];
  
  // Filter promos to only those that look like influencers
  const influencers = promos.filter(p => p.influencerName || p.commissionValue > 0);

  const metrics = useMemo(() => {
    const totalInfluencers = influencers.length;
    const activeInfluencers = influencers.filter(inf => inf.isActive).length;
    const totalConversions = influencers.reduce((sum, inf) => sum + (inf.usageCount || 0), 0);
    const totalRevenue = influencers.reduce((sum, inf) => sum + (inf.totalRevenue || 0), 0);
    
    let totalCommissions = 0;
    influencers.forEach(inf => {
      if (inf.commissionType === 'percentage') {
        totalCommissions += (inf.totalRevenue || 0) * (inf.commissionValue / 100);
      } else {
        totalCommissions += (inf.usageCount || 0) * inf.commissionValue;
      }
    });

    // Sort by revenue
    const topPerformers = [...influencers].sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0)).slice(0, 10);

    return {
      totalInfluencers,
      activeInfluencers,
      totalConversions,
      totalRevenue,
      totalCommissions,
      topPerformers
    };
  }, [influencers]);

  const handleExport = () => {
    const columns = [
      { header: 'Influencer Name', key: 'name', width: 30 },
      { header: 'Promo Code', key: 'code', width: 20 },
      { header: 'Conversions', key: 'conversions', width: 15 },
      { header: 'Revenue Generated (EGP)', key: 'revenue', width: 25 },
      { header: 'Commission Owed (EGP)', key: 'commission', width: 25 }
    ];

    const data = metrics.topPerformers.map(inf => {
      let commission = 0;
      if (inf.commissionType === 'percentage') {
        commission = (inf.totalRevenue || 0) * (inf.commissionValue / 100);
      } else {
        commission = (inf.usageCount || 0) * inf.commissionValue;
      }
      return {
        name: inf.influencerName || 'Unnamed',
        code: inf.code,
        conversions: inf.usageCount || 0,
        revenue: inf.totalRevenue || 0,
        commission: commission
      };
    });

    exportToExcel({ data, columns, filename: 'Top_Influencers_Analysis' });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h2 className="headline-lg m-0">Influencer Analysis</h2>
          <p className="text-on-surface-variant m-0" style={{ marginTop: '4px' }}>Performance metrics and ROI for your influencer partnerships.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="metric-card" style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0 }}>Total Influencers</h3>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>{metrics.totalInfluencers}</div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{metrics.activeInfluencers} currently active</div>
        </div>

        <div className="metric-card" style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#fce7f3', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0 }}>Total Conversions</h3>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>{metrics.totalConversions}</div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>successful promo code uses</div>
        </div>

        <div className="metric-card" style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0 }}>Generated Revenue</h3>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>{metrics.totalRevenue.toFixed(2)}</div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>EGP from influencer sales</div>
        </div>

        <div className="metric-card" style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={20} />
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0 }}>Total Commission Owed</h3>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>{metrics.totalCommissions.toFixed(2)}</div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>EGP to payout</div>
        </div>
      </div>

      <div className="card" style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="#8b5cf6" /> Top Performers
          </h3>
          <button className="btn btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '14px' }}>
            <Download size={16} /> Export
          </button>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Influencer</th>
                <th>Promo Code</th>
                <th>Conversions</th>
                <th>Revenue Generated</th>
                <th>Commission Owed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {metrics.topPerformers.length > 0 ? metrics.topPerformers.map((inf) => {
                let commission = 0;
                if (inf.commissionType === 'percentage') {
                  commission = (inf.totalRevenue || 0) * (inf.commissionValue / 100);
                } else {
                  commission = (inf.usageCount || 0) * inf.commissionValue;
                }

                return (
                  <tr key={inf.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{inf.influencerName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'capitalize', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                        {inf.socialAccounts && inf.socialAccounts.length > 0 ? (
                          inf.socialAccounts.map((acc, idx) => (
                            <span key={idx}>
                              {acc.platform} {acc.handle && `(${acc.handle})`}
                            </span>
                          ))
                        ) : (
                          <span>{inf.socialPlatform} {inf.socialHandle && `(${inf.socialHandle})`}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--primary)', backgroundColor: 'var(--primary-container)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>
                        {inf.code}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{inf.usageCount || 0}</td>
                    <td style={{ fontWeight: 600, color: '#10b981' }}>{(inf.totalRevenue || 0).toFixed(2)} EGP</td>
                    <td style={{ fontWeight: 600 }}>{commission.toFixed(2)} EGP</td>
                    <td>
                      <Link to={`/admin/influencers/edit/${inf.id}`} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>No influencer data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
