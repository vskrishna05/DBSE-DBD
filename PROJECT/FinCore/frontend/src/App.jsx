import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

// Guards & Layouts
import { CustomerRoute, AdminRoute } from './components/ProtectedRoute';
import CustomerLayout from './components/CustomerLayout';
import AdminLayout from './components/AdminLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import PublicPlansPage from './pages/public/PublicPlansPage';

// Auth Pages
import CustomerLoginPage from './pages/auth/CustomerLoginPage';
import CustomerRegisterPage from './pages/auth/CustomerRegisterPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import CompanyRegisterPage from './pages/auth/CompanyRegisterPage';

// Customer Portal Pages
import CustomerDashboardPage from './pages/customer/CustomerDashboardPage';
import CustomerSubscriptionPage from './pages/customer/CustomerSubscriptionPage';
import CustomerBrowsePlansPage from './pages/customer/CustomerBrowsePlansPage';
import CustomerSubscribePage from './pages/customer/CustomerSubscribePage';
import CustomerInvoicesPage from './pages/customer/CustomerInvoicesPage';
import CustomerPaymentsPage from './pages/customer/CustomerPaymentsPage';
import CustomerLoansPage from './pages/customer/CustomerLoansPage';
import CustomerNotificationsPage from './pages/customer/CustomerNotificationsPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';

// Admin Portal Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminPlansPage from './pages/admin/AdminPlansPage';
import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage';
import AdminInvoicesPage from './pages/admin/AdminInvoicesPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminLoansPage from './pages/admin/AdminLoansPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/plans" element={<PublicPlansPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Navigate to="/customer/login" replace />} />
            <Route path="/customer/login" element={<CustomerLoginPage />} />
            <Route path="/customer/register" element={<CustomerRegisterPage />} />
            <Route path="/customer/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/customer/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/customer/reset-password" element={<ResetPasswordPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/institution/register" element={<CompanyRegisterPage />} />
            <Route path="/company/register" element={<CompanyRegisterPage />} />

            {/* Customer Portal Protected Routes */}
            <Route element={<CustomerRoute />}>
              <Route path="/customer" element={<CustomerLayout />}>
                <Route index element={<Navigate to="/customer/dashboard" replace />} />
                <Route path="dashboard" element={<CustomerDashboardPage />} />
                <Route path="profile" element={<CustomerProfilePage />} />
                <Route path="plans" element={<CustomerBrowsePlansPage />} />
                <Route path="subscribe" element={<CustomerSubscribePage />} />
                <Route path="subscription" element={<CustomerSubscriptionPage />} />
                <Route path="invoices" element={<CustomerInvoicesPage />} />
                <Route path="payments" element={<CustomerPaymentsPage />} />
                <Route path="loans" element={<CustomerLoansPage />} />
                <Route path="notifications" element={<CustomerNotificationsPage />} />
              </Route>
            </Route>

            {/* Admin Portal Protected Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
                <Route path="plans" element={<AdminPlansPage />} />
                <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
                <Route path="invoices" element={<AdminInvoicesPage />} />
                <Route path="payments" element={<AdminPaymentsPage />} />
                <Route path="loans" element={<AdminLoansPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
            </Route>

            {/* Fallback Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}
