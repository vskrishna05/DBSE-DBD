import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Layers, Building2, Key, CheckCircle, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { apiCompanies, apiAuth } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function CustomerRegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleLoginSuccess } = useAuth();
  const { showToast } = useToast();

  const [companies, setCompanies] = useState([]);
  const [step, setStep] = useState(1); // Step 1: Profile & Company -> Step 2: OTP Verification
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    finance_company_id: searchParams.get('companyId') || '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    city: '',
    state: '',
    country: 'India',
  });

  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    apiCompanies.getPublic().then((res) => {
      setCompanies(res.data);
      if (!form.finance_company_id && res.data.length > 0) {
        setForm((prev) => ({ ...prev, finance_company_id: res.data[0].id.toString() }));
      }
    });
  }, []);

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!form.finance_company_id) {
      showToast('Please select a Finance Company', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiAuth.sendOtp(form.email, 'REGISTRATION');
      showToast(res.data.message || `Verification code dispatched to ${form.email}. Check your Gmail inbox.`, 'info');
      if (res.data?.otp_hint) {
        setOtpCode(res.data.otp_hint);
      }
      setStep(2);
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to dispatch verification OTP', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setSubmitting(true);
    try {
      const res = await apiAuth.sendOtp(form.email, 'REGISTRATION');
      showToast(res.data.message || `New verification code sent to ${form.email}`, 'info');
      if (res.data?.otp_hint) {
        setOtpCode(res.data.otp_hint);
      }
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to resend verification OTP', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Verify OTP
      await apiAuth.verifyOtp(form.email, otpCode, 'REGISTRATION');

      // 2. Perform Account Registration
      const regRes = await apiAuth.registerCustomer({
        ...form,
        finance_company_id: parseInt(form.finance_company_id),
      });

      handleLoginSuccess(regRes.data);
      showToast('Account registered and verified successfully!', 'success');

      // Check if planId query parameter exists to redirect to subscription
      const planId = searchParams.get('planId');
      if (planId) {
        navigate(`/customer/subscribe?planId=${planId}`);
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      showToast(err.friendlyMessage || 'Registration failed. Check OTP.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.08), transparent 50%)' }}>
      <div className="card glass" style={{ maxWidth: step === 1 ? '580px' : '440px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '1rem' }}>
            <div className="brand-logo-icon">
              <Layers size={22} />
            </div>
            <span className="brand-text" style={{ fontSize: '1.4rem' }}>FINCORE</span>
          </Link>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>
            {step === 1 ? 'Open New Customer Account' : 'Verify Security OTP'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            {step === 1
              ? 'Select your banking institution and configure your profile'
              : `Enter the 6-digit code sent to ${form.email}`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleStep1Submit}>
            {/* Finance Company Selection - Mandatory per Spec */}
            <div className="form-group" style={{ background: 'rgba(56, 189, 248, 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <label className="form-label" style={{ color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={16} /> Select Finance Company / Partner Bank *
              </label>
              <select
                className="form-control"
                required
                value={form.finance_company_id}
                onChange={(e) => setForm({ ...form, finance_company_id: e.target.value })}
              >
                <option value="">-- Choose Financial Institution --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code}) - Lic #{c.license_number}
                  </option>
                ))}
              </select>
              <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.35rem', display: 'block' }}>
                Your subscriptions, plans, invoices, and credit limits will be managed under this tenant.
              </small>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
                className="form-control"
                placeholder="customer@domain.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Secure Password *</label>
              <input
                type="password"
                required
                minLength={8}
                className="form-control"
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="98765 43210"
                  value={form.phone_number}
                  onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Mumbai"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
            >
              {submitting ? 'Generating Verification...' : 'Continue to Security Verification'}{' '}
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2Submit}>
            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={20} color="#0284c7" />
              <div style={{ fontSize: '0.85rem', flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#0284c7' }}>Verification Code Dispatched</div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  Please enter the 6-digit code sent to <strong>{form.email}</strong>.
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Enter 6-Digit OTP</label>
              <input
                type="text"
                maxLength={6}
                required
                className="form-control"
                placeholder="Enter 6-digit code"
                style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.4rem', fontFamily: 'var(--font-mono)' }}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />
              <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Dispatched directly to <strong>{form.email}</strong>. Check Inbox or <strong>Spam / Updates</strong> folder.
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
            >
              {submitting ? 'Verifying & Registering...' : 'Verify OTP & Complete Registration'}
            </button>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
              <button
                type="button"
                disabled={submitting}
                onClick={handleResendOtp}
                className="btn btn-outline"
                style={{ flex: 1, padding: '0.65rem' }}
              >
                {submitting ? 'Sending...' : 'Resend Code'}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-outline"
                style={{ flex: 1, padding: '0.65rem', borderColor: '#475569', color: '#94a3b8' }}
              >
                Change Email
              </button>
            </div>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', fontSize: '0.88rem', color: '#94a3b8' }}>
          <div>
            Already registered?{' '}
            <Link to="/customer/login" style={{ fontWeight: 600, color: '#38bdf8' }}>
              Customer Sign In
            </Link>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.82rem' }}>
            Are you a Financial Institution or Small Finance Bank?{' '}
            <Link to="/institution/register" style={{ fontWeight: 600, color: '#10b981' }}>
              Register your Company
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
