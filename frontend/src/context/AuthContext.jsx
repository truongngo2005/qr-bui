import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('coffee_token'));
  const [rememberedPhone, setRememberedPhone] = useState(localStorage.getItem('coffee_device_phone') || '');
  const [loading, setLoading] = useState(true);
  const [showRememberModal, setShowRememberModal] = useState(false);
  const [pendingPhone, setPendingPhone] = useState('');

  // Kiểm tra token khi load app
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success) {
            setUser(res.data);
          } else {
            logout();
          }
        } catch (err) {
          console.error("Token verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const handleLoginSuccess = (authData) => {
    localStorage.setItem('coffee_token', authData.token);
    setToken(authData.token);
    setUser({
      id: authData.userId,
      fullName: authData.fullName,
      phoneNumber: authData.phoneNumber,
      email: authData.email,
      role: authData.role,
      position: authData.position,
      hourlyRate: authData.hourlyRate,
    });

    // Nếu chưa lưu số điện thoại trên máy này -> Kích hoạt Modal hỏi Lưu thiết bị
    const saved = localStorage.getItem('coffee_device_phone');
    if (!saved || saved !== authData.phoneNumber) {
      setPendingPhone(authData.phoneNumber);
      setShowRememberModal(true);
    }
  };

  const confirmRememberDevice = (shouldRemember) => {
    if (shouldRemember && pendingPhone) {
      localStorage.setItem('coffee_device_phone', pendingPhone);
      setRememberedPhone(pendingPhone);
    }
    setShowRememberModal(false);
  };

  const forgetDevice = () => {
    localStorage.removeItem('coffee_device_phone');
    setRememberedPhone('');
  };

  const logout = () => {
    localStorage.removeItem('coffee_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role,
        isAdmin: user?.role === 'ADMIN',
        isManager: user?.role === 'MANAGER' || user?.role === 'ADMIN',
        isEmployee: user?.role === 'EMPLOYEE',
        rememberedPhone,
        loading,
        handleLoginSuccess,
        confirmRememberDevice,
        forgetDevice,
        logout,
        showRememberModal,
        pendingPhone,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
