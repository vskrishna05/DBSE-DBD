import React, { useEffect, useState } from 'react';
import { PlusCircle, Layers, Check, Trash2, Edit, X, Zap } from 'lucide-react';
import { apiPlans } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminPlansPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    price: '49.00',
    billing_cycle: 'monthly',
    interest_discount_rate: '1.50',
    features: [
      { feature_key: 'auto_invoicing', feature_label: 'Automated Monthly Invoicing', is_included: true },
      { feature_key: 'rate_reduction', feature_label: 'Preferential Loan Interest', is_included: true }
    ],
  });

  const [newFeatureText, setNewFeatureText] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const res = await apiPlans.getAll();
      setPlans(res.data);
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to fetch plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiPlans.create({
        ...form,
        finance_company_id: user.companyId,
        price: parseFloat(form.price),
        interest_discount_rate: parseFloat(form.interest_discount_rate),
      });
      showToast('Plan successfully created in database!', 'success');
      setShowCreateModal(false);
      loadPlans();
    } catch (err) {
      showToast(err.friendlyMessage || 'Plan creation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this plan? Existing subscriptions remain valid.')) return;
    try {
      await apiPlans.delete(id);
      showToast('Plan deactivated', 'info');
      loadPlans();
    } catch (err) {
      showToast(err.friendlyMessage || 'Deactivation failed', 'error');
    }
  };

  const addFeature = () => {
    if (!newFeatureText.trim()) return;
    const key = newFeatureText.toLowerCase().replace(/[^a-z0-9]/g, '_');
    setForm((prev) => ({
      ...prev,
      features: [...prev.features, { feature_key: key, feature_label: newFeatureText, is_included: true }],
    }));
    setNewFeatureText('');
  };

  const removeFeature = (index) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Plan Tier Configuration</h1>
          <p style={{ color: '#94a3b8' }}>Design, update, and manage SaaS subscription tiers and interest concessions</p>
        </div>

        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm" style={{ gap: '0.4rem', background: 'linear-gradient(135deg, #10b981, #2563eb)' }}>
          <PlusCircle size={16} /> Create New Plan Tier
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {plans.map((p) => (
          <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.35rem' }}>{p.name}</h3>
              <span className={`badge ${p.is_active ? 'badge-success' : 'badge-danger'}`}>
                {p.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'var(--font-mono)', marginBottom: '0.75rem' }}>
              Code: {p.code}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-heading)' }}>
                ₹{parseFloat(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}> / {p.billing_cycle}</span>
            </div>

            {parseFloat(p.interest_discount_rate) > 0 && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: 600 }}>
                <Zap size={16} />
                <span>{parseFloat(p.interest_discount_rate).toFixed(2)}% Loan Rate Concession</span>
              </div>
            )}

            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1.5rem', flex: 1 }}>
              {p.description || 'Enterprise grade core banking plan.'}
            </p>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>
                Included Benefits:
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                {p.features?.map((f) => (
                  <li key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                    <Check size={14} color="#34d399" />
                    <span>{f.feature_label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {p.is_active && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <button
                  onClick={() => handleDeactivate(p.id)}
                  className="btn btn-danger btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  <Trash2 size={13} /> Deactivate
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Provision New Plan Tier</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePlan}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Plan Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Platinum Corporate Tier"
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Plan Code</label>
                  <input
                    type="text"
                    required
                    placeholder="PLAT-CORP"
                    className="form-control"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="form-control"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Billing Cycle</label>
                  <select
                    className="form-control"
                    value={form.billing_cycle}
                    onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Rate Discount (%)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    className="form-control"
                    value={form.interest_discount_rate}
                    onChange={(e) => setForm({ ...form, interest_discount_rate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={2}
                  className="form-control"
                  placeholder="Summary of terms and target market"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Dynamic Benefits Section */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Configured Features</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Add plan perk (e.g. Priority wire settlements)"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                  />
                  <button type="button" onClick={addFeature} className="btn btn-secondary btn-sm">
                    Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {form.features.map((f, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-elevated)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                      <span>{f.feature_label}</span>
                      <button type="button" onClick={() => removeFeature(idx)} style={{ background: 'transparent', border: 'none', color: '#fb7185', cursor: 'pointer' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-outline btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary btn-sm" style={{ background: 'linear-gradient(135deg, #10b981, #2563eb)' }}>
                  {saving ? 'Creating Plan...' : 'Save & Publish Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
