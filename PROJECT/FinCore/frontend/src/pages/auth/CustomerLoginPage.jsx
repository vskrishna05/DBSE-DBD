import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Mail, ArrowRight, ShieldCheck, Lock, RefreshCw, KeyRound, AlertCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { apiAuth } from '../../api/client';

export default function CustomerLoginPage() {
  const { loginCustomer, loginGmailOtp } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Auth Mode: 'gmail_otp' (default) | 'password'
  const [authMode, setAuthMode] = useState('gmail_otp');

  // Inline Error State
  const [error, setError] = useState(null);

  // Gmail OTP state (Preserved exactly as working)
  const [gmailEmail, setGmailEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Email / Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Countdown timer for resend OTP
  React.useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle Send Gmail OTP (Unchanged logic + inline error)
  const handleSendGmailOtp = async (e) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = gmailEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      const msg = 'Please enter a valid Gmail or email address.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await apiAuth.sendGmailOtp(cleanEmail, 'customer');
      setCustomerName(res.data.name || '');
      setOtpSent(true);
      setCountdown(45);
      showToast(
        res.data.message || `Verification OTP code dispatched to ${cleanEmail}. Valid for 10 minutes.`,
        'success'
      );
    } catch (err) {
      const msg = err.friendlyMessage || 'No customer registered with this email address. Please register first.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle Verify Gmail OTP (Unchanged logic + inline error)
  const handleVerifyGmailOtp = async (e) => {
    e.preventDefault();
    setError(null);
    if (!otpCode || otpCode.length < 4) {
      const msg = 'Please enter the 6-digit verification code received in your Gmail.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    setVerifyingOtp(true);
    try {
      await loginGmailOtp(gmailEmail.trim().toLowerCase(), otpCode.trim(), 'customer');
      showToast('Identity verified via Gmail OTP! Welcome to FinCore.', 'success');
      navigate('/customer/dashboard');
    } catch (err) {
      const msg = err.friendlyMessage || 'Invalid or expired OTP code. Please retry or click Resend.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Handle Password Login (Unchanged logic + inline error)
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmittingPassword(true);
    try {
      await loginCustomer(email, password);
      showToast('Logged in successfully!', 'success');
      navigate('/customer/dashboard');
    } catch (err) {
      const msg = err.friendlyMessage || 'Invalid email or password. Please verify your credentials.';
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
          ? 'radial-gradient(circle at 50% 12%, rgba(2, 132, 199, 0.1), transparent 70%), var(--bg-primary)'
          : 'radial-gradient(circle at 50% 12%, rgba(2, 132, 199, 0.06), transparent 70%), #f8fafc',
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

      {/* Customer Authentication Card */}
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
                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 8px 18px -4px rgba(2, 132, 199, 0.35)',
                marginBottom: '0.65rem',
              }}
            >
              <Layers size={26} strokeWidth={2.2} />
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
                color: '#0284c7',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginTop: '3px',
              }}
            >
              Powering Smarter Financial Services
            </span>
          </Link>

          {/* Heading */}
          <h1
            style={{
              fontSize: '1.55rem',
              fontWeight: 700,
              color: isDark ? 'var(--text-primary)' : '#0f172a',
              margin: '0 0 0.45rem 0',
              letterSpacing: '-0.02em',
            }}
          >
            Customer Sign In
          </h1>

          {/* Supporting Text */}
          <p
            style={{
              color: isDark ? 'var(--text-secondary)' : '#64748b',
              fontSize: '0.9rem',
              lineHeight: 1.55,
              margin: '0 auto',
              maxWidth: '360px',
            }}
          >
            Access your financial services dashboard securely using OTP verification or password.
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

        {/* Switch between Gmail OTP and Password */}
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
                    ? '#0284c7'
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
            <Mail size={16} color={authMode === 'gmail_otp' ? (isDark ? '#ffffff' : '#0284c7') : '#94a3b8'} /> Gmail OTP
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
                    ? '#0284c7'
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
            <KeyRound size={16} color={authMode === 'password' ? (isDark ? '#ffffff' : '#0284c7') : '#94a3b8'} /> Password
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
                    Registered Gmail Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. name@gmail.com"
                    value={gmailEmail}
                    onChange={(e) => {
                      setGmailEmail(e.target.value);
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
                    onFocus={(e) => (e.target.style.borderColor = '#0284c7')}
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
                    A secure 6-digit one-time PIN will be dispatched to this Gmail inbox.
                  </small>
                </div>

                <button
                  type="submit"
                  disabled={sendingOtp || !gmailEmail}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    cursor: sendingOtp || !gmailEmail ? 'not-allowed' : 'pointer',
                    opacity: sendingOtp || !gmailEmail ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                  }}
                >
                  {sendingOtp ? 'Dispatching Verification Code...' : 'Send Verification OTP'}{' '}
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyGmailOtp}>
                <div
                  style={{
                    background: isDark ? 'rgba(2, 132, 199, 0.12)' : '#f0f9ff',
                    border: isDark ? '1px solid rgba(2, 132, 199, 0.25)' : '1px solid #bae6fd',
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
                      color: '#0284c7',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    <ShieldCheck size={16} />
                    <span>OTP Sent to Gmail</span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      color: isDark ? 'var(--text-secondary)' : '#475569',
                      marginTop: '0.25rem',
                    }}
                  >
                    Enter the 6-digit code dispatched to <strong>{gmailEmail}</strong>
                    {customerName ? ` (${customerName})` : ''}.
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
                    6-Digit Verification Code
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
                    onFocus={(e) => (e.target.style.borderColor = '#0284c7')}
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
                        color: '#0284c7',
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
                    background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    cursor: verifyingOtp || otpCode.length < 4 ? 'not-allowed' : 'pointer',
                    opacity: verifyingOtp || otpCode.length < 4 ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                  }}
                >
                  {verifyingOtp ? 'Verifying Identity...' : 'Verify & Enter Dashboard'}{' '}
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
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
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
                onFocus={(e) => (e.target.style.borderColor = '#0284c7')}
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
                  Password
                </label>
                <Link
                  to="/customer/forgot-password"
                  style={{ fontSize: '0.8rem', color: '#0284c7', textDecoration: 'none', fontWeight: 500 }}
                >
                  Forgot Password?
                </Link>
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
                onFocus={(e) => (e.target.style.borderColor = '#0284c7')}
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
                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: submittingPassword ? 'not-allowed' : 'pointer',
                opacity: submittingPassword ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              }}
            >
              {submittingPassword ? 'Signing In...' : 'Sign In to FinCore'} <ArrowRight size={16} />
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
            Don't have a banking account?{' '}
            <Link
              to="/customer/register"
              style={{ fontWeight: 600, color: '#0284c7', textDecoration: 'none' }}
            >
              Register as Customer
            </Link>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.82rem' }}>
            Are you a Financial Institution?{' '}
            <Link
              to="/institution/register"
              style={{ fontWeight: 600, color: '#059669', textDecoration: 'none' }}
            >
              Register your Bank / Company
            </Link>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.82rem' }}>
            Need Administrator Access?{' '}
            <Link
              to="/admin/login"
              style={{ fontWeight: 600, color: isDark ? 'var(--text-muted)' : '#64748b', textDecoration: 'none' }}
            >
              Admin Console
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
