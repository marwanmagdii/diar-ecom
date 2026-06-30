import React, { useState, useEffect } from 'react';
import { User, ExternalLink, Search, Filter, Download, Activity } from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';
import { Link } from 'react-router-dom';
import CustomerAnalytics from './CustomerAnalytics';
import { useStore } from '../../store';

export default function ActivityLogs() {
  const { currentAdmin, setAdmin } = useStore();
  const { config, updateLoggingSettings } = useStore();
  const { products } = useStore();
  const { language } = useStore();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Marwan'); // 'Marwan', 'Roaya', 'Customers'

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const parseLogDescription = (log) => {
    let targetName = '-';
    let updateText = log.description;
    let link = null;

    if (log.actionType.includes('product')) {
      const idMatch = log.description.match(/([a-f0-9]{24}|[a-zA-Z0-9_-]{10,})/i);
      if (idMatch) {
        const id = idMatch[1];
        const product = products.find(p => p.id === id);
        targetName = product ? (product.title || product.titleAr) : id;
        updateText = log.description.replace(id, '').replace(/product:?\s*/i, 'Product ').trim();
        link = `/diaradmin26/products/${id}`;
      } else if (log.description) {
        targetName = log.description.replace(/Added product:?/i, '').trim();
        updateText = 'Added new product';
      }
    } else if (log.actionType.includes('order')) {
      const match = log.description.match(/#+([a-zA-Z0-9_-]+)/);
      if (match && log.description) {
        targetName = `Order #${match[1]}`;
        updateText = log.description.replace(match[0], '').replace(/order\s*/i, 'Order ').trim();
        link = `/diaradmin26/orders/${match[1]}`;
      }
    } else if (log.actionType === 'update_settings') {
      targetName = 'Store Settings';
      updateText = log.description;
      link = '/diaradmin26/settings';
    } else if (log.actionType === 'login') {
      targetName = 'System Auth';
      updateText = log.description;
    }

    if (updateText === 'Updated Product' || updateText === 'Updated Order') updateText += ' details';

    return { targetName, updateText, link };
  };

  const getActionColor = (type) => {
    if (type.includes('add') || type.includes('create')) return '#10b981'; // green
    if (type.includes('delete') || type.includes('remove')) return '#ef4444'; // red
    return '#3b82f6'; // blue
  };

  const filteredLogs = logs.filter(log => {
    const { targetName, updateText } = parseLogDescription(log);
    const targetStr = (targetName || '').toString().toLowerCase();
    const updateStr = (updateText || '').toString().toLowerCase();
    const searchStr = (searchTerm || '').toString().toLowerCase();
    
    const matchesSearch = targetStr.includes(searchStr) || updateStr.includes(searchStr);
    const matchesAdmin = log.adminName === activeTab;
    return matchesSearch && matchesAdmin;
  });

  const handleExport = () => {
    const columns = [
      { header: 'Admin', key: 'admin', width: 20 },
      { header: 'Target Item', key: 'target', width: 30 },
      { header: 'Update Details', key: 'details', width: 40 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Time', key: 'time', width: 15 }
    ];

    const data = filteredLogs.map(log => {
      const { targetName, updateText } = parseLogDescription(log);
      const d = new Date(log.timestamp);
      return {
        admin: log.adminName,
        target: targetName,
        details: updateText,
        status: 'Success',
        date: d.toLocaleDateString(),
        time: d.toLocaleTimeString()
      };
    });

    exportToExcel({ data, columns, filename: 'Activity_Logs' });
  };

  return (
    <div style={{ padding: '24px', width: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="headline-sm">{language === 'ar' ? 'سجل النشاطات' : 'Activity Logs'}</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleExport} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} />
            {language === 'ar' ? 'تصدير' : 'Export Data'}
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
        {[
          { id: 'Marwan', label: language === 'ar' ? 'سجلات مروان' : 'Marwan Logs' },
          { id: 'Roaya', label: language === 'ar' ? 'سجلات رؤيا' : 'Roaya Logs' },
          { id: 'Customers', label: language === 'ar' ? 'تتبع العملاء' : 'Customer Tracking' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? '#2563eb' : '#64748b',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #2563eb' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toggle Status Row under Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--surface-container-lowest)', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
            {activeTab === 'Customers' 
              ? (language === 'ar' ? 'حالة تتبع العملاء' : 'Customer Tracking Status')
              : (language === 'ar' ? `حالة تسجيل ${activeTab}` : `${activeTab}'s Logging Status`)}
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            {activeTab === 'Customers' 
              ? (language === 'ar' ? 'حدد ما إذا كنت تريد حفظ بيانات رحلات التسوق للعملاء.' : 'Determine if customer shopping journeys should be tracked and saved.')
              : (language === 'ar' ? `حدد ما إذا كنت تريد حفظ أفعال ${activeTab} في قاعدة البيانات.` : `Determine if actions taken by ${activeTab} should be saved to the database.`)}
          </p>
        </div>

        <button
          onClick={() => {
            const currentStatus = config?.loggingSettings?.[activeTab] ?? true;
            updateLoggingSettings({ ...config?.loggingSettings, [activeTab]: !currentStatus });
            if (activeTab !== 'Customers') setAdmin(activeTab);
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', transition: 'all 0.2s', border: 'none',
            backgroundColor: (config?.loggingSettings?.[activeTab] !== false) ? '#10b981' : '#e2e8f0',
            color: (config?.loggingSettings?.[activeTab] !== false) ? 'white' : '#64748b',
            fontWeight: 600
          }}
        >
          {(config?.loggingSettings?.[activeTab] !== false) ? (language === 'ar' ? 'نشط (يعمل)' : 'Active (ON)') : (language === 'ar' ? 'غير نشط (متوقف)' : 'Inactive (OFF)')}
        </button>
      </div>

      {/* Conditional Table Rendering */}
      {activeTab === 'Customers' ? (
        <CustomerAnalytics isEmbedded={true} />
      ) : (
        <div style={{ backgroundColor: 'var(--surface-container-lowest)', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 className="title-md">{language === 'ar' ? `نشاطات ${activeTab}` : `${activeTab}'s Recent Activities`}</h2>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder={language === 'ar' ? 'بحث...' : 'Search logs...'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
              />
            </div>
          </div>
        
        {loading ? (
          <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading logs...'}</p>
        ) : filteredLogs.length === 0 ? (
          <p style={{ color: '#64748b' }}>{language === 'ar' ? 'لا توجد نشاطات مسجلة بعد.' : 'No activity logs match your search.'}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: language === 'ar' ? 'right' : 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '14px' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>{language === 'ar' ? 'العنصر المستهدف' : 'Target Name'}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>{language === 'ar' ? 'التحديث' : 'Update Details'}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>{language === 'ar' ? 'الوقت' : 'Time'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => {
                  const { targetName, updateText, link } = parseLogDescription(log);
                  return (
                    <tr key={log._id || index} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '16px', color: '#0f172a', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {targetName}
                          {link && (
                            <Link to={link} style={{ color: '#2563eb', display: 'flex', alignItems: 'center', textDecoration: 'none' }} title="View">
                              <ExternalLink size={16} />
                            </Link>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: '#334155' }}>
                        {updateText}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          backgroundColor: '#10b98115', 
                          color: '#10b981', 
                          padding: '6px 12px', 
                          borderRadius: '20px', 
                          fontSize: '13px', 
                          fontWeight: 600 
                        }}>
                          {language === 'ar' ? 'نجاح' : 'Success'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>
                        {new Date(log.timestamp).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </td>
                      <td style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>
                        {new Date(log.timestamp).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
