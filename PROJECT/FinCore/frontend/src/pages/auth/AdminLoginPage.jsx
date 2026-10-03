import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, Lock, ArrowRight, ShieldCheck, Mail, RefreshCw, KeyRound, AlertCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { apiAuth } from '../../api/client';

export default function AdminLoginPage() {
  const { loginAdmin, loginGmailOtp } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Auth Mode: 'gmail_otp' (default) | 'password'
  const [authMode, setAuthMode] = useState('gmail_otp');

  // Inline error state
  const [error, setError] = useState(null);

  // Gmail OTP state
  const [adminEmail, setAdminEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [adminName, setAdminName] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Email / Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);

  React.useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendGmailOtp = async (e) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = adminEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      const msg = 'Please enter a valid administrator email address.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await apiAuth.sendGmailOtp(cleanEmail, 'admin');
      setAdminName(res.data.name || '');
      setOtpSent(true);
      setCountdown(45);
      showToast(res.data.message || `Verification OTP code dispatched to ${cleanEmail}. Valid for 10 minutes.`, 'success');
    } catch (err) {
      const msg = err.friendlyMessage || 'No administrator registered with this email address.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyGmailOtp = async (e) => {
    e.preventDefault();
    setError(null);
    if (!otpCode || otpCode.length < 4) {
      const msg = 'Please enter the 6-digit verification code received in your email.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    setVerifyingOtp(true);
    try {
      await loginGmailOtp(adminEmail.trim().toLowerCase(), otpCode.trim(), 'admin');
      showToast('Administrator identity verified! Access granted.', 'success');
      navigate('/admin/dashboard');
    } catch (err) {
      const msg = err.friendlyMessage || 'Invalid administrator verification OTP. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmittingPassword(true);
    try {
      await loginAdmin(email, password);
      showToast('Logged in as Administrator!', 'success');
      navigate('/admin/dashboard');
    } catch (err) {
      const msg = err.friendlyMessage || 'Invalid administrator credentials. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmittingPassword(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        background: isDark
          ? 'radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.1), transparent 65%), var(--bg-primary)'
          : 'radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.07), transparent 65%), #f8fafc',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        position: 'relative',
      }}
    >
      {/* Theme Toggle Button */}
      <button
        type="button"
        onClick={toggleTheme}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          background: isDark ? 'var(--bg-surface-elevated)' : '#ffffff',
          border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
          borderRadius: '50%',
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: isDark ? '#f59e0b' : '#0284c7',
          boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'all 0.2s',
          zIndex: 10,
        }}
      >
        {isDark ? <Sun size={19} /> : <Moon size={19} />}
      </button>

      {/* Admin Authentication Card */}
      <div
        className="fincore-auth-card"
        style={{
          maxWidth: '460px',
          width: '100%',
          background: isDark ? 'var(--bg-surface)' : '#ffffff',
          borderRadius: '24px',
          border: isDark ? '1px solid var(--border-subtle)' : '1px solid #e2e8f0',
          boxShadow: isDark
            ? '0 20px 45px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            : '0 20px 45px -12px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)',
          padding: '2.75rem 2.25rem',
          boxSizing: 'border-box',
          color: isDark ? 'var(--text-primary)' : '#0f172a',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              marginBottom: '0.85rem',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10b981, #0284c7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 8px 18px -4px rgba(16, 185, 129, 0.35)',
                marginBottom: '0.65rem',
              }}
            >
              <Building size={24} strokeWidth={2.2} />
            </div>
            <span
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                color: isDark ? '#ffffff' : '#0f172a',
                lineHeight: 1.2,
              }}
            >
              FINCORE
            </span>
            <span
              style={{
                fontSize: '0.76rem',
                color: '#10b981',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginTop: '3px',
              }}
            >
              Multi-Tenant Banking Infrastructure
            </span>
          </Link>

          <h1
            style={{
              fontSize: '1.55rem',
              fontWeight: 700,
              color: isDark ? 'var(--text-primary)' : '#0f172a',
              margin: '0 0 0.45rem 0',
              letterSpacing: '-0.02em',
            }}
          >
            Administrator Access
          </h1>
          <p
            style={{
              color: isDark ? 'var(--text-secondary)' : '#64748b',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Institution Management Console
          </p>
        </div>

        {/* Inline Error Alert Banner */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
              border: isDark ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid #fecaca',
              color: isDark ? '#f87171' : '#dc2626',
              fontSize: '0.88rem',
              marginBottom: '1.5rem',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 500 }}>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '1rem',
                lineHeight: 1,
                padding: '2px',
                opacity: 0.8,
              }}
              title="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tabs: Gmail OTP vs Password */}
        <div
          style={{
            display: 'flex',
            background: isDark ? 'var(--bg-surface-elevated)' : '#f1f5f9',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '1.75rem',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthMode('gmail_otp');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '9px',
              border: 'none',
              background:
                authMode === 'gmail_otp'
                  ? isDark
                    ? '#10b981'
                    : '#ffffff'
                  : 'transparent',
              color:
                authMode === 'gmail_otp'
                  ? isDark
                    ? '#ffffff'
                    : '#0f172a'
                  : isDark
                  ? '#94a3b8'
                  : '#64748b',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              boxShadow:
                authMode === 'gmail_otp' && !isDark
                  ? '0 1px 3px rgba(0,0,0,0.08)'
                  : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Mail size={16} color={authMode === 'gmail_otp' ? (isDark ? '#ffffff' : '#10b981') : '#94a3b8'} /> Gmail OTP
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('password');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '9px',
              border: 'none',
              background:
                authMode === 'password'
                  ? isDark
                    ? '#10b981'
                    : '#ffffff'
                  : 'transparent',
              color:
                authMode === 'password'
                  ? isDark
                    ? '#ffffff'
                    : '#0f172a'
                  : isDark
                  ? '#94a3b8'
                  : '#64748b',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              boxShadow:
                authMode === 'password' && !isDark
                  ? '0 1px 3px rgba(0,0,0,0.08)'
                  : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <KeyRound size={16} color={authMode === 'password' ? (isDark ? '#ffffff' : '#10b981') : '#94a3b8'} /> Password
          </button>
        </div>

        {/* AUTH MODE: GMAIL OTP */}
        {authMode === 'gmail_otp' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendGmailOtp}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      color: isDark ? 'var(--text-secondary)' : '#334155',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Authorized Administrator Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. admin@finnova.in"
                    value={adminEmail}
                    onChange={(e) => {
                      setAdminEmail(e.target.value);
                      setError(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                      background: isDark ? 'var(--bg-surface-elevated)' : '#ffffff',
                      color: isDark ? 'var(--text-primary)' : '#0f172a',
                      fontSize: '0.92rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#10b981')}
                    onBlur={(e) =>
                      (e.target.style.borderColor = isDark ? 'var(--border-subtle)' : '#cbd5e1')
                    }
                  />
                  <small
                    style={{
                      color: isDark ? 'var(--text-muted)' : '#64748b',
                      fontSize: '0.75rem',
                      marginTop: '0.35rem',
                      display: 'block',
                    }}
                  >
                    A secure 6-digit one-time PIN will be dispatched to this administrator inbox.
                  </small>
                </div>

                <button
                  type="submit"
                  disabled={sendingOtp || !adminEmail}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    cursor: sendingOtp || !adminEmail ? 'not-allowed' : 'pointer',
                    opacity: sendingOtp || !adminEmail ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  {sendingOtp ? 'Dispatching Administrator PIN...' : 'Send Administrator OTP'}{' '}
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyGmailOtp}>
                <div
                  style={{
                    background: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5',
                    border: isDark ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid #a7f3d0',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#10b981',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    <ShieldCheck size={16} />
                    <span>Administrator PIN Sent</span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      color: isDark ? 'var(--text-secondary)' : '#475569',
                      marginTop: '0.25rem',
                    }}
                  >
                    Enter the 6-digit code dispatched to <strong>{adminEmail}</strong>
                    {adminName ? ` (${adminName})` : ''}.
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '0.25rem' }}>
                    💡 Tip: If not in your inbox, please check your <strong>Spam / Junk</strong> folder.
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      color: isDark ? 'var(--text-secondary)' : '#334155',
                      marginBottom: '0.4rem',
                    }}
                  >
                    6-Digit Verification PIN
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/\D/g, ''));
                      setError(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                      background: isDark ? 'var(--bg-surface-elevated)' : '#ffffff',
                      color: isDark ? 'var(--text-primary)' : '#0f172a',
                      fontSize: '1.25rem',
                      letterSpacing: '0.25em',
                      textAlign: 'center',
                      fontWeight: 700,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#10b981')}
                    onBlur={(e) =>
                      (e.target.style.borderColor = isDark ? 'var(--border-subtle)' : '#cbd5e1')
                    }
                  />
                  <div
                    style={{
                      textAlign: 'center',
                      marginTop: '0.4rem',
                      fontSize: '0.78rem',
                      color: isDark ? 'var(--text-muted)' : '#64748b',
                    }}
                  >
                    Check your Primary, Updates, or Spam folder.
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.25rem',
                    fontSize: '0.82rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode('');
                      setError(null);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: isDark ? 'var(--text-secondary)' : '#64748b',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Change Email
                  </button>

                  {countdown > 0 ? (
                    <span style={{ color: isDark ? 'var(--text-muted)' : '#94a3b8' }}>
                      Resend in {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendGmailOtp}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#10b981',
                        cursor: 'pointer',
                        padding: 0,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <RefreshCw size={12} /> Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={verifyingOtp || otpCode.length < 4}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    cursor: verifyingOtp || otpCode.length < 4 ? 'not-allowed' : 'pointer',
                    opacity: verifyingOtp || otpCode.length < 4 ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  {verifyingOtp ? 'Verifying Credentials...' : 'Verify & Enter Admin Console'}{' '}
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        )}

        {/* AUTH MODE: EMAIL & PASSWORD */}
        {authMode === 'password' && (
          <form onSubmit={handlePasswordLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: isDark ? 'var(--text-secondary)' : '#334155',
                  marginBottom: '0.4rem',
                }}
              >
                Administrator Email Address
              </label>
              <input
                type="email"
                required
                placeholder="admin@finnova.in"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                  background: isDark ? 'var(--bg-surface-elevated)' : '#ffffff',
                  color: isDark ? 'var(--text-primary)' : '#0f172a',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#10b981')}
                onBlur={(e) =>
                  (e.target.style.borderColor = isDark ? 'var(--border-subtle)' : '#cbd5e1')
                }
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.4rem',
                }}
              >
                <label
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: isDark ? 'var(--text-secondary)' : '#334155',
                  }}
                >
                  Administrator Password
                </label>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                  background: isDark ? 'var(--bg-surface-elevated)' : '#ffffff',
                  color: isDark ? 'var(--text-primary)' : '#0f172a',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#10b981')}
                onBlur={(e) =>
                  (e.target.style.borderColor = isDark ? 'var(--border-subtle)' : '#cbd5e1')
                }
              />
            </div>

            <button
              type="submit"
              disabled={submittingPassword}
              style={{
                width: '100%',
                marginTop: '0.5rem',
                padding: '0.85rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: submittingPassword ? 'not-allowed' : 'pointer',
                opacity: submittingPassword ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              }}
            >
              {submittingPassword ? 'Signing In...' : 'Sign In to Admin Console'}{' '}
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '2rem',
            borderTop: isDark ? '1px solid var(--border-subtle)' : '1px solid #f1f5f9',
            paddingTop: '1.25rem',
            fontSize: '0.88rem',
            color: isDark ? 'var(--text-secondary)' : '#64748b',
          }}
        >
          <div>
            Need to register a new bank or NBFC?{' '}
            <Link
              to="/institution/register"
              style={{ fontWeight: 600, color: '#10b981', textDecoration: 'none' }}
            >
              Register Institution
            </Link>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.82rem' }}>
            Customer looking to access account?{' '}
            <Link
              to="/customer/login"
              style={{ fontWeight: 600, color: '#0284c7', textDecoration: 'none' }}
            >
              Customer Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
