import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, KeyRound, Info } from 'lucide-react';
import { apiAuth } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiAuth.forgotPassword(email);
      showToast('If the account exists, a reset code has been dispatched.', 'info');
      setTimeout(() => {
        navigate(`/customer/reset-password?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (err) {
      showToast(err.friendlyMessage || 'Request failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card glass" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-logo-icon" style={{ margin: '0 auto 1rem' }}>
            <KeyRound size={22} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Forgot Password</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Enter your email to receive a password reset token</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Account Email Address</label>
            <input
              type="email"
              required
              className="form-control"
              placeholder="customer@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {submitting ? 'Generating Reset Code...' : 'Send Password Reset Code'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/customer/login" style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Remembered password? Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
