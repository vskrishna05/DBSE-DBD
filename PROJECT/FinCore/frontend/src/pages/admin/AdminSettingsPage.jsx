import React, { useEffect, useState } from 'react';
import { Building, Save, ShieldCheck, Mail, Phone, MapPin, Lock, KeyRound, Eye, EyeOff } from 'lucide-react';
import { apiCompanies, apiAuth } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Admin password change state
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
    name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
  });

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      const res = await apiCompanies.getById(user.companyId);
      setCompany(res.data);
      setForm({
        name: res.data.name,
        contact_email: res.data.contact_email,
        contact_phone: res.data.contact_phone,
        address: res.data.address || '',
      });
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to fetch company profile', 'error');
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
      showToast(res.data?.message || 'Admin password updated successfully!', 'success');
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
      await apiCompanies.update(user.companyId, form);
      showToast('Institution profile updated successfully!', 'success');
      loadCompany();
    } catch (err) {
      showToast(err.friendlyMessage || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#10b981', padding: '3rem', textAlign: 'center' }}>Loading company configuration...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Institution Settings & Regulatory Profile</h1>
        <p style={{ color: '#94a3b8' }}>Manage operating tenant credentials, banking license, and institutional contact points</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, #10b981, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.8rem', fontWeight: 800 }}>
            <Building size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>{company?.name}</h2>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Tenant Code: <strong style={{ color: '#38bdf8' }}>{company?.code}</strong> | Regulatory License: <strong style={{ color: '#34d399' }}>{company?.license_number}</strong>
            </div>
            <div style={{ marginTop: '0.4rem' }}>
              <span className="badge badge-success">
                <ShieldCheck size={13} /> Active Licensed Multi-Tenant
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Registered Institution Legal Name</label>
            <input
              type="text"
              required
              className="form-control"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Official Compliance Email</label>
              <input
                type="email"
                required
                className="form-control"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Support / Inquiry Hotline</label>
              <input
                type="text"
                required
                className="form-control"
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Registered Corporate Address</label>
            <textarea
              rows={3}
              className="form-control"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ gap: '0.5rem', background: 'linear-gradient(135deg, #10b981, #2563eb)' }}>
              <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Admin Security & Password Change Card */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(37, 99, 235, 0.2))', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <KeyRound size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>Administrator Password & Credentials</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Update your administrator account password for {user?.email}</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Current Admin Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrentPwd ? 'text' : 'password'}
                required
                placeholder="Enter current password"
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
              style={{ gap: '0.5rem', background: 'linear-gradient(135deg, #10b981, #2563eb)' }}
            >
              <Lock size={16} /> {changingPwd ? 'Updating Password...' : 'Update Admin Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
