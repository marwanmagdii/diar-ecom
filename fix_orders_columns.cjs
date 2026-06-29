const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/Orders.jsx', 'utf8');

// Update state for visibleColumns to include 'time'
content = content.replace(
  /const \[visibleColumns, setVisibleColumns\] = useState\(\{[\s\S]*?\}\);/,
  `const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    date: true,
    time: true,
    customer: true,
    status: true,
    promoCode: true,
    influencer: true,
    total: true,
    actions: true
  });`
);

// Update headers order
content = content.replace(
  /<tr>\s*\{visibleColumns\.id[\s\S]*?<\/tr>/,
  `<tr>
                {visibleColumns.id && <th>{t('orderId')}</th>}
                {visibleColumns.date && <th>{t('date')}</th>}
                {visibleColumns.time && <th>{lang === 'ar' ? 'الوقت' : 'Time'}</th>}
                {visibleColumns.customer && <th>{t('customer')}</th>}
                {visibleColumns.status && <th>{t('status')}</th>}
                {visibleColumns.promoCode && <th>{lang === 'ar' ? 'كود الخصم' : 'Promo Code'}</th>}
                {visibleColumns.influencer && <th>{lang === 'ar' ? 'المؤثر' : 'Influencer'}</th>}
                {visibleColumns.total && <th>{t('total')}</th>}
                {visibleColumns.actions && <th>{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>}
              </tr>`
);

// Update row cells order and date/time formatting
const replaceCellsRegex = /\{visibleColumns\.id && <td[\s\S]*?\{visibleColumns\.actions && <td>[\s\S]*?<\/td>\}/;

const newCells = `{visibleColumns.id && <td style={{ fontWeight: 600 }}>{order.id.slice(0, 8).toUpperCase()}</td>}
                    {visibleColumns.date && <td>{order.createdAt instanceof Date ? order.createdAt.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US') : new Date(order.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</td>}
                    {visibleColumns.time && <td>{order.createdAt instanceof Date ? order.createdAt.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : new Date(order.createdAt).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</td>}
                    {visibleColumns.customer && <td>
                      <div>{order.customer}</div>
                      <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>{order.phone}</div>
                    </td>}
                    {visibleColumns.status && <td>
                      <span className={\`status-pill status-\${order.status?.toLowerCase()}\`}>
                        {t(order.status?.toLowerCase()) || order.status}
                      </span>
                    </td>}
                    {visibleColumns.promoCode && <td>
                      {order.promoCode ? <span style={{ backgroundColor: '#0f172a', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>{order.promoCode}</span> : '-'}
                    </td>}
                    {visibleColumns.influencer && <td>{order.influencerName || '-'}</td>}
                    {visibleColumns.total && <td>{order.total?.toFixed(2)} EGP</td>}
                    {visibleColumns.actions && <td>
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
                    </td>}`;

content = content.replace(replaceCellsRegex, newCells);

fs.writeFileSync('src/pages/admin/Orders.jsx', content, 'utf8');
console.log('Fixed Orders table columns order and added time column.');
