import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, ShieldCheck, ArrowRight, User, Lock, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, isCustomer, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className="top-nav">
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <div className="brand-logo-icon">
          <Layers size={22} />
        </div>
        <span className="brand-text">FINCORE</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/" style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>Home</Link>
        <Link to="/about" style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>Architecture</Link>
        <Link to="/plans" style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>Plans & Rates</Link>
        <Link to="/institution/register" style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>Register FinTech Bank</Link>
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
            color: theme === 'dark' ? '#f59e0b' : '#3b82f6',
            transition: 'all 0.2s',
          }}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        {user ? (
          <>
            <button
              onClick={() => navigate(isCustomer ? '/customer/dashboard' : '/admin/dashboard')}
              className="btn btn-secondary btn-sm"
            >
              {isCustomer ? <User size={15} /> : <ShieldCheck size={15} />}
              {user.name} ({user.role})
            </button>
            <button onClick={logout} className="btn btn-outline btn-sm">
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/customer/login" className="btn btn-outline btn-sm">
              Customer Login
            </Link>
            <Link to="/customer/register" className="btn btn-primary btn-sm">
              Get Started <ArrowRight size={14} />
            </Link>
            <Link to="/admin/login" style={{ color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: '0.5rem' }}>
              <Lock size={12} /> Admin
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
