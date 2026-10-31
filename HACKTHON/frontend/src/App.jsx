import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Customer Pages
import Overview from './pages/customer/Overview';
import MyVehicles from './pages/customer/MyVehicles';
import BookService from './pages/customer/BookService';
import TrackService from './pages/customer/TrackService';
import MaintenancePredictions from './pages/customer/MaintenancePredictions';
import VehicleHealth from './pages/customer/VehicleHealth';
import VehiclePassport from './pages/customer/VehiclePassport';
import CostEstimator from './pages/customer/CostEstimator';
import Diagnosis from './pages/customer/Diagnosis';
import PickupDrop from './pages/customer/PickupDrop';
import Invoices from './pages/customer/Invoices';

// Mechanic Pages
import MechanicDashboard from './pages/mechanic/MechanicDashboard';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{ 
            style: { 
              background: '#09090B', 
              color: '#FFFFFF', 
              border: '1px solid rgba(255, 255, 255, 0.2)' 
            } 
          }} 
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer Portal */}
          <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
            <Route path="/customer" element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="vehicles" element={<MyVehicles />} />
              <Route path="book" element={<BookService />} />
              <Route path="bookings" element={<TrackService />} />
              <Route path="track" element={<TrackService />} />
              <Route path="predictions" element={<MaintenancePredictions />} />
              <Route path="health" element={<VehicleHealth />} />
              <Route path="passport" element={<VehiclePassport />} />
              <Route path="estimates" element={<CostEstimator />} />
              <Route path="diagnosis" element={<Diagnosis />} />
              <Route path="pickup" element={<PickupDrop />} />
              <Route path="invoices" element={<Invoices />} />
            </Route>
          </Route>

          {/* Mechanic Workshop Portal */}
          <Route element={<ProtectedRoute allowedRoles={['MECHANIC']} />}>
            <Route path="/mechanic" element={<DashboardLayout />}>
              <Route index element={<MechanicDashboard />} />
              <Route path="tracking" element={<MechanicDashboard />} />
              <Route path="health-check" element={<MechanicDashboard />} />
              <Route path="parts-used" element={<MechanicDashboard />} />
            </Route>
          </Route>

          {/* Service Center Manager Portal */}
          <Route element={<ProtectedRoute allowedRoles={['SERVICE_CENTER_MANAGER']} />}>
            <Route path="/manager" element={<DashboardLayout />}>
              <Route index element={<ManagerDashboard />} />
              <Route path="appointments" element={<ManagerDashboard />} />
              <Route path="assignments" element={<ManagerDashboard />} />
              <Route path="estimates" element={<ManagerDashboard />} />
              <Route path="inventory" element={<ManagerDashboard />} />
              <Route path="invoices" element={<ManagerDashboard />} />
            </Route>
          </Route>

          {/* System Administrator Portal */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="customers" element={<AdminDashboard />} />
              <Route path="mechanics" element={<AdminDashboard />} />
              <Route path="bookings" element={<AdminDashboard />} />
              <Route path="inventory" element={<AdminDashboard />} />
              <Route path="invoices" element={<AdminDashboard />} />
              <Route path="centers" element={<AdminDashboard />} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
