import React from 'react';
import { useStore } from '../store';

export default function ToastContainer() {
  const { toasts, removeToast } = useStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type || 'success'}`} style={{
          backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minWidth: '250px'
        }}>
          <span>{toast.message}</span>
          <button 
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              marginLeft: '10px',
              fontSize: '16px'
            }}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
