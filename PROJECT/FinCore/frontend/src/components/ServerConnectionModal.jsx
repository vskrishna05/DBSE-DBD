import React, { useState, useEffect } from 'react';
import { Server, CheckCircle2, AlertCircle, X, RefreshCw, Globe, ArrowRight } from 'lucide-react';
import { getApiBaseUrl, setCustomApiUrl, DEFAULT_LIVE_TUNNEL_URL } from '../api/client';

export default function ServerConnectionModal({ isOpen, onClose }) {
  const [currentUrl, setCurrentUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null); // 'connected' | 'error' | null
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const active = getApiBaseUrl().replace(/\/api\/?$/, '');
      setCurrentUrl(active);
      setInputUrl(active);
      checkHealth(active);
    }
  }, [isOpen]);

  const checkHealth = async (urlToCheck) => {
    setTesting(true);
    setStatus(null);
    setStatusMsg('Testing connection...');
    try {
      const target = (urlToCheck || '').trim().replace(/\/api\/?$/, '').replace(/\/$/, '');
      const healthEndpoint = target ? `${target}/api/health` : '/api/health';
      const res = await fetch(healthEndpoint, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setStatus('connected');
        setStatusMsg(`Connected: ${data.service || 'FinCore API Gateway'} (v${data.version || '1.0.0'})`);
      } else {
        setStatus('error');
        setStatusMsg(`Server responded with HTTP ${res.status}`);
      }
    } catch (err) {
      setStatus('error');
      setStatusMsg('Connection failed: Server unreachable or offline.');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setTesting(true);
    const cleanUrl = inputUrl.trim().replace(/\/api\/?$/, '').replace(/\/$/, '');
    try {
      const healthEndpoint = cleanUrl ? `${cleanUrl}/api/health` : '/api/health';
      const res = await fetch(healthEndpoint, { method: 'GET' });
      if (res.ok) {
        setCustomApiUrl(cleanUrl);
        setStatus('connected');
        setStatusMsg('Successfully connected! Reloading...');
        setTimeout(() => {
          window.location.reload();
        }, 600);
      } else {
        setStatus('error');
        setStatusMsg(`Server returned HTTP ${res.status}. Please check URL.`);
        setTesting(false);
      }
    } catch (e) {
      setStatus('error');
      setStatusMsg('Cannot reach backend at this URL. Make sure the server or tunnel is running.');
      setTesting(false);
    }
  };

  const handleResetDefault = () => {
    setInputUrl(DEFAULT_LIVE_TUNNEL_URL);
    checkHealth(DEFAULT_LIVE_TUNNEL_URL);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-surface-elevated, #111827)',
          border: '1px solid var(--border-subtle, #374151)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          color: '#f8fafc',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <Server size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>API Backend Connection</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Connect Vercel to your live database server</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Indicator */}
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            background: status === 'connected' ? 'rgba(16, 185, 129, 0.12)' : status === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${status === 'connected' ? 'rgba(16, 185, 129, 0.3)' : status === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
          }}
        >
          {testing ? (
            <RefreshCw size={16} className="animate-spin" style={{ color: '#38bdf8' }} />
          ) : status === 'connected' ? (
            <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
          ) : (
            <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
          )}
          <span style={{ color: status === 'connected' ? '#10b981' : status === 'error' ? '#ef4444' : '#94a3b8' }}>
            {statusMsg || 'Checking backend status...'}
          </span>
        </div>

        {/* Input Form */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.45rem' }}>
            Live Backend Server / Cloudflare Tunnel URL
          </label>
          <div style={{ position: 'relative' }}>
            <Globe size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://your-tunnel.trycloudflare.com"
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                borderRadius: '8px',
                background: '#0f172a',
                border: '1px solid #334155',
                color: '#f8fafc',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.75rem' }}>
            <span style={{ color: '#64748b' }}>Active Tunnel URL</span>
            <button
              type="button"
              onClick={handleResetDefault}
              style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0 }}
            >
              Set to Current Live Tunnel
            </button>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => checkHealth(inputUrl)}
            disabled={testing}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: '1px solid #334155',
              background: '#1e293b',
              color: '#cbd5e1',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={testing}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: '#0284c7',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            Save & Connect <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
