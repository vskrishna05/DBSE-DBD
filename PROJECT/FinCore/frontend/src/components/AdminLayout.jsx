import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Layers,
  FileText,
  IndianRupee,
  TrendingDown,
  BarChart3,
  Settings,
  LogOut,
  Building,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/admin/customers', icon: <Users size={18} />, label: 'Customer Directory' },
    { to: '/admin/plans', icon: <CreditCard size={18} />, label: 'Plan Management' },
    { to: '/admin/subscriptions', icon: <Layers size={18} />, label: 'Subscriptions' },
    { to: '/admin/invoices', icon: <FileText size={18} />, label: 'Invoices & Billing' },
    { to: '/admin/payments', icon: <IndianRupee size={18} />, label: 'Payment Records' },
    { to: '/admin/loans', icon: <TrendingDown size={18} />, label: 'Loan Accounts' },
    { to: '/admin/analytics', icon: <BarChart3 size={18} />, label: 'Revenue Analytics' },
    { to: '/admin/settings', icon: <Settings size={18} />, label: 'Settings & Security' },
  ];

  return (
    <div className="app-layout">
      {/* Admin Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo-icon" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
            <Building size={20} />
          </div>
          <div>
            <div className="brand-text" style={{ fontSize: '1.25rem' }}>FINCORE</div>
          </div>
        </div>

        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(16, 185, 129, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>
            <Building size={14} />
            <span>OPERATING TENANT</span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.companyName || 'Finance Company Admin'}
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontWeight: 700 }}>
              {user?.name?.[0] || 'A'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 600 }}>
                {user?.role}
              </div>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/admin/login'); }}
            className="btn btn-outline btn-sm"
            style={{ width: '100%', gap: '0.5rem' }}
          >
            <LogOut size={14} /> Admin Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="portal-main">
        <header className="top-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn btn-outline btn-sm mobile-menu-toggle"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Administration Dashboard</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: theme === 'dark' ? '#f59e0b' : '#10b981',
                transition: 'all 0.2s',
              }}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <span className="badge badge-success">
              Role: {user?.role?.toUpperCase()}
            </span>
          </div>
        </header>

        <main className="portal-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
