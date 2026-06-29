import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldAlert, Lock, User, LogIn } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { language, t } = useLanguage();

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (login(username, password)) {
      navigate(from, { replace: true });
    } else {
      setError(language === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid username or password');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: 'var(--surface)',
      padding: '24px'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '400px', 
        backgroundColor: 'var(--surface-container-lowest)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        border: '1px solid var(--outline-variant)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--primary-container)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--on-primary-container)'
          }}>
            <Lock size={32} />
          </div>
        </div>
        
        <h1 style={{ 
          textAlign: 'center', 
          fontSize: '24px', 
          fontWeight: 800, 
          color: 'var(--on-surface)',
          marginBottom: '8px'
        }}>
          {language === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard'}
        </h1>
        <p style={{ 
          textAlign: 'center', 
          color: 'var(--on-surface-variant)', 
          fontSize: '14px', 
          marginBottom: '32px' 
        }}>
          {language === 'ar' ? 'يرجى تسجيل الدخول للمتابعة' : 'Please log in to continue'}
        </p>

        {error && (
          <div style={{ 
            backgroundColor: 'var(--error-container)', 
            color: 'var(--on-error-container)', 
            padding: '12px 16px', 
            borderRadius: '12px', 
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 500
          }}>
            <ShieldAlert size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--on-surface)' }}>
              {language === 'ar' ? 'اسم المستخدم' : 'Username'}
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: language === 'ar' ? 'auto' : '16px', right: language === 'ar' ? '16px' : 'auto', color: 'var(--on-surface-variant)' }}>
                <User size={18} />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: language === 'ar' ? '12px 48px 12px 16px' : '12px 16px 12px 48px', 
                  borderRadius: '12px', 
                  border: '1px solid var(--outline)', 
                  backgroundColor: 'var(--surface-container-lowest)',
                  color: 'var(--on-surface)',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
                placeholder="admin"
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--on-surface)' }}>
              {language === 'ar' ? 'كلمة المرور' : 'Password'}
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: language === 'ar' ? 'auto' : '16px', right: language === 'ar' ? '16px' : 'auto', color: 'var(--on-surface-variant)' }}>
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: language === 'ar' ? '12px 48px 12px 16px' : '12px 16px 12px 48px', 
                  borderRadius: '12px', 
                  border: '1px solid var(--outline)', 
                  backgroundColor: 'var(--surface-container-lowest)',
                  color: 'var(--on-surface)',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            style={{ 
              marginTop: '8px',
              backgroundColor: 'var(--primary)', 
              color: 'var(--on-primary)', 
              padding: '14px', 
              borderRadius: '12px', 
              border: 'none', 
              fontSize: '16px', 
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          >
            <LogIn size={20} />
            {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
