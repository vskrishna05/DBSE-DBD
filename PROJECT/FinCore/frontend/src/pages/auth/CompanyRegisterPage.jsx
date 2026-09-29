import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Layers, CheckCircle2, ArrowRight, ShieldCheck, FileText, Lock, Mail, Phone, MapPin } from 'lucide-react';
import { apiCompanies } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function CompanyRegisterPage() {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const { showToast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    license_number: '',
    gstin: '',
    pan_number: '',
    cin_number: '',
    gst_invoice_ref: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    state: '',
    pincode: '',
    admin_name: '',
    admin_email: '',
    admin_mobile: '',
    admin_password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'code' ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.gstin || formData.gstin.length < 15) {
      showToast('Please provide a valid 15-character Indian GSTIN', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiCompanies.register({
        name: formData.name,
        code: formData.code,
        license_number: formData.license_number,
        gstin: formData.gstin,
        pan_number: formData.pan_number || formData.gstin.substring(2, 12),
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        address: `${formData.address}${formData.cin_number ? ` (CIN: ${formData.cin_number})` : ''}${formData.gst_invoice_ref ? ` | GST Ref: ${formData.gst_invoice_ref}` : ''}`,
        state: formData.state,
        pincode: formData.pincode,
        admin_name: formData.admin_name,
        admin_email: formData.admin_email,
        admin_mobile: formData.admin_mobile,
        admin_password: formData.admin_password,
      });

      setSuccessData(res.data);
      showToast(`${formData.name} registered successfully with FinCore!`, 'success');
    } catch (err) {
      showToast(err.friendlyMessage || 'Company registration failed. Check inputs.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceedToLogin = async () => {
    try {
      await loginAdmin(formData.admin_email, formData.admin_password);
      showToast('Logged in as Bank Administrator', 'success');
      navigate('/admin/dashboard');
    } catch (err) {
      navigate('/admin/login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1rem', background: 'radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.08), transparent 60%)' }}>
      <div className="card glass" style={{ maxWidth: '820px', width: '100%', padding: '2.5rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '1rem' }}>
            <div className="brand-logo-icon" style={{ background: 'linear-gradient(135deg, #10b981, #0284c7)' }}>
              <Building2 size={22} />
            </div>
            <span className="brand-text" style={{ fontSize: '1.4rem' }}>FINCORE</span>
          </Link>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.4rem', fontWeight: 700 }}>
            Financial Institution & Company Onboarding
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }}>
            Register your Small Finance Bank, Commercial Bank, or NBFC onto the FinCore multi-tenant banking platform.
          </p>
        </div>

        {successData ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#f8fafc' }}>
              {successData.company_name} Registered!
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: '520px', margin: '0 auto 1.5rem', fontSize: '0.92rem' }}>
              Your financial institution profile and GST tax invoicing credentials have been verified and seeded. Customers can now immediately register under your bank.
            </p>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', maxWidth: '440px', margin: '0 auto 2rem', textAlign: 'left', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>Institution Code:</span>
                <span style={{ fontWeight: 700, color: '#38bdf8' }}>{successData.company_code}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>GSTIN Number:</span>
                <span style={{ fontWeight: 600 }}>{successData.gstin}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>Admin Email:</span>
                <span style={{ fontWeight: 600 }}>{successData.admin_email}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToLogin}
              className="btn btn-primary"
              style={{ padding: '0.75rem 2rem' }}
            >
              Enter Institution Management Console <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Section 1: Institution Details */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <Building2 size={16} /> 1. Institution & Regulatory Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Institution / Bank Name *</label>
                  <input
                    type="text"
                    required
                    name="name"
                    className="form-control"
                    placeholder="e.g. AU Small Finance Bank"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Institution Code (Short Symbol) *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    name="code"
                    className="form-control"
                    placeholder="e.g. AUSFB"
                    value={formData.code}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">RBI / Regulatory License Number *</label>
                  <input
                    type="text"
                    required
                    name="license_number"
                    className="form-control"
                    placeholder="e.g. RBI/2026/SFB/119"
                    value={formData.license_number}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Corporate Identification Number (CIN) *</label>
                  <input
                    type="text"
                    required
                    name="cin_number"
                    className="form-control"
                    placeholder="e.g. U65191MH2026PTC348210"
                    value={formData.cin_number}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Indian Tax & GST Registration */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <FileText size={16} /> 2. GST Tax Invoicing & Compliance Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">GSTIN (15-digit GST Identification) *</label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    name="gstin"
                    className="form-control"
                    placeholder="e.g. 27AAACR1234F1Z9"
                    value={formData.gstin}
                    onChange={handleChange}
                  />
                  <small style={{ color: '#64748b', fontSize: '0.72rem' }}>State code + 10-char PAN + entity code + Z + check digit</small>
                </div>
                <div className="form-group">
                  <label className="form-label">Company PAN Number *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    name="pan_number"
                    className="form-control"
                    placeholder="e.g. AAACR1234F"
                    value={formData.pan_number}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">GST Invoice Reference / Registration Document No. *</label>
                <input
                  type="text"
                  required
                  name="gst_invoice_ref"
                  className="form-control"
                  placeholder="e.g. GST-REG-INV-2026-9042 or Tax Invoice Certificate ARN"
                  value={formData.gst_invoice_ref}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Section 3: Contact & Address */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <MapPin size={16} /> 3. Official Contact & Registered Headquarters
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Official Business Email *</label>
                  <input
                    type="email"
                    required
                    name="contact_email"
                    className="form-control"
                    placeholder="corporate@bank.in"
                    value={formData.contact_email}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Official Contact Phone (+91) *</label>
                  <input
                    type="text"
                    required
                    name="contact_phone"
                    className="form-control"
                    placeholder="+91-22-68001000"
                    value={formData.contact_phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Registered Office Street Address *</label>
                <input
                  type="text"
                  required
                  name="address"
                  className="form-control"
                  placeholder="e.g. Floor 8, Financial Hub, Bandra Kurla Complex"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    required
                    name="state"
                    className="form-control"
                    placeholder="e.g. Maharashtra"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    name="pincode"
                    className="form-control"
                    placeholder="e.g. 400051"
                    value={formData.pincode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Primary Administrator Credentials */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <Lock size={16} /> 4. Primary Administrator Profile (For Email OTP & Password Access)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Admin Full Name *</label>
                  <input
                    type="text"
                    required
                    name="admin_name"
                    className="form-control"
                    placeholder="e.g. Arvind Mehta"
                    value={formData.admin_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Admin Mobile Number (10 digits) *</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRight: 'none', padding: '0.62rem 0.75rem', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)', color: '#94a3b8', fontSize: '0.9rem' }}>
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      name="admin_mobile"
                      className="form-control"
                      style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}
                      placeholder="9876543210"
                      value={formData.admin_mobile}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Official Admin Email (Gmail / Work Email) *</label>
                  <input
                    type="email"
                    required
                    name="admin_email"
                    className="form-control"
                    placeholder="admin@bank.in"
                    value={formData.admin_email}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Admin Secure Password *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    name="admin_password"
                    className="form-control"
                    placeholder="••••••••"
                    value={formData.admin_password}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
            >
              {submitting ? 'Submitting Regulatory Registration...' : 'Complete Institution Registration'} <ArrowRight size={18} />
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', fontSize: '0.88rem', color: '#94a3b8' }}>
          Are you an individual customer looking to open an account?{' '}
          <Link to="/customer/register" style={{ fontWeight: 600, color: '#38bdf8' }}>
            Customer Registration
          </Link>
          {' | '}
          <Link to="/admin/login" style={{ fontWeight: 600, color: '#10b981' }}>
            Administrator Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
