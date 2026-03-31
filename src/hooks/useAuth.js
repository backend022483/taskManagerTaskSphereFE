import { useState, useEffect, createContext, useContext } from 'react';
import { apiService, endpoints } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth state on mount
    const storedToken = localStorage.getItem('authToken') || sessionStorage.getItem('backupToken');
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('backupUser');

    console.log('useAuth - Checking stored auth:', { 
      hasToken: !!storedToken, 
      hasUser: !!storedUser,
      tokenSource: storedToken ? (localStorage.getItem('authToken') ? 'localStorage' : 'sessionStorage') : 'none'
    });

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log('useAuth - User restored:', userData.username);
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          sessionStorage.removeItem('backupToken');
          sessionStorage.removeItem('backupUser');
        }
      }
    }
    
    // Always set loading to false after checking
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    console.log('useAuth - Login called for:', userData.user?.username);
    
    setUser(userData.user);
    setToken(userData.token);
    
    // Store in both localStorage and sessionStorage
    localStorage.setItem('authToken', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
    
    sessionStorage.setItem('backupToken', userData.token);
    sessionStorage.setItem('backupUser', JSON.stringify(userData.user));
    
    console.log('useAuth - Login complete, token stored');
  };

  const logout = async () => {
    console.log('useAuth - Logout called');
    
    try {
      // Call backend logout endpoint if we have a token
      if (token) {
        try {
          await apiService.post(endpoints.logout);
          console.log('useAuth - Backend logout successful');
        } catch (error) {
          console.warn('useAuth - Backend logout failed:', error);
          // Continue with local logout even if backend logout fails
        }
      }
    } catch (error) {
      console.warn('useAuth - Error during logout:', error);
    } finally {
      // Always clear local state regardless of backend call success
      setUser(null);
      setToken(null);
      
      // Clear both storages
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('backupToken');
      sessionStorage.removeItem('backupUser');
      
      console.log('useAuth - Logout complete');
    }
  };

  const isAuthenticated = !!token;

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
