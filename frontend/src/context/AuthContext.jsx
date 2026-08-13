import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    () => localStorage.getItem('token') || sessionStorage.getItem('token')
  );
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.getMe();
      if (response.status === 'success' && response.data?.user) {
        setUser(response.data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Failed to authenticate session:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const handleLogin = async (credentials, rememberMe = true) => {
    const response = await authService.login(credentials);
    if (response.status === 'success' && response.data) {
      const { user: loggedInUser, token: authToken } = response.data;
      if (rememberMe) {
        localStorage.setItem('token', authToken);
        sessionStorage.removeItem('token');
      } else {
        sessionStorage.setItem('token', authToken);
        localStorage.removeItem('token');
      }
      setToken(authToken);
      setUser(loggedInUser);
      return response.data;
    } else {
      throw new Error(response.message || 'Login failed');
    }
  };

  const handleRegister = async (userData) => {
    const response = await authService.register(userData);
    if (response.status === 'success' && response.data) {
      const { user: registeredUser, token: authToken } = response.data;
      localStorage.setItem('token', authToken);
      sessionStorage.removeItem('token');
      setToken(authToken);
      setUser(registeredUser);
      return response.data;
    } else {
      throw new Error(response.message || 'Registration failed');
    }
  };

  const handleChangePassword = async (passwordData) => {
    const response = await authService.changePassword(passwordData);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout,
    changePassword: handleChangePassword,
    refreshUser: fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
