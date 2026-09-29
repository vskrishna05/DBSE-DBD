import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  CreditCard,
  FileText,
  IndianRupee,
  TrendingDown,
  Bell,
  User,
  LogOut,
  Building2,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiNotifications } from '../api/client';

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnread = async () => {
    try {
      const res = await apiNotifications.getAll();
      const unread = res.data.filter((n) => n.status === 'UNREAD').length;
      setUnreadCount(unread);
    } catch (e) {
      // quiet fail
    }
  };

  const navItems = [
    { to: '/customer/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/customer/subscription', icon: <Layers size={18} />, label: 'My Subscription' },
    { to: '/customer/plans', icon: <CreditCard size={18} />, label: 'Browse Plans' },
    { to: '/customer/invoices', icon: <FileText size={18} />, label: 'Invoices & Billing' },
    { to: '/customer/payments', icon: <IndianRupee size={18} />, label: 'Payment History' },
    { to: '/customer/loans', icon: <TrendingDown size={18} />, label: 'Loans & Repayments' },
    { to: '/customer/notifications', icon: <Bell size={18} />, label: 'Alerts', badge: unreadCount },
    { to: '/customer/profile', icon: <User size={18} />, label: 'Profile & Security' },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo-icon">
            <Layers size={20} />
          </div>
          <div>
            <div className="brand-text" style={{ fontSize: '1.25rem' }}>FINCORE</div>
          </div>
        </div>

        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(56, 189, 248, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 600 }}>
            <Building2 size={14} />
            <span>ORGANIZATION</span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.companyName || 'Associated Bank'}
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
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && (
                <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', fontWeight: 700 }}>
              {user?.name?.[0] || 'C'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/customer/login'); }}
            className="btn btn-outline btn-sm"
            style={{ width: '100%', gap: '0.5rem' }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="portal-main">
        <header className="top-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn btn-outline btn-sm mobile-menu-toggle"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Banking & Billing Dashboard</h2>
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
                color: theme === 'dark' ? '#f59e0b' : '#0284c7',
                transition: 'all 0.2s',
              }}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              onClick={() => navigate('/customer/notifications')}
              className="btn btn-secondary btn-sm"
              style={{ position: 'relative', padding: '0.5rem' }}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, background: '#f43f5e', color: '#fff', fontSize: '0.65rem', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/customer/profile')}
              className="btn btn-secondary btn-sm"
            >
              <User size={15} /> Profile
            </button>
          </div>
        </header>

        <main className="portal-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
