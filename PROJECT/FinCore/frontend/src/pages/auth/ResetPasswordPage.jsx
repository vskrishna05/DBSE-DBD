import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CheckCircle2 } from 'lucide-react';
import { apiAuth } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiAuth.resetPassword(email, otpCode, newPassword);
      showToast('Password has been successfully reset! Please login.', 'success');
      navigate('/customer/login');
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to reset password. Check OTP code.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card glass" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-logo-icon" style={{ margin: '0 auto 1rem' }}>
            <Lock size={22} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Set New Password</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Enter verification OTP and your new password</p>
        </div>

        <form onSubmit={handleReset}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              required
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">6-Digit Reset Code</label>
            <input
              type="text"
              required
              maxLength={6}
              className="form-control"
              style={{ textAlign: 'center', letterSpacing: '0.25em', fontFamily: 'var(--font-mono)' }}
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              className="form-control"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {submitting ? 'Resetting Password...' : 'Save New Password & Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/customer/login" style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Cancel & Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
