import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Copy, Link as LinkIcon, Tag, Eye } from 'lucide-react';
import { useStore } from '../../store';
import DataTable from '../../components/admin/DataTable';

export default function InfluencerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { config, orders, language } = useStore();
  const promos = config.promoCodes || [];
  
  const influencer = promos.find(p => p.id === id);
  
  if (!influencer) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2>Influencer not found</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/diaradmin26/influencers')}>
          Back to Influencers
        </button>
      </div>
    );
  }

  // Calculate dynamic stats
  const influencerOrders = (orders || []).filter(
    o => o.promoCode === influencer.code || o.affiliateCode === influencer.code
  );
  
  const dynamicUses = influencerOrders.length;
  const dynamicSales = influencerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  
  let dynamicCommission = 0;
  if (influencer.commissionType === 'percentage') {
    dynamicCommission = dynamicSales * (influencer.commissionValue / 100);
  } else {
    dynamicCommission = dynamicUses * (influencer.commissionValue || 0);
  }

  const isLink = influencer.affiliateType === 'link';

  const columns = [
    { id: 'id', label: language === 'ar' ? 'رقم الطلب' : 'Order ID', render: (order) => <span style={{ fontWeight: 600 }}>{order.id.slice(0, 8).toUpperCase()}</span> },
    { id: 'date', label: language === 'ar' ? 'التاريخ' : 'Date', render: (order) => order.createdAt instanceof Date ? order.createdAt.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') },
    { id: 'customer', label: language === 'ar' ? 'العميل' : 'Customer', render: (order) => <span style={{ whiteSpace: 'nowrap', fontWeight: 500, color: 'var(--on-surface)' }}>{order.customer}</span> },
    { id: 'status', label: language === 'ar' ? 'الحالة' : 'Status', render: (order) => <span className={`status-pill status-${order.status?.toLowerCase()}`}>{order.status}</span> },
    { id: 'total', label: language === 'ar' ? 'الإجمالي' : 'Total', align: 'right', render: (order) => <span style={{ fontWeight: 'bold', color: 'var(--primary)', whiteSpace: 'nowrap' }}>{order.total?.toFixed(2)} EGP</span> },
    { id: 'actions', label: language === 'ar' ? 'الإجراءات' : 'Actions', align: 'right', render: (order) => (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
        <button 
          className="btn btn-secondary"
          style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="View Details" 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/diaradmin26/orders/${encodeURIComponent(order.id)}`);
          }}
        >
          <Eye size={18} />
        </button>
      </div>
    )}
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--on-surface-variant)' }}>
        <button 
          onClick={() => navigate('/diaradmin26/influencers')}
          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontSize: '14px' }}
        >
          {language === 'ar' ? 'المؤثرين' : 'Influencers'}
        </button>
        <ChevronRight size={16} />
        <span style={{ color: 'var(--on-surface)', fontWeight: 500, fontSize: '14px' }}>{influencer.influencerName || 'Unnamed'}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--on-surface)' }}>
            {influencer.influencerName || 'Unnamed'}
          </h1>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => navigate(`/diaradmin26/influencers/edit/${influencer.id}`)}
          >
            <Edit size={16} />
            {language === 'ar' ? 'تعديل' : 'Edit'}
          </button>
        </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: isLink ? '#0f172a' : '#0f172a', color: '#ffffff', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
              {isLink ? <LinkIcon size={14} style={{ color: '#a78bfa' }} /> : <Tag size={14} style={{ color: '#fbbf24' }} />}
              {influencer.code}
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
              {isLink ? (language === 'ar' ? 'رابط إحالة' : 'Referral Link') : (language === 'ar' ? 'كود خصم' : 'Promo Code')}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="metric-card" style={{ padding: '24px', backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: '0 0 12px 0' }}>
            {language === 'ar' ? 'نسبة العمولة' : 'Commission Rate'}
          </h3>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
            {influencer.commissionValue}{influencer.commissionType === 'percentage' ? '%' : ' EGP'}
          </div>
        </div>
        <div 
          className="metric-card" 
          style={{ padding: '24px', backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => {
            document.getElementById('order-history').scrollIntoView({ behavior: 'smooth' });
          }}
          title={language === 'ar' ? 'عرض المستخدمين' : 'View users'}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: '0 0 12px 0', display: 'flex', justifyContent: 'space-between' }}>
            {language === 'ar' ? 'مرات الاستخدام' : 'Total Uses'}
            <ChevronRight size={16} />
          </h3>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
            {dynamicUses}
            {influencer.maxUses > 0 && <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}> / {influencer.maxUses}</span>}
          </div>
        </div>
        <div className="metric-card" style={{ padding: '24px', backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: '0 0 12px 0' }}>
            {language === 'ar' ? 'إجمالي المبيعات' : 'Sales Generated'}
          </h3>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
            {dynamicSales.toFixed(2)} EGP
          </div>
        </div>
        <div className="metric-card" style={{ padding: '24px', backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: '0 0 12px 0' }}>
            {language === 'ar' ? 'إجمالي العمولات' : 'Total Earnings'}
          </h3>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
            {dynamicCommission.toFixed(2)} EGP
          </div>
        </div>
      </div>

      <div id="order-history" style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
            {language === 'ar' ? 'سجل الطلبات' : 'Order History'}
          </h2>
        </div>
        <div style={{ padding: '24px' }}>
          <DataTable
            tableId={`influencer-orders-${id}`}
            columns={columns}
            data={influencerOrders}
            searchPlaceholder={language === 'ar' ? 'البحث في الطلبات...' : 'Search orders...'}
            emptyMessage={language === 'ar' ? 'لم يتم العثور على طلبات.' : 'No orders found for this influencer.'}
            onRowClick={(order) => navigate(`/diaradmin26/orders/${encodeURIComponent(order.id)}`)}
          />
        </div>
      </div>
    </div>
  );
}
