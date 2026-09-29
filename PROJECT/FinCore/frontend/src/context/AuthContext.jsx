import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiAuth } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Rehydrate session from localStorage
    const savedUser = localStorage.getItem('fincore_user');
    const token = localStorage.getItem('fincore_token');

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('fincore_user');
        localStorage.removeItem('fincore_token');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (tokenData) => {
    localStorage.setItem('fincore_token', tokenData.access_token);
    const userInfo = {
      id: tokenData.user_id,
      email: tokenData.email,
      name: tokenData.full_name,
      role: tokenData.role,
      companyId: tokenData.finance_company_id,
      companyName: tokenData.finance_company_name,
    };
    localStorage.setItem('fincore_user', JSON.stringify(userInfo));
    setUser(userInfo);
    return userInfo;
  };

  const loginCustomer = async (email, password) => {
    const res = await apiAuth.loginCustomer(email, password);
    return handleLoginSuccess(res.data);
  };

  const loginAdmin = async (email, password) => {
    const res = await apiAuth.loginAdmin(email, password);
    return handleLoginSuccess(res.data);
  };

  const loginGmailOtp = async (email, otpCode, role = 'customer') => {
    const res = await apiAuth.loginGmailOtp(email, otpCode, role);
    return handleLoginSuccess(res.data);
  };

  const loginMobile = async (phoneNumber, otpCode, role = 'customer') => {
    const res = await apiAuth.loginMobile(phoneNumber, otpCode, role);
    return handleLoginSuccess(res.data);
  };

  const loginGoogle = async (googlePayload) => {
    const res = await apiAuth.verifyGoogle(googlePayload);
    return handleLoginSuccess(res.data);
  };

  const logout = () => {
    localStorage.removeItem('fincore_token');
    localStorage.removeItem('fincore_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isCustomer: user?.role === 'customer',
        isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
        loginCustomer,
        loginAdmin,
        loginGmailOtp,
        loginMobile,
        loginGoogle,
        logout,
        handleLoginSuccess,
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
