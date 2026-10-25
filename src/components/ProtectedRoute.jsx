import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useStore();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--surface)' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // TEMPORARY BYPASS FOR SCREENSHOT
    // return <Navigate to="/diaradmin26/login" state={{ from: location }} replace />;
  }

  return children;
}
