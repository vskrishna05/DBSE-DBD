import React, { useEffect, useState } from 'react';
import { User, Building2, ShieldCheck, Save, CreditCard, Lock, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { apiCustomers, apiAuth } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function CustomerProfilePage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Password change state
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    address_line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await apiCustomers.getMe();
      setProfile(res.data);
      setForm({
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        phone_number: res.data.profile?.phone_number || '',
        address_line1: res.data.profile?.address_line1 || '',
        city: res.data.profile?.city || '',
        state: res.data.profile?.state || '',
        postal_code: res.data.profile?.postal_code || '',
        country: res.data.profile?.country || 'India',
      });
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      showToast('New passwords do not match. Please verify.', 'error');
      return;
    }
    setChangingPwd(true);
    try {
      const res = await apiAuth.changePassword(pwdForm.currentPassword, pwdForm.newPassword);
      showToast(res.data?.message || 'Password changed successfully!', 'success');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to change password. Please check current password.', 'error');
    } finally {
      setChangingPwd(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiCustomers.updateMe(form);
      showToast('Profile information successfully updated!', 'success');
      loadProfile();
    } catch (err) {
      showToast(err.friendlyMessage || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#38bdf8', padding: '3rem', textAlign: 'center' }}>Loading profile record...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Account Profile & Security</h1>
        <p style={{ color: '#94a3b8' }}>Review your institutional credentials and verified customer information</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.8rem', fontWeight: 800 }}>
            {profile?.first_name?.[0] || 'C'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>{profile?.first_name} {profile?.last_name}</h2>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{profile?.email}</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span className="badge badge-success">
                <ShieldCheck size={13} /> Verified Account
              </span>
              <span className="badge badge-info">
                Credit Rating: {profile?.profile?.credit_score || 720}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                required
                className="form-control"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
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
            <label className="form-label">Phone Contact</label>
            <input
              type="text"
              className="form-control"
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input
              type="text"
              className="form-control"
              value={form.address_line1}
              onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-control"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-control"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Postal Code</label>
              <input
                type="text"
                className="form-control"
                value={form.postal_code}
                onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ gap: '0.5rem' }}>
              <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Management Card */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(139, 92, 246, 0.2))', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
            <KeyRound size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>Change Account Password</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Update your portal login password for enhanced institutional security</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Current Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrentPwd ? 'text' : 'password'}
                required
                placeholder="Enter your current password"
                className="form-control"
                style={{ paddingRight: '2.5rem' }}
                value={pwdForm.currentPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                {showCurrentPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  required
                  placeholder="Min 6 characters"
                  className="form-control"
                  style={{ paddingRight: '2.5rem' }}
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd(!showNewPwd)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPwd ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new password"
                  className="form-control"
                  style={{ paddingRight: '2.5rem' }}
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Minimum 6 characters. Use strong combinations of letters, numbers, and symbols.
            </div>
            <button
              type="submit"
              disabled={changingPwd || !pwdForm.currentPassword || !pwdForm.newPassword}
              className="btn btn-primary"
              style={{ gap: '0.5rem', background: 'linear-gradient(135deg, #0284c7, #6366f1)' }}
            >
              <Lock size={16} /> {changingPwd ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
