import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, ShieldCheck } from 'lucide-react';
import { apiAuth } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function VerifyOtpPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiAuth.verifyOtp(email, otp, 'REGISTRATION');
      showToast('Account verification successful. Please log in.', 'success');
      navigate('/customer/login');
    } catch (err) {
      showToast(err.friendlyMessage || 'Verification failed. Code may be expired.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card glass" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-logo-icon" style={{ margin: '0 auto 1rem' }}>
            <ShieldCheck size={22} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Verify OTP Code</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Verify email address for financial security</p>
        </div>

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label className="form-label">Registered Email</label>
            <input
              type="email"
              required
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">6-Digit Code</label>
            <input
              type="text"
              required
              maxLength={6}
              className="form-control"
              style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.3rem', fontFamily: 'var(--font-mono)' }}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {submitting ? 'Verifying...' : 'Submit Verification'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/customer/login" style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
