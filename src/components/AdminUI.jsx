import React from 'react';

// ponytail: single file for admin UI components to avoid boilerplate

export function PremiumInput({ label, type = 'text', value, onChange, placeholder, required = false, className = '', ...props }) {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <input type={type} className="input-field" value={value} onChange={onChange} placeholder={placeholder} required={required} {...props} />
    </div>
  );
}

export function PremiumToggle({ label, checked, onChange, description }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '12px' }}>
      <div>
        <div style={{ fontWeight: 600 }}>{label}</div>
        {description && <div style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>{description}</div>}
      </div>
      <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
        <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
        <span style={{ 
          display: 'inline-block', width: '44px', height: '24px', 
          backgroundColor: checked ? 'var(--primary)' : 'var(--outline-variant)', 
          borderRadius: '12px', position: 'relative', transition: 'background-color 0.2s' 
        }}>
          <span style={{ 
            display: 'inline-block', width: '20px', height: '20px', backgroundColor: 'white', 
            borderRadius: '50%', position: 'absolute', top: '2px', left: checked ? '22px' : '2px', 
            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' 
          }} />
        </span>
      </label>
    </div>
  );
}

export function MetricCard({ title, value, icon, trend, children }) {
  return (
    <div className="metric-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="metric-info">
          <h3 className="metric-title">{title}</h3>
          <p className="metric-value">{value}</p>
          {trend && <span className="metric-trend" style={{ color: trend.startsWith('+') ? 'var(--success)' : 'inherit' }}>{trend}</span>}
        </div>
        {icon && <div className="metric-icon">{icon}</div>}
      </div>
      {children}
    </div>
  );
}
