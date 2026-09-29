import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiPlans, apiSubscriptions } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function CustomerBrowsePlansPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribingId, setSubscribingId] = useState(null);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const res = await apiPlans.getAll();
      setPlans(res.data);
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to load plans for your organization', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubscribe = async () => {
    if (!selectedPlanForModal) return;
    setSubscribingId(selectedPlanForModal.id);
    try {
      const res = await apiSubscriptions.subscribe(selectedPlanForModal.id, true);
      showToast(res.data.message || 'Subscribed successfully! Invoice generated.', 'success');
      setSelectedPlanForModal(null);
      navigate('/customer/invoices');
    } catch (err) {
      showToast(err.friendlyMessage || 'Subscription failed', 'error');
    } finally {
      setSubscribingId(null);
    }
  };

  if (loading) {
    return <div style={{ color: '#38bdf8', padding: '3rem', textAlign: 'center' }}>Loading available plans...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Available Organization Plans</h1>
        <p style={{ color: '#94a3b8' }}>
          Select a subscription tier offered by your financial institution to elevate your service and borrowing terms.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {plans.map((plan) => (
          <div key={plan.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.4rem' }}>{plan.name}</h3>
              <span className="badge badge-info">{plan.code}</span>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-heading)' }}>
                ₹{parseFloat(plan.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}> / {plan.billing_cycle}</span>
            </div>

            {parseFloat(plan.interest_discount_rate) > 0 && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
                <Zap size={16} />
                <span>{parseFloat(plan.interest_discount_rate).toFixed(2)}% Loan Interest Discount</span>
              </div>
            )}

            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {plan.description || 'Enterprise grade financial subscription plan.'}
            </p>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginBottom: '2rem', flex: 1 }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '0.75rem' }}>
                Plan Benefits:
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {plan.features?.map((f) => (
                  <li key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
                    <Check size={16} color="#38bdf8" />
                    <span>{f.feature_label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setSelectedPlanForModal(plan)}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 'auto' }}
            >
              Subscribe to Tier <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {selectedPlanForModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Confirm Subscription</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              You are subscribing to <strong>{selectedPlanForModal.name}</strong> for{' '}
              <strong style={{ color: '#38bdf8' }}>₹{parseFloat(selectedPlanForModal.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })} / {selectedPlanForModal.billing_cycle}</strong>.
              An invoice will be generated immediately for settlement.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={() => setSelectedPlanForModal(null)}
                className="btn btn-outline btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubscribe}
                disabled={subscribingId === selectedPlanForModal.id}
                className="btn btn-primary btn-sm"
              >
                {subscribingId === selectedPlanForModal.id ? 'Activating...' : 'Confirm & Generate Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
