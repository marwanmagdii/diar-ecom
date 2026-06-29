import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const authStatus = localStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const logLogin = (adminName) => {
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminName,
        actionType: 'login',
        description: `Admin ${adminName} logged in`,
        details: {}
      })
    }).catch(e => console.error(e));
  };

  const login = (username, password) => {
    // Simple hardcoded authentication for immediate security
    // We can replace this with a real backend API call later
    const user = username.toLowerCase().trim();
    if (user === 'marwan' && password === 'Marwan@Diar2026!') {
      setIsAuthenticated(true);
      localStorage.setItem('isAdminAuthenticated', 'true');
      localStorage.setItem('currentAdmin', 'Marwan');
      logLogin('Marwan');
      return true;
    }
    if (user === 'roaya' && password === 'Roaya#Admin2026!') {
      setIsAuthenticated(true);
      localStorage.setItem('isAdminAuthenticated', 'true');
      localStorage.setItem('currentAdmin', 'Roaya');
      logLogin('Roaya');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAdminAuthenticated');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
