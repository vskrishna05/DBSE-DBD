import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layers, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { apiPlans, apiSubscriptions } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function CustomerSubscribePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const planId = searchParams.get('planId');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (!planId) {
      navigate('/customer/plans');
      return;
    }
    apiPlans.getById(planId)
      .then((res) => setPlan(res.data))
      .catch((err) => {
        showToast('Plan not found', 'error');
        navigate('/customer/plans');
      })
      .finally(() => setLoading(false));
  }, [planId]);

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const res = await apiSubscriptions.subscribe(parseInt(planId), true);
      showToast(res.data.message || 'Subscription successfully activated!', 'success');
      navigate('/customer/invoices');
    } catch (err) {
      showToast(err.friendlyMessage || 'Subscription failed', 'error');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#38bdf8', padding: '3rem', textAlign: 'center' }}>Loading subscription summary...</div>;
  }

  return (
    <div style={{ maxWidth: '650px', margin: '2rem auto' }}>
      <div className="card glass" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-logo-icon" style={{ margin: '0 auto 1rem' }}>
            <Layers size={24} />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Confirm Subscription</h1>
          <p style={{ color: '#94a3b8' }}>Review your chosen plan tier and billing cycle</p>
        </div>

        {plan && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.3rem' }}>{plan.name}</h3>
                <span className="badge badge-info">{plan.code}</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', marginBottom: '0.5rem' }}>
                ₹{parseFloat(plan.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 400 }}> / {plan.billing_cycle}</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{plan.description}</p>
            </div>

            {parseFloat(plan.interest_discount_rate) > 0 && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#34d399', fontSize: '0.9rem', fontWeight: 600 }}>
                <Zap size={20} />
                <span>Includes {parseFloat(plan.interest_discount_rate).toFixed(2)}% discount on all loan borrowings</span>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Upon confirmation, an invoice for <strong>₹{parseFloat(plan.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> will be issued to your billing account.
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => navigate('/customer/plans')}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Choose Different Plan
                </button>
                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  {subscribing ? 'Processing Activation...' : 'Confirm Subscription'} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
