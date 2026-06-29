const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/Orders.jsx', 'utf8');

// 1. Add column toggler state
const stateReplacement = `const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    date: true,
    customer: true,
    status: true,
    total: true,
    promoCode: true,
    influencer: true,
    actions: true
  });
`;
content = content.replace(/const \[searchTerm, setSearchTerm\] = useState\(''\);\s*const \[statusFilter, setStatusFilter\] = useState\('All'\);/, stateReplacement);

// 2. Add Columns Toggle Button
const buttonsReplacement = `          <div style={{ position: 'relative' }}>
            <button 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }} 
              onClick={() => setShowColumnsMenu(!showColumnsMenu)}
            >
              <Filter size={18} /> {lang === 'ar' ? 'الأعمدة' : 'Columns'}
            </button>
            {showColumnsMenu && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'var(--surface)', border: '1px solid var(--outline)', borderRadius: '8px', padding: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, width: '200px' }}>
                {Object.keys(visibleColumns).map(key => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer', fontSize: '14px' }}>
                    <input 
                      type="checkbox" 
                      checked={visibleColumns[key]} 
                      onChange={(e) => setVisibleColumns({...visibleColumns, [key]: e.target.checked})}
                    />
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </label>
                ))}
              </div>
            )}
          </div>
          
          <button 
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }} 
            onClick={handleExport}`;

content = content.replace(/<button\s+className="btn btn-secondary"\s+style=\{\{ display: 'flex', alignItems: 'center', gap: '8px' \}\}\s+onClick=\{handleExport\}/, buttonsReplacement);

// 3. Update search logic to include promo code and influencer
const searchLogic = `const matchesSearch = 
        (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customer && order.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.phone && order.phone.includes(searchTerm)) ||
        (order.promoCode && order.promoCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.influencerName && order.influencerName.toLowerCase().includes(searchTerm.toLowerCase()));`;

content = content.replace(/const matchesSearch =\s*\(order\.id && order\.id\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\)\) \|\|\s*\(order\.customer && order\.customer\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\)\) \|\|\s*\(order\.phone && order\.phone\.includes\(searchTerm\)\);/, searchLogic);

// 4. Update Table Headers
const headers = `<tr>
                {visibleColumns.id && <th>{t('orderId')}</th>}
                {visibleColumns.date && <th>{t('date')}</th>}
                {visibleColumns.customer && <th>{t('customer')}</th>}
                {visibleColumns.promoCode && <th>{lang === 'ar' ? 'كود الخصم' : 'Promo Code'}</th>}
                {visibleColumns.influencer && <th>{lang === 'ar' ? 'المؤثر' : 'Influencer'}</th>}
                {visibleColumns.status && <th>{t('status')}</th>}
                {visibleColumns.total && <th>{t('total')}</th>}
                {visibleColumns.actions && <th>{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>}
              </tr>`;

content = content.replace(/<tr>\s*<th>\{t\('orderId'\)\}<\/th>[\s\S]*?<th>\{lang === 'ar' \? 'الإجراءات' : 'Actions'\}<\/th>\s*<\/tr>/, headers);

// 5. Update Table Body / Rows + Date formatting
// We need to parse the row mapping
content = content.replace(/<td style=\{\{ fontWeight: 600 \}\}>\{order\.id\.slice\(0, 8\)\.toUpperCase\(\)\}<\/td>/, '{visibleColumns.id && <td style={{ fontWeight: 600 }}>{order.id.slice(0, 8).toUpperCase()}</td>}');
content = content.replace(/<td>\{order\.createdAt instanceof Date \? order\.createdAt\.toLocaleDateString\(\) : 'Unknown'\}<\/td>/, "{visibleColumns.date && <td>{order.createdAt instanceof Date ? order.createdAt.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date(order.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>}");
content = content.replace(/<td>\s*<div>\{order\.customer\}<\/div>\s*<div style=\{\{ fontSize: '12px', color: 'var\(--on-surface-variant\)' \}\}>\{order\.phone\}<\/div>\s*<\/td>/, `{visibleColumns.customer && <td>
                      <div>{order.customer}</div>
                      <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>{order.phone}</div>
                    </td>}`);
content = content.replace(/<td>\s*<span className=\{\`status-pill status-\$\{order\.status\?\.toLowerCase\(\)\}\`\}>\s*\{t\(order\.status\?\.toLowerCase\(\)\) \|\| order\.status\}\s*<\/span>\s*<\/td>/, `{visibleColumns.status && <td>
                      <span className={\`status-pill status-\${order.status?.toLowerCase()}\`}>
                        {t(order.status?.toLowerCase()) || order.status}
                      </span>
                    </td>}`);
content = content.replace(/<td>\{order\.total\?\.toFixed\(2\)\} EGP<\/td>/, `
                    {visibleColumns.promoCode && <td>
                      {order.promoCode ? <span style={{ backgroundColor: '#0f172a', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>{order.promoCode}</span> : '-'}
                    </td>}
                    {visibleColumns.influencer && <td>{order.influencerName || '-'}</td>}
                    {visibleColumns.total && <td>{order.total?.toFixed(2)} EGP</td>}`);
content = content.replace(/<td>\s*<div style=\{\{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' \}\}>[\s\S]*?<\/div>\s*<\/td>/, `{visibleColumns.actions && <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary"
                          style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="View Details" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(\`/admin/orders/\${encodeURIComponent(order.id)}\`);
                          }}
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>}`);

fs.writeFileSync('src/pages/admin/Orders.jsx', content, 'utf8');
console.log('Orders.jsx patched successfully');
