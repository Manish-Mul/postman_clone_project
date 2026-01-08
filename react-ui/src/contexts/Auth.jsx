import { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Unified login handler
  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        console.error('Error parsing user data', error);
      }
    }
    setLoading(false);
  }, []);

  // Listen for token-expired event AFTER logout is defined
  useEffect(() => {
    const handleTokenExpired = () => {
      alert('Your session has expired. Please log in again.');
      logout();
    };

    window.addEventListener('token-expired', handleTokenExpired);
    return () => window.removeEventListener('token-expired', handleTokenExpired);
  }, [logout]);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
