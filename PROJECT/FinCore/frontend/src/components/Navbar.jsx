import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, ShieldCheck, ArrowRight, User, Lock, Sun, Moon, Server } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ServerConnectionModal from './ServerConnectionModal';
import { getApiBaseUrl } from '../api/client';

export default function Navbar() {
  const { user, isCustomer, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showServerModal, setShowServerModal] = useState(false);
  const [isServerLive, setIsServerLive] = useState(null);

  useEffect(() => {
    let mounted = true;
    const checkServer = async () => {
      try {
        const base = getApiBaseUrl().replace(/\/api\/?$/, '');
        const res = await fetch(`${base}/api/health`, { method: 'GET' });
        if (mounted) setIsServerLive(res.ok);
      } catch (e) {
        if (mounted) setIsServerLive(false);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <>
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
            onClick={() => setShowServerModal(true)}
            title="Backend API Server Status & Configuration"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: isServerLive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${isServerLive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: isServerLive ? '#10b981' : '#ef4444',
              padding: '0.35rem 0.65rem',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isServerLive ? '#10b981' : '#ef4444',
                boxShadow: isServerLive ? '0 0 6px #10b981' : '0 0 6px #ef4444',
              }}
            />
            {isServerLive ? 'Live API' : 'Server Offline'}
          </button>

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

      <ServerConnectionModal
        isOpen={showServerModal}
        onClose={() => setShowServerModal(false)}
      />
    </>
  );
}
